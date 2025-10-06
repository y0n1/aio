import type { Alias, AliasOptions, Plugin } from "vite";
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";

type AliasEntries = Record<string, string>;

interface LoggerLike {
  warn(message: string): void;
}

export interface DenoWorkspacePluginOptions {
  /**
   * Optional path (relative to the Vite root or absolute) to a specific
   * workspace configuration file. When provided, the plugin uses this path
   * directly instead of searching for a workspace file.
   */
  workspacePath?: string;
  /**
   * The filename to search for when discovering the workspace configuration.
   * Defaults to `deno.jsonc`. If not found, the plugin falls back to
   * `deno.json` automatically.
   */
  workspaceFile?: string;
}

/**
 * Vite plugin that keeps `resolve.alias` in sync with the packages
 * declared in a Deno workspace. It discovers every package listed in
 * `deno.json`/`deno.jsonc`, reads their exported entry point, and exposes it as a
 * Vite alias automatically.
 *
 * @param options Optional configuration for the plugin.
 *   - `workspacePath`: Absolute or root-relative path to a specific workspace
 *     manifest to load instead of searching for one.
 *   - `workspaceFile`: Alternate filename to look for when discovering the workspace
 *     manifest. Defaults to `deno.jsonc` and falls back to `deno.json`.
 *
 * By default, the plugin searches upward from Vite's `config.root` (or the current
 * working directory) for a `deno.jsonc` file. If it is not present, it falls back
 * to `deno.json`.
 *
 * Existing aliases declared in Vite are preserved. When aliases are defined as an
 * array, the plugin appends any new entries that do not already exist. When
 * aliases are defined as an object, the plugin merges the generated aliases with
 * the existing map, giving precedence to the existing user-defined entries.
 *
 * @see https://github.com/y0n1/vite-plugin-deno-workspace#usage
 */
export function denoWorkspacePlugin(
  options: DenoWorkspacePluginOptions = {},
): Plugin {
  return {
    name: "@y0n1/vite-plugin-deno-workspace",
    enforce: "pre",
    /**
     * Vite config hook. Discovers the Deno workspace manifest, collects package
     * aliases, and merges them into Vite's resolve.alias configuration.
     */
    config(config) {
      const root = config.root ? path.resolve(config.root) : process.cwd();
      const workspaceConfigPath = resolveWorkspaceConfigPath(root, options);

      if (!workspaceConfigPath) {
        this.warn(
          "[vite-plugin-deno-workspace] Unable to locate a Deno workspace file.",
        );
        return undefined;
      }

      const aliases = collectPackageAliases(workspaceConfigPath, {
        warn: (message) => this.warn(message),
      });

      if (!Object.keys(aliases).length) {
        return undefined;
      }

      const mergedAlias = mergeAliases(config.resolve?.alias, aliases);

      return {
        resolve: {
          alias: mergedAlias,
        },
      } satisfies { resolve: { alias: AliasOptions } };
    },
  };
}

export default denoWorkspacePlugin;

function mergeAliases(
  existing: AliasOptions | undefined,
  additions: AliasEntries,
): AliasOptions {
  if (!existing) {
    return { ...additions } satisfies AliasOptions;
  }

  const additionEntries = Object.entries(additions);

  if (Array.isArray(existing)) {
    const existingFinds = new Set(
      existing
        .map((entry) => entry.find)
        .filter((find): find is string => typeof find === "string"),
    );

    const newAliases = additionEntries
      .filter(([find]) => !existingFinds.has(find))
      .map(([find, replacement]) => ({ find, replacement } satisfies Alias));

    return [...existing, ...newAliases];
  }

  return { ...additions, ...existing } satisfies AliasOptions;
}

