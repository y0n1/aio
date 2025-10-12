export class Todo {
  #id: number;
  #text: string;
  #completed: boolean;

  constructor(id: number, text: string, completed: boolean) {
    this.#id = id;
    this.#text = text;
    this.#completed = completed;
  }

  get id(): number {
    return this.#id;
  }

  get text(): string {
    return this.#text;
  }

  get completed(): boolean {
    return this.#completed;
  }

  toggle() {
    this.#completed = !this.#completed;
  }
}
