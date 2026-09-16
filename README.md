# QuanX Resource Parsers

Personal Quantumult X resource parsers. This repository is not a company config dump and it does not host a subscription.

The first parser, `nexitally-node-parser.js`, turns a Nexitally **full Quantumult X configuration** into a server-only `[server_remote]` resource:

- extracts the first `[server_local]` block;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` lines;
- drops comments, traffic / expiry banners, `[Premium]` placeholders, unsupported prefixes, and exact duplicates;
- contains no subscription URL, account id, or node password.

Quantumult X downloads the private URL on the device. The script only sees `$resource.content`.

## Usage

One parser per profile, under `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub if jsDelivr is stale:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Then add the **private** Nexitally full-configuration URL as a server resource:

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the phone. Never commit it here.

After the stable local profile is in place, refresh **Server Resources → Nexitally**. Local `[policy]`, `[filter_remote]`, and rewrite sections stay yours.

## Why

Nexitally’s **Configuration File → Download** replaces the whole active profile. A resource parser turns the embedded `[server_local]` section into an independently refreshable server list.

If Nexitally later publishes an official server-only Quantumult X subscription, use that and remove this layer.

## Personal handbook and replay studio

| Path | What it is |
| --- | --- |
| [handbook/](handbook/README.md) | Operator notes: scope, `$resource` / `$done` contract, keep/drop reason codes, device wiring, troubleshooting |
| [studio/](studio/README.md) | Sanitized fixtures plus a Node sandbox that prints why each line was kept or dropped |
| [studio/profiles/](studio/profiles/) | Copy-paste `[general]` / `[server_remote]` / policy snippets with a URL token |
| [studio/report/gallery.html](studio/report/gallery.html) | Generated keep/drop gallery |

```bash
npm test
node studio/replay.js explain managed-full-profile
node studio/replay.js why "anytls=example.com:443, password=pwd, tag=HK-Reset-01"
```

`npm test` replays 30 invented fixtures and scans the tree for live-looking URLs or non-sample passwords.

## Compatibility

Tested against Quantumult X configurations that include AnyTLS. The client must support AnyTLS and resource parsers. The exclusion regex treats `Reset` as a substring (`HK-Reset-01` and `Preset` drop; `HK-RST-01` stays). See [handbook/04-keep-drop-reason-codes.md](handbook/04-keep-drop-reason-codes.md).

## License

MIT. Personal project of Sapphire Ran.
