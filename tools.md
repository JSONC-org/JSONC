---
layout: default
title: JSONC
---

# Tools and Libraries

Several tools and libraries support JSONC, enabling developers to parse and generate JSONC data easily. This is a non-exhaustive list organized by programming language.

## Parsers

| Language   | Tool/Library                                      | Comments | Trailing Commas | Notes                          |
|----------- |---------------------------------------------------|----------|-----------------|--------------------------------|
| C++        | [nlohmann/json][nlohmann]                         | 🟡 [^1]  | 🟡 [^2]        |                                |
| C++        | [RapidJSON][rapidjson]                            | 🟡 [^3]  | 🟡 [^4]        |                                |
| C++        | [stephenberry/glaze][glaze]                       | 🟢 [^5]  | 🔴             |                                |
| Elixir     | [massivefermion/jsonc][massivefermion]            | 🟢       | 🟢             | Includes additional extensions |
| Go         | [HuJSON][hujson]                                  | 🟢       | 🟢             |                                |
| Go         | [tidwall/jsonc][tidwall]                          | 🟢       | 🟢             |                                |
| Java       | [Jackson][Jackson]                                | 🟡 [^6]  | 🟡 [^7]        |                                |
| JavaScript | [microsoft/node-jsonc-parser][msft]               | 🟢       | 🟡 [^8]        |                                |
| Kotlin     | [kotlinx.serialization.json][kotlinx]             | 🟡 [^9]  | 🟡 [^10]       |                                |
| PHP        | [otar/jsonc][otar]                                | 🟢       | 🟢             |                                |
| Python     | [n-takumasa/json-with-comments][n-takumasa]       | 🟢       | 🟢             |                                |
| Rust       | [dprint/jsonc-parser][dprint]                     | 🟢       | 🟢             |                                |
| Swift      | [steelbrain/JSONCKit][steelbrain]                 | 🟢       | 🟢             |                                |

Legend:

🟢: Default support <br>
🟡: Optional support <br>
🔴: Unsupported <br>

[otar]: https://github.com/otar/jsonc
[steelbrain]: https://github.com/steelbrain/JSONCKit
[hujson]: https://github.com/tailscale/hujson
[rapidjson]: https://github.com/Tencent/rapidjson
[nlohmann]: https://github.com/nlohmann/json
[glaze]: https://github.com/stephenberry/glaze
[tidwall]: https://github.com/tidwall/jsonc
[Jackson]: https://github.com/FasterXML/jackson-core
[massivefermion]: https://github.com/massivefermion/jsonc
[msft]: https://github.com/microsoft/node-jsonc-parser
[kotlinx]: https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/
[n-takumasa]: https://github.com/n-takumasa/json-with-comments
[dprint]: https://github.com/dprint/jsonc-parser

<hr>

[^1]: Use `ignore_comments`

[^2]: Use `ignore_trailing_commas`

[^3]: Use `kParseCommentsFlag`

[^4]: Use `kParseTrailingCommasFlag`

[^5]: Use `glz::read_jsonc` (or using options: `glz::opts{.comments = true}`). See [Documentation](https://github.com/stephenberry/glaze/blob/main/docs/json.md#json-with-comments-jsonc).

[^6]: Use `JsonFactory.enable(JsonReadFeature.ALLOW_JAVA_COMMENTS)`

[^7]: Use `JsonFactory.enable(JsonReadFeature.ALLOW_TRAILING_COMMA)`

[^8]: Use `allowTrailingComma: true`

[^9]: Use `allowComments`. See [Documentation](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-comments.html).

[^10]: Use `allowTrailingComma`. See [Documentation](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-trailing-comma.html).