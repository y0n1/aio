import { useEffect, useRef } from "react";
import { useRerender } from "./use_rerender.ts";
import type { IListenable } from "../core/listenable.ts";
import type { IDisposable } from "../core/disposable.ts";

/**
 * Creates a view-model instance tied to a React component lifecycle.
 *
 * @remarks
 * A view-model is an object that implements the {@linkcode IListenable} and {@linkcode IDisposable} interfaces.
 * The easies way to create a view-model is to extend the {@linkcode ChangeNotifier} class.
 * The view-model can notify the view about internal state changes by calling its {@linkcode IListenable.notifyListeners} method.
 * Its {@linkcode IDisposable.dispose} method is called to dispose of resources when the component is unmounted.
 *
 * @template TCtor The type of the view-model class constructor.
 * @param ctor - The view-model class constructor.
 * @param args - The arguments to pass to the view-model constructor.
 * @returns The view-model instance (persisted across rerenders).
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
  const ref = useRef(new ctor(...args) as InstanceType<TCtor>);

  useEffect(() => {
    // If the view-model is disposed, create a new instance and rerender.
    // This is expected to happen, particularly, in React Strict Mode.
    if (ref.current.isDisposed) {
      ref.current = new ctor(...args) as InstanceType<TCtor>;
      rerender();
    }

    if (!ref.current.hasListeners) {
      ref.current.addListener(rerender);
    }

    return () => {
      ref.current.dispose();
    };
  }, []);

  return ref.current;
}
