import "./_setup_tests.ts";
import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { renderHook } from "@testing-library/react";
import {
  useSingleton,
  useSingletonFactory,
} from "../internal/use_singleton.ts";

class ExampleService {
  constructor(readonly value: number) {}
}

class FactoryService {
  constructor(readonly value: number) {}
}

Deno.test("useSingleton keeps the same instance while the key stays stable", () => {
  const { result, rerender } = renderHook(
    (props: { value: number; key: number }) =>
      useSingleton(ExampleService, [props.value], props.key),
    {
      initialProps: { value: 1, key: 0 },
    },
  );

  const initialInstance = result.current as ExampleService;

  assertEquals(initialInstance.value, 1);

  rerender({ value: 2, key: 0 });

  assertStrictEquals(result.current, initialInstance);
  assertEquals((result.current as ExampleService).value, 1);
});

Deno.test("useSingleton creates a new instance when the key changes", () => {
  const { result, rerender } = renderHook(
    (props: { value: number; key: number }) =>
      useSingleton(ExampleService, [props.value], props.key),
    {
      initialProps: { value: 10, key: 0 },
    },
  );

  const firstInstance = result.current as ExampleService;

  rerender({ value: 20, key: 1 });

  const secondInstance = result.current as ExampleService;

  assertNotStrictEquals(secondInstance, firstInstance);
  assertEquals(secondInstance.value, 20);
});

Deno.test("useSingletonFactory memoizes the factory output by key", () => {
  let calls = 0;

  const { result, rerender } = renderHook(
    (props: { value: number; key: number }) =>
      useSingletonFactory(() => {
        calls += 1;
        return new FactoryService(props.value);
      }, props.key),
    {
      initialProps: { value: 5, key: 0 },
    },
  );

  const firstInstance = result.current as FactoryService;

  assertEquals(firstInstance.value, 5);
  assertEquals(calls, 1);

  rerender({ value: 8, key: 0 });

  assertStrictEquals(result.current, firstInstance);
  assertEquals(calls, 1);

  rerender({ value: 13, key: 1 });

  assertEquals(calls, 2);
  assertNotStrictEquals(result.current, firstInstance);
  assertEquals((result.current as FactoryService).value, 13);
});
