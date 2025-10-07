export class ChangeEvent<
  TInvoker extends object = object,
  TChanges extends Array<[string, unknown]> = Array<[string, unknown]>,
> {
  static get displayName() {
    return "ChangeEvent";
  }

  static get eventName() {
    return "__CHANGE_EVENT__";
  }

  #invoker: TInvoker;
  #changes: TChanges;

  constructor(invoker: TInvoker, changes: TChanges) {
    this.#invoker = invoker;
    this.#changes = changes;
  }

  get invoker() {
    return this.#invoker;
  }

  get changes() {
    return this.#changes;
  }
}
