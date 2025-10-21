import { ChangeNotifier } from "@y0n1/react-mvvm";
import { Todo } from "../../../domain/models/Todo.ts";
import type { TodoCounters } from "../../../domain/models/TodoCounters.ts";
import type { ICountersStore } from "../../../data/stores/todos/ICountersStore.ts";
import type { ITodosStore } from "../../../data/stores/todos/ITodosStore.ts";

export class TodoListViewModel extends ChangeNotifier {
  #draft: string;
  get draft(): string {
    return this.#draft;
  }

  #todosStore: ITodosStore;
  get todos(): Todo[] {
    return this.#todosStore.todos;
  }

  #countersStore: ICountersStore;
  get counters(): TodoCounters {
    return {
      completed: this.#countersStore.completed,
      total: this.#countersStore.total,
    };
  }

  constructor(
    draft = "",
    todosStore: ITodosStore,
    countersStore: ICountersStore,
  ) {
    super();
    this.#draft = draft;
    this.#todosStore = todosStore;
    this.#countersStore = countersStore;

    this.addTodo = this.addTodo.bind(this);
    this.toggleTodo = this.toggleTodo.bind(this);
    this.removeTodo = this.removeTodo.bind(this);
    this.draftChange = this.draftChange.bind(this);
  }

  addTodo(): void {
    const value = this.#draft.trim();
    if (!value) {
      return;
    }

    this.#todosStore.add(new Todo(crypto.randomUUID(), value, false));
    this.#countersStore.incrementTotal();
    this.#draft = "";

    this.notifyListeners();
  }

  removeTodo(id: string): void {
    const result = this.#todosStore.find(id);
    if (!result.ok) {
      console.warn(result.error);
      return;
    }
    const todo = result.value!;
    this.#countersStore.decrementTotal();
    if (todo.completed) {
      this.#countersStore.decrementCompleted();
    }
    this.#todosStore.remove(id);

    this.notifyListeners();
  }

  toggleTodo(id: string): void {
    const result = this.#todosStore.toggle(id);
    if (!result.ok) {
      console.warn(result.error);
      return;
    }
    const todo = result.value!;
    if (todo.completed) {
      this.#countersStore.incrementCompleted();
    } else {
      this.#countersStore.decrementCompleted();
    }

    this.notifyListeners();
  }

  draftChange(value: string): void {
    this.#draft = value;
    this.notifyListeners();
  }

  override dispose(): void {
    super.dispose();
  }
}
