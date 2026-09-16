# QuanX Resource Parsers

Personal Quantumult X resource parsers. The first parser turns Nexitally's managed **full configuration** into a server-only `[server_remote]` resource so a stable local profile can keep its own `[policy]`, filters, and rewrites.

This repository does not ship subscription URLs, account ids, or node passwords.

## Nexitally node parser

[`nexitally-node-parser.js`](nexitally-node-parser.js) runs inside Quantumult X after the app downloads the managed file:

- reads `[server_local]` only;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, exact duplicates, `[Premium]` placeholders, and traffic / expiry / plan rows;
- returns those server lines as the resource body, or a visible `$done({error})`.

## Usage

Add the parser to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Attach the **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the device. Never commit it.

After the stable profile is in place, refresh **Server Resources → Nexitally**. Longer steps: [docs/usage.md](docs/usage.md).

## Why

Nexitally's **Configuration File → Download** replaces the whole active profile. A resource parser makes `[server_local]` independently refreshable.

If Nexitally publishes an official server-only Quantumult X subscription, use that and remove this parser.

## Docs and examples

| Path | Contents |
| --- | --- |
| [docs/](docs/README.md) | Parser contract, extraction rules, privacy, troubleshooting |
| [examples/fixtures/](examples/fixtures/) | Fictional managed profiles |
| [examples/expected/](examples/expected/) | Exact parser output for each fixture |
| [examples/profiles/](examples/profiles/) | Stable local profile snippets |
| [examples/walkthrough.md](examples/walkthrough.md) | `full-config` replay |

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.conf
npm run examples
```

## Compatibility

Tested against Quantumult X configurations that include AnyTLS nodes. The app must support AnyTLS and resource parsers.

## License

The parser and examples in this repository are personal utilities. Official Quantumult X sample lines cited in the docs belong to the Quantumult X project.
