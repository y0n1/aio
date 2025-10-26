import "../tests/_setup_tests.ts";
import { assert, assertEquals } from "@std/assert";
import { type Result, Results } from "./result.ts";

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

Deno.test("Results.isResult returns true for valid Success result", () => {
  const result = Results.Success(42);
  assert(Results.isResult(result));
});

Deno.test("Results.isResult returns true for valid Failure result", () => {
  const result = Results.Failure(new Error("test"));
  assert(Results.isResult(result));
});

Deno.test("Results.isResult returns true for Success result with undefined value", () => {
  const result = Results.Success();
  assert(Results.isResult(result));
});

Deno.test("Results.isResult returns true for object with ok property", () => {
  assert(Results.isResult({ ok: true, value: 42 }));
  assert(Results.isResult({ ok: false, error: "error" }));
});

Deno.test("Results.isResult returns false for null", () => {
  assert(!Results.isResult(null));
});

Deno.test("Results.isResult returns false for undefined", () => {
  assert(!Results.isResult(undefined));
});

Deno.test("Results.isResult returns false for non-object values", () => {
  assert(!Results.isResult(42));
  assert(!Results.isResult("string"));
  assert(!Results.isResult(true));
});

Deno.test("Results.isResult returns false for objects without ok property", () => {
  assert(!Results.isResult({ value: 42 }));
  assert(!Results.isResult({ error: new Error("test") }));
});

Deno.test("Results.isResult returns false for objects with non-boolean ok property", () => {
  assert(!Results.isResult({ ok: "true", value: 42 }));
  assert(!Results.isResult({ ok: 1, value: 42 }));
});

Deno.test("Results.isSuccess returns true for valid Success result", () => {
  const result = Results.Success(42);
  assert(Results.isSuccess(result));
});

Deno.test("Results.isSuccess returns true for Success result with undefined value", () => {
  const result = Results.Success();
  assert(Results.isSuccess(result));
});

Deno.test("Results.isSuccess returns false for Failure result", () => {
  const result = Results.Failure(new Error("test"));
  assert(!Results.isSuccess(result));
});

Deno.test("Results.isSuccess returns false for null", () => {
  assert(!Results.isSuccess(null));
});

Deno.test("Results.isSuccess returns false for undefined", () => {
  assert(!Results.isSuccess(undefined));
});

Deno.test("Results.isSuccess returns false for non-object values", () => {
  assert(!Results.isSuccess(42));
  assert(!Results.isSuccess("string"));
  assert(!Results.isSuccess(true));
});

Deno.test("Results.isSuccess returns false for objects without ok property", () => {
  assert(!Results.isSuccess({ value: 42 }));
});

Deno.test("Results.isSuccess returns false for objects with ok=false", () => {
  assert(!Results.isSuccess({ ok: false, value: 42 }));
});

Deno.test("Results.isSuccess returns false for objects without value property", () => {
  assert(!Results.isSuccess({ ok: true }));
});

Deno.test("Results.isFailure returns true for valid Failure result", () => {
  const result = Results.Failure(new Error("test"));
  assert(Results.isFailure(result));
});

Deno.test("Results.isFailure returns true for Failure result with custom error type", () => {
  const result = Results.Failure({ code: 404, message: "Not found" });
  assert(Results.isFailure(result));
});

Deno.test("Results.isFailure returns false for Success result", () => {
  const result = Results.Success(42);
  assert(!Results.isFailure(result));
});

Deno.test("Results.isFailure returns false for null", () => {
  assert(!Results.isFailure(null));
});

Deno.test("Results.isFailure returns false for undefined", () => {
  assert(!Results.isFailure(undefined));
});

Deno.test("Results.isFailure returns false for non-object values", () => {
  assert(!Results.isFailure(42));
  assert(!Results.isFailure("string"));
  assert(!Results.isFailure(false));
});

Deno.test("Results.isFailure returns false for objects without ok property", () => {
  assert(!Results.isFailure({ error: new Error("test") }));
});

Deno.test("Results.isFailure returns false for objects with ok=true", () => {
  assert(!Results.isFailure({ ok: true, error: new Error("test") }));
});

Deno.test("Results.isFailure returns false for objects without error property", () => {
  assert(!Results.isFailure({ ok: false }));
});
