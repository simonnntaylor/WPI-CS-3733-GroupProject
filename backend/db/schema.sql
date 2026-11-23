-- Consolidated schema (MySQL 8 / AWS RDS)
--
-- Notes on the MySQL version:
-- * updated_at is kept current by "on update current_timestamp", so no trigger is needed.
-- * MySQL automatically indexes every foreign key column, so no separate indexes are needed.
-- * Names use varchar(255) instead of text, because MySQL can't put a unique
--   constraint or index on a text column without a length.

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
create table organizations (
  id             bigint auto_increment primary key,
  name           varchar(255) not null,
  username       varchar(255) not null unique,   -- the "user" in /loginOrganization
  password_hash  varchar(255) not null,          -- bcrypt hash, never the plain password
  created_at     timestamp not null default current_timestamp,
  updated_at     timestamp not null default current_timestamp on update current_timestamp
);

-- ---------------------------------------------------------------------------
-- Addresses
-- ---------------------------------------------------------------------------
create table addresses (
  id              bigint auto_increment primary key,
  address_line_1  varchar(255) not null,
  address_line_2  varchar(255),
  city            varchar(255),
  region          varchar(255),           -- state / province / county
  postal_code     varchar(20),
  country_code    char(2) not null,       -- ISO 3166-1 alpha-2, e.g. 'US'
  latitude        decimal(9, 6),
  longitude       decimal(9, 6),
  created_at      timestamp not null default current_timestamp,
  updated_at      timestamp not null default current_timestamp on update current_timestamp
);

-- ---------------------------------------------------------------------------
-- Categories (per organization) and category items (with price range)
-- ---------------------------------------------------------------------------
create table categories (
  id               bigint auto_increment primary key,
  name             varchar(255) not null,
  organization_id  bigint not null,
  created_at       timestamp not null default current_timestamp,
  updated_at       timestamp not null default current_timestamp on update current_timestamp,
  foreign key (organization_id) references organizations (id) on delete cascade
);

create table category_items (
  id           bigint auto_increment primary key,
  name         varchar(255) not null,
  category_id  bigint not null,
  low_price    decimal(10, 2),
  high_price   decimal(10, 2),
  created_at   timestamp not null default current_timestamp,
  updated_at   timestamp not null default current_timestamp on update current_timestamp,
  foreign key (category_id) references categories (id) on delete cascade,
  check (low_price is null or low_price >= 0),
  check (low_price is null or high_price is null or low_price <= high_price)
);

-- ---------------------------------------------------------------------------
-- Items
-- ---------------------------------------------------------------------------
create table items (
  id                bigint auto_increment primary key,
  name              varchar(255) not null,
  price             decimal(10, 2),
  category_item_id  bigint,
  created_at        timestamp not null default current_timestamp,
  updated_at        timestamp not null default current_timestamp on update current_timestamp,
  foreign key (category_item_id) references category_items (id) on delete set null,
  check (price is null or price >= 0)
);

-- ---------------------------------------------------------------------------
-- Donation centers
-- ---------------------------------------------------------------------------
create table donation_centers (
  id               bigint auto_increment primary key,
  name             varchar(255) not null,          -- also the "user" in /loginDonationCenter
  password_hash    varchar(255) not null,          -- bcrypt hash, never the plain password
  organization_id  bigint not null,
  address_id       bigint,
  created_at       timestamp not null default current_timestamp,
  updated_at       timestamp not null default current_timestamp on update current_timestamp,
  foreign key (organization_id) references organizations (id) on delete cascade,
  foreign key (address_id) references addresses (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- Login tokens: created at login, sent with every request, checked by each Lambda.
-- Deleting an account deletes its tokens too (logs it out everywhere).
-- ---------------------------------------------------------------------------
create table organization_tokens (
  token            varchar(255) primary key,
  organization_id  bigint not null,
  expires_at       timestamp not null,
  created_at       timestamp not null default current_timestamp,
  foreign key (organization_id) references organizations (id) on delete cascade
);

create table donation_center_tokens (
  token               varchar(255) primary key,
  donation_center_id  bigint not null,
  expires_at          timestamp not null,
  created_at          timestamp not null default current_timestamp,
  foreign key (donation_center_id) references donation_centers (id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Boxes and their contents
-- ---------------------------------------------------------------------------
create table boxes (
  id                  bigint auto_increment primary key,
  name                varchar(255),
  donation_center_id  bigint not null,
  status              enum('open', 'donated') not null default 'open',  -- 'open' while the donor is packing
  created_at          timestamp not null default current_timestamp,
  updated_at          timestamp not null default current_timestamp on update current_timestamp,
  foreign key (donation_center_id) references donation_centers (id) on delete cascade
);

create table box_items (
  id          bigint auto_increment primary key,
  box_id      bigint not null,
  item_id     bigint not null,
  created_at  timestamp not null default current_timestamp,
  updated_at  timestamp not null default current_timestamp on update current_timestamp,
  foreign key (box_id) references boxes (id) on delete cascade,
  foreign key (item_id) references items (id) on delete restrict
);

-- ---------------------------------------------------------------------------
-- Inventory: what each donation center currently has.
-- Filled when a box is donated (/completeBoxDonation copies its items here),
-- or directly by the center's Add Item / Remove Item buttons.
-- ---------------------------------------------------------------------------
create table inventory_items (
  id                  bigint auto_increment primary key,
  donation_center_id  bigint not null,
  item_id             bigint not null,
  created_at          timestamp not null default current_timestamp,
  updated_at          timestamp not null default current_timestamp on update current_timestamp,
  foreign key (donation_center_id) references donation_centers (id) on delete cascade,
  foreign key (item_id) references items (id) on delete restrict
);

-- ---------------------------------------------------------------------------
-- Wishlist: which category items a donation center wants
-- ---------------------------------------------------------------------------
create table wishlist_items (
  id                  bigint auto_increment primary key,
  donation_center_id  bigint not null,
  category_item_id    bigint not null,
  created_at          timestamp not null default current_timestamp,
  updated_at          timestamp not null default current_timestamp on update current_timestamp,
  foreign key (donation_center_id) references donation_centers (id) on delete cascade,
  foreign key (category_item_id) references category_items (id) on delete cascade,
  unique (donation_center_id, category_item_id)
);
