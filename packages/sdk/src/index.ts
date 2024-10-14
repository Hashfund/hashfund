import xior from "xior";

import { CrudApi } from "./crud";
import { Omit } from "./object";
import { ImageKitApi } from "./imagekit";
import type {
  User,
  Swap,
  LimitOffsetPagination,
  UserWithExtra,
  MintWithExtra,
  SwapWithVolume,
  SwapWithGraph,
} from "./models";

export class UserApi extends CrudApi<User> {
  protected path = "users";

  override list(query?: Record<string, string | number>) {
    return this.xior.get<LimitOffsetPagination<UserWithExtra>>(
      this.buildPathWithQuery(this.path, query)
    );
  }
}

export class MintApi extends Omit(
  CrudApi<MintWithExtra>,
  "create",
  "update",
  "delete"
) {
  protected path = "mints";

  getMintByUser(user: string) {
    return this.xior.get<LimitOffsetPagination<MintWithExtra>>(
      this.buildPath("users", user)
    );
  }
}

export class SwapApi extends Omit(CrudApi<Swap>, "create", "update", "delete") {
  protected path = "swaps";

  getSwapsGraph(query?: Record<string, string>) {
    return this.xior.get<LimitOffsetPagination<SwapWithGraph>>(
      this.buildPathWithQuery(this.buildPath("graph"), query)
    );
  }

  getSwapsVolume(query: Record<string, string>) {
    return this.xior.get<SwapWithVolume[]>(
      this.buildPathWithQuery(this.buildPath("volume"), query)
    );
  }
}

export default class Api {
  readonly user: UserApi;
  readonly mint: MintApi;
  readonly swap: SwapApi;
  readonly imagekit: ImageKitApi;

  constructor(baseURL: string, accessToken?: string, flag = "web3auth") {
    const xiorInstance = xior.create({
      baseURL,
      headers: {
        Authorization: flag + " " + accessToken,
      },
    });

    this.user = new UserApi(xiorInstance);
    this.mint = new MintApi(xiorInstance);
    this.swap = new SwapApi(xiorInstance);
    this.imagekit = new ImageKitApi(xiorInstance);
  }
}
