import { assert, assertStrictEquals } from "@std/assert";
import { Results } from "../core/Result.ts";

Deno.test("Results.OK returns a frozen success result with the value", () => {
  const payload = { id: 123 };

  const result = Results.OK(payload);

  assert(Object.isFrozen(result));
  assertStrictEquals(result.type, "success");
  assertStrictEquals(result.value, payload);
  assert(!("error" in result));
});

Deno.test("Results.Error returns a frozen failure result with the error", () => {
  const failure = new Error("fail");

  const result = Results.Error(failure);

  assert(Object.isFrozen(result));
  assertStrictEquals(result.type, "failure");
  assertStrictEquals(result.error, failure);
  assert(!("value" in result));
});
