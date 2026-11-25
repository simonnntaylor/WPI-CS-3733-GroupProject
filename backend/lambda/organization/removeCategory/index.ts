// POST /organization/removeCategory
// Login required (any logged-in user, group is NOT checked for now).
// Request:  { "name": "Appliances" }
// Response: 200 { "name": "Appliances", "message": "Category successfully removed" }
//           400 { "error": "Category not found" }
//           400 { "error": "Category is in use by inventory or boxes and cannot be removed" }
//
// Removing a category also removes its category items and any wish list
// entries for it (ON DELETE CASCADE in db/schema.sql). It is blocked while
// any inventory or box still uses one of its items (ON DELETE RESTRICT).

import { query } from '../../shared/db';
import { getUsername } from '../../shared/auth';
import { ok, fail } from '../../shared/response';

export const handler = async (event: any) => {
  // 1. Make sure someone is logged in.
  //    TEMPORARY: group check turned off. Later: requireGroup(event, 'Organization').
  const username = getUsername(event);
  if (!username) {
    return fail('Not logged in', 401);
  }

  // 2. Read the category name from the request body.
  let name: string;
  try {
    const body = JSON.parse(event.body ?? '{}');
    name = typeof body.name === 'string' ? body.name.trim() : '';
  } catch {
    return fail('Request body must be valid JSON');
  }
  if (name === '') {
    return fail('Category not found'); // an empty name can never match
  }

  // 3. Delete it. RETURNING gives back the deleted row, so no rows means
  //    there was no category with that name.
  let deleted: any[];
  try {
    deleted = await query('DELETE FROM categories WHERE name = $1 RETURNING name', [name]);
  } catch (err: any) {
    // 23503 = foreign key violation: inventory_items or box_items still use
    // an item in this category, so the database refuses (ON DELETE RESTRICT).
    if (err?.code === '23503') {
      return fail('Category is in use by inventory or boxes and cannot be removed');
    }
    throw err;
  }
  if (deleted.length === 0) {
    return fail('Category not found');
  }

  return ok({ name, message: 'Category successfully removed' });
};
