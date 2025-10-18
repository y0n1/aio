import { useMemo } from "react";

/**
 * Instantiates and returns a singleton instance of a class for the lifetime of a React component.
 *
 * The created instance remains the same as long as the "key" parameter does not change.
 * If "key" changes, a new instance is created. This pattern is useful for classes that
 * manage non-React state, lifecycles, or non-trivial side-effects.
 *
 * @template TInstance The type of instance created.
 * @template TCtor The constructor type for the class.
 * @param ctor The class constructor.
 * @param args Arguments to pass to the constructor.
 * @param key (optional) A key to control memoization; changing this will create a new instance.
 * @returns A stable, memoized instance of the class.
 *
 * @example
 * class MyService {
 *   constructor(url: string) { ... }
 *   doSomething() { ... }
 * }
 * const service = useSingleton(MyService, [myUrl]);
 * service.doSomething();
 */
export function useSingleton<
  TInstance,
  TCtor extends new (...args: ConstructorParameters<TCtor>) => TInstance,
>(
  ctor: TCtor,
  args: ConstructorParameters<TCtor>,
  key: number = 0,
): InstanceType<TCtor> {
  return useMemo(() => new ctor(...args), [key]) as InstanceType<
    TCtor
  >;
}

export function useSingletonFactory<
  TInstance,
  TCtor extends new (...args: ConstructorParameters<TCtor>) => TInstance,
>(
  factory: () => InstanceType<TCtor>,
  key: number = 0,
): InstanceType<TCtor> {
  return useMemo(factory, [key]);
}
