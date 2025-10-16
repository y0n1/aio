export type AliasEntries = Record<string, string>;

export interface LoggerLike {
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
