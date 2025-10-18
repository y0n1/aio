import type { ITodosCountersStore } from "./ITodosCountersStore.ts";

export class TodosCountersStore implements ITodosCountersStore {
  #total: number;
  #completed: number;

  constructor() {
    this.#total = 0;
    this.#completed = 0;
  }

  get total(): number {
    return this.#total;
  }
  
  get completed(): number {
    return this.#completed;
  }
  
  get remaining(): number {
    return this.#total - this.#completed;
  }

  incrementTotal(): void {
    this.#total += 1;
  }
  
  decrementTotal(): void {
    this.#total -= 1;
  }
  
  incrementCompleted(): void {
    this.#completed += 1;
  }
  
  decrementCompleted(): void {
    this.#completed -= 1;
  }
}