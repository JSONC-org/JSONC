# JSONC Grammar directory

This directory contains the ABNF grammar for JSONC, along with plans for generating railroad diagrams from it.

## Railroad Diagram Generation Plan

Generate railroad diagrams from `grammar/jsonc.abnf` using a simple one-file Node.js script.

Instead of building a custom ABNF parser and converter to Tab Atkins constructor calls, use:

- https://github.com/xtofs/railroad-diagram-generator.js

This tool parses ABNF directly and generates static HTML with embedded SVG diagrams.

### Script behavior

The wrapper script should:

1. Accept input ABNF path and optional output HTML path.
2. Default to:
   - input: `grammar/jsonc.abnf`
   - output: `grammar/railroad-diagram.html`
3. Optionally accept `--title` to set the HTML title.
4. Execute the upstream CLI from our installed dependency.
5. Exit non-zero on error and print useful diagnostics.

### Command examples

Initialize submodule(s):

```bash
git submodule update --init --recursive
```

Install dependencies:

```bash
npm install
```

The dependency is sourced from disk via:

```json
"railroad-diagram-generator-js": "file:./submodules/railroad-diagram-generator-js"
```

Generate with defaults:

```bash
npm run railroad
```

Generate from a specific input and output:

```bash
npm run railroad -- grammar/jsonc.abnf grammar/railroad-diagram.html
```

Generate with a custom title:

```bash
npm run railroad -- grammar/jsonc.abnf grammar/railroad-diagram.html --title "JSONC Grammar"
```

### Notes on EOF for single-line comments

The grammar already allows inline comments to terminate at end-of-file because the line terminator is optional:

```abnf
single-line-comment = "//" *single-line-comment-char [ comment-terminator ]
```

So diagrams generated from this ABNF should not imply a mandatory line ending.