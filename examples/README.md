# Examples

Sanitized Quantumult X snippets that exercise `nexitally-node-parser.js` without a live subscription.

Every hostname, password, and traffic figure is invented. Do not replace these files with a real download. See [../docs/privacy.md](../docs/privacy.md).

## Run the catalog

From the repository root, with Node.js 18+:

```bash
node examples/run-parser.js
node examples/run-parser.js --verbose
node examples/run-parser.js --list
node examples/run-parser.js --only typical-full-config --verbose
```

`--dump` prints a parse result. Combine it with `--input` for a **redacted** file that lives outside git:

```bash
node examples/run-parser.js --input /tmp/redacted-nexitally.conf --dump
```

`npm test` is an alias for the catalog run (see `package.json`).

## Catalog

| Id | Input | Expected | What it proves |
| --- | --- | --- | --- |
| `typical-full-config` | mixed full profile | 8 server lines | Happy path: AnyTLS plus other official prefixes; policy/filter noise ignored |
| `section-at-eof` | `[server_local]` last | 2 server lines | Section may run to end of file |
| `mixed-case-header` | `[SERVER_LOCAL]` | 1 server line | Header match is case-insensitive |
| `crlf-and-bom` | BOM + CRLF | 2 server lines | Windows / dashboard exports |
| `comments-and-duplicates` | comments + repeats | 2 server lines | `;` `#` `//` and exact-line dedup |
| `spaced-protocol-equals` | `anytls = host` | 1 server line | Whitespace around `=` |
| `unsupported-prefixes` | `ss=` / `shadowsocksr=` | error | Prefix allow-list |
| `placeholders-only` | Premium + 流量 | error | Exclusion keywords |
| `empty-server-local` | empty section | error | Section present but unused |
| `no-server-local` | no section | error | Wrong body type |
| `inner-spaced-header` | `[ server_local ]` | error | Header must be exact |
| `glued-header` | header without newline | error | `\n` required after the header |
| `second-section-ignored` | two `[server_local]` | 1 server line | Only the first section is read |
| `exclusion-substring` | tag contains `Traffic` | 1 server line | Exclusion is a substring, not a whole-tag match |
| `chinese-node-names` | `香港` / `日本` tags | 3 server lines | Chinese region names are not exclusion keywords |
| `indented-header` | spaces before the header | 1 server line | Leading whitespace on `[server_local]` is allowed |
| `html-login-page` | fake HTML | error | Dashboard / login bodies fail closed |
| `clash-yaml` | fake Clash YAML | error | Wrong format; this script does not convert Clash |

Details for each file: [`nexitally/README.md`](nexitally/README.md).

## Reading a fixture pair

Content successes store the exact `$done({ content })` string in a `.expected.txt` file (newline-separated server lines, trailing newline optional; the runner trims one trailing newline before compare).

Error successes store JSON:

```json
{
  "error": "Nexitally parser: [server_local] section was not found."
}
```

## Adding a fixture

1. Invent the input. No real hosts or passwords.
2. Name it `examples/nexitally/<id>.conf`.
3. Add `<id>.expected.txt` or `<id>.expected.json`.
4. Register it in `fixtures-manifest.json`.
5. Run `node examples/run-parser.js --only <id> --verbose`.
