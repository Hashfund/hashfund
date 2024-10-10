import { ApiImpl } from "./impl";
import { LimitOffsetPagination } from "./models";

export abstract class CrudApi<T> extends ApiImpl {  
  retrieve(id: string) {
    return this.xior.get<T>(this.buildPath(id));
  }

  list(query?: Record<string, string | number>) {
    return this.xior.get<LimitOffsetPagination<T>>(
      this.buildPathWithQuery(this.path, query)
    );
  }

  create<U extends Partial<T>>(values: U) {
    return this.xior.post(this.path, values);
  }

  update(id: string, values: Partial<T>) {
    return this.xior.patch<T>(this.buildPath(id), values);
  }

  delete(id: string) {
    return this.xior.delete<T>(this.buildPath(id));
  }
}
