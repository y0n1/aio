import { type Result, Results } from "@y0n1/react-mvvm";
import type { Todo } from "../../../domain/models/Todo.ts";
import type { ITodosStore } from "./ITodosStore.ts";

export class TodosStoreLocal implements ITodosStore {
  #todos: Todo[] = [];
  get todos(): Todo[] {
    return this.#todos;
  }

  constructor() {
    this.#todos = [];
  }

  add(todo: Todo): void {
    this.#todos = this.#todos.concat(todo);
  }

  remove(id: Todo["id"]): Result<void, Error> {
    const result = this.find(id);
    if (!result.ok) {
      return Results.Failure(result.error);
    }
    this.#todos = this.#todos.filter((todo) => todo.id !== id);
    return Results.Success();
  }

  toggle(id: Todo["id"]): Result<Todo, Error> {
    const result = this.find(id);
    if (!result.ok) {
      return Results.Failure(result.error);
    }
    const todo = result.value!;
    todo.toggle();
    this.#todos = this.#todos.map((t) => t.id === id ? todo : t);
    return Results.Success(todo);
  }

  find(id: Todo["id"]): Result<Todo, Error> {
    const todo =this.#todos.find((todo) => todo.id === id);
    if (!todo) {
      return Results.Failure(new Error(`Todo with id ${id} not found`));
    }
    return Results.Success(todo);
  }
}
