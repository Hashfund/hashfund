import { mints } from "../../db/schema";
import { mapFilters, queryBuilder } from "../../utils/query";

export const mintQuery = queryBuilder({
  id: mapFilters(mints.id),
  uri: mapFilters(mints.uri),
  name: mapFilters(mints.name),
  symbol: mapFilters(mints.symbol),
  supply: mapFilters(mints.supply),
  creator: mapFilters(mints.creator),
  signature: mapFilters(mints.signature),
  timestamp: mapFilters(mints.timestamp),
});
