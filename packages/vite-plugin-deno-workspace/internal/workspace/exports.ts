/**
 * Resolves the exports field from a package configuration.
 * @param exportsField - The exports field to resolve.
 * @returns The resolved exports field.
 */
export function resolveExportsField(exportsField: unknown): string | undefined {
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
