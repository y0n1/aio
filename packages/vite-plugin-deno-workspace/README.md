# @y0n1/vite-plugin-deno-workspace

This is Vite plugin that keeps `resolve.alias` in sync with the packages
declared in a Deno workspace. It discovers every package listed in
`deno.json`/`deno.jsonc`, reads their exported entry point, and exposes it as a
Vite alias automatically.

## Project Layout

The package follows a Go-inspired layout: the public surface sits at the root,
while implementation details live inside `internal/` so they can evolve freely.

- `plugin.ts` – public entry point exporting `denoWorkspacePlugin`
- `internal/plugin.ts` – Vite hook implementation
- `internal/vite/alias.ts` – alias merge helpers
- `internal/workspace/*` – workspace discovery, package loading, exports parsing
- `internal/config/json.ts` – JSON/JSONC utilities
- `internal/types.ts` – shared internal types

Tests live next to the code they cover (`internal/**/*.test.ts`) with
integration coverage in `tests/mod.test.ts`. Shared test helpers remain in
`tests/helpers.ts`.

## Usage

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import denoWorkspacePlugin from "@y0n1/vite-plugin-deno-workspace";

export default defineConfig({
  plugins: [
    denoWorkspacePlugin(),
    react(),
  ],
});
```

By default the plugin searches upward from Vite's `config.root` (or the current
working directory) for a `deno.jsonc` file. If it is not present, it falls back
to `deno.json`.

Every workspace entry is resolved relative to the workspace manifest. Entries
with wildcards (`packages/*`) are expanded by scanning the target directory;
non-wildcard entries are resolved as-is. Each package must expose a `name` field
and an `exports` field (or the default `./mod.ts` entry) in its
`deno.json`/`deno.jsonc`. The plugin validates that the declared entry point
exists before adding the alias.

## Options

`denoWorkspacePlugin(options?: DenoWorkspacePluginOptions)` accepts the
following optional configuration:

- `workspacePath`: Absolute or root-relative path to a specific workspace
  manifest to load instead of searching for one.
- `workspaceFile`: Alternate filename to look for when discovering the workspace
  manifest. Defaults to `deno.jsonc` and falls back to `deno.json`.

Existing aliases declared in Vite are preserved. When aliases are defined as an
array, the plugin appends any new entries that do not already exist. When
aliases are defined as an object, the plugin merges the generated aliases with
the existing map, giving precedence to the existing user-defined entries.

## Logging

When a package entry point cannot be found, or when the workspace manifest is
missing, the plugin logs a `warn` entry through Vite's plugin logger so the
issue is visible during development builds.
