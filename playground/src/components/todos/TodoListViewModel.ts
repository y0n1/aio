import { ChangeNotifier } from "@y0n1/react-mvvm";
import { Todo } from "./models/Todo.ts";
import type { TodoCounters } from "./models/TodoCounters.ts";

export class TodoListViewModel extends ChangeNotifier {
  static get displayName() {
    return "TodoListViewModel";
  }

  #draft: string;
  #todos: Todo[];
  #counters: TodoCounters;

  constructor(
    todos = [],
    draft = "",
    counters = { completed: 0, total: 0 },
  ) {
    super();
    this.#draft = draft;
    this.#todos = todos;
    this.#counters = counters;
  }

  get todos(): Todo[] {
    return this.#todos;
  }

  get counts(): TodoCounters {
    return this.#counters;
  }

  get draft(): string {
    return this.#draft;
  }

  set draft(value: string) {
    this.#draft = value;
  }

  addTodo() {
    const value = this.#draft.trim();
    if (!value) {
      return;
    }

    const todo = new Todo(Date.now(), value, false);
    this.#todos.push(todo);
    this.#counters.total += 1;
    this.#draft = "";

    this.#todos = [...this.#todos];
    this.#counters = { ...this.#counters };

    this.notifyListeners();
  }

  toggleTodo(id: number) {
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

  removeTodo(id: number) {
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

  handleDraftChange(value: string) {
    this.#draft = value;
    this.notifyListeners();
  }
}
