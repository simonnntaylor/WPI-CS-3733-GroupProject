import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib/core';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dsql from 'aws-cdk-lib/aws-dsql';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {
  // Public so Lambdas defined later can be pointed at the database:
  //   environment: { DB_ENDPOINT: this.dbEndpoint }
  //   and given permission with this.grantDbAccess(myFunction)
  public readonly dbCluster: dsql.CfnCluster;
  public readonly dbEndpoint: string;
  public readonly api: apigw.RestApi;
  private readonly authorizer: apigw.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---------------------------------------------------------------------
    // Database: one Aurora DSQL cluster (PostgreSQL-compatible, serverless).
    // - No VPC and no password: Lambdas connect with IAM tokens.
    // - Deletion protection off + DESTROY: `cdk destroy` deletes the cluster
    //   and its data too.
    // ---------------------------------------------------------------------
    this.dbCluster = new dsql.CfnCluster(this, 'Database', {
      deletionProtectionEnabled: false,
    });
    this.dbCluster.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    this.dbEndpoint = this.dbCluster.attrEndpoint;

    // ---------------------------------------------------------------------
    // Tables: CDK can't create tables inside DSQL, so a small setup Lambda
    // (db/runSchema.ts) runs db/schema.sql during deploy. Because the SQL is
    // passed in as a property, editing schema.sql makes it run again.
    // ---------------------------------------------------------------------
    const runSchemaFn = new nodejs.NodejsFunction(this, 'RunSchemaFunction', {
      entry: path.join(__dirname, '../db/runSchema.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.minutes(5),
      environment: { DB_ENDPOINT: this.dbEndpoint },
      bundling: {
        // Bundle everything (the DSQL signer isn't built into Lambda).
        // pg-native is an optional add-on to pg that we don't use.
        externalModules: ['pg-native'],
      },
    });
    this.grantDbAccess(runSchemaFn);

    const schemaProvider = new cr.Provider(this, 'SchemaProvider', {
      onEventHandler: runSchemaFn,
    });
    new cdk.CustomResource(this, 'Schema', {
      serviceToken: schemaProvider.serviceToken,
      properties: {
        Sql: fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8'),
      },
    });

    // Printed after `cdk deploy`, handy for connecting with psql.
    new cdk.CfnOutput(this, 'DatabaseEndpoint', { value: this.dbEndpoint });

    // ---------------------------------------------------------------------
    // API: one REST API that the frontend calls.
    // - CORS allows any website for now (tighten before the final demo).
    // - Login uses the team's existing Cognito user pool (made in the AWS
    //   Console, not by CDK). The stack must deploy to us-east-1, same as
    //   the pool.
    // ---------------------------------------------------------------------
    this.api = new apigw.RestApi(this, 'Api', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    // When API Gateway itself rejects a request (e.g. 401 not logged in), add
    // the CORS header so the browser shows the real error, not a CORS error.
    for (const type of [apigw.ResponseType.DEFAULT_4XX, apigw.ResponseType.DEFAULT_5XX]) {
      this.api.addGatewayResponse(`Cors${type.responseType}`, {
        type,
        responseHeaders: { 'Access-Control-Allow-Origin': "'*'" },
      });
    }

    const userPool = cognito.UserPool.fromUserPoolId(this, 'UserPool', 'us-east-1_pu2srHftk');
    this.authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    });

    // ---------------------------------------------------------------------
    // Endpoints. URLs are grouped by actor:
    //   /organization/...    Organization users (login required)
    //   /donationCenter/...  Donation center users (login required)
    //   /donor/...           anyone (no login)
    // GET for reads (inputs in the URL), POST for changes (inputs in the body).
    // Add yours here, e.g.:
    //   this.addEndpoint('GET', 'donationCenter/showDashboard',
    //                    'lambda/donationCenter/showDashboard/index.ts');
    // ---------------------------------------------------------------------
    this.addEndpoint('GET', 'whoami', 'lambda/whoami/index.ts');
    this.addEndpoint('GET', 'donationCenter/showDashboard', 'lambda/donationCenter/showDashboard/index.ts');

    // Printed after `cdk deploy`. The frontend needs this URL.
    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.url });
  }

  // Creates a Lambda from `entry` and connects it to the API at `urlPath`.
  // Every endpoint gets database access. Login is required unless the path
  // starts with "donor/" or requireLogin is false.
  public addEndpoint(
    method: 'GET' | 'POST',
    urlPath: string,
    entry: string,
    requireLogin = !urlPath.startsWith('donor/'),
  ) {
    // e.g. 'donationCenter/showDashboard' -> 'DonationCenterShowDashboard'
    const id = urlPath
      .split(/[/-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    const fn = new nodejs.NodejsFunction(this, `${id}Function`, {
      entry: path.join(__dirname, '..', entry),
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30),
      environment: { DB_ENDPOINT: this.dbEndpoint },
      bundling: { externalModules: ['pg-native'] },
    });
    this.grantDbAccess(fn);

    this.api.root.resourceForPath(urlPath).addMethod(
      method,
      new apigw.LambdaIntegration(fn),
      requireLogin
        ? { authorizer: this.authorizer, authorizationType: apigw.AuthorizationType.COGNITO }
        : {},
    );
    return fn;
  }

  // Lets a Lambda connect to the database as the admin user.
  public grantDbAccess(fn: lambda.IFunction) {
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dsql:DbConnectAdmin'],
        resources: [this.dbCluster.attrResourceArn],
      }),
    );
  }
}
