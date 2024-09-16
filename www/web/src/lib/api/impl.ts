import { AxiosInstance } from "axios";

export abstract class Api {
  abstract path: string;

  constructor(protected axios: AxiosInstance) {}

  protected buildPath(...args: any[]) {
    return this.path + "/" + args.join("/");
  }

  protected buildQueryPath(path: string, query?: Record<string, any>) {
    const q = new URLSearchParams(query);
    return path + "?" + q.toString();
  }
}
