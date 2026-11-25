// Shared database helper for every endpoint Lambda.
//
// Usage:
//   import { query } from '../../shared/db';
//   const rows = await query('SELECT * FROM inventory_items WHERE center_name = $1', [name]);
//
// $1, $2, ... are placeholders filled from the params array. Always use them
// instead of building SQL strings yourself (prevents SQL injection).
//
// Notes:
// * numeric columns (prices) come back as strings, e.g. "15.00". Use Number().
// * DSQL has no triggers: every UPDATE must also SET updated_at = now().

import { Pool } from 'pg';
import { DsqlSigner } from '@aws-sdk/dsql-signer';

const hostname = process.env.DB_ENDPOINT!;
const signer = new DsqlSigner({ hostname, region: process.env.AWS_REGION! });

// Created once per Lambda container and reused between requests.
// DSQL has no password: each new connection gets a fresh short-lived token
// made from the Lambda's IAM permissions.
const pool = new Pool({
  host: hostname,
  port: 5432,
  user: 'admin',
  database: 'postgres',
  password: () => signer.getDbConnectAdminAuthToken(),
  ssl: true,
  max: 1, // a Lambda handles one request at a time
});

export async function query(sql: string, params: unknown[] = []): Promise<any[]> {
  const result = await pool.query(sql, params);
  return result.rows;
}
