import type { Todo } from "../../../models/Todo.ts";

export interface ITodosStore {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
}
