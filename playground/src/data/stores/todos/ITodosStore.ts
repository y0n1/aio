import type { ChangeNotifier, Command, Result } from "@y0n1/react-mvvm";
import type { Todo } from "../../../models/domain/Todo.ts";

export interface ITodosStore extends ChangeNotifier {
  get todos(): Todo[];
  add(todo: Todo): void;
  remove(id: Todo["id"]): Result<void, Error>;
  toggle(id: Todo["id"]): Result<Todo, Error>;
  find(id: Todo["id"]): Result<Todo, Error>;
  get loadCmd(): Command<Todo[], []>;
}
