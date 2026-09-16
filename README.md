# QuanX Resource Parsers

Personal Quantumult X resource parsers. Small scripts that Quantumult X runs
on a downloaded resource so a **managed full configuration** can be used as a
refreshable server list.

This repository is not affiliated with Nexitally or with Quantumult X.

## Contents

| Path | Role |
| --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Parser: `[server_local]` → server lines |
| [`docs/`](docs/README.md) | Runtime contract, keep/drop rules, workflow, privacy, troubleshooting |
| [`examples/nexitally/`](examples/nexitally/README.md) | Synthetic full configs + expected output |
| [`examples/quantumult-x/`](examples/quantumult-x/README.md) | Snippets to paste into a local profile |
| [`test/`](docs/local-testing.md) | Node harness and golden-file tests |

## Nexitally node parser

`nexitally-node-parser.js` converts Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- supports AnyTLS and other common Quantumult X server formats (`shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`);
- removes duplicate entries and excludes traffic/expiry information plus `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private data.

The Nexitally subscription is downloaded directly by Quantumult X. The parser runs in Quantumult X's resource-parser environment (`$resource` / `$done`). Details: [Resource-parser runtime](docs/resource-parser-runtime.md).

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub, if you prefer not to use jsDelivr:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the Nexitally URL only in your local configuration. Never commit it to this repository, a public Gist, or another public service.

A policy group can select every node from that resource without listing tags by hand:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally
static = Final, Nexitally, direct
```

Ready-to-paste copies live in [`examples/quantumult-x/`](examples/quantumult-x/). End-to-end steps: [Nexitally workflow](docs/nexitally-workflow.md).

After importing your stable Quantumult X profile, refresh **Server Resources → Nexitally** to update nodes. Your `[policy]`, `[filter_remote]`, and other local configuration sections remain unchanged.

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. Using a resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription in the future, prefer the official server resource and remove this parser layer.

## Examples and tests

Synthetic input that looks like a managed full configuration (quota rows, `[Premium]` rows, comments, duplicates, mixed protocols) is in [`examples/nexitally/`](examples/nexitally/). Those files use `example.com` hosts and dummy passwords only.

```bash
node test/harness.js examples/nexitally/full-config.sample.conf
npm test
```

See [Local testing](docs/local-testing.md), [Keep vs drop](docs/parser-keep-drop.md), and [Privacy and safety](docs/privacy-and-safety.md).

## Compatibility

Tested with Quantumult X configurations containing AnyTLS nodes. Requires a Quantumult X version that supports AnyTLS (1.5.6+) and resource parsers.

## License

[MIT](LICENSE)
