import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observable } from "./observable.ts";

Deno.test("Observable notifies subscribers when value changes", () => {
  const observable = new Observable(0);
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
  "Observable does not notify subscribers when setting the same value",
  () => {
    const observable = new Observable("initial");
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
  "Observable subscription returns an unsubscribe function",
  () => {
    const observable = new Observable(0);
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

Deno.test("Observable valueOf and toString reflect the current value", () => {
  const observable = new Observable(42);

  assertStrictEquals(observable.valueOf(), 42);
  assertEquals(observable.toString(), "Observable(42)");

  observable.value = 7;

  assertStrictEquals(observable.valueOf(), 7);
  assertEquals(observable.toString(), "Observable(7)");
});
