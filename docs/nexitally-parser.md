# Nexitally node parser

`nexitally-node-parser.js` is a Quantumult X **resource parser**. Quantumult X downloads the Nexitally full configuration, then runs this script against the body. The script never fetches the subscription itself and never embeds a URL.

The walkthrough below matches the file as committed. Pair it with [`examples/fixtures/nexitally-full-config.sanitized.conf`](../examples/fixtures/nexitally-full-config.sanitized.conf).

## Input

Quantumult X sets `$resource.content` to the UTF-8 body of the resource. The parser:

1. Coerces the value to a string (`null` / missing becomes `""`).
2. Strips a leading UTF-8 BOM (`\uFEFF`). Some dashboards and Windows editors prepend one.
3. Normalizes `\r\n` to `\n` so the section regex can use `\n` anchors.

`$resource.link` is ignored on purpose. Using the URL inside the parser would encourage copying a private Configuration File link into a script.

## Section extraction

```js
text.match(/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i)
```

That expression:

| Piece | Meaning |
| --- | --- |
| `(?:^|\n)\s*\[server_local\]\s*\n` | Section header, optional indent, case-insensitive. |
| `([\s\S]*?)` | Non-greedy body. |
| `(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)` | Stop at the next INI section (`[filter_local]`, `[policy]`, …) or EOF. |

If the header is missing, the parser exits with:

```text
Nexitally parser: [server_local] section was not found.
```

See [`examples/fixtures/missing-server-local.conf`](../examples/fixtures/missing-server-local.conf).

The next-section lookahead is what stops filter / rewrite / MITM lines from leaking into the server resource. The sanitized full-config fixture includes those sections so a regression is obvious.

## Line filter

Each line of `[server_local]` is trimmed. A line is kept only when **all** of the following hold:

1. Non-empty after trim.
2. Not a comment. Quantumult X comments start with `;`, `#`, or `//`.
3. Matches a supported server prefix:

   ```text
   anytls | shadowsocks | vmess | vless | trojan | http | socks5
   ```

   Optional spaces around `=` are allowed. The prefix is case-insensitive (`ANYTLS =` is kept).

4. Does **not** match the exclusion regex:

   ```text
   [Premium] | Traffic | Expire | Reset | Days Left | 流量 | 到期 | 剩余 | 套餐
   ```

   Providers commonly encode quota and expiry as fake nodes or as those words in `tag=`. Locked inventory is often tagged `[Premium]`.

5. Has not been seen before. Dedup is exact-line, first copy wins.

Unsupported families (`wireguard`, `hysteria2`, a bare `ss =` alias) are dropped. They are not errors. See [`examples/fixtures/unsupported-lines.conf`](../examples/fixtures/unsupported-lines.conf).

## Output

If at least one line remains:

```js
$done({ content: servers.join("\n") })
```

Quantumult X treats that string as the `[server_remote]` body: one server per line, no section header.

If the section existed but nothing survived (comments only, or only traffic / `[Premium]` placeholders):

```text
Nexitally parser: no usable server entries were found.
```

Those two error strings are stable. The Node tests assert them.

## What the parser does not do

- It does not rename nodes, add emoji, or sort by region.
- It does not rewrite `udp-relay`, `fast-open`, or TLS flags.
- It does not read `$resource.info` / `subscription-userinfo`. Traffic numbers that arrived as **nodes** are stripped; a proper header is left for Quantumult X.
- It does not retry with a different User-Agent. Nexitally's Configuration File URL is already a Quantumult X document, not an anti-bot HTML challenge.
- It does not implement KOP-XIAO hash parameters (`#in=香港&emoji=1`). Those belong to a general-purpose parser. This script is intentionally small.

If you need rename / filter parameters, run a second, general parser on a **server-only** resource, or fork this file in a private gist. Do not grow this script into a second resource-parser.js.

## Worked example

Input (abridged from the sanitized fixture):

```ini
[server_local]
# Traffic: 128.50 GB / 500.00 GB
anytls = info.nodes.example.com:1, password=0, over-tls=true, tag=Traffic: 128.50 GB / 500.00 GB
anytls = hk-01.nodes.example.com:443, password=example-password-not-real, over-tls=true, tls-host=hk-01.nodes.example.com, udp-relay=true, tag=HK-01
anytls = hk-01.nodes.example.com:443, password=example-password-not-real, over-tls=true, tls-host=hk-01.nodes.example.com, udp-relay=true, tag=HK-01
anytls = premium.nodes.example.com:443, password=example-password-not-real, over-tls=true, tag=JP-02 [Premium]

[filter_local]
final, Final
```

Output:

```text
anytls = hk-01.nodes.example.com:443, password=example-password-not-real, over-tls=true, tls-host=hk-01.nodes.example.com, udp-relay=true, tag=HK-01
```

The traffic node, the duplicate, the `[Premium]` placeholder, and `[filter_local]` are gone.

## Running it outside Quantumult X

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sanitized.conf
```

The helper injects `$resource` and `$done`, then prints JSON. That is the same sandbox `npm test` uses.
