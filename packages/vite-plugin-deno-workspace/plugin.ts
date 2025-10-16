import * as path from "node:path";
import process from "node:process";

import type { AliasOptions, Plugin } from "vite";

import { mergeAliases } from "./internal/vite/alias.ts";
import { collectPackageAliases } from "./internal/workspace/packages.ts";
import { resolveWorkspaceConfigPath } from "./internal/workspace/discover.ts";
import type {
  DenoWorkspacePluginOptions,
  LoggerLike,
} from "./internal/types.ts";

/**
 * Vite plugin for automatically inferring and configuring workspace-based path aliases
 * from Deno workspace setups (deno.json and deno.jsonc files).
 *
 * @param options - Options to customize plugin behavior.
 * @returns A Vite plugin instance that auto-resolves workspace package aliases.
 *
 * ## How it works
 *
 * This plugin, when registered in your `vite.config.ts`, scans your Deno workspace root
 * for workspace configuration files. If found, it collects path aliases for all
 * workspace packages and injects them into Vite's resolver. This streamlines monorepo
 * interoperability and TypeScript/Vite compatibility when using Deno style project
 * structures.
 *
 * ### Example usage (vite.config.ts):
 * ```ts
 * import { denoWorkspacePlugin } from "@y0n1/vite-plugin-deno-workspace";
 * export default {
 *   plugins: [
 *     denoWorkspacePlugin(),
 *   ],
 * };
 * ```
 */
export function denoWorkspacePlugin(
  options: DenoWorkspacePluginOptions = {},
): Plugin {
  return {
    /**
     * The name of this Vite plugin.
     */
    name: "@y0n1/vite-plugin-deno-workspace",

    /**
     * Runs before other Vite config hooks to ensure aliases are set early.
     */
    enforce: "pre",

    /**
     * Vite config hook.
     * @param config - The Vite user config.
     */
    config(config) {
      const root = config.root ? path.resolve(config.root) : process.cwd();
      const workspaceConfigPath = resolveWorkspaceConfigPath(root, options);

      // Warn if no workspace config file could be found
      if (!workspaceConfigPath) {
        this.warn(
          "[vite-plugin-deno-workspace] Unable to locate a Deno workspace file.",
        );
        return undefined;
      }

      // Collect all intra-workspace package aliases
      const aliases = collectPackageAliases(
        workspaceConfigPath,
        {
          warn: (message: string) => this.warn(message),
        } satisfies LoggerLike,
      );

      // If no aliases are found, do not modify config
      if (!Object.keys(aliases).length) {
        return undefined;
      }

      // Merge existing user-defined aliases with discovered workspace aliases
      const mergedAlias = mergeAliases(config.resolve?.alias, aliases);

      // Return new Vite config fragment with updated aliases
      return {
        resolve: {
          alias: mergedAlias,
        },
      } as { resolve: { alias: AliasOptions } };
    },
  };
}
