# Writing another personal parser

This repository is a small personal collection. Add a parser only when you have a second managed full-configuration source that Quantumult X should subscribe to as servers.

If you only need more documentation or fixtures for Nexitally, add those under `docs/` and `examples/nexitally/` instead.

## Constraints Quantumult X imposes

- One `resource_parser_url` per profile. A second production parser means a second profile, or a single script that branches on `$resource.link` / `$resource.tag`.
- No `require`, no network, no persistent store.
- Stay on language features the Quantumult X engine already accepts. Follow `nexitally-node-parser.js`: `var`, regex, arrays, `$done`.
- Return server lines for a `[server_remote]` resource. Do not return a full profile.

## Suggested layout

```text
<name>-parser.js                 production script at repo root
examples/<name>/
  README.md
  manifest.json
  fixtures/...
docs/                            only if the new parser needs its own contract
```

Keep educational experiments under `examples/`, the way `generic-server-local/extract-server-local.js` does. Do not point a daily profile at a teaching script.

## Implement the script

Minimum shape:

```javascript
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

// extract and filter ...

if (!usable) {
  $done({ error: "Name parser: concise reason." });
} else {
  $done({ content: usable.join("\n") });
}
```

Error strings should name the parser. The Nexitally script prefixes `Nexitally parser:`.

Do not embed subscription URLs or account ids. If you need to distinguish sources, branch on `$resource.tag` and document the tag you expect.

## Add fixtures first

Write the input and the expected `$done` result before you rely on a phone refresh.

`examples/<name>/manifest.json`:

```json
{
  "parser": "../../<name>-parser.js",
  "cases": [
    {
      "name": "happy-path",
      "input": "fixtures/happy-path.conf",
      "expectedContent": "fixtures/happy-path.expected.txt"
    },
    {
      "name": "missing-section",
      "input": "fixtures/missing-section.conf",
      "expectedError": "Name parser: [server_local] section was not found."
    }
  ]
}
```

Rules:

- reserved example hosts and passwords only;
- at least one success case and one error case;
- register the folder so `npm test` picks it up (any `examples/*/manifest.json` is enough).

## Check on a computer, then on a phone

```bash
npm test
node scripts/run-parser.js --json <name>-parser.js examples/<name>/fixtures/happy-path.conf
```

Only after the checker is green, point a **throwaway** Quantumult X resource at a private URL and refresh. Leave the daily Nexitally resource on `nexitally-node-parser.js` until you are sure.

## Document the contract

Copy the structure of `docs/parser-contract.md`:

- input normalization
- which section is read
- keep / drop rules
- exact error strings
- a worked example that points at a fixture

Update the root `README.md` index if the new script is meant to be used in a profile.

## What not to add

- Company configs, internal hostnames, or shared team subscriptions.
- A general-purpose Clash / Surge converter. That problem is already solved by community parsers; this repo stays narrow.
- Hash-parameter UI (`#in=`, `#emoji=`) unless you also implement the Quantumult X parser-helper protocol and have a personal reason to maintain it.
