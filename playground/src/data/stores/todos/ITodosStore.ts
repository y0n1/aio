import type { Todo } from "../../../domain/models/Todo.ts";

export interface ITodosStore {
  get todos(): Todo[];
  addTodo: (todo: Todo) => void;
  removeTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
}
