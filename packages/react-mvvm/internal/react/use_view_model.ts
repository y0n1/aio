import { useEffect, useRef } from "react";
import { useRerender } from "./use_rerender.ts";
// deno-lint-ignore no-unused-vars
import type { ChangeNotifier } from "../core/change_notifier.ts";
import type { IListenable } from "../core/listenable.ts";
import type { IDisposable } from "../core/disposable.ts";

/**
 * Creates a singleton view-model instance that is persisted for the entire component's lifecycle.
 *
 * @description
 * A view-model is an object that implements the {@linkcode IListenable} and {@linkcode IDisposable} interfaces.
 * The easiest way to create a view-model is by extending the {@linkcode ChangeNotifier} class.
 * The view-model notifies the view about internal state changes by calling its {@linkcode IListenable.notifyListeners} method.
 * **Change notifications have no effect on a component that is not mounted**.
 * The {@linkcode IDisposable.dispose} method is called automatically when the component unmounts to dispose of resources.
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

    // React Strict Mode executes this effect in the following sequence: mount -> cleanup -> mount.
    // During the first mount a view-model instance already exists, created by the first invocation of this hook.
    // The second mount creates a new view-model instance due to the cleanup function being called.
    // To ensure the view is updated with the new view-model instance, we only call rerender if the old reference is null.
    // That indicates that the call to getCurrentRef must have returned a new instance.
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
