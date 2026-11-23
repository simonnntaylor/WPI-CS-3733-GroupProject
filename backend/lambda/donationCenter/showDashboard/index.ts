// POST /donationCenter/showDashboard
// Request:  { "token": "..." }
// Response: everything the donation center dashboard page displays.

// TODO: replace this placeholder with the real query function from the
//       database branch once it's merged, e.g.
//       import { query } from "../../shared/db";
//       It should run one SQL statement (with ? placeholders filled from
//       `params`) and return the rows.
async function query(sql: string, params: unknown[] = []): Promise<any[]> {
  throw new Error("Database not connected yet");
}

// Reply helpers so success and error replies look the same.
// The headers let the frontend website call this API (CORS).
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
function ok(body: object) {
  return { statusCode: 200, headers, body: JSON.stringify(body) };
}
function fail(error: string) {
  return { statusCode: 400, headers, body: JSON.stringify({ error }) };
}

export const handler = async (event: { body?: string | null }) => {
  // 1. Read the request.
  //    event.body is a STRING of JSON, like '{"token":"abc123"}'
  let token: unknown;
  try {
    token = JSON.parse(event.body ?? "{}").token;
  } catch {
    return fail("Request body must be valid JSON");
  }

  // 2. Check the token.
  //    No token, or no matching unexpired token = not logged in.
  if (typeof token !== "string" || token === "") {
    return fail("Invalid or expired token");
  }
  const tokenRows = await query(
    "select donation_center_id from donation_center_tokens where token = ? and expires_at > now()",
    [token]
  );
  if (tokenRows.length === 0) {
    return fail("Invalid or expired token");
  }
  const centerId = tokenRows[0].donation_center_id;

  // 3. Look up the donation center's info (name and address).
  //    "left join" so a center with no address still shows up.
  const centerRows = await query(
    `select dc.name, a.address_line_1, a.city, a.region, a.postal_code
       from donation_centers dc
       left join addresses a on dc.address_id = a.id
      where dc.id = ?`,
    [centerId]
  );
  if (centerRows.length === 0) {
    return fail("Donation center does not exist");
  }
  const center = centerRows[0];

  // 4. Look up that center's inventory items, and its wish list
  //    (the two panels on the dashboard).
  const inventoryRows = await query(
    `select i.name, i.price, c.name as category
       from inventory_items inv
       join items i                on inv.item_id = i.id
       left join category_items ci on i.category_item_id = ci.id
       left join categories c      on ci.category_id = c.id
      where inv.donation_center_id = ?
      order by i.name`,
    [centerId]
  );
  const wishListRows = await query(
    `select ci.name, c.name as category
       from wishlist_items w
       join category_items ci on w.category_item_id = ci.id
       join categories c      on ci.category_id = c.id
      where w.donation_center_id = ?
      order by c.name, ci.name`,
    [centerId]
  );

  // MySQL returns decimal columns as text (like "12.50"), so turn prices into numbers.
  const inventory = inventoryRows.map((row) => ({
    name: row.name,
    category: row.category,
    price: row.price === null ? null : Number(row.price),
  }));

  // 5. Calculate the summary numbers ("Total Items" and "Total Value" in the Figma).
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price ?? 0), 0);

  // 6. Send it back.
  return ok({
    name: center.name,
    address: {
      line1: center.address_line_1,
      city: center.city,
      region: center.region,
      postalCode: center.postal_code,
    },
    wishList: wishListRows.map((row) => ({ name: row.name, category: row.category })),
    inventory,
    totalItems,
    totalValue: Math.round(totalValue * 100) / 100, // round to cents
  });
};
