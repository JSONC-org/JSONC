#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "index.markdown");
const content = fs.readFileSync(filePath, "utf8");

// Extract the "Tools and Libraries" section
const sectionMatch = content.match(/## Tools and Libraries([\s\S]*?)(?=\n## |\n#+ |$)/);
if (!sectionMatch) {
  console.error("Could not find the 'Tools and Libraries' section.");
  process.exit(1);
}

const section = sectionMatch[1];

// Extract language headers (lines like **Language**)
const languageRegex = /^\*\*(.+?)\*\*/gm;
const languages = [];
let match;
while ((match = languageRegex.exec(section)) !== null) {
  languages.push(match[1]);
}

if (languages.length === 0) {
  console.error("No language headers found in the 'Tools and Libraries' section.");
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
    "The 'Tools and Libraries' section must stay in alphabetical order.",
  );
  process.exit(1);
}
