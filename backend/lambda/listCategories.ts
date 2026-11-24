import { APIGatewayProxyHandler } from 'aws-lambda';
import { CategoryRepository, PgCategoryRepository } from './categoryRepository';
import { ErrorResponse, ListCategoriesResponse } from './types';
import { respond } from './http';

// GET /listCategories
export function createListCategoriesHandler(repo: CategoryRepository): APIGatewayProxyHandler {
  return async () => {
    try {
      const categories = await repo.list();
      return respond(200, { categories } satisfies ListCategoriesResponse);
    } catch (err) {
      console.error('listCategories failed', err);
      return respond(500, { error: 'Internal server error' } satisfies ErrorResponse);
    }
  };
}

export const handler = createListCategoriesHandler(new PgCategoryRepository());