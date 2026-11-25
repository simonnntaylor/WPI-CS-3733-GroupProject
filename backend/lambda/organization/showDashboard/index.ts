// GET /organization/showDashboard
// Login required (any logged-in user, group is NOT checked for now).
// Request:  no body or URL inputs.
// Response: everything the organization dashboard page displays:
//   - every donation center, with its total items and total $ value
//   - every category, with how many items it has and the items themselves
//     (name + low/high price), for the category dropdowns

import { query } from '../../shared/db';
import { getUsername } from '../../shared/auth';
import { ok, fail } from '../../shared/response';

export const handler = async (event: any) => {
  // 1. Make sure someone is logged in.
  //    TEMPORARY: group check turned off. To turn it back on, use
  //      const orgUsername = requireGroup(event, 'Organization');
  //    (import requireGroup instead of getUsername) and
  //    return fail('Only organizations can view this dashboard', 403) if null.
  //    Once it's on, also add "WHERE dc.organization_username = $1" below so
  //    an organization only sees its own centers. (There's only one
  //    organization right now, so every center is shown.)
  const username = getUsername(event);
  if (!username) {
    return fail('Not logged in', 401);
  }

  // 2. Every donation center with its inventory totals.
  //    LEFT JOIN keeps centers that have no inventory yet (their SUMs are
  //    NULL, so COALESCE turns them into 0). GROUP BY gives one row per center.
  const centerRows = await query(
    `SELECT dc.name, dc.street_address, dc.latitude, dc.longitude,
            COALESCE(SUM(i.quantity), 0)           AS total_items,
            COALESCE(SUM(i.price * i.quantity), 0) AS total_value
       FROM donation_centers dc
       LEFT JOIN inventory_items i ON i.center_name = dc.name
      GROUP BY dc.name, dc.street_address, dc.latitude, dc.longitude
      ORDER BY dc.name`
  );

  // 3. Every category with how many items it has (e.g. Clothing: 3).
  //    LEFT JOIN keeps categories with no items yet (count 0).
  const categoryRows = await query(
    `SELECT c.name, COUNT(ci.item_name) AS item_count
       FROM categories c
       LEFT JOIN category_items ci ON ci.category_name = c.name
      GROUP BY c.name
      ORDER BY c.name`
  );

  // 4. Every category item, so the page can show them when a category's
  //    arrow is clicked (e.g. Clothing -> Jacket $10-$40, Shoes $5-$30).
  const itemRows = await query(
    `SELECT category_name, item_name, low_price, high_price
       FROM category_items
      ORDER BY category_name, item_name`
  );

  // Group the items by category: { Clothing: [...], Toys: [...] }
  const itemsByCategory: Record<string, { name: string; lowPrice: number; highPrice: number }[]> = {};
  for (const row of itemRows) {
    if (!itemsByCategory[row.category_name]) {
      itemsByCategory[row.category_name] = [];
    }
    itemsByCategory[row.category_name].push({
      name: row.item_name,
      lowPrice: Number(row.low_price),
      highPrice: Number(row.high_price),
    });
  }

  // 5. Send it back. pg returns numeric/SUM/COUNT values as strings
  //    ("15", "176.00"), so convert them with Number().
  return ok({
    centers: centerRows.map((row) => ({
      name: row.name,
      address: row.street_address,
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      totalItems: Number(row.total_items),
      totalValue: Number(row.total_value),
    })),
    categories: categoryRows.map((row) => ({
      name: row.name,
      itemCount: Number(row.item_count),
      items: itemsByCategory[row.name] ?? [], // [] if the category has no items yet
    })),
  });
};
