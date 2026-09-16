# QuanX Resource Parsers

Personal Quantumult X resource parsers. They extract a server-only resource from a provider's **full configuration** so a local profile can keep its own `[policy]`, `[filter_remote]`, and rewrite sections.

This repository is public and holds **no subscription URL, account id, or node password**. Examples use `.example.invalid` hosts. See [docs/privacy.md](docs/privacy.md).

## Parsers

| Script | Input | Output |
| --- | --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Nexitally Quantumult X full configuration (`[server_local]` plus the rest of the profile) | Server lines for `[server_remote]` |

The Nexitally parser:

- extracts `[server_local]`;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, exact duplicates, `[Premium]` placeholders, and traffic / expiry info nodes;
- errors instead of returning an empty list when the section is missing or unusable;
- reads only `$resource.content` (never `$resource.link`).

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

GitHub raw, if you prefer not to use jsDelivr:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Keep the Nexitally URL only in the local configuration. Never commit it here, to a public Gist, or to another public service.

After importing a stable Quantumult X profile, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and other local sections stay as you wrote them.

Copy-paste fragments: [examples/quantumult-x/](examples/quantumult-x/).

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. A resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription, use that and delete this parser layer.

## Docs and examples

| Path | What it is |
| --- | --- |
| [docs/README.md](docs/README.md) | Index |
| [docs/quantumult-x-resource-parser-api.md](docs/quantumult-x-resource-parser-api.md) | `$resource` / `$done` contract |
| [docs/nexitally-node-parser.md](docs/nexitally-node-parser.md) | Extract → filter → dedupe pipeline |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Failed refresh, missing nodes, overwritten profile |
| [docs/privacy.md](docs/privacy.md) | What must never be committed |
| [examples/README.md](examples/README.md) | Fixture catalog and local-profile snippets |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to add a fixture |

Preview a fixture without Quantumult X (Node.js 18+):

```bash
npm test
node tests/run.js --dump examples/nexitally/typical-full-config.conf
```

The harness evaluates the real parser inside a `vm` sandbox. Fixtures are the source of truth for parser behavior.

## Compatibility

Tested with Quantumult X configurations that contain AnyTLS nodes. AnyTLS requires Quantumult X 1.5.6 (build 914) or later. Resource parsers require v1.0.8+.

## License

[MIT](LICENSE)
