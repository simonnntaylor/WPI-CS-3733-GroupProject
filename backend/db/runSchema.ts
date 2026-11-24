// Setup Lambda: runs db/schema.sql against the DSQL cluster.
//
// CDK can create the DSQL cluster but not the tables inside it, so
// lib/backend-stack.ts wires this Lambda up as a "custom resource":
// CloudFormation calls it during `cdk deploy`, passing the contents of
// schema.sql as event.ResourceProperties.Sql. It runs again whenever
// schema.sql changes.

import { Client } from 'pg';
import { DsqlSigner } from '@aws-sdk/dsql-signer';

export async function handler(event: any) {
  // Nothing to do when the stack is deleted: the cluster is deleted with it.
  if (event.RequestType === 'Delete') {
    return { PhysicalResourceId: event.PhysicalResourceId };
  }

  const hostname = process.env.DB_ENDPOINT!;
  const region = process.env.AWS_REGION!;

  // DSQL has no password. We sign in with a short-lived token made from
  // this Lambda's IAM permissions.
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
    // DSQL allows only one DDL statement per transaction, so run them one
    // at a time. Strip "--" comments first, then split on semicolons.
    const statements = String(event.ResourceProperties.Sql)
      .replace(/--.*$/gm, '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sql of statements) {
      console.log('Running:', sql.split('\n')[0]);
      await client.query(sql);
    }
  } finally {
    await client.end();
  }

  return { PhysicalResourceId: 'donazion-schema' };
}
