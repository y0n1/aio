import { ChangeNotifier } from "./ChangeNotifier.ts";

export type ViewModelConstructor<
  TArgs extends unknown[],
  TInstance extends ViewModelBase,
> = new (
  ...args: TArgs
) => TInstance;

export abstract class ViewModelBase extends ChangeNotifier {
  static override get displayName() {
    return "ViewModelBase";
  }

  #instanceId: string;

  constructor() {
    super();
    this.#instanceId = crypto.randomUUID();
  }

  get instanceId(): string {
    return this.#instanceId;
  }
}
