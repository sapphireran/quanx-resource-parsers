# Worked example: `typical-full-config`

A line-by-line walk through
[`examples/nexitally/cases/typical-full-config/input.conf`](../examples/nexitally/cases/typical-full-config/input.conf)
so the parser's keep/drop decisions are visible without opening Quantumult X.

Reproduce it:

```bash
node examples/scripts/run-example.js typical-full-config
```

## Input shape

The fixture is a fake managed profile, not a subscription:

| Section | Why it is there |
| --- | --- |
| `[general]` | Real downloads start with this. The parser must ignore it. |
| `[dns]` | Same. |
| `[policy]` | The reason we do not re-import the managed file. |
| `[server_local]` | The only section that may contribute output. |
| `[filter_remote]` / `[filter_local]` | Must not leak. |
| `[rewrite_local]` / `[mitm]` | Must not leak. |

## `[server_local]` decisions

| Line (tag) | Decision | Reason |
| --- | --- | --- |
| `; region: hong kong` | drop | `;` comment |
| `tag=HK-Central-01` | **keep** | `anytls =`, not a placeholder |
| `tag=HK-Central-02` | **keep** | same |
| `; region: japan` | drop | comment |
| `tag=JP-Osaka-01` | **keep** | `shadowsocks =` |
| `; region: united states` | drop | comment |
| `tag=US-Sfo-01` | **keep** | `vmess =` |
| `; account banners — must be dropped` | drop | comment |
| `tag=Traffic: 128.00 GB` | drop | `Traffic` exclusion |
| `tag=Expire: 2099-12-31` | drop | `Expire` exclusion |
| `tag=[Premium]` | drop | `[Premium]` exclusion |

Nothing under `[filter_local]` is considered, including `final, Proxy`.

## Output

Four lines, in file order, exact text of the kept servers:

```text
anytls = hk-central-01.example.test:443, password=example-anytls-password, over-tls=true, tls-verification=true, tls-host=hk-central-01.example.test, udp-relay=true, tag=HK-Central-01
anytls = hk-central-02.example.test:443, password=example-anytls-password, over-tls=true, tls-verification=true, tls-host=hk-central-02.example.test, udp-relay=true, tag=HK-Central-02
shadowsocks = jp-osaka-01.example.test:443, method=chacha20-ietf-poly1305, password=example-ss-password, obfs=http, obfs-host=download.windowsupdate.com, udp-relay=true, tag=JP-Osaka-01
vmess = us-sfo-01.example.test:443, method=aes-128-gcm, password=00000000-0000-4000-8000-000000000001, obfs=wss, obfs-host=us-sfo-01.example.test, obfs-uri=/example, tls13=true, udp-relay=true, tag=US-Sfo-01
```

Passwords and hostnames above are invented. A live export will look similar
in *structure* and must not be pasted into this file.

## What Quantumult X does with that output

Those four lines become the contents of the `Nexitally` server resource.
They do not replace `[policy]`. To use them, the personal profile still
needs a policy that references `HK-Central-01` (and friends) or the
resource tag itself.

See [`examples/nexitally/quanx-profile-snippet.conf`](../examples/nexitally/quanx-profile-snippet.conf)
for the local-side attachment.
