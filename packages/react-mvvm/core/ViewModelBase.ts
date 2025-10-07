import { logChange } from "../utils/logging.ts";
import { ChangeNotifier } from "./ChangeNotifier.ts";
import { Loggable } from "./Loggable.ts";

export type ViewModelConstructor<
  TArgs extends unknown[],
  TInstance extends ViewModelBase,
> = new (
  ...args: TArgs
) => TInstance;

export abstract class ViewModelBase extends ChangeNotifier implements Loggable {
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

  enableLogging(): void {
    this.addListener(logChange);
  }

  disableLogging(): void {
    this.removeListener(logChange);
  }
}
