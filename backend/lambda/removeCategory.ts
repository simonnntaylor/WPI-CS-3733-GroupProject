import { APIGatewayProxyHandler } from 'aws-lambda';
import { CategoryRepository, PgCategoryRepository } from './categoryRepository';
import { CategorySuccessResponse, ErrorResponse } from './types';
import { readName, respond } from './http';

// POST /removeCategory
export function createRemoveCategoryHandler(repo: CategoryRepository): APIGatewayProxyHandler {
  return async (event) => {
    try {
      const { name, badJson } = readName(event.body);

      if (badJson) {
        return respond(400, { error: 'Request body must be valid JSON' } satisfies ErrorResponse);
      }

      // An empty name can never match an existing category.
      const result = name === '' ? 'not_found' : await repo.remove(name);

      if (result === 'not_found') {
        return respond(400, { error: 'Category not found' } satisfies ErrorResponse);
      }
      if (result === 'in_use') {
        return respond(400, {
          error: 'Category is in use by inventory or boxes and cannot be removed',
        } satisfies ErrorResponse);
      }

      return respond(200, {
        name,
        message: 'Category successfully removed',
      } satisfies CategorySuccessResponse);
    } catch (err) {
      console.error('removeCategory failed', err);
      return respond(500, { error: 'Internal server error' } satisfies ErrorResponse);
    }
  };
}

export const handler = createRemoveCategoryHandler(new PgCategoryRepository());