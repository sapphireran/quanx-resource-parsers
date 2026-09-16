# Writing another personal parser

This repository is a place for **small, personal** Quantumult X resource parsers. A new parser should solve one extract-or-filter problem and ship with synthetic examples. It should not contain a subscription URL, account id, or real node line.

## Decide whether you need a new file

`resource_parser_url` is global. Every `[server_remote]` line with `opt-parser=true` runs the same script.

Add a second parser file when:

- the input shape is different (another provider's full config, a Clash YAML dump, a server list with a different info-line dialect); and
- you are willing to either switch the global URL when you refresh that resource, or write a dispatcher that branches on `$resource.tag`.

Do **not** add a second parser just to rename nodes. Do that with `[policy]` regexes or a general-purpose parser.

## File layout

```text
<name>-parser.js                 # Quantumult X script, no Node APIs
docs/<name>.md                   # why it exists, setup, failure strings
examples/<name>/
  README.md                      # what each fixture proves
  input-....conf                 # synthetic input
  expected-....txt               # exact $done({content}) body
scripts/verify-examples.js       # register the new fixtures
```

Keep the Quantumult X script self-contained. The official parser environment does not provide `require`, `fs`, or `$task.fetch`.

## Script skeleton

Copy this shape. It matches the [official sample](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) and the Nexitally parser:

```javascript
/*
 * Quantumult X resource parser.
 *
 * Receives a body Quantumult X already downloaded. Returns only the
 * lines that belong in [server_remote]. Contains no private URLs.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

var match = text.match(
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
);

if (!match) {
  $done({ error: "parser: [server_local] section was not found." });
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
    $done({ error: "parser: no usable server entries were found." });
  } else {
    $done({ content: servers.join("\n") });
  }
}
```

Rules that keep the script safe to publish:

- Read `$resource.content`. Do not print `$resource.link`.
- Normalize BOM and CRLF first. Provider files often arrive with both.
- Fail with `$done({error})` instead of returning an empty string. An empty success is easy to mistake for "the provider has zero nodes."
- Prefer exact-line dedupe. Fuzzy dedupe by `tag=` will drop two real nodes that share a name.
- Keep the exclude list in one regex so the docs and the examples can quote it.

## Dispatcher pattern (optional)

If one profile must parse two differently shaped resources, branch on the tag you assigned locally:

```javascript
var tag = String($resource.tag || "");
var text = String($resource.content || "");

if (/^Nexitally$/i.test(tag)) {
  // extract [server_local] as in nexitally-node-parser.js
} else if (/^Other$/i.test(tag)) {
  // different extract
} else {
  $done({ error: "parser: unsupported resource tag " + tag });
}
```

The tag is chosen by you in `[server_remote]`. It is not a secret, but it is also not a substitute for hiding the URL.

## Synthetic fixtures, not live captures

A fixture is useful when it freezes **structure**:

- section order of a managed full config;
- comment prefixes the provider uses;
- info-line wording the exclude regex must catch;
- CRLF / BOM / duplicate / end-of-file edge cases.

Replace every hostname with `*.example.test` or the official `example.com` samples. Replace passwords with `example-password` or the placeholder values from [sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf).

Register the fixture in `scripts/verify-examples.js` so `node scripts/verify-examples.js` fails if the extract rules drift.

## Checklist before you commit

- [ ] The new `.js` file has no URL, token, email, or real node line.
- [ ] Docs describe the input shape and the two error strings.
- [ ] At least one happy-path fixture and one error fixture exist.
- [ ] `node scripts/verify-examples.js` passes.
- [ ] README links the new doc from the parser list.
- [ ] You did not add company dashboards, internal hosts, or work profiles.

## What not to add

- Generic Clash / Surge / V2RayN converters. Those already exist as well-known public parsers; this repo stays small.
- Rewrite or filter parsers, unless they are personal and similarly tiny.
- Hash-parameter UIs (`$parser.hashSchema`) unless you also document every control. The Nexitally parser deliberately has none.
