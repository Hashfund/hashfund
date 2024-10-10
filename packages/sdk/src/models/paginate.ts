export type LimitOffsetPagination<T> = {
  next?: string;
  previous?: string;
  results: T[];
};
