(function () {
  function jsoncLanguage(hljs) {
    const ATTRIBUTE = {
      className: "attr",
      begin: /((\"(\\.|[^\\\"\r\n])*\")|('(\\.|[^\\'\r\n])*'))(?=\s*:)/,
      relevance: 1.01,
    };

    const PUNCTUATION = {
      className: "punctuation",
      match: /[{}[\],:]/,
      relevance: 0,
    };

    const LITERALS = ["true", "false", "null"];

    const LITERALS_MODE = {
      className: "literal",
      beginKeywords: LITERALS.join(" "),
      relevance: 0,
    };

    const NUMBER_MODE = {
      className: "number",
      begin: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
      relevance: 0,
    };

    const INVALID_TOKEN_MODE = {
      className: "error",
      begin: /\S+/,
      relevance: 0,
    };

    return {
      name: "JSONC",
      aliases: ["jsonc"],
      keywords: {
        literal: LITERALS,
      },
      contains: [
        ATTRIBUTE,
        PUNCTUATION,
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
        LITERALS_MODE,
        NUMBER_MODE,
        hljs.C_LINE_COMMENT_MODE,
        hljs.C_BLOCK_COMMENT_MODE,
        INVALID_TOKEN_MODE,
      ],
      illegal: null,
    };
  }

  if (window.hljs) {
    window.hljs.registerLanguage("jsonc", jsoncLanguage);
  }
})();
