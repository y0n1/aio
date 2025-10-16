import * as fs from "node:fs";

/**
 * Loads and parses a JSON or JSONC file.
 * @param filePath - The path to the JSON or JSONC file.
 * @returns The parsed JSON object or undefined if the file does not exist or is empty.
 */
export function loadJson(filePath: string): unknown | undefined {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const source = fs.readFileSync(filePath, "utf8").trim();
  if (!source) {
    return undefined;
  }

  try {
    return JSON.parse(source);
  } catch {
    try {
      const json = stripJsonComments(source);
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  }
}

/**
 * Strips JSON comments from a string.
 * @param source - The string to strip comments from.
 * @returns The string with comments removed.
 */
export function stripJsonComments(source: string): string {
  let result = "";
  let inString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let isEscaped = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (inSingleLineComment) {
      if (char === "\n" || char === "\r") {
        inSingleLineComment = false;
        result += char;
        if (char === "\r" && next === "\n") {
          result += next;
          i++;
        }
      }
      continue;
    }

    if (inMultiLineComment) {
      if (char === "\n") {
        result += char;
      } else if (char === "\r" && next === "\n") {
        result += char + next;
        i++;
      }

      if (char === "*" && next === "/") {
        inMultiLineComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (!isEscaped && char === '"') {
        inString = false;
      }
      isEscaped = !isEscaped && char === "\\";
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      isEscaped = false;
      continue;
    }

    if (char === "/" && next === "/") {
      inSingleLineComment = true;
      i++;
      continue;
    }

    if (char === "/" && next === "*") {
      inMultiLineComment = true;
      i++;
      continue;
    }

    result += char;
  }

  return result;
}
