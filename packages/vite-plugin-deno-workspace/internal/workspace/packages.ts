import * as fs from "node:fs";
import * as path from "node:path";

import type { AliasEntries, LoggerLike } from "../../types.ts";
import { loadJson } from "../config/json.ts";
import { tryStat } from "./discover.ts";
import { resolveExportsField } from "./exports.ts";

/**
 * Collects package aliases from a workspace configuration file.
 * @param workspaceConfigPath - The path to the workspace configuration file.
 * @param logger - The logger to use.
 * @returns The package aliases.
 */
export function collectPackageAliases(
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

/**
 * Resolves a package alias from a package directory.
 * @param packageDir - The directory of the package.
 * @param logger - The logger to use.
 * @returns The package alias.
 */
export function resolvePackageAlias(
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

/**
 * Finds a package configuration file in the package directory.
 * @param packageDir - The directory of the package.
 * @returns The path to the package configuration file if found, otherwise undefined.
 */
export function findPackageConfig(packageDir: string): string | undefined {
  const candidates = ["deno.json", "deno.jsonc"];
  for (const candidate of candidates) {
    const configPath = path.join(packageDir, candidate);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  return undefined;
}
