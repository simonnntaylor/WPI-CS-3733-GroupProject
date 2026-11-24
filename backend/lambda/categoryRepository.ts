import { withClient } from './db';

export type AddResult = 'added' | 'duplicate';
export type RemoveResult = 'removed' | 'not_found' | 'in_use';

export interface CategoryRepository {
  add(name: string, organizationUsername: string): Promise<AddResult>;
  remove(name: string): Promise<RemoveResult>;
  list(): Promise<string[]>;
  /** The site has a single organization. Used when no Cognito user is available. */
  findOnlyOrganization(): Promise<string | null>;
}

// categories.name is the primary key, so names are unique across the table.
export class PgCategoryRepository implements CategoryRepository {
  async add(name: string, organizationUsername: string): Promise<AddResult> {
    return withClient(async (db) => {
      const res = await db.query(
        `INSERT INTO categories (name, organization_username)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING
         RETURNING name`,
        [name, organizationUsername],
      );
      return res.rowCount === 1 ? 'added' : 'duplicate';
    });
  }

  async remove(name: string): Promise<RemoveResult> {
    return withClient(async (db) => {
      try {
        const res = await db.query(
          'DELETE FROM categories WHERE name = $1 RETURNING name',
          [name],
        );
        return res.rowCount === 1 ? 'removed' : 'not_found';
      } catch (err: any) {
        // 23503 = foreign_key_violation: inventory_items or box_items still
        // use an item in this category (ON DELETE RESTRICT).
        if (err?.code === '23503') return 'in_use';
        throw err;
      }
    });
  }

  async list(): Promise<string[]> {
    return withClient(async (db) => {
      const res = await db.query('SELECT name FROM categories ORDER BY name');
      return res.rows.map((r) => r.name as string);
    });
  }

  async findOnlyOrganization(): Promise<string | null> {
    return withClient(async (db) => {
      const res = await db.query('SELECT username FROM organizations LIMIT 1');
      return res.rows[0]?.username ?? null;
    });
  }
}