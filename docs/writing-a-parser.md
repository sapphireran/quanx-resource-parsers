# Writing another parser in this repository

Use this when a second provider also ships a **full Quantumult X configuration** and you want a server-only remote resource. Do not start from a general Clash/V2Ray converter; that problem is already solved elsewhere.

## Checklist

1. Confirm the download is Quantumult X INI with a `[server_local]` (or equivalent) section.
2. Confirm there is no official server-only Quantumult X subscription. If there is, do not add a parser.
3. Copy the Nexitally script rather than a Node module. Quantumult X has no `require`.
4. Keep the script free of URLs, tokens, and default hosts.
5. Add sanitized fixtures under `examples/<provider>/` and a manifest entry.
6. Document exclusion keywords. Broad regexes surprise people.
7. Stay on ES5-ish JavaScript. The local runner is Node, the real runtime is Quantumult X.

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
  $done({ error: "<Provider> parser: [server_local] section was not found." });
} else {
  var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
  var excluded = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
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
    $done({ error: "<Provider> parser: no usable server entries were found." });
  } else {
    $done({ content: servers.join("\n") });
  }
}
```

Change only what the provider actually requires:

- section name, if they use something other than `[server_local]`
- supported prefixes, if they add a documented Quantumult X protocol
- exclusion keywords, if their info lines use different words
- error string prefix, so Quantumult X’s UI names the script

## Testing without the app

```bash
node examples/run-parser.js --parser nexitally-node-parser.js --only typical-full-config --verbose
```

`--parser` accepts a path relative to the repository root. Add fixtures before relying on a live refresh.

When adding a fixture:

1. Invent every hostname and password.
2. Cover the failure you care about (`no-server-local`, empty section, CRLF, duplicates).
3. Put the expected `$done` payload in a sibling `.expected.txt` or `.expected.json`.
4. Register it in `examples/fixtures-manifest.json`.

## Things that do not belong in a parser here

- Hash-parameter UIs (`#in=香港&emoji=1`). Use a general converter for that.
- HTTP fetches. Resource parsers cannot do them, and they would also require embedding secrets.
- Rewrite or filter conversion. Out of scope for this repository.
- Company-internal configuration. This tree is personal-only.

## Review questions

Before merging a new script:

- Can someone read the file and be sure no private URL is present?
- Does every keep/drop rule have a fixture?
- Are error strings stable (Quantumult X users search for them)?
- Is the README table updated?
