import { useMemo } from "react";

export function useSingleton<
  TInstance, TCtor extends new (...args: ConstructorParameters<TCtor>) => TInstance,
>(ctor: TCtor, ...args: ConstructorParameters<TCtor>): InstanceType<TCtor> {
  const params = useMemo(() => args, [...args]);
  return useMemo(() => new ctor(...params), [ctor, ...params]) as InstanceType<TCtor>;
}