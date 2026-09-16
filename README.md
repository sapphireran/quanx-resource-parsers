# QuanX Resource Parsers

Personal Quantumult X **resource parsers**: small scripts that run on the device after Quantumult X downloads a remote resource.

This repository is not a subscription host and not a company project. The only live script today is a Nexitally full-profile → server-list extractor.

## Contents

| Path | Role |
| --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Parser Quantumult X actually executes |
| [`docs/parser-contract.md`](docs/parser-contract.md) | `$resource` / `$done` contract and ES5 rules |
| [`docs/nexitally.md`](docs/nexitally.md) | Why Nexitally ships a full profile, and what the parser keeps |
| [`docs/troubleshooting.md`](docs/troubleshooting.md) | Error strings, `opt-parser`, AnyTLS versions |
| [`docs/security.md`](docs/security.md) | What must never land in git |
| [`docs/writing-a-parser.md`](docs/writing-a-parser.md) | How to add another *personal* parser |
| [`examples/nexitally/`](examples/nexitally/) | Sanitized fixtures and expected server lists |
| [`examples/quantumult-x/`](examples/quantumult-x/) | Local profile snippets |
| [`scripts/`](scripts/) | Node harness so fixtures can be checked without the app |

## Nexitally node parser

`nexitally-node-parser.js` converts Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- supports AnyTLS, Shadowsocks, VMess, VLESS, Trojan, HTTP, and SOCKS5;
- removes duplicate lines and drops traffic / expiry / `[Premium]` placeholders (English and Chinese banners);
- contains no subscription URL, account ID, node password, or other private data.

Quantumult X downloads the Nexitally URL itself. The parser only sees `$resource.content`.

If Nexitally publishes an official **server-only** Quantumult X subscription, use that URL and remove this parser.

## Usage

Add the parser URL to the **local** `[general]` section:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

jsDelivr may cache `@main`. The raw GitHub URL is equivalent:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL only on the device. Never commit it to this repository, a public gist, or another public host.

After the stable local profile is in place, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and the rest of the local file stay as you wrote them.

Copy-paste fragments: [`examples/quantumult-x/`](examples/quantumult-x/).

## Why this exists

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-importing that file replaces the active profile. A resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

```text
full profile from Nexitally
        │
        ▼
   [server_local]  ──parser──►  node lines only
   [policy]        ──ignored──►  your local [policy] remains
   [filter_*]      ──ignored──►  your local filters remain
```

## Compatibility

Tested against Quantumult X configurations that include AnyTLS nodes. AnyTLS requires Quantumult X **1.5.6+**. Resource parsers require a build that implements `$resource` / `$done` (v1.0.8+).

The parser accepts the prefixes listed in [docs/parser-contract.md](docs/parser-contract.md). Other families (Hysteria2, WireGuard, SSR) are dropped.

## Check the examples locally

Requires Node.js 18+. No npm dependencies.

```bash
node scripts/check-examples.js
node scripts/run-parser.js examples/nexitally/typical-full-profile.conf
```

The harness injects `$resource` and `$done` the way Quantumult X does. It does not download any URL.

## Security

Fixtures use `*.example.invalid` and the placeholder `YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL`. Read [docs/security.md](docs/security.md) before adding a file or opening an issue with a sample body.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
