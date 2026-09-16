# Adding another personal parser

This repo is allowed to hold more than one Quantumult X resource parser as long as each file is personal, secret-free, and has fixtures.

Quantumult X still has **one** `resource_parser_url`. A second parser is a second script you point a profile at, not a second hook in the same profile. If you need both behaviors in one app, you must merge them into one file or split profiles.

## Suggested layout

```text
<vendor>-<kind>-parser.js          // QX entry, ES5, calls $done
examples/<vendor>/
  manifest.json
  <case>/input.conf
  <case>/expected.txt
docs/<vendor>-parser.md
```

Keep `scripts/lib/qx-parser-harness.js` as the only sandbox. Point `runParser({ parserFile })` at the new file from a dedicated verify script, or teach `verify-examples.js` to read more than one manifest. Do not copy the `vm` boilerplate into the parser.

## Rules that stay the same

1. **No live URLs, hosts, or passwords.** Same substitutions as [privacy.md](privacy.md).
2. **Server parsers return bare server lines.** No `[server_local]` wrapper, no policy, no filters.
3. **Errors are explicit strings** via `$done({ error })`, not thrown exceptions. A throw looks like a broken parser to Quantumult X.
4. **Stay synchronous.** Resource parsers cannot `$task.fetch`.
5. **Stay ES5-ish.** `var`, `function`, no optional chaining, no `const`/`let` if you want the widest QX JavaScriptCore range. The Nexitally file is the style template.
6. **One job per file.** Extract servers, or translate a filter list, or strip rewrite ads — not all three unless that is the whole product.

## Minimal skeleton

```javascript
/*
 * Quantumult X resource parser.
 * Contains no subscription URL, account identifier, or live node secrets.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

if (!text) {
  $done({ error: "parser: empty resource body." });
} else {
  $done({ content: text });
}
```

Replace the `else` branch with real work. Add fixtures that prove both the error path and the keep path before you point a device at the file.

## Checklist

- [ ] Filename says what vendor and what kind of resource
- [ ] Header comment repeats the "no private data" rule
- [ ] Fixtures exist and `npm test` (or the new verify entry) covers them
- [ ] Root README links the new file and the new doc
- [ ] `resource_parser_url` examples use this GitHub / jsDelivr project, optionally SHA-pinned
- [ ] Diff contains no `password=` values that look real
