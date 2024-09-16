import { Api } from "./impl";
import { LimitOffsetPagination, Mint } from "./models";
import { Graph } from "./models/graph.model";
import { Leaderboard } from "./models/user.model";

export class MintApi extends Api {
  path = "mints";

  getAllMints(query?: Record<string, any>, url?: string) {
    return this.axios.get<LimitOffsetPagination<Mint>>(
      this.buildQueryPath(url ?? this.path, query)
    );
  }

  getMint(id: string) {
    return this.axios.get<Mint>(this.buildPath(id));
  }

  getGraph(id: string, query: Record<string, any>) {
    return this.axios.get<Graph[]>(
      this.buildQueryPath(this.buildPath(id, "graph"), query)
    );
  }

  getLeaderboard(id: string, query?: Record<string, any>) {
    return this.axios.get<Leaderboard[]>(
      this.buildQueryPath(this.buildPath(id, "leaderboard"), query)
    );
  }
}
