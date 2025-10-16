import { assertEquals } from "jsr:@std/assert";

import { resolveExportsField } from "./exports.ts";

Deno.test("returns string exports directly", () => {
  assertEquals(resolveExportsField("./mod.ts"), "./mod.ts");
});

Deno.test("prefers dot key", () => {
  assertEquals(
    resolveExportsField({
      ".": "./index.ts",
      default: "./mod.ts",
    }),
    "./index.ts",
  );
});

Deno.test("falls back to default key", () => {
  assertEquals(
    resolveExportsField({ default: "./default.ts" }),
    "./default.ts",
  );
});

Deno.test("uses first string value when no preferred keys", () => {
  assertEquals(
    resolveExportsField({ browser: "./browser.ts", worker: "./worker.ts" }),
    "./browser.ts",
  );
});

Deno.test("returns undefined when no string entries", () => {
  assertEquals(resolveExportsField({ foo: { bar: 1 } }), undefined);
});
