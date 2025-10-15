import { useMemo, useReducer, useRef } from "react";

export function useSingleton<
  TInstance,
  TCtor extends new (...args: ConstructorParameters<TCtor>) => TInstance,
>(ctor: TCtor, ...args: ConstructorParameters<TCtor>): InstanceType<TCtor> {
  const params = useMemo(() => args, [...args]);
  return useMemo(() => new ctor(...params), [ctor, ...params]) as InstanceType<
    TCtor
  >;
}

export const useUpdateView = () => {
  const [, updateView] = useReducer((b) => !b, true);
  return updateView;
};

export const useIsFirstMount = () => {
  const isFirstMountRef = useRef(true);

  if (isFirstMountRef.current) {
    isFirstMountRef.current = false;
  }

  return isFirstMountRef.current;
};
