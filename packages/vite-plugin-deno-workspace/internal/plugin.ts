import * as path from "node:path";
import process from "node:process";

import type { AliasOptions, Plugin } from "vite";

import { mergeAliases } from "./vite/alias.ts";
import { collectPackageAliases } from "./workspace/packages.ts";
import { resolveWorkspaceConfigPath } from "./workspace/discover.ts";
import type { DenoWorkspacePluginOptions } from "../types.ts";

export function denoWorkspacePlugin(
  options: DenoWorkspacePluginOptions = {},
): Plugin {
  return {
    name: "@y0n1/vite-plugin-deno-workspace",
    enforce: "pre",
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
      } as { resolve: { alias: AliasOptions } };
    },
  };
}
