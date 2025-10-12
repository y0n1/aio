import type { Command } from "@y0n1/react-mvvm";
import type { TodoListViewModel } from "../TodoListViewModel.ts";

export class DraftChangeCommand implements Command {
  #vm: TodoListViewModel;

  constructor(vm: TodoListViewModel) {
    this.#vm = vm;

    this.execute = this.execute.bind(this);
  }

  execute(value: string): void {
    this.#vm.handleDraftChange(value);
  }
}
