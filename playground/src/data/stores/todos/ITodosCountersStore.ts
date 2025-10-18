export interface ITodosCountersStore {
  get total(): number;
  get completed(): number;
  get remaining(): number;

  incrementTotal(): void;
  decrementTotal(): void;
  incrementCompleted(): void;
  decrementCompleted(): void;
}
