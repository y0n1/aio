import * as fs from "node:fs";
import * as path from "node:path";

import type { DenoWorkspacePluginOptions } from "../../types.ts";

/**
 * Resolves the path to the workspace configuration file.
 * @param root - The root directory of the project.
 * @param options - The options for the plugin.
 * @returns The path to the workspace configuration file.
 */
export function resolveWorkspaceConfigPath(
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

/**
 * Finds a file by name in the directory tree, starting from the given directory.
 * @param fileName - The name of the file to find.
 * @param startDir - The directory to start searching from.
 * @returns The path to the file if found, otherwise undefined.
 */
export function findUp(
  fileName: string,
  startDir: string,
): string | undefined {
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
 * Tries to stat a file.
 * @param filePath - The path to the file.
 * @returns The stat of the file if successful, otherwise undefined.
 */
export function tryStat(filePath: string): fs.Stats | undefined {
  try {
    return fs.statSync(filePath);
  } catch {
    return undefined;
  }
}
