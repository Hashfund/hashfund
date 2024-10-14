import path from "path";
import type { XiorInstance } from "xior";

export abstract class ApiImpl {
  protected abstract path: string;

  constructor(readonly xior: XiorInstance) {}

  readonly buildPath = (...paths: (string | number)[]) => {
    return path.join(this.path, ...paths.map(String));
  };

  readonly buildPathWithQuery = <T extends Record<string, any>>(
    path: string,
    query?: T
  ) => {
    if (query) {
      for (const [key, value] of Object.entries(query))
        if (!value) delete query[key];
      const q = new URLSearchParams(query);
      return path + "?" + q.toString();
    }

    return path;
  };
}
