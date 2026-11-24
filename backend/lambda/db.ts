// Opens a short-lived connection to Aurora DSQL using an IAM token, the same
// way db/runSchema.ts does. The Lambda needs grantDbAccess() in the CDK stack.
import { Client } from 'pg';
import { DsqlSigner } from '@aws-sdk/dsql-signer';

export async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const hostname = process.env.DB_ENDPOINT!;
  const region = process.env.AWS_REGION!;

  const signer = new DsqlSigner({ hostname, region });
  const client = new Client({
    host: hostname,
    port: 5432,
    user: 'admin',
    database: 'postgres',
    password: await signer.getDbConnectAdminAuthToken(),
    ssl: true,
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}