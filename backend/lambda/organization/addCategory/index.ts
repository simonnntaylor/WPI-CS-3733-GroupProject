// POST /organization/addCategory
// Login required (any logged-in user, group is NOT checked for now).
// Request:  { "name": "Appliances" }
// Response: 200 { "name": "Appliances", "message": "Category successfully added" }
//           400 { "error": "Category name can't be an empty string" }
//           400 { "error": "Category already exists" }

import { query } from '../../shared/db';
import { getUsername } from '../../shared/auth';
import { ok, fail } from '../../shared/response';

export const handler = async (event: any) => {
  // 1. Make sure someone is logged in.
  const username = getUsername(event);
  if (!username) {
    return fail('Not logged in', 401);
  }

  // 2. Read the category name from the request body.
  //    event.body is a STRING of JSON, like '{"name":"Appliances"}'
  let name: string;
  try {
    const body = JSON.parse(event.body ?? '{}');
    name = typeof body.name === 'string' ? body.name.trim() : '';
  } catch {
    return fail('Request body must be valid JSON');
  }
  if (name === '') {
    return fail("Category name can't be an empty string");
  }

  // 3. Work out which organization owns the new category.
  //    TEMPORARY (group check off): if the logged-in user is an organization,
  //    use them. Otherwise fall back to the site's single organization, so
  //    any test account can add categories. Once group checks are back on,
  //    use requireGroup(event, 'Organization') and drop the fallback.
  const orgRows = await query(
    `SELECT username FROM organizations
      ORDER BY (username = $1) DESC, username
      LIMIT 1`,
    [username]
  );
  if (orgRows.length === 0) {
    return fail('No organization exists yet', 400);
  }
  const organization = orgRows[0].username;

  // 4. Add it. Category names are the primary key, so a duplicate name hits
  //    ON CONFLICT and inserts nothing: RETURNING then gives back no rows.
  const inserted = await query(
    `INSERT INTO categories (name, organization_username)
     VALUES ($1, $2)
     ON CONFLICT (name) DO NOTHING
     RETURNING name`,
    [name, organization]
  );
  if (inserted.length === 0) {
    return fail('Category already exists');
  }

  return ok({ name, message: 'Category successfully added' });
};
