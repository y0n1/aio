import type { Alias, AliasOptions } from "vite";

import type { AliasEntries } from "../types.ts";

/**
 * Merges existing Vite aliases with new workspace package aliases.
 * @param existing - The existing Vite aliases.
 * @param additions - The new workspace package aliases.
 * @returns The merged aliases.
 */
export function mergeAliases(
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
      .map(([find, replacement]) => ({
        find,
        replacement,
      } satisfies Alias));

    return [...existing, ...newAliases];
  }

  return { ...additions, ...existing } satisfies AliasOptions;
}
