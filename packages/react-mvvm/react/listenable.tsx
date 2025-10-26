import { IListenable } from "@y0n1/react-mvvm";
import { useListenable } from "./use_listenable.ts";

/**
 * The `Listenable` component subscribes to an `IListenable` and re-renders
 * its children whenever the listenable signals an update.
 * 
 * @remarks
 * This is a helper component for MVVM scenarios. Use it to scope an area
 * of your JSX that should update in response to observable mutations.
 *
 * @param props - Component props
 * @param props.listenable - The `IListenable` to subscribe to
 * @param props.children - React children to be rendered and updated
 *
 * @example
 * ```tsx
 * <Listenable listenable={myViewModel}>
 *   <div>{myViewModel.value}</div>
 * </Listenable>
 * ```
 */
export const Listenable: React.FC<
  React.PropsWithChildren<{ listenable: IListenable }>
> = ({ listenable, children }) => {
  useListenable(listenable);
  return children;
};
Listenable.displayName = "Listenable";
