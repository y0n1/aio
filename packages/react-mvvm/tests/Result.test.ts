import "./_setup_tests.ts";
import { assert, assertEquals } from "@std/assert";
import { type Result, Results } from "../internal/core/result.ts";

const divide = (a: number, b: number): Result<number, Error> => {
  if (b === 0) {
    return Results.Failure(new Error("Division by zero"));
  }
  return Results.Success(a / b);
};

Deno.test("divide returns a successful result when the division is successful", () => {
  const result = divide(10, 2);
  assert(result.ok);
  assertEquals(result.value, 5);
});

Deno.test("divide returns a failed result when the division is not successful", () => {
  const result = divide(10, 0);
  assert(!result.ok);
  assertEquals(result.error.message, "Division by zero");
});
