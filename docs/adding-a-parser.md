# Adding another personal parser

Use this page when a second provider needs the same treatment as Nexitally: Quantumult X can download the resource, but the body is not a server-only snippet.

Keep the work personal. Do not copy employer configs, internal hostnames, or company filter lists into this repository.

## Decide whether a new file is needed

`resource_parser_url` is global. A second file is worth it when:

- you will switch the global URL for a while and test one provider; or
- the new transform is easier to read as its own script, and you accept flipping `resource_parser_url` when you change providers.

If two providers can share one script, branch on the **shape of `$resource.content`**, never on `$resource.link`. Link-based branching would encode private URLs in a public file.

## File layout

```
<provider>-<kind>-parser.js    # ES5-friendly script Quantumult X downloads
docs/<provider>.md             # why it exists, what it keeps, how to enable it
examples/fixtures/             # synthetic input + expected output or error
examples/README.md             # list the new fixtures
scripts/run-<provider>-parser.js
```

Match the Nexitally names unless there is a reason not to. Predictable names make the README table easy to scan.

## Script skeleton

A parser that only wants Quantumult X APIs looks like this. The same file can be loaded by the desktop runner because the runner injects `$resource` and `$done`.

```javascript
/*
 * Quantumult X resource parser for <provider> <kind>.
 *
 * Quantumult X fetches the resource. This file only transforms
 * $resource.content. It contains no subscription URL or account data.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

if (!looksLikeTheProvider(text)) {
  $done({ error: "<provider> parser: unexpected resource shape." });
} else {
  var lines = extractUsefulLines(text);
  if (!lines.length) {
    $done({ error: "<provider> parser: no usable entries were found." });
  } else {
    $done({ content: lines.join("\n") });
  }
}

function looksLikeTheProvider(text) {
  return true;
}

function extractUsefulLines(text) {
  return [];
}
```

A complete copy lives at [examples/parser-template.js](../examples/parser-template.js).

Rules:

- No `require`, `import`, `fetch`, or `$task.fetch`.
- Prefer `var` and `function` declarations.
- Always call `$done` exactly once on every path.
- Put user-facing errors in `$done({ error })`. Do not throw.
- Strip a BOM and normalize newlines before matching.
- Keep comments in the script about behavior, not about a personal account.

## Fixtures

Add at least four synthetic files:

| Fixture | Purpose |
| --- | --- |
| Happy path | A full input that produces a known server list |
| Missing section | The explicit "shape is wrong" error |
| Empty / metadata only | The explicit "nothing usable" error |
| Edge case | CRLF, duplicates, comments, or a protocol mix |

Passwords and hostnames must be documentation values. See [privacy.md](privacy.md).

If the desktop runner is a directory walker (the Nexitally runner is), name files:

```
<case>.input.conf
<case>.expected.txt            # when content is returned
<case>.expected-error.txt      # when error is returned
```

Put the exact error string in the `expected-error` file, one line, no extra spaces.

## README and docs

When a new parser is ready:

1. Add a row to the parser table in [README.md](../README.md).
2. Add a short "why / usage" section or a link to `docs/<provider>.md`.
3. Mention the local runner command.
4. Repeat the warning that private URLs stay in the Quantumult X profile.

## What not to add

- A general Clash / Surge / V2RayN converter. Those already exist. This repository is for small, provider-specific gaps.
- Default `rename`, emoji, or region filters. Those belong in a parameterized general parser, or in local Quantumult X policy regexes.
- CI that downloads a live subscription. Fixtures are static.

## Switching `resource_parser_url`

Because the slot is global, a practical personal workflow is:

1. Keep the Nexitally parser as the default URL.
2. When testing a second parser, point `resource_parser_url` at that file.
3. Leave `opt-parser=true` only on the resource that needs the transform.
4. Switch the URL back when the test is done.

Resources with `opt-parser=false` or omitted `opt-parser` are unchanged.
