import type { Todo } from "../../../domain/models/Todo.ts";

export interface ITodosStore {
  get todos(): Todo[];
  addTodo(todo: Todo): void;
  removeTodo(id: Todo['id']): void;
  toggleTodo(id: Todo['id']): void;
}
