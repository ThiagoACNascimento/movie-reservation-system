interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  prev: number | null;
  next: number | null;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}
