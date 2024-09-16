import { Api } from "./impl";
import { LimitOffsetPagination, Mint } from "./models";
import { Leaderboard, User } from "./models/user.model";

export class userApi extends Api {
  path = "users";

  getUser(id: string) {
    return this.axios.get<User>(this.buildPath(id));
  }

  getLeaderboard() {
    return this.axios<Leaderboard[]>(this.buildPath("leaderboard"));
  }

  getUserTokens(id: string) {
    return this.axios<LimitOffsetPagination<Mint>>(
      this.buildPath(id, "tokens")
    );
  }

  updateUser(id: string, data: Record<string, any>) {
    const form = new FormData();
    for (const [key, value] of Object.entries(data)) form.append(key, value);

    return this.axios.post<User>(this.buildPath(id), form);
  }
}
