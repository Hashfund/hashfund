import { Api } from "./impl";
import type { AuthParams } from "./models";

export class ImageKitApi extends Api {
  path = "/imagekit";

  getAuthenticationParameters() {
    return this.axios.get<AuthParams>(this.buildPath("auth"));
  }
}
