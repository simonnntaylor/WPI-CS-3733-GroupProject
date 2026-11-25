// GET /donationCenter/showDashboard
// Login required (any logged-in user, group is NOT checked for now).
// Request:  no body or URL inputs. WHO is asking comes from the Cognito login.
// Response: everything the donation center dashboard page displays.

import { query } from '../../shared/db';
import { getUsername } from '../../shared/auth';
import { ok, fail } from '../../shared/response';

export const handler = async (event: any) => {
  // 1. Find out which center is asking.
  //    API Gateway already checked the login. getUsername reads who it is:
  //    the center's name (its Cognito username).
  //    TEMPORARY: group check turned off. To turn it back on, use
  //      const centerName = requireGroup(event, 'DonationCenter');
  //    (import requireGroup instead of getUsername) and
  //    return fail('Only donation centers can view this dashboard', 403) if null.
  const centerName = getUsername(event);
  if (!centerName) {
    return fail('Not logged in', 401);
  }

  // TODO 2. Look up the center's info.
  //   - Table: donation_centers. Columns: name, street_address, latitude, longitude.
  //   - Filter with WHERE name = $1 and pass [centerName] as the params.
  //   - query() returns an array of rows. If it's empty, return
  //     fail('Donation center not found', 404).
  const centerRows = await query(
    'SELECT name, street_address, latitude, longitude FROM donation_centers WHERE name = $1',
    [centerName]
  );
  if (centerRows.length === 0) {
    return fail('Donation center not found', 404);
  }
  const centerInfo = centerRows[0];

  // TODO 3. Look up the center's inventory.
  //   - Table: inventory_items. Columns: id, category_name, item_name, price, quantity.
  //   - WHERE center_name = $1. Add ORDER BY so the list has a stable order.
  const inventoryRows = await query(
    'SELECT id, category_name, item_name, price, quantity FROM inventory_items WHERE center_name = $1 ORDER BY category_name, item_name',
    [centerName]
  );

  // TODO 4. Look up the center's wish list.
  //   - Table: wish_list. Column: category_name (whole categories, no items).
  //   - WHERE center_name = $1, ORDER BY category_name.
  const wishListRows = await query(
    'SELECT category_name FROM wish_list WHERE center_name = $1 ORDER BY category_name',
    [centerName]
  );

  // TODO 5. Calculate the totals ("Total Items" and "Total Value" on the page).
  //   - Either in SQL:
  //       SELECT SUM(quantity) AS total_items, SUM(price * quantity) AS total_value
  //       FROM inventory_items WHERE center_name = $1
  //     (SUM returns null when there are no rows, so use ?? 0)
  //   - pg returns numeric/SUM values as STRINGS ("15.00"): wrap them in Number().
  const totalsRow = await query(
    'SELECT COALESCE(SUM(quantity), 0) AS total_items, COALESCE(SUM(price * quantity), 0) AS total_value FROM inventory_items WHERE center_name = $1',
    [centerName]
  );
  const totals = totalsRow[0];
  const totalItems = Number(totals.total_items);
  const totalValue = Number(totals.total_value); 

  // TODO 6. Send it back with ok({ ... }).
  //   - Agree on the field names with frontend/app/center/page.tsx, e.g.
  //     { name, address, wishList, inventory, totalItems, totalValue }
  //   - Convert prices with Number(row.price) before sending.
  return ok({
    name: centerInfo.name,
    address: centerInfo.street_address,
    latitude: centerInfo.latitude == null ? null : Number(centerInfo.latitude),
    longitude: centerInfo.longitude == null ? null : Number(centerInfo.longitude),
    wishList: wishListRows.map((row) => row.category_name),
    inventory: inventoryRows.map((row) => ({
      id: row.id,
      category: row.category_name,
      name: row.item_name,
      price: Number(row.price),
      quantity: Number(row.quantity),
    })),
    totalItems,
    totalValue,
  });

  

};
