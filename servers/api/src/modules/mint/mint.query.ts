import { or } from "drizzle-orm";
import { mints } from "../../db/schema";
import { mapFilters, queryBuilder } from "../../utils/query";

const builder = {
  id: mapFilters(mints.id),
  uri: mapFilters(mints.uri),
  name: mapFilters(mints.name),
  symbol: mapFilters(mints.symbol),
  supply: mapFilters(mints.supply),
  creator: mapFilters(mints.creator),
  signature: mapFilters(mints.signature),
  timestamp: mapFilters(mints.timestamp),
};

export const mintQuery = queryBuilder(builder);
export const mintSearch = (() => {
  const query = queryBuilder(builder, or);
  return (search: string) => {
    search = "%" + search + "%";
    return query({
      id__like: search,
      uri__like: search,
      name__like: search,
      symbol__like: search,
      creator__like: search,
      signature__like: search,
    });
  };
})();
