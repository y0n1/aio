export interface Command {
  execute(...args: unknown[]): void;
}
