import { useEffect, useReducer } from "react";
import type { ChangeNotifier } from "../core/ChangeNotifier.ts";
import { useSingleton } from "./useSingleton.ts";

/**
 * Instantiates a {@linkcode ChangeNotifier} subscribing the component to its change notifications.
 *
 * @remarks
 * The ChangeNotifier instance will trigger a re-render when it notifies of changes.
 * When the component unmounts, the ChangeNotifier instance is disposed.
 *
 * @template TCtor - The constructor type of the ChangeNotifier.
 * @param ctor - The ChangeNotifier class (or subclass) to instantiate.
 * @param args - Arguments to pass to the ChangeNotifier constructor.
 * @returns The instantiated ChangeNotifier.
 *
 * @example
 * ```tsx
 * class Counter extends ChangeNotifier {
 *   #count = 0;
 *
 *   constructor(initialCount = 0) {
 *     super();
 *     this.#count = initialCount;
 *   }
 *
 *   get count(): number {
 *     return this.#count;
 *   }
 *
 *   increase(): void {
 *     this.count++;
 *     this.notifyListeners();
 *   }
 * }
 *
 * const counterNotifier = useChangeNotifier(Counter, 0);
 * ```
 */
export function useChangeNotifier<
  TCtor extends new (
    ...args: ConstructorParameters<TCtor>
  ) => ChangeNotifier,
>(
  ctor: TCtor,
  ...args: ConstructorParameters<TCtor>
): InstanceType<TCtor> {
  const [, updateView] = useReducer((b) => !b, true);
  const instance = useSingleton<ChangeNotifier, TCtor>(ctor, ...args);

  useEffect(() => {
    instance.addListener(updateView);
    return () => {
      instance.removeListener(updateView);
    };
  }, [instance]);

  return instance;
}
