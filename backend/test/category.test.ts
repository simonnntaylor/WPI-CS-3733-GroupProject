import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import {
  AddResult,
  CategoryRepository,
  RemoveResult,
} from '../lambda/categoryRepository';
import { createAddCategoryHandler } from '../lambda/addCategory';
import { createRemoveCategoryHandler } from '../lambda/removeCategory';
import { createListCategoriesHandler } from '../lambda/listCategories';

// In-memory stand-in for the database.
class FakeRepo implements CategoryRepository {
  categories = new Map<string, string>(); // name -> organization
  inUse = new Set<string>(); // categories that inventory still uses
  organization: string | null = 'org1';

  async add(name: string, org: string): Promise<AddResult> {
    if (this.categories.has(name)) return 'duplicate';
    this.categories.set(name, org);
    return 'added';
  }
  async remove(name: string): Promise<RemoveResult> {
    if (!this.categories.has(name)) return 'not_found';
    if (this.inUse.has(name)) return 'in_use';
    this.categories.delete(name);
    return 'removed';
  }
  async list(): Promise<string[]> {
    return [...this.categories.keys()].sort();
  }
  async findOnlyOrganization(): Promise<string | null> {
    return this.organization;
  }
}

const call = (handler: any, body: unknown, claims?: object) =>
  handler(
    {
      body: body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body),
      requestContext: { authorizer: claims ? { claims } : undefined },
    } as unknown as APIGatewayProxyEvent,
    {} as Context,
    () => {},
  );

describe('addCategory', () => {
  let repo: FakeRepo;
  let add: ReturnType<typeof createAddCategoryHandler>;

  beforeEach(() => {
    repo = new FakeRepo();
    add = createAddCategoryHandler(repo);
  });

  it('adds a new category', async () => {
    const res = await call(add, { name: 'Appliances' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ name: 'Appliances', message: 'Category successfully added' });
    expect(repo.categories.get('Appliances')).toBe('org1');
  });

  it('trims the name and uses the Cognito user as the owner', async () => {
    await call(add, { name: '  Furniture ' }, { 'cognito:username': 'donazion-org' });
    expect(repo.categories.get('Furniture')).toBe('donazion-org');
  });

  it('rejects an empty name', async () => {
    const res = await call(add, { name: '   ' });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe("Category name can't be an empty string");
  });

  it('rejects a missing body', async () => {
    const res = await call(add, undefined);
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid JSON', async () => {
    const res = await call(add, '{not json');
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Request body must be valid JSON');
  });

  it('rejects a duplicate category', async () => {
    await call(add, { name: 'Appliances' });
    const res = await call(add, { name: 'Appliances' });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Category already exists');
  });

  it('rejects when no organization exists', async () => {
    repo.organization = null;
    const res = await call(add, { name: 'Appliances' });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Organization not found');
  });

  it('returns 500 when the database fails', async () => {
    repo.add = async () => {
      throw new Error('db down');
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await call(add, { name: 'Appliances' });
    expect(res.statusCode).toBe(500);
  });
});

describe('removeCategory', () => {
  let repo: FakeRepo;
  let remove: ReturnType<typeof createRemoveCategoryHandler>;

  beforeEach(async () => {
    repo = new FakeRepo();
    await repo.add('Appliances', 'org1');
    remove = createRemoveCategoryHandler(repo);
  });

  it('removes an existing category', async () => {
    const res = await call(remove, { name: 'Appliances' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ name: 'Appliances', message: 'Category successfully removed' });
    expect(repo.categories.has('Appliances')).toBe(false);
  });

  it('rejects a category that does not exist', async () => {
    const res = await call(remove, { name: 'Furniture' });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Category not found');
  });

  it('rejects an empty name as not found', async () => {
    const res = await call(remove, { name: '' });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Category not found');
  });

  it('rejects a category still used by inventory or boxes', async () => {
    repo.inUse.add('Appliances');
    const res = await call(remove, { name: 'Appliances' });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Category is in use by inventory or boxes and cannot be removed');
    expect(repo.categories.has('Appliances')).toBe(true);
  });
});

describe('listCategories', () => {
  it('returns categories in alphabetical order', async () => {
    const repo = new FakeRepo();
    await repo.add('Furniture', 'org1');
    await repo.add('Appliances', 'org1');
    const res = await call(createListCategoriesHandler(repo), undefined);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ categories: ['Appliances', 'Furniture'] });
  });
});