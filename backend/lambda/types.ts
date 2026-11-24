// Request/response shapes from Sam's API designs (APIDesign.md).

export interface CategoryRequest {
  name: string;
}

export interface CategorySuccessResponse {
  name: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ListCategoriesResponse {
  categories: string[];
}