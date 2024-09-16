import { Api } from "./impl";
import type { Swap, UserMintSwap } from "./models/swap.model";
import type { LimitOffsetPagination } from "./models";
import { Graph } from "./models/graph.model";

export class SwapApi extends Api {
  path = "swaps";

  getSwaps(query?: Record<string, string>) {
    return this.axios.get<LimitOffsetPagination<Swap>>(
      this.buildQueryPath(this.path, query)
    );
  }

  getSwapsByMint(mint: string, filter?: Record<string, any>) {
    return this.axios.get<LimitOffsetPagination<Swap>>(
      this.buildQueryPath(this.buildPath(mint), filter)
    );
  }

  getUserSwapByMint(mint: string, userId: string) {
    return this.axios.get<UserMintSwap[]>(this.buildPath(mint, userId));
  }
}
