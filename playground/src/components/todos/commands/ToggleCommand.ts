import type { Command } from "@y0n1/react-mvvm";
import type { TodoListViewModel } from "../TodoListViewModel.ts";

export class ToggleCommand implements Command {
  #vm: TodoListViewModel;

  constructor(vm: TodoListViewModel) {
    this.#vm = vm;

    this.execute = this.execute.bind(this);
  }

  execute(id: number): void {
    this.#vm.toggleTodo(id);
  }
}
