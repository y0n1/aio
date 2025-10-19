import { assertEquals, assertMatch } from "@std/assert";
import { join } from "@std/path";

import { loadJson, stripJsonComments } from "./json.ts";

Deno.test("loadJson parses plain JSON", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const file = join(dir, "config.json");
    await Deno.writeTextFile(file, '{"name":"test"}\n');
    assertEquals(loadJson(file), { name: "test" });
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("loadJson handles JSONC", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const file = join(dir, "config.jsonc");
    await Deno.writeTextFile(
      file,
      `{
  // comment
  "name": "value"
}
`,
    );
    assertEquals(loadJson(file), { name: "value" });
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("stripJsonComments removes line and block comments", () => {
  const source = `{
  // line
  "name": "value", /* block */
  "url": "https://example.com" // trailing
}`;
  const stripped = stripJsonComments(source);

  assertMatch(stripped, /"name": "value",\s*"url": "https:\/\/example.com"/);
});
