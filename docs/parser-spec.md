# Nexitally node parser specification

This is the contract `nexitally-node-parser.js` implements today. The personal lab catalog ([`lab/fixtures/catalog.json`](../lab/fixtures/catalog.json)) is the executable version of this page.

Runtime keep/drop logic is not supposed to change in a docs-only pull request. If a fixture and this page disagree, fix the page.

## Inputs

| Field | Used? | Notes |
| --- | --- | --- |
| `$resource.content` | yes | Full Quantumult X configuration text, UTF-8 |
| `$resource.link` | no | Private URL; must stay on-device |
| `$resource.tag` | no | Resource tag is assigned by the profile (`tag=Nexitally`) |
| `$resource.info` | no | `subscription-userinfo` header, if any |
| `$resource.user_agent` | no | Retry path is unused |

Empty or missing content is treated as an empty string.

## Normalization

1. If the first character is U+FEFF, strip it.
2. Replace `\r\n` with `\n`. Lone `\r` is not rewritten; Windows exports that use CRLF are covered.

## Section extract

Regular expression (case-insensitive):

```text
(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)
```

Implications:

- The header must be followed by a newline. `[server_local]` as the entire file is a miss → error *section was not found*.
- Leading whitespace before the header is allowed (`  [SERVER_LOCAL]`).
- The first matching header wins. A later `[server_local]` is ignored.
- The next line that looks like `[something]` ends the capture. `[Premium]`, `[filter_local]`, `[policy]`, and `[server_remote]` all terminate the extract.
- Capture does not include the terminating header.

If the regex fails: `$done({ error: "Nexitally parser: [server_local] section was not found." })`.

## Line filter

For each captured line, in order:

1. Trim surrounding whitespace (spaces and tabs).
2. Drop the line if it is empty.
3. Drop the line if it starts with `;`, `#`, or `//` (Quantumult X comment prefixes from `sample.conf`).
4. Drop the line unless it matches `^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=` (case-insensitive). Spaces before `=` are allowed.
5. Drop the line if it matches `(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)` (case-insensitive substring).
6. Drop the line if the trimmed text was already kept (exact duplicate).

Unsupported prefixes seen in the lab: `hysteria2`, `tuic`, `wireguard`, `ssh`, `static`, `available`.

## Outputs

| Situation | `$done` payload |
| --- | --- |
| At least one kept line | `{ content: lines.join("\n") }` — no trailing newline |
| Section found, zero kept lines | `{ error: "Nexitally parser: no usable server entries were found." }` |
| Section missing | `{ error: "Nexitally parser: [server_local] section was not found." }` |

The script does not return `retry`, does not call `$notify`, and does not perform HTTP.

## Worked example

Input (abridged from [`nexitally-style-full.conf`](../lab/fixtures/nexitally-style-full.conf)):

```ini
[server_local]
anytls=hk-iplc-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=香港 IPLC 01
anytls=info.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=剩余流量 128 GB
anytls=hk-iplc-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=香港 IPLC 01
anytls=premium.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Node [Premium]

[Premium]
anytls=after-premium.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Should Not Extract
```

| Line | Decision | Reason |
| --- | --- | --- |
| 香港 IPLC 01 | keep | supported AnyTLS |
| 剩余流量 128 GB | drop | `剩余` and `流量` |
| second 香港 IPLC 01 | drop | duplicate |
| Node `[Premium]` | drop | `[Premium]` substring |
| Should Not Extract | unseen | `[Premium]` header ended the section |

Replay:

```bash
node lab/run.js --explain lab/fixtures/nexitally-style-full.conf
```
