# Nexitally node parser

`nexitally-node-parser.js` is for one situation: Nexitally's **Configuration File → Download** product is a complete Quantumult X profile. Importing that file again replaces `[policy]`, `[filter_*]`, `[rewrite_*]`, and `[mitm]`.

The same download URL can be attached as a `[server_remote]` resource. Quantumult X fetches the full file, this parser extracts `[server_local]`, and only server lines land in the node list.

## Pipeline

1. Coerce `$resource.content` to a string.
2. Strip a leading UTF-8 BOM.
3. Normalize `\r\n` to `\n`.
4. Capture the first `[server_local]` section with:

   ```text
   (?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)
   ```

5. Split that capture on newlines, trim each line, then keep a line only when all of the following hold:
   - it is not empty;
   - it is not a comment (`#`, `;`, or `//`);
   - it matches a supported prefix;
   - it does not match the exclusion regex;
   - it has not already been seen (exact trimmed line).
6. `$done({content})` with the kept lines joined by `\n`, or `$done({error})`.

The section regex is case-insensitive, so `[SERVER_LOCAL]` works. It requires a newline after the header, so a glued `[server_local]anytls=...` line is treated as a missing section.

The next INI-style `[section]` ends the capture. Filter or remote lines after `[server_local]` cannot leak into the node list.

## Supported prefixes

```javascript
/^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i
```

Spaces around `=` are allowed. Clash-style `ss = ...` is not. Hysteria2, TUIC, and WireGuard lines are dropped even if a managed file included them.

## Exclusions

```javascript
/(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i
```

Nexitally-style managed files often put quota rows in `[server_local]`. Some of those rows are comments; some are fake server lines whose `tag=` contains traffic or plan text. Both are dropped.

`[Premium]` placeholders are dropped even when the rest of the line is a well-formed `anytls=` entry.

The same keywords also drop a real node if they appear anywhere on the line, including the tag. That is intentional: it is safer to omit one node than to import a quota row as a proxy. The `exclusion-in-tag` fixture encodes that trade-off.

## Duplicates

Dedup is exact-line after trim. Two nodes that differ only by `tag=` are both kept. The same line with accidental leading spaces is kept once.

## Errors

| Message | When |
| --- | --- |
| `Nexitally parser: [server_local] section was not found.` | No matching section header, empty body, or header without a following newline |
| `Nexitally parser: no usable server entries were found.` | The section exists, but every line was a comment, unsupported prefix, exclusion, or duplicate of a dropped line |

Quantumult X shows `$done({error})` on the resource. The local harness prints the same string on stderr.

## What the parser never contains

The script has no Nexitally host, account id, token, or node password. Those values arrive only in `$resource.content` on the device. See [privacy.md](privacy.md).

## Compatibility

AnyTLS lines need a Quantumult X build that already understands `anytls=`. Resource parsers themselves need a build that implements `$resource` / `$done` (officially documented from v1.0.8-build253, with later fields on v1.0.10+ / v1.5.6+).

If Nexitally later publishes a server-only Quantumult X subscription, prefer that resource and delete this parser from `[general]` if nothing else uses it.
