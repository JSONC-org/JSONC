#!/usr/bin/env node

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

// Customization section
const DEFAULT_INPUT_ABNF = "grammar/jsonc.abnf";
const DEFAULT_PROCESSED_ABNF = "grammar/jsonc-processed.abnf";
const DEFAULT_OUTPUT_HTML = "grammar/railroad-diagram.html";

// Rules to inline from their %x... definitions as literal ABNF strings.
// Add more rule names here to apply the same transformation.
const INLINE_HEX_RULES = [
  "multi-line-comment-start",
  "multi-line-comment-end",
  "asterisk",
  "escape"
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeAbnfHexSequence(value) {
  const trimmed = value.trim();
  if (!/^%x[0-9A-Fa-f]+(?:\.[0-9A-Fa-f]+)*$/.test(trimmed)) {
    throw new Error(`Unsupported ABNF hex sequence: ${value}`);
  }

  const bytes = trimmed
    .slice(2)
    .split(".")
    .map((part) => parseInt(part, 16));

  return String.fromCodePoint(...bytes);
}

function inlineHexRuleAsLiteral(source, ruleName) {
  const escapedRuleName = escapeRegExp(ruleName);
  const ruleRegex = new RegExp(
    `^\\s*${escapedRuleName}\\s*=\\s*(%x[0-9A-Fa-f]+(?:\\.[0-9A-Fa-f]+)*)\\b.*$`,
    "m",
  );
  const ruleMatch = source.match(ruleRegex);
  if (!ruleMatch) {
    throw new Error(`Rule ${ruleName} was not found.`);
  }

  const hexSequence = ruleMatch[1];
  const literalChars = decodeAbnfHexSequence(hexSequence);

  // For backslash or other problematic characters, keep them as hex format
  // ABNF doesn't support backslash escaping in quoted strings
  let replacement;
  if (literalChars === "\\") {
    replacement = hexSequence;
  } else {
    // For other characters, escape only double quotes (not backslashes)
    const escapedLiteralChars = literalChars.replace(/"/g, '\\"');
    replacement = `"${escapedLiteralChars}"`;
  }

  const removeRuleRegex = new RegExp(`^\\s*${escapedRuleName}\\s*=.*(?:\\r?\\n|$)`, "m");
  const withoutRule = source.replace(removeRuleRegex, "");

  const useRuleRegex = new RegExp(
    `(?<![A-Za-z0-9-])${escapedRuleName}(?![A-Za-z0-9-])`,
    "g",
  );

  // Replace only grammar expressions: RHS after '=' or continuation lines.
  return withoutRule
    .split(/\r?\n/)
    .map((line) => {
      const eqIndex = line.indexOf("=");

      if (eqIndex !== -1) {
        const lhs = line.slice(0, eqIndex + 1);
        const rhs = line.slice(eqIndex + 1).replace(useRuleRegex, replacement);
        return `${lhs}${rhs}`;
      }

      if (/^\s/.test(line)) {
        return line.replace(useRuleRegex, replacement);
      }

      return line;
    })
    .join("\n");
}

function processAbnfSource(source) {
  let processed = source;

  for (const ruleName of INLINE_HEX_RULES) {
    processed = inlineHexRuleAsLiteral(processed, ruleName);
  }

  return processed;
}

const args = process.argv.slice(2);
const titleIndex = args.indexOf("--title");

let title;
if (titleIndex !== -1) {
  if (titleIndex + 1 >= args.length) {
    console.error("Missing value for --title");
    process.exit(1);
  }
  title = args[titleIndex + 1];
  args.splice(titleIndex, 2);
}

const input = args[0] || DEFAULT_INPUT_ABNF;
const output = args[1] || DEFAULT_OUTPUT_HTML;
const processedAbnf = DEFAULT_PROCESSED_ABNF;

const inputPath = path.resolve(__dirname, input);
const outputPath = path.resolve(__dirname, output);
const processedPath = path.resolve(__dirname, processedAbnf);

let source;
try {
  source = fs.readFileSync(inputPath, "utf8");
} catch (error) {
  console.error(`Failed to read input ABNF: ${error.message}`);
  process.exit(1);
}

let processed;
try {
  processed = processAbnfSource(source);
} catch (error) {
  console.error(`Failed to process ABNF source: ${error.message}`);
  process.exit(1);
}

if (typeof processed !== "string") {
  console.error("Failed to process ABNF source: processAbnfSource must return a string.");
  process.exit(1);
}

try {
  fs.mkdirSync(path.dirname(processedPath), { recursive: true });
  fs.writeFileSync(processedPath, processed, "utf8");
} catch (error) {
  console.error(`Failed to write processed ABNF: ${error.message}`);
  process.exit(1);
}

const cliPath = path.join(
  __dirname,
  "node_modules",
  "railroad-diagram-generator-js",
  "bin",
  "cli.js",
);

const cliArgs = [cliPath, "generate", processedPath, outputPath];
if (title) {
  cliArgs.push("--title", title);
}

const result = spawnSync(process.execPath, cliArgs, {
  cwd: __dirname,
  stdio: "inherit",
});

if (result.error) {
  console.error(`Failed to run railroad generator: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);