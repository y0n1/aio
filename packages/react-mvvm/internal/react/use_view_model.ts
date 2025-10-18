import { useEffect, useRef } from "react";
import { useRerender } from "./use_rerender.ts";
import type { IListenable } from "../core/listenable.ts";
import type { IDisposable } from "../core/disposable.ts";

/**
 * Creates a singleton view-model instance that is persisted for the entire component's lifecycle.
 *
 * @remarks
 * A view-model is an object that implements the {@linkcode IListenable} and {@linkcode IDisposable} interfaces.
 * The easiest way to create a view-model is by extending the {@linkcode ChangeNotifier} class.
 * The view-model notifies the view about internal state changes by calling its {@linkcode IListenable.notifyListeners} method.
 * It disposes of resources when the component is unmounted by calling its {@linkcode IDisposable.dispose} method.
 *
 * @template `TCtor` - The type of the view-model class constructor.
 * @param `ctor` - The view-model class constructor.
 * @param `args` - The arguments to pass to the view-model constructor.
 * @returns The view-model instance.
 */
export function useViewModel<
  TCtor extends new (
    ...args: ConstructorParameters<TCtor>
  ) => IListenable & IDisposable,
>(
  ctor: TCtor,
  ...args: ConstructorParameters<TCtor>
): InstanceType<TCtor> {
  const rerender = useRerender();
  const ref = useRef<InstanceType<TCtor>>(null);

  useEffect(() => {
    const oldRef = ref.current;
    const newRef = getCurrentRef(ctor, args, ref);

    if (!newRef.hasListener(rerender)) {
      newRef.addListener(rerender);
    }
    
    // This is expected to happen, particularly, in React Strict Mode.
    if (oldRef === null) {
      rerender();
    }

    return () => {
      newRef.dispose();
      ref.current = null;
    };
  }, []);

  return getCurrentRef(ctor, args, ref);
}

const getCurrentRef = <
  TCtor extends new (
    ...args: ConstructorParameters<TCtor>
  ) => IListenable & IDisposable,
>(
  ctor: TCtor,
  args: ConstructorParameters<TCtor>,
  ref: React.RefObject<InstanceType<TCtor> | null>,
): InstanceType<TCtor> => {
  if (ref.current === null) {
    ref.current = new ctor(...args) as InstanceType<TCtor>;
  }
  return ref.current;
};
