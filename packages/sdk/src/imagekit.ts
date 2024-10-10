import { ApiImpl } from "./impl";
import type { AuthParams } from "./models";

export class ImageKitApi extends ApiImpl {
  path = "/imagekit";

  getAuthenticationParameters() {
    return this.xior.get<AuthParams>(this.buildPath("auth"));
  }
}
