import type { Result } from "@y0n1/react-mvvm";
import type { Todo } from "../../../domain/models/Todo.ts";

export interface ITodosStore {
  get todos(): Todo[];
  add(todo: Todo): void;
  remove(id: Todo["id"]): Result<void, Error>;
  toggle(id: Todo["id"]): Result<Todo, Error>;
  find(id: Todo["id"]): Result<Todo, Error>;
}
