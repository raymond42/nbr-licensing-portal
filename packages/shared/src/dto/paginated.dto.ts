/** Offset pagination envelope for list APIs (page is zero-based). */
export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  take: number;
}
