# QuanX Resource Parsers

Personal Quantumult X resource parsers. This repository is **personal only** — no company or employer configuration.

The committed parser never contains a subscription URL, account id, or node password. Quantumult X downloads the private Nexitally URL on the device; the script only sees `$resource.content`.

## Nexitally node parser

`nexitally-node-parser.js` turns Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts the first `[server_local]` section;
- returns Quantumult X server lines for `[server_remote]`;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5`;
- drops comments, exact duplicates, `[Premium]` placeholders, and traffic/expiry banners (`Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`).

## Usage

There is one global parser URL in `[general]`. Point it at **this** repository (`sapphireran/quanx-resource-parsers`). An older personal username used to host the same files; do not keep that path.

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add the **private** Nexitally full-configuration URL as a server resource:

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the device. Never commit it here, to a gist, or to another public host.

After the stable profile is imported, refresh **Server Resources → Nexitally**. Local `[policy]`, `[filter_remote]`, and other sections stay as you wrote them.

## Why

Nexitally's **Configuration File → Download** replaces the whole active profile. A resource parser turns the embedded `[server_local]` block into a refreshable `[server_remote]` list.

If Nexitally ships an official server-only Quantumult X subscription later, use that and delete this parser layer.

## Personal folio and bench

| path | role |
| --- | --- |
| [docs/](docs/) | Operator notes: parser contract, keep/drop traps, device wiring |
| [examples/](examples/) | Invented fixtures and private-profile snippets |
| [bench/](bench/) | Node `vm` sandbox, reason codes, [gallery](bench/gallery.html) |

```bash
npm test
node bench/run.js --dump examples/cases/managed-full-profile.conf
node bench/run.js --why "anytls=example.com:443, password=pwd, tag=HK-Reset-01"
```

Fixtures use `*.example.invalid` and official Quantumult X sample fields only.

## Compatibility

Tested against Quantumult X configurations that include AnyTLS. The app must support AnyTLS and resource parsers. Official sample lines in `examples/cases/` follow [sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf).
