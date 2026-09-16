# QuanX Resource Parsers

Personal, focused resource parsers for [Quantumult X](https://github.com/crossutility/Quantumult-X).

Each parser is a small JavaScript file Quantumult X downloads through `resource_parser_url`. Quantumult X itself fetches the private resource. The scripts in this repository never contain a subscription URL, account identifier, node password, or other private data.

## Parsers

| Script | Input | Output |
| --- | --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Nexitally managed **full** Quantumult X configuration | Server lines only, for `[server_remote]` |

The Nexitally parser:

- extracts entries from `[server_local]`;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, exact duplicates, traffic / expiry rows, and `[Premium]` placeholders;
- returns `$done({error})` instead of an empty server list when the section is missing or unusable.

If Nexitally ships an official server-only Quantumult X subscription, use that resource and remove this parser layer.

## Usage

Add the parser to `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr mirror:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL only in the local configuration. Never commit it here, to a public Gist, or to another public host.

After the stable personal profile is saved, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and the other local sections stay as they are. Do not use **Configuration File → Download** again unless you intend to replace the whole profile.

A copy-paste skeleton is in [`examples/nexitally/personal-profile-snippet.conf`](examples/nexitally/personal-profile-snippet.conf).

## Docs and examples

| Path | Contents |
| --- | --- |
| [`docs/`](docs/README.md) | Parser contract, Nexitally setup, troubleshooting, privacy rules |
| [`examples/`](examples/README.md) | Synthetic fixtures and expected parser output |
| [`scripts/run-parser.js`](scripts/run-parser.js) | Local `$resource` / `$done` harness |
| [`scripts/verify-examples.js`](scripts/verify-examples.js) | Fixture checks (no network) |

```bash
node scripts/verify-examples.js
node scripts/run-parser.js nexitally-node-parser.js examples/nexitally/full-config.conf
```

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the active profile. A resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

## Compatibility

Tested with Quantumult X configurations that contain AnyTLS nodes. AnyTLS and Reality fields require a Quantumult X build that supports them (1.5.6+). Resource parsers require `resource_parser_url` and `opt-parser=true`.

## Privacy

See [docs/privacy.md](docs/privacy.md). This repository is public. Fixtures use `*.example.test` hosts and documented placeholder credentials only.
