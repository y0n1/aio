import { assert, assertEquals, assertExists } from "jsr:@std/assert";
import { dirname, join } from "jsr:@std/path";
import type {
  Alias,
  AliasOptions,
  ConfigEnv,
  ConfigPluginContext,
  UserConfig,
} from "vite";

import denoWorkspacePlugin from "./mod.ts";

async function withTempDir(action: (dir: string) => Promise<void>) {
  const tempDir = await Deno.makeTempDir();
  try {
    await action(tempDir);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
}

async function writeJson(filePath: string, value: unknown) {
  await ensureDir(dirname(filePath));
  await Deno.writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeTextFile(filePath: string, contents: string) {
  await ensureDir(dirname(filePath));
  await Deno.writeTextFile(filePath, contents);
}

async function ensureDir(dirPath: string) {
  await Deno.mkdir(dirPath, { recursive: true });
}

async function invokeConfigHook(
  warnings: string[],
  config: UserConfig,
): Promise<UserConfig | undefined> {
  const plugin = denoWorkspacePlugin();
  const hook = plugin.config;

  if (!hook) {
    return undefined;
  }

  const handler = typeof hook === "function" ? hook : hook.handler;
  const context = {
    warn(message: string) {
      warnings.push(message);
    },
    info() {},
    error(message: string) {
      throw new Error(message);
    },
    debug() {},
    addWatchFile() {},
    getWatchFiles() {
      return [];
    },
    normalizePath(id: string) {
      return id;
    },
    parse() {
      throw new Error("Not implemented in tests");
    },
    resolve() {
      return Promise.resolve(null);
    },
    load(_id: string) {
      return Promise.resolve(null);
    },
    transform(_code: string, _id: string) {
      return Promise.resolve(null);
    },
    meta: {
      watchMode: false,
    },
    ssr: {
      request(..._args: unknown[]) {
        throw new Error("Not implemented in tests");
      },
    },
  } as unknown as ConfigPluginContext;

  const env: ConfigEnv = {
    command: "serve",
    mode: "development",
    isSsrBuild: false,
    isPreview: false,
  };

  const result = await handler.call(context, config, env);
  return result ?? undefined;
}

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
    const aliasMap = convertAliasToMap(
      result?.resolve?.alias as AliasOptions | undefined,
    );
    assertEquals(aliasMap["@tests/pkg-a"], join(packageDir, "mod.ts"));
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
    const aliasArray = result?.resolve?.alias as Alias[];
    assertEquals(aliasArray.length, 2);

    const retained = aliasArray.find((entry) =>
      entry.find === "@keep/existing"
    );
    assertExists(retained);
    assertEquals(retained.replacement, "/tmp/existing.ts");

    const generated = aliasArray.find((entry) => entry.find === "@tests/pkg-b");
    assertExists(generated);
    assertEquals(generated.replacement, join(packageDir, "main.ts"));
  });
});

function convertAliasToMap(
  alias: AliasOptions | undefined,
): Record<string, string> {
  if (!alias) {
    return {};
  }

  if (Array.isArray(alias)) {
    const entries: Record<string, string> = {};
    for (const { find, replacement } of alias) {
      if (typeof find === "string") {
        entries[find] = replacement;
      }
    }
    return entries;
  }

  return alias as Record<string, string>;
}

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
