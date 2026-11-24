import { APIGatewayProxyHandler } from 'aws-lambda';
import { CategoryRepository, PgCategoryRepository } from './categoryRepository';
import { CategorySuccessResponse, ErrorResponse } from './types';
import { cognitoUsername, readName, respond } from './http';

// POST /addCategory
export function createAddCategoryHandler(repo: CategoryRepository): APIGatewayProxyHandler {
  return async (event) => {
    try {
      const { name, badJson } = readName(event.body);

      if (badJson) {
        return respond(400, { error: 'Request body must be valid JSON' } satisfies ErrorResponse);
      }
      if (name === '') {
        return respond(400, { error: "Category name can't be an empty string" } satisfies ErrorResponse);
      }

      const organization = cognitoUsername(event) ?? (await repo.findOnlyOrganization());
      if (!organization) {
        return respond(400, { error: 'Organization not found' } satisfies ErrorResponse);
      }

      const result = await repo.add(name, organization);
      if (result === 'duplicate') {
        return respond(400, { error: 'Category already exists' } satisfies ErrorResponse);
      }

      return respond(200, {
        name,
        message: 'Category successfully added',
      } satisfies CategorySuccessResponse);
    } catch (err) {
      console.error('addCategory failed', err);
      return respond(500, { error: 'Internal server error' } satisfies ErrorResponse);
    }
  };
}

export const handler = createAddCategoryHandler(new PgCategoryRepository());