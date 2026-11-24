/**
 * Application use cases for managing organization categories.
 *
 * Persistence is deliberately behind CategoryRepository so the use cases can
 * be tested without AWS or a database connection. The repository adapter must
 * scope every operation to organizationUsername and implement removal as a
 * soft-delete/deactivation: category items, inventory, and box data must stay
 * available when a category is removed.
 */

export interface CategoryRepository {
  /** Creates an active category. Returns false if that name already exists. */
  createCategory(name: string, organizationUsername: string): Promise<boolean>;

  /** Deactivates an active category. Returns false when it does not exist. */
  deactivateCategory(
    name: string,
    organizationUsername: string,
  ): Promise<boolean>;
}

export interface CategoryUseCaseResult {
  name: string;
  message: string;
}

export class CategoryUseCaseError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'CategoryUseCaseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function normalizeRequiredName(name: unknown): string {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new CategoryUseCaseError(
      "Category name can't be an empty string",
      400,
    );
  }

  return name.trim();
}

function requireOrganizationUsername(organizationUsername: unknown): string {
  if (
    typeof organizationUsername !== 'string' ||
    organizationUsername.trim().length === 0
  ) {
    // The API contract only includes the category name. The caller must pass
    // this value from the authenticated organization, never from request JSON.
    throw new CategoryUseCaseError('Invalid organization', 401);
  }

  return organizationUsername.trim();
}

/**
 * Add a category for the authenticated organization.
 *
 * Names are trimmed before persistence. The repository should enforce
 * uniqueness atomically (for example with a database unique constraint) and
 * return false for an existing category.
 */
export async function addCategory(
  name: unknown,
  organizationUsername: unknown,
  repository: CategoryRepository,
): Promise<CategoryUseCaseResult> {
  const normalizedName = normalizeRequiredName(name);
  const organization = requireOrganizationUsername(organizationUsername);

  const created = await repository.createCategory(
    normalizedName,
    organization,
  );
  if (!created) {
    throw new CategoryUseCaseError('Category already exists', 400);
  }

  return {
    name: normalizedName,
    message: 'Category successfully added',
  };
}

/**
 * Remove a category for the authenticated organization.
 *
 * Removal must be implemented as a soft delete/deactivation so categories in
 * use can be removed without deleting or invalidating historical inventory,
 * box items, or category-item definitions.
 */
export async function removeCategory(
  name: unknown,
  organizationUsername: unknown,
  repository: CategoryRepository,
): Promise<CategoryUseCaseResult> {
  const normalizedName = normalizeRequiredName(name);
  const organization = requireOrganizationUsername(organizationUsername);

  const removed = await repository.deactivateCategory(
    normalizedName,
    organization,
  );
  if (!removed) {
    throw new CategoryUseCaseError('Category not found', 400);
  }

  return {
    name: normalizedName,
    message: 'Category successfully removed',
  };
}
