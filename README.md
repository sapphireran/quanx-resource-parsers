# QuanX Resource Parsers

Personal Quantumult X resource parsers. Small scripts, no account data, no subscription URLs.

The only production script today is [`nexitally-node-parser.js`](nexitally-node-parser.js). It reads a Nexitally **full Quantumult X configuration** and returns the `[server_local]` nodes as a `[server_remote]` server list.

## Contents

- [Nexitally node parser](#nexitally-node-parser)
- [Usage](#usage)
- [Why](#why)
- [What the parser keeps and drops](#what-the-parser-keeps-and-drops)
- [Examples and local checks](#examples-and-local-checks)
- [Docs](#docs)
- [Privacy](#privacy)
- [Compatibility](#compatibility)

## Nexitally node parser

`nexitally-node-parser.js` runs inside Quantumult X's resource-parser slot:

- Quantumult X downloads the private Nexitally URL
- the script reads `$resource.content` on device
- it extracts `[server_local]`
- it returns only Quantumult X server lines

It supports `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5`. It drops comments, exact duplicate lines, `[Premium]` placeholders, and traffic / expiry / plan rows (English and Chinese keywords). It does not contain a subscription URL, account id, node password, or other private data.

The script never fetches the Nexitally URL itself. If that URL appears in a commit, it is a leak — see [docs/privacy.md](docs/privacy.md).

## Usage

Add the parser to `[general]`. Prefer a commit-pinned jsDelivr URL in a real profile; `@main` is shown here so the snippet stays readable.

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

GitHub raw is the same file:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a server resource. `opt-parser=true` is required or Quantumult X will try to import the whole profile as a node list.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the Nexitally URL only in the local configuration. Never commit it to this repository, a public Gist, or another public service.

After importing a stable Quantumult X profile, refresh **Server Resources → Nexitally** when nodes change. Do not re-download **Configuration File → Download** unless you intend to replace the entire profile. `[policy]`, `[filter_remote]`, and the rest of the local configuration stay as you left them.

Copy-paste fragments with placeholder URLs: [`examples/nexitally/snippets/`](examples/nexitally/snippets/).

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the active profile.

A resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource. Policy groups should select those nodes with `resource-tag-regex=^Nexitally` rather than with stale local names from an old full-profile import.

If Nexitally ships an official server-only Quantumult X subscription, use that and remove this parser.

## What the parser keeps and drops

| Input line (inside `[server_local]`) | Result |
| --- | --- |
| `anytls` / `shadowsocks` / `vmess` / `vless` / `trojan` / `http` / `socks5` | Kept |
| `;` `#` `//` comments, blank lines | Dropped |
| Exact duplicate of an earlier kept line | Dropped (first copy wins) |
| `[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐` | Dropped |
| `ssr`, `wireguard`, `hysteria2`, other prefixes | Dropped |
| `[policy]`, `[filter_local]`, every section except `[server_local]` | Ignored |

Missing `[server_local]` and a section with no usable lines each return `$done({ error })` with a fixed message. The messages and the keep/drop rules are encoded as fixtures under [`examples/nexitally/`](examples/README.md).

## Examples and local checks

The `examples/` tree is fictional: `example.com` hosts, `placeholder` passwords, documentation UUIDs.

```bash
npm test
node scripts/run-parser.js examples/nexitally/happy-path/input.conf
```

That Node harness is the stand-in for Quantumult X. There is no web UI to click. See [docs/local-testing.md](docs/local-testing.md).

## Docs

- [docs/README.md](docs/README.md) — index
- [docs/resource-parsers.md](docs/resource-parsers.md) — Quantumult X parser API
- [docs/nexitally-parser.md](docs/nexitally-parser.md) — this script in detail
- [docs/privacy.md](docs/privacy.md) — what never goes in git
- [docs/troubleshooting.md](docs/troubleshooting.md) — empty lists, wrong refresh target
- [docs/adding-a-parser.md](docs/adding-a-parser.md) — adding a second personal parser

## Privacy

Public files in this repository must stay free of live subscription URLs, account identifiers, and real node secrets. The parser is published on purpose. The Nexitally download URL is not.

## Compatibility

Tested against Quantumult X configurations that embed AnyTLS nodes in `[server_local]`. Requires a Quantumult X build that supports resource parsers and, for AnyTLS lines, AnyTLS itself.

Node 18+ is enough to run the examples. No npm packages are installed.
