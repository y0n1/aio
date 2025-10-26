import { useEffect } from "react";
import { IListenable } from "../core/listenable.ts";
import { useRerender } from "./use_rerender.ts";

/**
 * Subscribes a React component to a listenable model, causing the
 * component to rerender whenever the model emits a change notification.
 *
 * @param listenable - The listenable object to subscribe to. Must implement {@linkcode IListenable}.
 *
 * @remarks
 * - The `rerender` function is registered as a listener during mount and removed during unmount.
 * - If the listenable changes, the effect will resubscribe.
 * - This hook ensures that the React component stays in sync with the listenable's state.
 *
 * @example
 * ```tsx
 * const MyComponent = ({ model }: { model: IListenable }) => {
 *   useListenable(model);
 *   return <div>{model.value}</div>;
 * };
 * ```
 *
 * @see {@link IListenable}
 * @see {@link useRerender}
 */
export const useListenable = (listenable: IListenable): void => {
  const rerender = useRerender();

  useEffect(() => {
    listenable.addListener(rerender);
    return () => {
      listenable.removeListener(rerender);
    };
  }, [listenable]);
};
