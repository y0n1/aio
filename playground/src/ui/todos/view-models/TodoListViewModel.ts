import { ChangeNotifier, Command, Results } from "@y0n1/react-mvvm";
import { Todo } from "../../../models/domain/Todo.ts";
import type { TodoCounters } from "../../../models/domain/TodoCounters.ts";
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

  get loadCmd(): Command<Todo[], []> {
    return this.#todosStore.loadCmd;
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

    this.#todosStore.loadCmd.addListener(this.#loadAction);
    this.#todosStore.loadCmd.execute();
  }

  #loadAction = (): void => {
    if (this.#todosStore.loadCmd.status === "done") {
      const result = this.#todosStore.loadCmd.result;
      if (Results.isSuccess<Todo[]>(result)) {
        for (const todo of (result.value ?? [])) {
          if (todo.completed) {
            this.#countersStore.incrementCompleted();
          }
          this.#countersStore.incrementTotal();
        }
      }
      this.notifyListeners();
    }
  };

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
    this.#todosStore.loadCmd.removeListener(this.#loadAction);
    super.dispose();
  }
}
