# QuanX Resource Parsers

Personal Quantumult X resource parsers. Each script is a small transform Quantumult X runs after it downloads a remote resource. The scripts in this repository contain no subscription URL, account id, node password, or other private data.

This is not a general Clash / Surge / V2RayN converter. For that, use a parameterized parser such as [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX) or the [official sample parser](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js).

## Parsers

| Script | Input Quantumult X downloads | Output |
| --- | --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Nexitally managed **full configuration** | Server lines for `[server_remote]` |

## Nexitally node parser

Nexitally ships a complete Quantumult X profile through **Configuration File → Download**. Re-importing that file replaces the active profile: policies, filters, rewrites, and MITM settings disappear.

`nexitally-node-parser.js` keeps the local profile and only refreshes nodes:

- reads `[server_local]` from the downloaded body;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, exact duplicates, `[Premium]` placeholders, and traffic / expiry / package rows;
- returns only those server lines to `[server_remote]`.

The Nexitally URL stays in the Quantumult X app. The parser never reads `$resource.link`.

Longer write-up: [docs/nexitally.md](docs/nexitally.md).

## Usage

Under `[general]`:

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

`opt-parser=true` is required. Without it Quantumult X will try to import a full profile as a node list.

Keep the Nexitally URL only in the local configuration. Do not commit it to this repository, a public Gist, or another public service.

A fuller local-profile fragment, including policy regexes, is in [examples/local-profile.snippet.conf](examples/local-profile.snippet.conf).

After saving the profile, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and the rest of the local configuration stay as they are.

If Nexitally publishes an official server-only Quantumult X subscription, use that resource and remove this parser.

## Examples and local checks

Synthetic fixtures live in [examples/fixtures/](examples/fixtures/). They use `example.com`, documentation IPv4 addresses, and sample credentials from the official Quantumult X `sample.conf`.

```bash
node scripts/run-nexitally-parser.js
node scripts/run-nexitally-parser.js examples/fixtures/typical-full-config.input.conf
```

The runner injects `$resource` and `$done` so the same parser file can run on a desktop. It is not a Quantumult X substitute.

| Case | What it shows |
| --- | --- |
| `typical-full-config` | Full profile → live AnyTLS / SS / Trojan lines; metadata dropped |
| `mixed-protocols` | Every supported prefix, including mixed case |
| `comments-duplicates-meta` | Comments, exact duplicates, and status rows dropped |
| `crlf-bom` | Leading UTF-8 BOM and CRLF newlines |
| `missing-server-local` / `already-server-only` | Wrong shape fails closed |

See [examples/README.md](examples/README.md) and [examples/server-line-reference.md](examples/server-line-reference.md).

## Why a parser instead of a full-profile import

| Action | What Quantumult X replaces |
| --- | --- |
| Configuration File → Download | The entire active profile |
| `[server_remote]` + this parser | Only the Nexitally node list |

`resource_parser_url` is a single global slot. `opt-parser` is per resource. Other remote lists can stay parser-off.

## Compatibility

- Quantumult X build that supports resource parsers (`resource_parser_url`, `opt-parser`).
- AnyTLS lines need Quantumult X 1.5.6 (build 914) or later.
- Reality fields are forwarded unchanged; the app build must already understand them.

## Documentation

- [docs/resource-parsers.md](docs/resource-parsers.md) — parser runtime and APIs
- [docs/nexitally.md](docs/nexitally.md) — Nexitally setup
- [docs/privacy.md](docs/privacy.md) — what never goes in this repo
- [docs/troubleshooting.md](docs/troubleshooting.md) — refresh errors
- [docs/adding-a-parser.md](docs/adding-a-parser.md) — adding another personal parser

## Privacy

The parser file is public. The Nexitally body is not. If a file would work as a drop-in replacement for a live profile, it does not belong in git. Details: [docs/privacy.md](docs/privacy.md).
