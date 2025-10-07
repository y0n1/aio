import type { ChangeEvent } from "./ChangeEvent.ts";

export type ChangeEventListener = <
  TInvoker extends object,
  TChanges extends Array<[string, unknown]>,
>(
  event: ChangeEvent<TInvoker, TChanges>,
) => void;
