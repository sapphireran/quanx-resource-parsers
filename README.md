# QuanX Resource Parsers

Personal Quantumult X resource parsers. This repository is **not** a workplace profile dump and it does not contain a live subscription URL.

The only production script today is `nexitally-node-parser.js`. It turns Nexitally's managed **full Quantumult X configuration** into a server-only `[server_remote]` body:

- reads `$resource.content` only (never `$resource.link`);
- extracts the first `[server_local]` section;
- keeps `anytls` / `shadowsocks` / `vmess` / `vless` / `trojan` / `http` / `socks5` lines;
- drops comments, duplicates, `[Premium]` stubs, and traffic / expiry banners (EN + ZH);
- returns one of two explicit errors when the section is missing or the sieve is empty.

## Usage

Add the parser to `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource. Keep that URL on the device.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. After importing a stable local profile, refresh **Server Resources → Nexitally**. Local `[policy]`, `[filter_remote]`, and rewrite sections stay yours.

A paste-ready fragment lives at [`examples/profile/stable-local.snippet.conf`](examples/profile/stable-local.snippet.conf).

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. This parser turns the embedded `[server_local]` section into an independently refreshable server resource.

If Nexitally later publishes an official server-only Quantumult X subscription, use that and remove this parser layer.

## Field guide and examples

| Path | What it is |
| --- | --- |
| [`fieldguide/`](fieldguide/README.md) | Source-faithful notes: contract, regex walkthrough, false friends, device setup, 中文速查 |
| [`examples/`](examples/README.md) | Sanitized fixtures with expected output (`*.example.test` hosts only) |
| `node scripts/verify.js` | Replay every catalog fixture in a Node `$resource` / `$done` sandbox |

```bash
node scripts/verify.js
node scripts/replay.js examples/fixtures/managed-full-profile/input.conf --annotate
```

The replay scripts never download a subscription. They only read files already on disk.

## Compatibility

Tested with Quantumult X configurations containing AnyTLS nodes, including Reality parameters. Requires a Quantumult X version that supports AnyTLS and resource parsers.

## Privacy

The parser source contains no subscription URL, account ID, or node password. Fixtures use placeholder secrets from this repo's field guide and from Quantumult X's public `sample.conf`. Do not commit a real panel download.
