import { useMemo } from "react";
import type { Command } from "../core/Command.ts";

export function useCommand<
  TCtor extends new (...args: ConstructorParameters<TCtor>) => Command,
>(ctor: TCtor, ...args: ConstructorParameters<TCtor>): InstanceType<TCtor> {
  const params = useMemo(() => args, [...args]);
  return useMemo(() => new ctor(...params), [ctor, ...params]) as InstanceType<
    TCtor
  >;
}
