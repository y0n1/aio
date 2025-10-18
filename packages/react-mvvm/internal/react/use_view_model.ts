import { useEffect, useRef } from "react";
import { useRerender } from "@y0n1/react-hooks";
import type { IListenable } from "../core/listenable.ts";
import type { IDisposable } from "../core/disposable.ts";

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

  if (!ref.current.hasListeners) {
    ref.current.addListener(rerender);
  }

  useEffect(() => {
    if (ref.current.isDisposed) {
      ref.current = new ctor(...args) as InstanceType<TCtor>;
      ref.current.addListener(rerender);
      rerender();
    }

    return () => {
      ref.current.dispose();
    };
  }, []);

  return ref.current;
}
