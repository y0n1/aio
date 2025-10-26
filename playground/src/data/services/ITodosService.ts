import type { Result } from "@y0n1/react-mvvm";
import type { ITodoApiModel } from "../../api/models/ITodoApiModel.ts";

export interface ITodosService {
  list(): Promise<Result<ITodoApiModel[], Error>>;
  add(todo: ITodoApiModel): Promise<Result<void, Error>>;
  remove(id: string): Promise<Result<void, Error>>;
  toggle(id: string): Promise<Result<ITodoApiModel, Error>>;
  find(id: string): Promise<Result<ITodoApiModel, Error>>;
}
