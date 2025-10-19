import { assert, assertEquals, assertExists } from "@std/assert";
import { join } from "@std/path";

import {
  convertAliasToMap,
  invokeConfigHook,
  withTempDir,
  writeJson,
  writeTextFile,
} from "./helpers.ts";

Deno.test("generates aliases for workspace packages", async () => {
  await withTempDir(async (workspaceRoot) => {
    const packagesDir = join(workspaceRoot, "packages");
    const packageDir = join(packagesDir, "pkg-a");

    await writeJson(join(workspaceRoot, "deno.jsonc"), {
      workspace: ["packages/*"],
    });
    await writeJson(join(packageDir, "deno.json"), {
      name: "@tests/pkg-a",
      exports: "./mod.ts",
    });
    await writeTextFile(
      join(packageDir, "mod.ts"),
      "export const value = 1;\n",
    );

    const warnings: string[] = [];

    const result = await invokeConfigHook(warnings, {
      root: join(workspaceRoot, "app"),
    });

    assertEquals(warnings.length, 0);
    assertExists(result?.resolve);
    const aliasMap = convertAliasToMap(result?.resolve?.alias);
    assertEquals(aliasMap["@tests/pkg-a"], join(packageDir, "mod.ts"));
  });
});

Deno.test("parses JSONC manifests that include comments", async () => {
  await withTempDir(async (workspaceRoot) => {
    const packagesDir = join(workspaceRoot, "packages");
    const packageDir = join(packagesDir, "pkg-comments");

    await writeTextFile(
      join(workspaceRoot, "deno.jsonc"),
      `{
  // Top-level workspace comment
  "workspace": [
    "packages/*" // Inline workspace comment
  ]
}
`,
    );

    await writeTextFile(
      join(packageDir, "deno.jsonc"),
      `{
  /* Package manifest comment */
  "name": "@tests/pkg-comments",
  "exports": "./mod.ts",
  "description": "Contains URL https://example.com/path"
  // Trailing property comment
}
`,
    );

    await writeTextFile(
      join(packageDir, "mod.ts"),
      "export const value = 3;\n",
    );

    const warnings: string[] = [];

    const result = await invokeConfigHook(warnings, {
      root: workspaceRoot,
    });

    assertEquals(warnings.length, 0);
    assertExists(result?.resolve);
    const aliasMap = convertAliasToMap(result?.resolve?.alias);
    assertEquals(aliasMap["@tests/pkg-comments"], join(packageDir, "mod.ts"));
  });
});

Deno.test("merges generated aliases with existing configuration", async () => {
  await withTempDir(async (workspaceRoot) => {
    const packageDir = join(workspaceRoot, "packages", "pkg-b");

    await writeJson(join(workspaceRoot, "deno.json"), {
      workspace: ["packages/*"],
    });
    await writeJson(join(packageDir, "deno.json"), {
      name: "@tests/pkg-b",
      exports: "./main.ts",
    });
    await writeTextFile(
      join(packageDir, "main.ts"),
      "export const value = 2;\n",
    );

    const warnings: string[] = [];
    const existing = [{
      find: "@keep/existing",
      replacement: "/tmp/existing.ts",
    }];

    const result = await invokeConfigHook(warnings, {
      root: workspaceRoot,
      resolve: {
        alias: existing,
      },
    });

    assertEquals(warnings.length, 0);
    assertExists(result?.resolve);
    const aliasArray = result?.resolve?.alias;
    assertExists(aliasArray);

    const retained = Array.isArray(aliasArray)
      ? aliasArray.find((entry) => entry.find === "@keep/existing")
      : undefined;
    assertExists(retained);
    assertEquals(retained.replacement, "/tmp/existing.ts");

    const generated = Array.isArray(aliasArray)
      ? aliasArray.find((entry) => entry.find === "@tests/pkg-b")
      : undefined;
    assertExists(generated);
    assertEquals(generated.replacement, join(packageDir, "main.ts"));
  });
});

Deno.test("warns when no workspace manifest is found", async () => {
  await withTempDir(async (workspaceRoot) => {
    const warnings: string[] = [];

    const result = await invokeConfigHook(warnings, {
      root: workspaceRoot,
    });

    assertEquals(result, undefined);
    assertEquals(warnings.length, 1);
    assert(warnings[0].includes("Unable to locate a Deno workspace file"));
  });
});
