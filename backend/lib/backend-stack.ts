import * as cdk from 'aws-cdk-lib/core';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {
  // The tables are public so Lambdas defined later in this file can be
  // given access, e.g. this.donationCenters.grantReadData(myFunction)
  public readonly organizations: dynamodb.TableV2;
  public readonly donationCenters: dynamodb.TableV2;
  public readonly categories: dynamodb.TableV2;
  public readonly categoryItems: dynamodb.TableV2;
  public readonly inventory: dynamodb.TableV2;
  public readonly wishList: dynamodb.TableV2;
  public readonly boxes: dynamodb.TableV2;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---------------------------------------------------------------------
    // DynamoDB tables. See db/schema.sql for every table's fields.
    //
    // Settings shared by every table:
    // - On-demand billing: pay per request, no capacity to manage.
    // - DESTROY: `cdk destroy` deletes the tables and their data too.
    // - No tableName: CDK generates a unique name, so teammates can each
    //   deploy their own copy. Lambdas get the real names via env variables.
    // ---------------------------------------------------------------------
    const shared = {
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    };
    const str = dynamodb.AttributeType.STRING;

    // The one organization. Key matches its Cognito username.
    this.organizations = new dynamodb.TableV2(this, 'Organizations', {
      ...shared,
      partitionKey: { name: 'username', type: str },
    });

    // Donation centers. Key matches the center's Cognito username, and makes
    // names unique. Also stores running totalItems / totalValue.
    this.donationCenters = new dynamodb.TableV2(this, 'DonationCenters', {
      ...shared,
      partitionKey: { name: 'name', type: str },
    });

    // Categories, e.g. "Clothing".
    this.categories = new dynamodb.TableV2(this, 'Categories', {
      ...shared,
      partitionKey: { name: 'categoryName', type: str },
    });

    // Items in each category with a price range, e.g. Clothing / Shoes.
    // Query by categoryName to get every item in a category.
    this.categoryItems = new dynamodb.TableV2(this, 'CategoryItems', {
      ...shared,
      partitionKey: { name: 'categoryName', type: str },
      sortKey: { name: 'itemName', type: str },
    });

    // What each center has. One row per donated line (separate rows even for
    // the same item name, since donors set their own prices).
    // Query by centerName to get a center's whole inventory.
    this.inventory = new dynamodb.TableV2(this, 'Inventory', {
      ...shared,
      partitionKey: { name: 'centerName', type: str },
      sortKey: { name: 'itemId', type: str },
    });

    // Which categories each center wants. Query by centerName for a center's
    // wish list, or use the byCategory index to find every center wanting a
    // category (/searchDonationCenters).
    this.wishList = new dynamodb.TableV2(this, 'WishList', {
      ...shared,
      partitionKey: { name: 'centerName', type: str },
      sortKey: { name: 'categoryName', type: str },
      globalSecondaryIndexes: [
        {
          indexName: 'byCategory',
          partitionKey: { name: 'categoryName', type: str },
          sortKey: { name: 'centerName', type: str },
        },
      ],
    });

    // Donor boxes. Contents are stored as a list inside the row.
    this.boxes = new dynamodb.TableV2(this, 'Boxes', {
      ...shared,
      partitionKey: { name: 'boxId', type: str },
    });

    // Print the generated table names after `cdk deploy`, so they're easy
    // to find in the AWS Console.
    const tables = {
      OrganizationsTable: this.organizations,
      DonationCentersTable: this.donationCenters,
      CategoriesTable: this.categories,
      CategoryItemsTable: this.categoryItems,
      InventoryTable: this.inventory,
      WishListTable: this.wishList,
      BoxesTable: this.boxes,
    };
    for (const [outputName, table] of Object.entries(tables)) {
      new cdk.CfnOutput(this, outputName, { value: table.tableName });
    }
  }
}
