import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib/core';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
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
    const schema = new cdk.CustomResource(this, 'Schema', {
      serviceToken: schemaProvider.serviceToken,
      properties: {
        Sql: fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8'),
      },
    });

    // ---------------------------------------------------------------------
    // Category API: Add Category, Remove Category, and List Categories.
    // ---------------------------------------------------------------------
    const categoryFn = (id: string, file: string) => {
      const fn = new nodejs.NodejsFunction(this, id, {
        entry: path.join(__dirname, `../lambda/${file}.ts`),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(15),
        environment: { DB_ENDPOINT: this.dbEndpoint },
        bundling: { externalModules: ['pg-native'] },
      });
      this.grantDbAccess(fn);
      // Make sure the tables exist before the first request can arrive.
      fn.node.addDependency(schema);
      return fn;
    };

    const addCategoryFn = categoryFn('AddCategoryFunction', 'addCategory');
    const removeCategoryFn = categoryFn('RemoveCategoryFunction', 'removeCategory');
    const listCategoriesFn = categoryFn('ListCategoriesFunction', 'listCategories');

    const api = new apigateway.RestApi(this, 'DonazionApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    api.root.addResource('addCategory').addMethod('POST', new apigateway.LambdaIntegration(addCategoryFn));
    api.root.addResource('removeCategory').addMethod('POST', new apigateway.LambdaIntegration(removeCategoryFn));
    api.root.addResource('listCategories').addMethod('GET', new apigateway.LambdaIntegration(listCategoriesFn));

    // Printed after `cdk deploy`, handy for connecting with psql.
    new cdk.CfnOutput(this, 'DatabaseEndpoint', { value: this.dbEndpoint });
     new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
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
