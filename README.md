# QuanX Resource Parsers

Personal Quantumult X resource parsers. The first (and currently only) script extracts connectable servers from a Nexitally **full configuration** so a locally maintained profile can refresh nodes without being overwritten.

This repository is personal. It is not company software and it must never contain a live subscription URL, account identifier, or node password.

## Contents

| Path | Role |
| --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Resource parser: `[server_local]` → server lines |
| [`docs/`](docs/README.md) | Parser API, privacy rules, compatibility, troubleshooting, local workflow |
| [`examples/`](examples/README.md) | Sanitized fixtures, expected output, sample local profile and policy groups |

```bash
node examples/run-fixtures.js
```

The fixture runner does not download anything. It replays committed sample files through the same `$resource` / `$done` contract Quantumult X uses.

## Nexitally node parser

`nexitally-node-parser.js` converts Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- supports AnyTLS, Shadowsocks, VMess, VLESS, Trojan, HTTP, and SOCKS5;
- removes duplicate lines and drops traffic / expiry / `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private data.

Quantumult X downloads the Nexitally configuration itself. The parser runs in the resource-parser sandbox and only sees `$resource.content`.

Design notes: [`docs/nexitally-parser.md`](docs/nexitally-parser.md).  
Privacy rules: [`docs/privacy.md`](docs/privacy.md).

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub equivalent:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the Nexitally URL only in your local configuration. Never commit it to this repository, a public Gist, or another public service.

After importing your stable Quantumult X profile, refresh **Server Resources → Nexitally** to update nodes. Your `[policy]`, `[filter_remote]`, and other local configuration sections remain unchanged.

A filled-out local profile shape (still using the placeholder URL) is in [`examples/local-profile.sample.conf`](examples/local-profile.sample.conf). Policy regexes that select `tag=Nexitally` are in [`examples/policy-groups.sample.conf`](examples/policy-groups.sample.conf).

Older personal notes used `pang990801/quanx-resource-parsers` (a previous GitHub username for the same project). New profiles should use `sapphireran/quanx-resource-parsers`.

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. Using a resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription in the future, prefer the official server resource and remove this parser layer.

## Compatibility

Tested against sanitized fixtures that include official Quantumult X AnyTLS sample lines. Requires a Quantumult X version that supports resource parsers (v1.0.8+) and, for AnyTLS nodes, a build that implements AnyTLS (v1.5.6+).

See [`docs/compatibility.md`](docs/compatibility.md) for the protocol allow-list and for prefixes this parser will not forward.

## Troubleshooting

If a refresh shows section headers as servers, or one of the two parser error strings, start at [`docs/troubleshooting.md`](docs/troubleshooting.md). Reproduce new shapes with a sanitized file under `examples/fixtures/` instead of pasting a live download.
