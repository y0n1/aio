import { dirname } from "@std/path";

import type {
  AliasOptions,
  ConfigEnv,
  ConfigPluginContext,
  UserConfig,
} from "vite";

import denoWorkspacePlugin from "../mod.ts";

export async function withTempDir(
  action: (dir: string) => Promise<void>,
): Promise<void> {
  const tempDir = await Deno.makeTempDir();
  try {
    await action(tempDir);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
}

export async function writeJson(filePath: string, value: unknown) {
  await ensureDir(dirname(filePath));
  await Deno.writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeTextFile(filePath: string, contents: string) {
  await ensureDir(dirname(filePath));
  await Deno.writeTextFile(filePath, contents);
}

export async function ensureDir(dirPath: string) {
  await Deno.mkdir(dirPath, { recursive: true });
}

export async function invokeConfigHook(
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

export function convertAliasToMap(
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
