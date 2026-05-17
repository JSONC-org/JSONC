#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "tools.md");
const content = fs.readFileSync(filePath, "utf8");

// Extract rows from the "Parsers" markdown table.
const parserSectionMatch = content.match(/##\s+Parsers([\s\S]*?)(?=\n##\s+|\n#+\s+|\n<hr>|$)/);
if (!parserSectionMatch) {
  console.error("Could not find the 'Parsers' section in tools.md.");
  process.exit(1);
}

const section = parserSectionMatch[1];

// Extract language names from the first column of each table row.
const languageRegex = /^\|\s*([^|]+?)\s*\|/gm;
const languages = [];
let match;
while ((match = languageRegex.exec(section)) !== null) {
  const language = match[1].trim();
  if (!language || language.toLowerCase() === "language") {
    continue;
  }
  // Skip markdown separator rows.
  if (/^[:\-\s]+$/.test(language)) {
    continue;
  }

  languages.push(language);
}

if (languages.length === 0) {
  console.error("No language rows found in the 'Parsers' table in tools.md.");
  process.exit(1);
}

console.log("Languages found:");
languages.forEach((lang, i) => console.log(`  ${i + 1}. ${lang}`));
console.log();

// Check alphabetical order (case-insensitive)
let inOrder = true;
for (let i = 1; i < languages.length; i++) {
  const prev = languages[i - 1].toLowerCase();
  const curr = languages[i].toLowerCase();
  if (curr < prev) {
    console.error(
      `Ordering error: "${languages[i]}" should appear before "${languages[i - 1]}".`,
    );
    inOrder = false;
  }
}

if (inOrder) {
  console.log("All languages are listed in alphabetical order.");
} else {
  console.error();
  console.error(
    "The language column in tools.md (Parsers table) must stay in alphabetical order.",
  );
  process.exit(1);
}
