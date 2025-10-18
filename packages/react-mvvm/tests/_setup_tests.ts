/**
 * Setup the global environment for tests that require a DOM.
 *
 * @example
 * ```ts
 * import "./_setup_tests.ts";
 * ```
 */

import { parseHTML } from "linkedom";
import * as process from "node:process";

const dom = parseHTML(`
<!doctype html>
<html lang="en">
  <head><title>Unreal DOM</title></head>
  <body></body>
</html>  
`);

globalThis.document = dom.document;
globalThis.window = dom.window;

globalThis.process ??= process;
globalThis.process.env = { NODE_ENV: "test" };

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
