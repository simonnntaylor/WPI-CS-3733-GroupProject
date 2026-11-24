import {
  addCategory,
  CategoryRepository,
  CategoryUseCaseError,
  removeCategory,
} from '../lib/category-use-cases';

function createRepository(): jest.Mocked<CategoryRepository> {
  return {
    createCategory: jest.fn(),
    deactivateCategory: jest.fn(),
  };
}

describe('addCategory', () => {
  const organizationUsername = 'org@example.com';

  it('trims and creates a category, returning the API success payload', async () => {
    const repository = createRepository();
    repository.createCategory.mockResolvedValue(true);

    await expect(
      addCategory('  Appliances  ', organizationUsername, repository),
    ).resolves.toEqual({
      name: 'Appliances',
      message: 'Category successfully added',
    });
    expect(repository.createCategory).toHaveBeenCalledWith(
      'Appliances',
      organizationUsername,
    );
  });

  it('rejects an empty or whitespace-only name without calling persistence', async () => {
    const repository = createRepository();

    await expect(
      addCategory('   ', organizationUsername, repository),
    ).rejects.toMatchObject({
      name: 'CategoryUseCaseError',
      message: "Category name can't be an empty string",
      statusCode: 400,
    });
    expect(repository.createCategory).not.toHaveBeenCalled();
  });

  it('rejects a non-string name', async () => {
    const repository = createRepository();

    await expect(
      addCategory(undefined, organizationUsername, repository),
    ).rejects.toBeInstanceOf(CategoryUseCaseError);
    expect(repository.createCategory).not.toHaveBeenCalled();
  });

  it('returns the documented duplicate-category error', async () => {
    const repository = createRepository();
    repository.createCategory.mockResolvedValue(false);

    await expect(
      addCategory('Appliances', organizationUsername, repository),
    ).rejects.toMatchObject({
      message: 'Category already exists',
      statusCode: 400,
    });
  });

  it('requires an authenticated organization context', async () => {
    const repository = createRepository();

    await expect(addCategory('Appliances', '', repository)).rejects.toMatchObject({
      message: 'Invalid organization',
      statusCode: 401,
    });
    expect(repository.createCategory).not.toHaveBeenCalled();
  });
});

describe('removeCategory', () => {
  const organizationUsername = 'org@example.com';

  it('deactivates the category and returns the API success payload', async () => {
    const repository = createRepository();
    repository.deactivateCategory.mockResolvedValue(true);

    await expect(
      removeCategory('  Appliances  ', organizationUsername, repository),
    ).resolves.toEqual({
      name: 'Appliances',
      message: 'Category successfully removed',
    });
    expect(repository.deactivateCategory).toHaveBeenCalledWith(
      'Appliances',
      organizationUsername,
    );
  });

  it('allows removal of a category in use; repository deactivation preserves its data', async () => {
    const repository = createRepository();
    // The use case does not reject based on usage. The persistence adapter
    // should deactivate the category without deleting dependent records.
    repository.deactivateCategory.mockResolvedValue(true);

    await expect(
      removeCategory('Clothing', organizationUsername, repository),
    ).resolves.toEqual({
      name: 'Clothing',
      message: 'Category successfully removed',
    });
  });

  it('returns the documented not-found error', async () => {
    const repository = createRepository();
    repository.deactivateCategory.mockResolvedValue(false);

    await expect(
      removeCategory('Missing', organizationUsername, repository),
    ).rejects.toMatchObject({
      message: 'Category not found',
      statusCode: 400,
    });
  });

  it('rejects an empty name without calling persistence', async () => {
    const repository = createRepository();

    await expect(
      removeCategory('   ', organizationUsername, repository),
    ).rejects.toMatchObject({
      message: "Category name can't be an empty string",
      statusCode: 400,
    });
    expect(repository.deactivateCategory).not.toHaveBeenCalled();
  });
});
