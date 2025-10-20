import { join } from "@std/path";
import { parse as parseJsonc } from "@std/jsonc";

function fail(message: string): never {
  console.error(`::error::${message}`);
  return Deno.exit(1);
}

const eventPath = Deno.env.get("GITHUB_EVENT_PATH");
if (!eventPath) {
  fail("GITHUB_EVENT_PATH env var is not available.");
}

let event: unknown;
try {
  const raw = await Deno.readTextFile(eventPath);
  event = JSON.parse(raw);
} catch (error) {
  fail(`Unable to read release event payload: ${error}`);
}

if (!event || typeof event !== "object" || !("release" in event)) {
  fail("GitHub event payload does not contain release information.");
}

const release = (event as { release: Record<string, unknown> }).release;
const releaseName = typeof release.name === "string" ? release.name.trim() : "";
const releaseTag = typeof release.tag_name === "string"
  ? release.tag_name.trim()
  : "";
const identifier = releaseName || releaseTag;

if (!identifier) {
  fail("Release title (name) or tag must be provided.");
}

const match = identifier.match(/^(?<package>.+)\/v(?<version>.+)$/);
const packageName = match?.groups?.package?.trim();
const releaseVersion = match?.groups?.version?.trim();

if (!packageName || !releaseVersion) {
  fail(
    "Release title must follow the '<package_name>/v<package_version>' format (e.g. 'react-mvvm/v1.0.0').",
  );
}

if (typeof release.draft === "boolean" && release.draft) {
  fail("Draft releases are not supported for publishing.");
}

const expectedTag = `${packageName}/v${releaseVersion}`;
if (releaseTag && releaseTag !== expectedTag) {
  fail(`Release tag '${releaseTag}' must match '${expectedTag}'.`);
}

const packagesRoot = "packages";
let matchedDir = "";
let matchedConfigVersion = "";

for await (const entry of Deno.readDir(packagesRoot)) {
  if (!entry.isDirectory) continue;

  const packageDir = join(packagesRoot, entry.name);
  const configPath = join(packageDir, "deno.jsonc");

  try {
    await Deno.stat(configPath);
  } catch {
    continue;
  }

  let config: unknown;
  try {
    const rawConfig = await Deno.readTextFile(configPath);
    config = parseJsonc(rawConfig);
  } catch (error) {
    fail(`Failed to parse ${configPath}: ${error}`);
  }

  if (!config || typeof config !== "object") continue;

  const name = Reflect.get(config, "name");
  const version = Reflect.get(config, "version");

  if (typeof name !== "string" || typeof version !== "string") continue;

  if (name.trim() === packageName) {
    matchedDir = packageDir;
    matchedConfigVersion = version.trim();
    break;
  }
}

if (!matchedDir) {
  fail(`No package found with name '${packageName}' under ${packagesRoot}.`);
}

if (matchedConfigVersion !== releaseVersion) {
  fail(
    `Release version '${releaseVersion}' does not match package version '${matchedConfigVersion}'.`,
  );
}

const outputPath = Deno.env.get("GITHUB_OUTPUT");
if (!outputPath) {
  fail("GITHUB_OUTPUT env var is not available.");
}

const lines = [
  `package_dir=${matchedDir}`,
  `package_name=${packageName}`,
  `package_version=${releaseVersion}`,
];

await Deno.writeTextFile(outputPath, `${lines.join("\n")}\n`, { append: true });

console.log(
  `Resolved release to ${packageName}@${releaseVersion} in ${matchedDir}.`,
);
