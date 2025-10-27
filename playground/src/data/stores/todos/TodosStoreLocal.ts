import {
  ChangeNotifier,
  Command,
  type Result,
  Results,
} from "@y0n1/react-mvvm";
import { Todo } from "../../../models/domain/Todo.ts";
import type { ITodosStore } from "./ITodosStore.ts";
import type { ITodosService } from "../../services/ITodosService.ts";
import type { ITodoApiModel } from "../../../models/apis/ITodoApiModel.ts";

export class TodosStoreLocal extends ChangeNotifier implements ITodosStore {
  #todos: Todo[];
  get todos(): Todo[] {
    return this.#todos;
  }

  #todosService: ITodosService;

  #loadCmd: Command<Todo[], []>;
  get loadCmd(): Command<Todo[], []> {
    return this.#loadCmd;
  }

  constructor(todosService: ITodosService) {
    super();
    this.#todos = [];
    this.#todosService = todosService;

    this.#loadCmd = new Command(this.#load.bind(this));
  }

  async #load(): Promise<Result<Todo[], Error>> {
    const result = await this.#todosService.list();
    if (!result.ok) {
      return result;
    }

    if (!(result.value instanceof Array)) {
      return Results.Failure(new Error("TodosService did not return an array"));
    }

    // Map to domain model
    this.#todos = result.value.map((todo: ITodoApiModel) =>
      new Todo(todo.id, todo.text, todo.completed)
    );

    return Results.Success(this.#todos);
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
    const todo = this.#todos.find((todo) => todo.id === id);
    if (!todo) {
      return Results.Failure(new Error(`Todo with id ${id} not found`));
    }
    return Results.Success(todo);
  }
}
