import { ChangeNotifier } from "@y0n1/react-mvvm";
import { Todo } from "../../../domain/models/Todo.ts";
import type { TodoCounters } from "../../../domain/models/TodoCounters.ts";

export class TodoListViewModel extends ChangeNotifier {
  #draft: string;
  get draft(): string {
    return this.#draft;
  }

  #todos: Todo[];
  get todos(): Todo[] {
    return this.#todos;
  }

  #counters: TodoCounters;
  get counters(): TodoCounters {
    return this.#counters;
  }

  addTodo(): void {
    const value = this.#draft.trim();
    if (!value) {
      return;
    }

    const todo = new Todo(crypto.randomUUID(), value, false);
    this.#todos.push(todo);
    this.#counters.total += 1;
    this.#draft = "";

    this.#todos = [...this.#todos];
    this.#counters = { ...this.#counters };

    this.notifyListeners();
  }

  removeTodo(id: string): void {
    const todoIndex = this.#todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      return;
    }

    const todo = this.#todos[todoIndex];
    if (todo.completed) {
      this.#counters.completed -= 1;
    }
    this.#counters.total -= 1;
    this.#todos.splice(todoIndex, 1);

    this.#counters = { ...this.#counters };
    this.#todos = [...this.#todos];

    this.notifyListeners();
  }

  toggleTodo(id: string): void {
    const todoIndex = this.#todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      return;
    }

    const todo = this.#todos[todoIndex];
    todo.toggle();
    if (todo.completed) {
      this.#counters.completed += 1;
    } else {
      this.#counters.completed -= 1;
    }

    this.#counters = { ...this.#counters };
    this.#todos = [...this.#todos];

    this.notifyListeners();
  }

  draftChange(value: string): void {
    this.#draft = value;
    this.notifyListeners();
  }

  constructor(
    draft = "",
  ) {
    super();
    this.#draft = draft;
    this.#todos = [];
    this.#counters = { completed: 0, total: 0 };

    this.addTodo = this.addTodo.bind(this);
    this.toggleTodo = this.toggleTodo.bind(this);
    this.removeTodo = this.removeTodo.bind(this);
    this.draftChange = this.draftChange.bind(this);
  }

  override dispose(): void {
    super.dispose();
  }
}
