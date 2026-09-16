# QuanX Resource Parsers

Personal Quantumult X resource parsers. Not company, employer, or client configuration.

The first parser turns a Nexitally **managed full configuration** into a refreshable **server resource**, so a local profile's policies, filters, and rewrites stay put.

## Nexitally node parser

[`nexitally-node-parser.js`](nexitally-node-parser.js) runs inside Quantumult X:

- reads `$resource.content` (the body Quantumult X already downloaded);
- takes the first `[server_local]` section;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, duplicates, `[Premium]` placeholders, and traffic / expiry banners (English and Chinese);
- returns server lines only, or an explicit `$done({ error })`.

The script contains no subscription URL, account ID, node password, or other private data.

## Usage

In `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr is optional:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL only on the device. Never commit it here.

After importing a stable local profile, refresh **Server Resources → Nexitally**. Bind groups with `resource-tag-regex=^Nexitally` if they should track the resource tag. Copy-paste fragments live under [`examples/snippets/`](examples/snippets/).

If Nexitally later publishes an official server-only Quantumult X subscription, use that URL and remove this parser layer.

## Docs and examples

| Path | Contents |
| --- | --- |
| [`docs/`](docs/) | Specification, device setup, troubleshooting, 中文速查 |
| [`examples/atlas/`](examples/atlas/) | 34 synthetic fixtures that lock the keep / drop rules |
| [`scripts/atlas.js`](scripts/atlas.js) | Local replay through the real parser file |

```bash
npm test
node scripts/atlas.js trace examples/atlas/cases/managed-full-profile/input.conf
```

Atlas hosts and secrets are from the official [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf). They are not live Nexitally nodes.

## Compatibility

Tested against Quantumult X configurations that already contain AnyTLS `[server_local]` lines. The client must support AnyTLS and resource parsers. This script does not convert Clash, Surge, or URI lists.
