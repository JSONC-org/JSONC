---

layout: default
---

**Notice:** This is a draft of the JSONC Specification and is subject to change.

## Introduction

JSONC (JSON with Comments) is an extension of JSON (JavaScript Object Notation) that allows comments within JSON data. This specification defines the syntax and semantics of JSONC.

The JSONC format was informally introduced by Microsoft to be used for VS Code's configuration files (`settings.json`, `launch.json`, `tasks.json`, etc). Alongside the informal format, a publicly-available parser ([`jsonc-parser`]) was supplied to parse those configuration files. The goal of this specification is to formalize the JSONC format as what [`jsonc-parser`] considers valid while using its default configurations.

[`jsonc-parser`]: https://www.npmjs.com/package/jsonc-parser

## Conventions and Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](#rfc2119)

The following terms are used throughout this specification:

- **Mode line**: A special comment at the beginning of a file that specifies the file type or mode, following conventions used by text editors like Emacs or Vim.
- **Parser**: A software component that reads and interprets JSONC documents.
- **Trailing comma**: A comma that appears after the last element in an array or the last property in an object, before the closing bracket or brace.

## Syntax

JSONC follows the same syntax rules as JSON with the addition of JavaScript style comments. Comments can be either single-line or multi-line.

### Single-line Comments

Single-line comments start with `//` and extend to the end of the line.

```jsonc
{
    // This is a single-line comment
    "name": "John Doe",
    "age": 30
}
```

### Multi-line Comments

Multi-line comments start with `/*` and end with `*/`. They can span multiple lines.

```jsonc
{
    /*
      This is a multi-line comment
      that spans multiple lines
    */
    "name": "Jane Doe",
    "age": 25
}
```

## Trailing commas

JSONC parsers MAY support trailing commas. For more information regarding trailing commas, refer to [Appendix A](#appendix-a-trailing-commas-and-jsonc).

## Semantics

Comments in JSONC are ignored during parsing, allowing developers to annotate their JSON data without affecting its structure or content.

## File extensions

The recommended file extension for JSONC documents is `.jsonc`.

The extension `.json` SHOULD be avoided, but if it's used, there SHOULD be a mode line present at the start of the file to indicate that it's actually a JSONC file:

For instance:
```jsonc
// -*- mode: jsonc -*-
```
or
```jsonc
// -*- jsonc -*-
```

## Main Use Cases

- Configuration Files: JSONC is useful for configuration files where comments can provide explanations or instructions.
- Data Annotation: JSONC allows developers to annotate JSON data with comments for better understanding and maintenance.

## Tools and Libraries
Several tools and libraries support JSONC, enabling developers to parse and generate JSONC data easily.

Here is a non-exhaustive list:

**JavaScript/TypeScript**:
- [microsoft/node-jsonc-parser](https://github.com/microsoft/node-jsonc-parser)

**C++**
- [stephenberry/glaze](https://github.com/stephenberry/glaze)

**Elixir**
- [massivefermion/jsonc](https://github.com/massivefermion/jsonc)

**Go**
- [tidwall/jsonc](https://github.com/tidwall/jsonc)

**Python**
- [n-takumasa/json-with-comments](https://github.com/n-takumasa/json-with-comments)

**PHP**
- [otar/jsonc](https://github.com/otar/jsonc)

**Rust**
- [dprint/jsonc-parser](https://github.com/dprint/jsonc-parser)

**Java**
- [Jackson](https://github.com/FasterXML/jackson-core) `JsonFactory.enable(JsonReadFeature.ALLOW_JAVA_COMMENTS)` 

**Kotlin**
- [kotlinx.serialization.json](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-comments.html)


## APPENDIX A: Trailing Commas and JSONC

### Why Trailing Commas Are Not a Requirement?

Trailing commas are not a requirement because the reference implementation, [jsonc-parser](https://www.npmjs.com/package/jsonc-parser), does not allow them unless explicitly configured. The `allowTrailingComma` option is set to `false` by default, so any trailing comma will result in a parsing error.

Mandatory trailing commas support might be added to future versions of the jsonc.org Specification when trailing commas reaches sufficient adoption in the Javascript ecosystem.

### Trailing Commas in VS Code

The "JSON with Comments" mode in VS Code used to allow trailing commas without any warnings by default, but this was eventually changed ([source](https://github.com/microsoft/vscode/issues/102061)).

At the time of writing this document, the "JSON with Comments" mode still accepts trailing commas, but it discourages their usage by displaying a warning ([source](https://code.visualstudio.com/docs/languages/json#_json-with-comments)) unless the file is one of the VS Code official configuration files. The exclusion of those configuration files comes from the JSON schema used. The schema for these files explicitly allow trailing commas, which is why they are accepted without warnings in that specific context.

## References

### [RFC2119]

Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, DOI 10.17487/RFC2119, March 1997, <https://www.rfc-editor.org/info/rfc2119>.
