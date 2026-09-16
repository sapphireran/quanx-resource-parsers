# QuanX Resource Parsers

Personal, single-purpose [Quantumult X](https://github.com/crossutility/Quantumult-X)
resource parsers. They turn a **managed full configuration** into a
server-only `[server_remote]` resource so a local profile can keep its
own policies and filters.

This repository is not a general Clash/Surge converter. For that, use a
general parser such as [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX).

## Parsers

| Script | Input | Output |
| --- | --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Nexitally Quantumult X full profile (`[server_local]`), or a bare Quantumult X server list | De-duplicated server lines, without traffic/expiry/`[Premium]` placeholders |

## Nexitally node parser

Nexitally distributes a complete Quantumult X configuration through
**Configuration File → Download**. Re-importing that file replaces the
active profile. This parser lets Quantumult X fetch the same URL as a
server resource and keep only the nodes.

Behavior:

- reads `[server_local]` (case-insensitive), or falls back if the body is
  already a server list;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`,
  `socks5` lines;
- drops comments, duplicates, traffic/expiry placeholders, and
  `[Premium]` stubs;
- optional URL hash filters: `in`, `out`, `regex`, `regout`.

The script contains no subscription URL, account id, or live password.
Quantumult X downloads the Nexitally URL on-device; GitHub only hosts the
parser.

## Usage

`[general]` (only one parser URL is allowed):

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

`[server_remote]` — keep the real Nexitally URL on the device:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. After the local profile is stable, refresh
**Server Resources → Nexitally**. `[policy]` and `[filter_*]` do not
change.

Optional: `#in=HK+SG` on the resource URL. See
[docs/hash-parameters.md](docs/hash-parameters.md).

Never commit the Nexitally URL to this repository, a Gist, or another
public host.

## Local examples and tests

Node 18+, no packages to install:

```bash
npm test
node tools/run-parser.js examples/nexitally-full-config.example.conf
```

The example profile is synthetic (`.example.test` hosts). See
[examples/README.md](examples/README.md).

## Documentation

- [Architecture](docs/architecture.md) — pipeline, sandbox APIs, fallback
- [Quantumult X setup](docs/quantumult-x-setup.md) — parser URL, `opt-parser`, refresh
- [Hash parameters](docs/hash-parameters.md) — `in` / `out` / `regex` / `regout`
- [Privacy](docs/privacy.md) — what must stay off GitHub
- [Local testing](docs/local-testing.md) — Node CLI and library usage
- [Troubleshooting](docs/troubleshooting.md) — empty parser, missing section, caches
- [Writing a parser](docs/writing-a-parser.md) — notes for the next script in this repo
- [Example walkthrough](docs/examples-walkthrough.md) — what the synthetic fixture keeps and drops

## Why

A full-profile subscription is convenient until you have a working
`[policy]` tree. A resource parser is the supported way to refresh nodes
without resetting that tree.

If Nexitally ships an official server-only Quantumult X subscription,
prefer that resource and delete this parser from `[general]`.

## Compatibility

Requires a Quantumult X version that supports resource parsers and, for
current Nexitally nodes, AnyTLS (1.5.6 series). The parser script uses
only `$resource` and `$done`.
