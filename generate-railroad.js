#!/usr/bin/env node

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

// Customization section
const DEFAULT_INPUT_ABNF = "grammar/JSONC.abnf";
const DEFAULT_PROCESSED_ABNF = "grammar/jsonc-processed.abnf";
const DEFAULT_OUTPUT_HTML = "grammar/railroad-diagram.html";
const FORCED_HTML_HEADER = "JSONC GRAMMAR";

// Rules to inline from their %x... definitions as literal ABNF strings.
// Add more rule names here to apply the same transformation.
const INLINE_HEX_RULES = [
  "multi-line-comment-start",
  "multi-line-comment-end",
  "asterisk",
  "escape",
  "single-line-comment-start",
  "quotation-mark",
  "decimal-point",
  "minus",
  "plus",
  "zero",
];

// Inline selected rule references as quoted literals in specific target rules.
// Add more mappings here to reuse this transformation pattern.
const INLINE_LITERAL_REFS = [
  {
    targetRule: "value",
    referencedRules: ["false", "true", "null"],
  },
];

// Move selected rule definitions after another rule in the processed ABNF.
// Add more entries here to control rule ordering in generated output.
const REPOSITION_RULES_AFTER = [
  {
    ruleName: "begin-array",
    afterRule: "array",
  },
  {
    ruleName: "end-array",
    afterRule: "begin-array",
  },
  {
    ruleName: "begin-object",
    afterRule: "object",
  },
  {
    ruleName: "end-object",
    afterRule: "begin-object",
  },
  {
    ruleName: "name-separator",
    afterRule: "member",
  },
  {
    ruleName: "value-separator",
    afterRule: "value",
  },
  {
    ruleName: "digit",
    afterRule: "unescaped",
  },
  {
    ruleName: "digit1-9",
    afterRule: "digit",
  },
  {
    ruleName: "hexdigit",
    afterRule: "digit1-9",
  },
  {
    ruleName: "four-hexdigits",
    afterRule: "hexdigit",
  }
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

function getHexRuleSequence(source, ruleName) {
  const escapedRuleName = escapeRegExp(ruleName);
  const ruleRegex = new RegExp(
    `^\\s*${escapedRuleName}\\s*=\\s*(%x[0-9A-Fa-f]+(?:\\.[0-9A-Fa-f]+)*)\\b.*$`,
    "m",
  );
  const ruleMatch = source.match(ruleRegex);
  if (!ruleMatch) {
    throw new Error(`Rule ${ruleName} was not found.`);
  }

  return ruleMatch[1];
}

function getHexRuleLiteral(source, ruleName) {
  return decodeAbnfHexSequence(getHexRuleSequence(source, ruleName));
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

  // Keep hex format for characters that cannot be represented safely
  // as a single ABNF quoted string literal.
  let replacement;
  if (literalChars === "\\" || literalChars === '"') {
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

function inlineLiteralRefsInTargetRule(source, targetRule, referencedRules) {
  const escapedTargetRule = escapeRegExp(targetRule);
  const targetRuleRegex = new RegExp(`^(\\s*${escapedTargetRule}\\s*=\\s*)(.*)$`, "m");
  const match = source.match(targetRuleRegex);
  if (!match) {
    throw new Error(`Rule ${targetRule} was not found.`);
  }

  const targetRulePrefix = match[1];
  const targetRuleRhs = match[2];

  let updatedRhs = targetRuleRhs;
  for (const referencedRule of referencedRules) {
    const replacementLiteral = getHexRuleSequence(source, referencedRule);
    const referencedRuleRegex = new RegExp(
      `(?<![A-Za-z0-9-])${escapeRegExp(referencedRule)}(?![A-Za-z0-9-])`,
      "g",
    );
    updatedRhs = updatedRhs.replace(referencedRuleRegex, replacementLiteral);
  }

  return source.replace(targetRuleRegex, `${targetRulePrefix}${updatedRhs}`);
}

function removeRuleDefinitions(source, ruleNames) {
  const removalSet = new Set(ruleNames);

  return source
    .split(/\r?\n/)
    .filter((line) => {
      const match = line.match(/^\s*([A-Za-z][A-Za-z0-9-]*)\s*=/);
      if (!match) {
        return true;
      }
      return !removalSet.has(match[1]);
    })
    .join("\n");
}

function findRuleBlock(lines, ruleName) {
  const ruleStartRegex = new RegExp(`^\\s*${escapeRegExp(ruleName)}\\s*=`);
  const startIndex = lines.findIndex((line) => ruleStartRegex.test(line));
  if (startIndex === -1) {
    throw new Error(`Rule ${ruleName} was not found.`);
  }

  let endIndex = startIndex + 1;
  while (endIndex < lines.length && /^\s/.test(lines[endIndex])) {
    endIndex += 1;
  }

  return {
    startIndex,
    endIndex,
    blockLines: lines.slice(startIndex, endIndex),
  };
}

function repositionRulesAfter(source, reorderings) {
  let lines = source.split(/\r?\n/);

  for (const { ruleName, afterRule } of reorderings) {
    const ruleBlock = findRuleBlock(lines, ruleName);
    lines.splice(ruleBlock.startIndex, ruleBlock.endIndex - ruleBlock.startIndex);

    const afterRuleBlock = findRuleBlock(lines, afterRule);
    lines.splice(afterRuleBlock.endIndex, 0, ...ruleBlock.blockLines);
  }

  return lines.join("\n");
}

function processAbnfSource(source) {
  let processed = source;

  for (const ruleName of INLINE_HEX_RULES) {
    processed = inlineHexRuleAsLiteral(processed, ruleName);
  }

  for (const { targetRule, referencedRules } of INLINE_LITERAL_REFS) {
    processed = inlineLiteralRefsInTargetRule(processed, targetRule, referencedRules);
    processed = removeRuleDefinitions(processed, referencedRules);
  }

  processed = repositionRulesAfter(processed, REPOSITION_RULES_AFTER);

  return processed;
}

function postProcessGeneratedHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const updated = html.replace(/<h1>[^<]*<\/h1>/, `<h1>${FORCED_HTML_HEADER}</h1>`);

  if (updated !== html) {
    fs.writeFileSync(htmlPath, updated, "utf8");
  }
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

if (result.status !== 0) {
  process.exit(result.status === null ? 1 : result.status);
}

try {
  postProcessGeneratedHtml(outputPath);
} catch (error) {
  console.error(`Failed to post-process generated HTML: ${error.message}`);
  process.exit(1);
}

process.exit(0);