function resolveWorkspaceConfigPath(
  root: string,
  options: DenoWorkspacePluginOptions,
): string | undefined {
  if (options.workspacePath) {
    const candidate = path.isAbsolute(options.workspacePath)
      ? options.workspacePath
      : path.resolve(root, options.workspacePath);

    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const primary = options.workspaceFile ?? "deno.jsonc";
  const fallbacks = new Set<string>();
  fallbacks.add(primary);
  fallbacks.add(primary === "deno.json" ? "deno.jsonc" : "deno.json");

  for (const fileName of fallbacks) {
    const found = findUp(fileName, root);
    if (found) {
      return found;
    }
  }

  return undefined;
}

function collectPackageAliases(
  workspaceConfigPath: string,
  logger: LoggerLike,
): AliasEntries {
  const workspaceConfig = loadJson(workspaceConfigPath);
  if (!workspaceConfig || typeof workspaceConfig !== "object") {
    return {};
  }

  const workspaceEntries = Array.isArray(
      (workspaceConfig as { workspace?: unknown }).workspace,
    )
    ? ((workspaceConfig as { workspace: unknown[] }).workspace)
    : [];

  const aliases: AliasEntries = {};
  const workspaceDir = path.dirname(workspaceConfigPath);

  for (const entry of workspaceEntries) {
    if (typeof entry !== "string") {
      continue;
    }

    if (entry.includes("*")) {
      const basePath = entry.split("*")[0];
      if (!basePath) {
        continue;
      }

      const baseDir = path.resolve(workspaceDir, basePath);
      const stat = tryStat(baseDir);
      if (!stat?.isDirectory()) {
        continue;
      }

      for (const dirent of fs.readdirSync(baseDir, { withFileTypes: true })) {
        if (!dirent.isDirectory()) {
          continue;
        }

        const packageDir = path.join(baseDir, dirent.name);
        const alias = resolvePackageAlias(packageDir, logger);
        if (alias) {
          aliases[alias.name] = alias.path;
        }
      }

      continue;
    }

    const packageDir = path.resolve(workspaceDir, entry);
    const alias = resolvePackageAlias(packageDir, logger);
    if (alias) {
      aliases[alias.name] = alias.path;
    }
  }

  return aliases;
}

function resolvePackageAlias(
  packageDir: string,
  logger: LoggerLike,
): { name: string; path: string } | undefined {
  const packageConfigPath = findPackageConfig(packageDir);
  if (!packageConfigPath) {
    return undefined;
  }

  const packageConfig = loadJson(packageConfigPath);
  if (!packageConfig || typeof packageConfig !== "object") {
    return undefined;
  }

  const { name, exports } = packageConfig as {
    name?: unknown;
    exports?: unknown;
  };

  if (typeof name !== "string" || !name) {
    return undefined;
  }

  const exportTarget = resolveExportsField(exports) ?? "./mod.ts";
  const packageRoot = path.dirname(packageConfigPath);
  const absoluteEntry = path.resolve(packageRoot, exportTarget);

  if (!fs.existsSync(absoluteEntry)) {
    logger.warn(
      `[vite-plugin-deno-workspace] Skipping alias for ${name} because entry point does not exist: ${absoluteEntry}`,
    );
    return undefined;
  }

  return { name, path: absoluteEntry };
}

function findPackageConfig(packageDir: string): string | undefined {
  const candidates = ["deno.json", "deno.jsonc"];
  for (const candidate of candidates) {
    const configPath = path.join(packageDir, candidate);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }

  return undefined;
}

function resolveExportsField(exportsField: unknown): string | undefined {
  if (typeof exportsField === "string") {
    return exportsField;
  }

  if (exportsField && typeof exportsField === "object") {
    const record = exportsField as Record<string, unknown>;

    if (typeof record["."] === "string") {
      return record["."];
    }

    if (typeof record["default"] === "string") {
      return record["default"];
    }

    for (const value of Object.values(record)) {
      if (typeof value === "string") {
        return value;
      }
    }
  }

  return undefined;
}

function loadJson(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const source = fs.readFileSync(filePath, "utf8").trim();
  if (!source) {
    return undefined;
  }

  try {
    return JSON.parse(source);
  } catch {
    try {
      return JSON.parse(stripJsonComments(source));
    } catch {
      return undefined;
    }
  }
}

function stripJsonComments(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function findUp(fileName: string, startDir: string): string | undefined {
  let dir = path.resolve(startDir);

  while (true) {
    const candidate = path.join(dir, fileName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }

    dir = parent;
  }
}

function tryStat(filePath: string) {
  try {
    return fs.statSync(filePath);
  } catch {
    return undefined;
  }
}
