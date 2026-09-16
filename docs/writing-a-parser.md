# Writing another personal parser

Use this page when adding a second *personal* Quantumult X parser to this repository. Do not import company or employer scripts.

## When a new parser is justified

Add a new file only if the input format is actually different:

| Situation | Action |
| --- | --- |
| Same Nexitally full profile, new banner wording | Extend the exclude regex and add a sanitized fixture |
| Same Nexitally profile, new official prefix Quantumult X already speaks | Add the prefix to `supported` and a mixed-protocol fixture |
| A different provider that also ships a full Quantumult X conf | New `*-node-parser.js` plus its own `examples/<name>/` tree |
| Clash / Surge / base64 v2ray | Out of scope unless you are willing to own that converter |

One `resource_parser_url` is active at a time in Quantumult X. A second parser means a second profile, or swapping the URL when you refresh that provider.

## File layout

```text
<provider>-node-parser.js          # ES5, $resource / $done only
examples/<provider>/
  README.md
  manifest.json
  *.conf                           # sanitized inputs
  *.expected.txt                   # server lines only
docs/<provider>.md                 # workflow, not marketing
```

Register the new manifest in `scripts/check-examples.js` if you add a second suite, or generalize the checker to walk `examples/*/manifest.json`.

## Required behavior

Copy the contract in [parser-contract.md](parser-contract.md):

1. Read `$resource.content`. Do not read `$resource.link`.
2. Call `$done` once.
3. Return Quantumult X server lines, not a full profile.
4. Error when the expected section is missing or empty.
5. Strip BOM and `\r\n`.
6. Keep the script free of URLs, tokens, and default hosts that belong to an account.

## Suggested skeleton

```javascript
/*
 * Quantumult X resource parser for <provider> managed full configurations.
 * Contains no subscription URL, account identifier, or node password.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

var match = text.match(
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
);

if (!match) {
  $done({ error: "<provider> parser: [server_local] section was not found." });
} else {
  var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
  var excluded = /(?:\[Premium\]|Traffic|Expire)/i;
  var seen = {};
  var servers = match[1]
    .split("\n")
    .map(function (line) { return line.trim(); })
    .filter(function (line) {
      if (!line || /^(?:;|#|\/\/)/.test(line)) return false;
      if (!supported.test(line) || excluded.test(line)) return false;
      if (seen[line]) return false;
      seen[line] = true;
      return true;
    });

  if (!servers.length) {
    $done({ error: "<provider> parser: no usable server entries were found." });
  } else {
    $done({ content: servers.join("\n") });
  }
}
```

Adapt `supported` and `excluded` only with a fixture that proves the change.

## Local loop

```bash
node scripts/run-parser.js examples/<provider>/typical-full-profile.conf --parser <provider>-node-parser.js
node scripts/check-examples.js
```

Commit the parser, the fixtures, and the expected files in the same change when the golden output is part of the behavior.

## What not to add

- A copy of KOP-XIAO's generic multi-format parser. That project is a different codebase with its own license and update cadence.
- Employer-internal endpoints, test accounts, or staging subscription URLs.
- `eval` of `$resource.content`, dynamic `Function` constructors, or any fetch back to a personal server.
- Default `resource_parser_url` values that are not this GitHub repository.

## Naming

- Parser file: lowercase, hyphenated, end with `-parser.js`.
- Resource `tag=` in snippets: the provider name, ASCII, no spaces.
- Error prefix: `"<Provider> parser: ..."` so Quantumult X's failure toast is searchable.
