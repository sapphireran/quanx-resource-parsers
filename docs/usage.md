# Usage

Use this parser when Nexitally's Quantumult X export is a **full configuration** and you want only the nodes, refreshed on a timer, inside a profile you already edited.

Re-downloading Nexitally's configuration file replaces the active Quantumult X profile. That wipes local `[policy]`, `[filter_remote]`, `[rewrite_remote]`, and any other hand-tuned sections. The parser turns the embedded `[server_local]` list into a `[server_remote]` resource so the rest of the profile can stay put.

## 1. Confirm the Nexitally URL

In the Nexitally dashboard, copy the **private Quantumult X full-configuration** URL (Configuration File → Download, or the equivalent Quantumult X full-profile link).

That response must contain a `[server_local]` section. A Clash YAML file, a Shadowrocket list, or a bare `ss://` dump will fail with `[server_local] section was not found.`

Keep the URL on the device. Do not commit it, gist it, or paste it into an issue.

## 2. Install this parser, not a generic one

Quantumult X accepts **one** `resource_parser_url` in `[general]`. Every resource that has `opt-parser=true` uses that same script.

This repository's script only extracts `[server_local]`. It is not [Shawn's generic resource-parser](https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js) and it ignores `#emoji=1&in=香港` hash parameters.

Add exactly one of these lines to `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

```ini
; CDN cache. Use this if raw.githubusercontent.com is unreachable.
; It can lag behind main after a parser change.
;resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

If Quantumult X says there is no custom parser:

1. Save the configuration.
2. Long-press the home-screen windmill, then tap the refresh control on the left.
3. Force-quit Quantumult X and reopen it.

The previous README pointed at `pang990801/quanx-resource-parsers`. That was the old GitHub login. Use `sapphireran/quanx-resource-parsers`.

## 3. Add Nexitally as a server resource

Do **not** import the downloaded configuration as the active profile. Add the same URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

| Parameter | Why |
| --- | --- |
| `tag=Nexitally` | Label in the server-resource list. Policy groups can select it with `resource-tag-regex=^Nexitally`. |
| `opt-parser=true` | Run this repository's parser on this resource only. The official default is off when the parameter is omitted. |
| `update-interval=21600` | Six hours. Quantumult X's default for remote resources is `86400` (24 hours). Use `-1` to disable automatic updates. |
| `enabled=true` | Load the resource. |

Leave `opt-parser` unset or `false` on every other `[server_remote]`, `[filter_remote]`, and `[rewrite_remote]` line. Those resources would otherwise be sent through the Nexitally extractor and fail.

A longer local-profile fragment, including policy groups, is in [`examples/quantumult-x.profile.snippet.conf`](examples/quantumult-x.profile.snippet.conf).

### UI equivalent

1. Open Quantumult X → the home-screen windmill → **Server** (节点) → **Reference** / **Remote** (引用).
2. Add the private Nexitally full-configuration URL.
3. Set the tag to `Nexitally`.
4. Enable **Resource Parser** (资源解析器) for that resource only.
5. Save, then update that resource.

## 4. Refresh nodes, not the whole profile

After the first successful parse:

1. Open **Server Resources**.
2. Update **Nexitally** only.
3. Leave `[policy]`, `[filter_remote]`, and `[rewrite_remote]` alone.

The parser returns a newline-separated list of Quantumult X server lines. Quantumult X stores that list as the contents of the Nexitally server resource. Existing policy groups that already point at `resource-tag-regex=^Nexitally` pick up the new names automatically.

Do not tap Nexitally's **Configuration File → Download** again unless you intend to replace the entire profile.

## 5. What you should see

A sanitized input/output pair lives in [`examples/`](examples/). The happy-path fixture is a miniature Nexitally-style full configuration. After the parser runs, Quantumult X should receive only the nine kept servers:

```text
anytls=hk-iplc-01.example.invalid:443, ..., tag=HK IPLC 01
anytls=jp-iepl-01.example.invalid:443, ..., tag=JP IEPL 01
anytls=sg-anycast-01.example.invalid:443, ..., tag=SG Anycast Reality 01
shadowsocks=us-ss-01.example.invalid:443, ..., tag=US SS2022 01
vmess=us-vmess-01.example.invalid:443, ..., tag=US VMess 01
vless=us-vless-01.example.invalid:443, ..., tag=US VLESS 01
trojan=us-trojan-01.example.invalid:443, ..., tag=US Trojan 01
http=helper.example.invalid:443, ..., tag=Helper HTTP 01
socks5=helper.example.invalid:1080, ..., tag=Helper SOCKS5 01
```

Dropped from that fixture: traffic / expiry / plan rows (English and Chinese), `[Premium]` stubs, comments, the duplicated HK line, `hysteria2=`, and every non-server section.

Replay the same transformation on a machine with Node.js 18+:

```bash
node docs/examples/run-examples.js
```

## 6. Troubleshooting

**`[server_local] section was not found.`**  
The URL is not a Quantumult X full configuration. Confirm you copied the Quantumult X profile link, not Clash / Surge / Shadowrocket. Open the URL on the device and look for a `[server_local]` header.

**`no usable server entries were found.`**  
The section exists but every line was a comment, a plan placeholder, a `[Premium]` stub, or an unsupported protocol. If the live export only contains Premium inventory, the base plan is not in that file.

**Parser never appears / "no custom parser".**  
`resource_parser_url` is missing, still pointed at the old `pang990801` path, or the app has not reloaded `[general]`. Refresh resources and force-quit Quantumult X.

**Other subscriptions broke after enabling the parser.**  
They have `opt-parser=true` while this extractor is the global parser. Turn their parser switch off.

**AnyTLS nodes appear but cannot connect.**  
Need Quantumult X 1.6.0 (or 1.5.6 TestFlight 914+). Reality lines need the official `reality-base64-pubkey` / `reality-hex-shortid` fields from Nexitally's export.

**jsDelivr still serves the old script.**  
Switch `resource_parser_url` to the raw GitHub URL. jsDelivr caches `gh/` URLs.

**I already use Shawn's parser for Clash subscriptions.**  
Quantumult X cannot load both parsers at once. Options: convert the other subscriptions to native Quantumult X server lists (then leave `opt-parser` off), or temporarily point `resource_parser_url` at this script only while updating Nexitally.

## 7. When to stop using this parser

Remove `opt-parser=true` and this `resource_parser_url` if Nexitally publishes an official **server-only** Quantumult X subscription. Point `[server_remote]` at that URL directly.
