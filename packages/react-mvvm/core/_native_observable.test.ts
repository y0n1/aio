import { assertEquals, assertStrictEquals } from "@std/assert";
import { NativeObservable } from "./native_observable.ts";

Deno.test("NativeObservable notifies listeners when the value changes", () => {
  const observable = new NativeObservable(0);
  const values: number[] = [];

  const unsubscribe = observable.subscribe((value) => {
    values.push(value);
  });

  observable.value = 1;
  observable.value = 2;

  assertEquals(values, [1, 2]);
  unsubscribe();
});

Deno.test(
  "NativeObservable does not notify listeners when setting the same value",
  () => {
    const observable = new NativeObservable("initial");
    const values: string[] = [];

    observable.subscribe((value) => {
      values.push(value);
    });

    observable.value = "initial";
    observable.value = "updated";

    assertEquals(values, ["updated"]);
  },
);

Deno.test(
  "NativeObservable subscription returns an unsubscribe function",
  () => {
    const observable = new NativeObservable(0);
    const values: number[] = [];

    const unsubscribe = observable.subscribe((value) => {
      values.push(value);
    });

    observable.value = 1;
    unsubscribe();
    observable.value = 2;

    assertEquals(values, [1]);
  },
);

Deno.test("NativeObservable valueOf and toString reflect the current value", () => {
  const observable = new NativeObservable(42);

  assertStrictEquals(observable.valueOf(), 42);
  assertEquals(observable.toString(), "NativeObservable(42)");

  observable.value = 7;

  assertStrictEquals(observable.valueOf(), 7);
  assertEquals(observable.toString(), "NativeObservable(7)");
});

Deno.test("NativeObservable type coercion works as expected for numbers and strings", () => {
  const observable = new NativeObservable(42);

  assertStrictEquals(observable.valueOf(), 42);
  assertEquals(observable.toString(), "NativeObservable(42)");

  observable.value = 7;

  assertStrictEquals(observable as unknown as number + 1, 8);

  (observable as unknown as NativeObservable<string>).value = "hello";
  assertEquals(`${observable} world`, "NativeObservable(hello) world");
  assertEquals(observable + " " + "world", "hello world");
});
