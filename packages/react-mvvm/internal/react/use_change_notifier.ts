import { useEffect, useRef } from "react";
import type { ChangeNotifier } from "../core/change_notifier.ts";
import { useRerender } from "@y0n1/react-hooks";

export function useChangeNotifier<
  TCtor extends new (
    ...args: ConstructorParameters<TCtor>
  ) => ChangeNotifier,
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
