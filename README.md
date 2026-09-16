# QuanX Resource Parsers

Personal Quantumult X resource parsers. Small on purpose. **Not company code.**

The Nexitally parser turns a managed **full Quantumult X configuration** into a server-only `[server_remote]` body so a locally tuned `[policy]` is not overwritten on every node refresh.

## Nexitally node parser

`nexitally-node-parser.js` runs in Quantumult X after the app has fetched your private URL:

- cuts the first `[server_local]` section;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, exact-line duplicates, `[Premium]` placeholders, and English/Chinese traffic-expiry banners;
- contains no subscription URL, account id, or node password.

Operator notebook: [`docs/README.md`](docs/README.md). Synthetic fixtures and a keep/drop gallery: [`examples/README.md`](examples/README.md).

## Usage

In `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL only on the device. Never commit it.

After a stable local profile is in place, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and the rest of the local profile stay put. Snippets: [`examples/profile/`](examples/profile/).

## Why

Nexitally’s **Configuration File → Download** is a complete profile. Re-importing it replaces the active configuration. A resource parser keeps the node list refreshable without that wipe.

If Nexitally ships an official server-only Quantumult X subscription, use that and delete this parser layer.

## Local checks (no phone, no fetch)

```bash
node tools/check.js
node tools/ledger.js examples/cases/typical-managed-full/input.conf
```

Fixtures use `*.example.test` hosts and public Quantumult X sample placeholders. `tools/check.js` secret-scans the tree.

## Compatibility

Tested against Quantumult X configurations that include AnyTLS. Needs a Quantumult X build that supports AnyTLS and resource parsers (parser API: v1.0.8-build253+; AnyTLS: v1.5.6+).
