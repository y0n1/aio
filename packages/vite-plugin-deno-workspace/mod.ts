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

/**
 * Resolves the path to the Deno workspace configuration file.
 *
 * This function attempts to locate the workspace manifest file by:
 * 1. Checking if a specific `workspacePath` is provided in options. If so, it resolves
 *    the path (absolute or relative to `root`) and returns it if it exists.
 * 2. Otherwise, it looks for a workspace file named by `options.workspaceFile` (defaulting
 *    to "deno.jsonc") or its fallback ("deno.json" or "deno.jsonc", whichever is not primary)
 *    by searching upward from the `root` directory.
 *
 * @param root - The root directory to start searching from.
 * @param options - Plugin options that may specify a workspace path or file name.
 * @returns The resolved path to the workspace config file, or undefined if not found.
 */
function resolveWorkspaceConfigPath(
  root: string,
  options: DenoWorkspacePluginOptions,
): string | undefined {
  // 1. Check for explicit workspacePath in options
  if (options.workspacePath) {
    const candidate = path.isAbsolute(options.workspacePath)
      ? options.workspacePath
      : path.resolve(root, options.workspacePath);

    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // 2. Determine primary and fallback workspace file names
  const primary = options.workspaceFile ?? "deno.jsonc";
  const fallbacks = new Set<string>();
  fallbacks.add(primary);
  // If primary is "deno.json", fallback to "deno.jsonc", else fallback to "deno.json"
  fallbacks.add(primary === "deno.json" ? "deno.jsonc" : "deno.json");

  // 3. Search upward for the workspace file(s)
  for (const fileName of fallbacks) {
    const found = findUp(fileName, root);
    if (found) {
      return found;
    }
  }

  // 4. No workspace config found
  return undefined;
}

/**
 * Collects Vite alias entries for all packages defined in a Deno workspace.
 *
 * This function reads the workspace manifest (deno.json/deno.jsonc), discovers all
 * package directories (expanding wildcards), and generates a map of alias entries
 * where each key is the package name and the value is the absolute path to its entry point.
 *
 * @param workspaceConfigPath - Absolute path to the workspace manifest file.
 * @param logger - Logger for warnings and informational messages.
 * @returns An object mapping package names to their resolved entry point paths.
 *
 * @example
 * // Given a workspace with packages "foo" and "bar":
 * const aliases = collectPackageAliases("/path/to/deno.jsonc", logger);
 * // aliases = { "foo": "/abs/path/to/foo/mod.ts", "bar": "/abs/path/to/bar/mod.ts" }
 */
function collectPackageAliases(
  workspaceConfigPath: string,
  logger: LoggerLike,
): AliasEntries {
  // Load the workspace configuration file (deno.json/deno.jsonc)
  const workspaceConfig = loadJson(workspaceConfigPath);
  if (!workspaceConfig || typeof workspaceConfig !== "object") {
    return {};
  }

  // Extract the "workspace" array from the config, or use an empty array if not present
  const workspaceEntries = Array.isArray(
      (workspaceConfig as { workspace?: unknown }).workspace,
    )
    ? ((workspaceConfig as { workspace: unknown[] }).workspace)
    : [];

  const aliases: AliasEntries = {};
  const workspaceDir = path.dirname(workspaceConfigPath);

  // Iterate over each workspace entry (can be a path or a glob with *)
  for (const entry of workspaceEntries) {
    if (typeof entry !== "string") {
      continue;
    }

    // Handle wildcard entries (e.g., "packages/*")
    if (entry.includes("*")) {
      // Get the base directory before the wildcard
      const basePath = entry.split("*")[0];
      if (!basePath) {
        continue;
      }

      const baseDir = path.resolve(workspaceDir, basePath);
      const stat = tryStat(baseDir);
      if (!stat?.isDirectory()) {
        continue;
      }

      // Read all subdirectories in the base directory
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

    // Handle explicit (non-wildcard) entries
    const packageDir = path.resolve(workspaceDir, entry);
    const alias = resolvePackageAlias(packageDir, logger);
    if (alias) {
      aliases[alias.name] = alias.path;
    }
  }

  return aliases;
}

/**
 * Resolves the alias for a Deno package by reading its configuration and determining
 * the entry point to expose as a Vite alias.
 *
 * @param packageDir - The absolute path to the package directory.
 * @param logger - An object with a `warn` method for logging warnings.
 * @returns An object containing the package name and the absolute path to its entry point,
 *          or `undefined` if the alias cannot be resolved.
 *
 * @docs
 * This function is used internally by the plugin to map Deno workspace packages to Vite aliases.
 * It attempts to locate a `deno.json` or `deno.jsonc` file in the given package directory,
 * reads the `name` and `exports` fields, and resolves the entry point. If the entry point
 * does not exist, a warning is logged and the alias is skipped.
 */
function resolvePackageAlias(
  packageDir: string,
  logger: LoggerLike,
): { name: string; path: string } | undefined {
  // Find the package configuration file (deno.json or deno.jsonc)
  const packageConfigPath = findPackageConfig(packageDir);
  if (!packageConfigPath) {
    return undefined;
  }

  // Load and parse the package configuration
  const packageConfig = loadJson(packageConfigPath);
  if (!packageConfig || typeof packageConfig !== "object") {
    return undefined;
  }

  // Extract the package name and exports field
  const { name, exports } = packageConfig as {
    name?: unknown;
    exports?: unknown;
  };

  // Validate the package name
  if (typeof name !== "string" || !name) {
    return undefined;
  }

  // Determine the entry point from the exports field or default to "./mod.ts"
  const exportTarget = resolveExportsField(exports) ?? "./mod.ts";
  const packageRoot = path.dirname(packageConfigPath);
  const absoluteEntry = path.resolve(packageRoot, exportTarget);

  // Check if the entry point exists
  if (!fs.existsSync(absoluteEntry)) {
    logger.warn(
      `[vite-plugin-deno-workspace] Skipping alias for ${name} because entry point does not exist: ${absoluteEntry}`,
    );
    return undefined;
  }

  // Return the alias mapping
  return { name, path: absoluteEntry };
}

/**
 * Attempts to locate a Deno package configuration file within the given directory.
 *
 * Searches for "deno.json" and "deno.jsonc" in the specified package directory,
 * returning the path to the first file found. If neither file exists, returns undefined.
 *
 * @param packageDir - The absolute path to the package directory to search.
 * @returns The absolute path to the found configuration file, or undefined if not found.
 *
 * @internal
 */
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

/**
 * Resolves the entry point from a Deno package's "exports" field.
 *
 * The function supports the following resolution order:
 * 1. If the exports field is a string, returns it directly.
 * 2. If the exports field is an object:
 *    a. Returns the value of the "." key if it is a string.
 *    b. Returns the value of the "default" key if it is a string.
 *    c. Returns the first string value found among the object's values.
 * 3. Returns undefined if no valid entry point is found.
 *
 * @param exportsField - The "exports" field from a Deno package config.
 * @returns The resolved entry point string, or undefined if not found.
 */
function resolveExportsField(exportsField: unknown): string | undefined {
  if (typeof exportsField === "string") {
    return exportsField;
  }

  if (exportsField && typeof exportsField === "object") {
    const record = exportsField as Record<string, unknown>;

    // Prefer the "." key if present and a string
    if (typeof record["."] === "string") {
      return record["."];
    }

    // Fallback to "default" key if present and a string
    if (typeof record["default"] === "string") {
      return record["default"];
    }

    // Otherwise, return the first string value found
    for (const value of Object.values(record)) {
      if (typeof value === "string") {
        return value;
      }
    }
  }

  return undefined;
}

/**
 * Loads and parses a JSON or JSONC file from the given path.
 * Attempts to parse as standard JSON first, then falls back to stripping comments (JSONC).
 * Returns the parsed object, or undefined if the file does not exist or is invalid.
 *
 * @param filePath - The path to the JSON or JSONC file.
 * @returns The parsed object, or undefined if parsing fails.
 */
function loadJson(filePath: string): unknown | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const source = fs.readFileSync(filePath, "utf8").trim();
  if (!source) {
    return undefined;
  }

  // Try parsing as standard JSON first
  try {
    return JSON.parse(source);
  } catch {
    // If that fails, try parsing after stripping comments (JSONC)
    try {
      const json = stripJsonComments(source);
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  }
}

/**
 * Strips JSON comments from the given source string.
 *
 * @param source - The source string containing JSON or JSONC.
 * @returns The source string with comments removed.
 */
function stripJsonComments(source: string) {
  let result = "";
  let inString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let isEscaped = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (inSingleLineComment) {
      if (char === "\n" || char === "\r") {
        inSingleLineComment = false;
        result += char;
        if (char === "\r" && next === "\n") {
          result += next;
          i++;
        }
      }
      continue;
    }

    if (inMultiLineComment) {
      if (char === "\n") {
        result += char;
      } else if (char === "\r" && next === "\n") {
        result += char + next;
        i++;
      }

      if (char === "*" && next === "/") {
        inMultiLineComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (!isEscaped && char === '"') {
        inString = false;
      }
      isEscaped = !isEscaped && char === "\\";
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      isEscaped = false;
      continue;
    }

    if (char === "/" && next === "/") {
      inSingleLineComment = true;
      i++;
      continue;
    }

    if (char === "/" && next === "*") {
      inMultiLineComment = true;
      i++;
      continue;
    }

    result += char;
  }

  return result;
}

/**
 * Finds the first occurrence of a file by name starting from a given directory and searching upward.
 *
 * @param fileName - The name of the file to search for.
 * @param startDir - The directory to start searching from.
 * @returns The absolute path to the first occurrence of the file, or undefined if not found.
 */
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

/**
 * Attempts to get the file status of a given path.
 *
 * @param filePath - The path to the file to stat.
 * @returns The file status, or undefined if the file does not exist.
 */
function tryStat(filePath: string) {
  try {
    return fs.statSync(filePath);
  } catch {
    return undefined;
  }
}
