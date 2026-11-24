-- =============================================================================
-- Donazion database schema (Aurora DSQL, PostgreSQL-compatible)
--
-- This file IS run: on every `cdk deploy`, db/runSchema.ts executes each
-- statement below against the DSQL cluster (see lib/backend-stack.ts).
-- * If you are trying to redo the database and recreate tables, run cdk destroy
--   and cdk deploy to delete and recreate the stack. This will delete all data in the database.
--
-- Rules for editing this file:
-- * Every statement must be safe to run again (use IF NOT EXISTS), because
--   it runs on every deploy that changes this file.
-- * IF NOT EXISTS skips tables that already exist, so editing an existing
--   CREATE TABLE does NOT change the live table. To change one, add a new
--   statement at the bottom (e.g. ALTER TABLE ... ADD COLUMN IF NOT EXISTS),
--   or drop the table / redeploy a fresh stack while there's no real data.
-- * DSQL rules: one statement at a time (no transactions mixing DDL), indexes
--   must use CREATE INDEX ASYNC, no ENUM types (use text + CHECK instead).
-- * Don't put semicolons inside comments; the runner splits on them.
--
-- Logins (usernames / passwords) live in AWS Cognito, not here. Cognito
-- usernames match organizations.username and donation_centers.name.
-- Center totals are not stored; compute them with SUM over inventory_items.
--
-- Timestamps: every table has created_at and updated_at. Both default to the
-- time the row is inserted. DSQL has no triggers, so updated_at does NOT
-- change by itself: every UPDATE in a Lambda must include
--   SET ..., updated_at = now()
-- =============================================================================


-- The site's single organization.
CREATE TABLE IF NOT EXISTS organizations (
  username    text PRIMARY KEY,               -- same as its Cognito username
  name        text NOT NULL,                  -- display name
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);


-- Donation centers. The name is the key, so names are unique.
-- Each center belongs to an organization. Deleting the organization deletes
-- its centers, and deleting a center deletes its inventory, wish list and
-- boxes (CASCADE).
CREATE TABLE IF NOT EXISTS donation_centers (
  name                   text PRIMARY KEY,    -- same as its Cognito username
  organization_username  text NOT NULL
                           REFERENCES organizations (username) ON DELETE CASCADE,
  street_address         text NOT NULL,       -- e.g. '100 Institute Rd, Worcester, MA 01609'
  latitude               numeric(9, 6) CHECK (latitude BETWEEN -90 AND 90),
  longitude              numeric(9, 6) CHECK (longitude BETWEEN -180 AND 180),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);


-- Categories, e.g. 'Clothing'. Set by the organization. Every center picks
-- from this shared list. Deleting the organization deletes its categories.
CREATE TABLE IF NOT EXISTS categories (
  name                   text PRIMARY KEY,
  organization_username  text NOT NULL
                           REFERENCES organizations (username) ON DELETE CASCADE,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);


-- Items in each category with an allowed price range, e.g. Clothing / Shoes.
-- Item names are permanent: a rename is remove + add. Prices can be edited.
-- Deleting a category deletes its items, but is blocked (RESTRICT) while any
-- inventory or box still uses one of them.
CREATE TABLE IF NOT EXISTS category_items (
  category_name  text NOT NULL REFERENCES categories (name) ON DELETE CASCADE,
  item_name      text NOT NULL,
  low_price      numeric(10, 2) NOT NULL CHECK (low_price >= 0),
  high_price     numeric(10, 2) NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),   -- changes when prices are edited
  PRIMARY KEY (category_name, item_name),
  CHECK (low_price <= high_price)
);


-- What each center has. One row per donated line: the same item can appear
-- in several rows with different donor-set prices.
CREATE TABLE IF NOT EXISTS inventory_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name    text NOT NULL REFERENCES donation_centers (name) ON DELETE CASCADE,
  category_name  text NOT NULL,   -- must match category_items, see FOREIGN KEY below
  item_name      text NOT NULL,   -- must match category_items, see FOREIGN KEY below
  price          numeric(10, 2) NOT NULL CHECK (price >= 0),   -- per unit, set by the donor
  quantity       integer NOT NULL CHECK (quantity > 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),   -- changes when quantity changes
  FOREIGN KEY (category_name, item_name)
    REFERENCES category_items (category_name, item_name) ON DELETE RESTRICT
);

-- Fast lookup of one center's inventory (the dashboard).
CREATE INDEX ASYNC IF NOT EXISTS inventory_items_by_center
  ON inventory_items (center_name);


-- Which whole categories each center wants.
CREATE TABLE IF NOT EXISTS wish_list (
  center_name    text NOT NULL REFERENCES donation_centers (name) ON DELETE CASCADE,
  category_name  text NOT NULL REFERENCES categories (name) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (center_name, category_name)
);

-- Fast lookup of every center wanting a category (/searchDonationCenters).
CREATE INDEX ASYNC IF NOT EXISTS wish_list_by_category
  ON wish_list (category_name);


-- A donor's box for one center.
CREATE TABLE IF NOT EXISTS boxes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name  text NOT NULL REFERENCES donation_centers (name) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'donated')),   -- 'open' while packing
  donated_at   timestamptz,                               -- set when status becomes 'donated'
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  -- donated_at must be filled in exactly when the box is donated
  CHECK ((status = 'donated') = (donated_at IS NOT NULL))
);

-- Fast lookup of one center's boxes.
CREATE INDEX ASYNC IF NOT EXISTS boxes_by_center
  ON boxes (center_name);


-- What's in each box. Deleting a box deletes its items (CASCADE).
-- When a box is donated, its rows are copied into inventory_items.
CREATE TABLE IF NOT EXISTS box_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id         uuid NOT NULL REFERENCES boxes (id) ON DELETE CASCADE,
  category_name  text NOT NULL,   -- must match category_items, see FOREIGN KEY below
  item_name      text NOT NULL,   -- must match category_items, see FOREIGN KEY below
  price          numeric(10, 2) NOT NULL CHECK (price >= 0),   -- per unit, set by the donor
  quantity       integer NOT NULL CHECK (quantity > 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (category_name, item_name)
    REFERENCES category_items (category_name, item_name) ON DELETE RESTRICT
);

-- Fast lookup of one box's items.
CREATE INDEX ASYNC IF NOT EXISTS box_items_by_box
  ON box_items (box_id);
