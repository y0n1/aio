import { assertEquals } from "jsr:@std/assert";
import { join } from "jsr:@std/path";

import { collectPackageAliases, resolvePackageAlias } from "./packages.ts";

class TestLogger {
  messages: string[] = [];
  warn(message: string) {
    this.messages.push(message);
  }
}

Deno.test("collectPackageAliases expands wildcards", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(
      join(dir, "deno.json"),
      '{"workspace":["packages/*"]}\n',
    );
    await Deno.mkdir(join(dir, "packages", "pkg-a"), { recursive: true });
    await Deno.writeTextFile(
      join(dir, "packages", "pkg-a", "deno.json"),
      '{"name":"@pkg/a","exports":"./mod.ts"}\n',
    );
    await Deno.writeTextFile(
      join(dir, "packages", "pkg-a", "mod.ts"),
      "export {}\n",
    );

    const logger = new TestLogger();
    const aliases = collectPackageAliases(join(dir, "deno.json"), logger);
    assertEquals(aliases["@pkg/a"], join(dir, "packages", "pkg-a", "mod.ts"));
    assertEquals(logger.messages.length, 0);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("resolvePackageAlias warns when entry missing", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(
      join(dir, "deno.json"),
      '{"name":"@pkg/missing","exports":"./missing.ts"}\n',
    );

    const logger = new TestLogger();
    const alias = resolvePackageAlias(dir, logger);
    assertEquals(alias, undefined);
    assertEquals(logger.messages.length, 1);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
