# QuanX Resource Parsers

Personal Quantumult X resource parsers. The first (and currently only) parser turns a Nexitally **full** Quantumult X configuration into a server-only `[server_remote]` resource so a local profile can keep its own policies, filters, and rewrites.

This repository is public. It contains **no** subscription URL, account id, node password, or other private data.

## Contents

| Path | Role |
| --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Parser Quantumult X evaluates |
| [`docs/`](docs/README.md) | API notes, parser contract, privacy, troubleshooting |
| [`examples/`](examples/README.md) | Sanitized fixtures, expected output, local profile snippets |
| [`scripts/run-parser.js`](scripts/run-parser.js) | Node stand-in for `$resource` / `$done` |
| [`scripts/verify-examples.js`](scripts/verify-examples.js) | Fixture comparison |

## Nexitally node parser

`nexitally-node-parser.js` receives the body Quantumult X already downloaded and:

- reads only the `[server_local]` section
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines
- drops comments, blanks, exact duplicates, `[Premium]` placeholders, and traffic / expiry rows (English and Chinese keywords)
- returns those lines as the server resource, or a specific error if nothing usable remains

It does not convert Clash, Surge, or `ss://` URIs. It does not implement `#in=` / `#rename=` hash parameters.

## Usage in Quantumult X

Set the parser once under `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub fallback:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Add the **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Keep the real URL on the device. Never commit it.

After the profile is stable, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and other local sections stay as they are.

Copy-paste fragments: [`examples/snippets/`](examples/snippets/). Device walkthrough: [`examples/walkthroughs/nexitally-local-refresh.md`](examples/walkthroughs/nexitally-local-refresh.md).

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading that file replaces the whole active profile.

A resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally ships an official server-only Quantumult X subscription, use that and delete this layer.

## Local examples

Fixtures are fake. They exist so the keep / drop rules stay visible without a live export.

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sample.conf
npm run verify
```

`npm install` is not required. See [docs/local-verification.md](docs/local-verification.md) and [examples/README.md](examples/README.md).

## Privacy

Read [docs/privacy-and-safety.md](docs/privacy-and-safety.md) before filing an issue or adding a fixture. Live URLs, node credentials, and MITM material do not belong in this git remote.

## Compatibility

Tested with Quantumult X configurations that contain AnyTLS nodes. The app must support AnyTLS and resource parsers. Quantumult X 1.5.6 (build 925) is the commonly cited AnyTLS baseline; older builds will not understand `anytls=` output.

## Docs

- [Quantumult X parser API](docs/quantumult-x-resource-parsers.md)
- [Server line formats](docs/quantumult-x-server-formats.md)
- [Nexitally parser contract](docs/nexitally-node-parser.md)
- [Troubleshooting](docs/troubleshooting.md)
