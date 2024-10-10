export type RouteProps<
  T extends Record<string, string> = Record<string, string>,
  U extends Record<string, string> = Record<string, string>
> = {
  params: T;
  searchParams: U;
};
