import { or } from "drizzle-orm";
import { users } from "../../db/schema";
import { mapFilters, queryBuilder } from "../../utils/query";

const builder = {
  id: mapFilters(users.id),
  name: mapFilters(users.name),
};

export const userQuery = queryBuilder(builder);

export const userSearch = (() => {
  const query = queryBuilder(builder, or);
  return (search: string) => {
    search = "%" + search + "%";
    return query({
      id__like: search,
      name__like: search,
    });
  };
})();
