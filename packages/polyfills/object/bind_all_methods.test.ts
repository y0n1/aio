import { assert, assertEquals, assertStrictEquals } from "@std/assert";

import { bindAllFunctions } from "./bind_all_methods.ts";

Deno.test("bindAllFunctions binds prototype methods to the instance", () => {
  class Counter {
    #count = 0;

    get count(): number {
      return this.#count;
    }

    increment(): number {
      this.#count += 1;
      return this.#count;
    }

    add(amount: number): number {
      this.#count += amount;
      return this.#count;
    }
  }

  const counter = new Counter();
  bindAllFunctions(counter);

  const { increment, add } = counter;

  assertEquals(increment(), 1);
  assertEquals(add(2), 3);
  assertEquals(counter.count, 3);
});

Deno.test("bindAllFunctions does not alter non-function prototype members", () => {
  function WithNonFunctions() {}

  Object.defineProperty(WithNonFunctions.prototype, "label", {
    value: "polyfill",
    writable: true,
    configurable: true,
  });

  WithNonFunctions.prototype.describe = function () {
    return this.label;
  };

  const instance = new (WithNonFunctions as unknown as new () => {
    label: string;
    describe: () => string;
  })();
  bindAllFunctions(instance);

  assertStrictEquals(instance.label, "polyfill");
  assert(!Object.hasOwn(instance, "label"));
  assertEquals(instance.describe(), "polyfill");
});

Deno.test("bindAllFunctions keeps accessor descriptors intact", () => {
  let getterCalls = 0;

  class AccessorExample {
    #value = 0;

    get value(): number {
      getterCalls += 1;
      return this.#value;
    }

    set value(next: number) {
      this.#value = next;
    }

    double(): number {
      return this.value * 2;
    }
  }

  const instance = new AccessorExample();
  bindAllFunctions(instance);

  assertEquals(getterCalls, 0);

  instance.value = 21;
  const { double } = instance;

  assertEquals(double(), 42);
  assertEquals(getterCalls, 1);
});
