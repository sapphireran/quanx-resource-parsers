# Quantumult X resource-parser runtime

This repository’s scripts are **resource parsers**, not rewrite scripts and not HTTP rewrite workers. Quantumult X downloads a remote (or local) resource, then evaluates the parser JavaScript against that payload. The parser’s only job is to turn the raw bytes into a Quantumult X server list.

The official sample is [`resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) in [crossutility/Quantumult-X](https://github.com/crossutility/Quantumult-X). The notes below describe the contract that `nexitally-node-parser.js` relies on.

## Where the parser is installed

Under `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Quantumult X keeps **one** parser URL for the profile. There is no per-resource parser file. A resource opts in with `opt-parser=true` on its `[server_remote]` (or filter/rewrite) line.

Raw GitHub is an equivalent host if jsDelivr is cached or blocked:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

The GitHub account that owns this repository used to be `pang990801`. Older bookmarks that still mention that login should be updated to `sapphireran`.

## What Quantumult X injects

| Object | Meaning |
| --- | --- |
| `$resource.content` | UTF-8 body of the downloaded resource. This is the only field `nexitally-node-parser.js` reads. |
| `$resource.link` | Original URL or local path. Unused here on purpose: the parser must not hard-code or log a subscription URL. |
| `$resource.info` | `subscription-userinfo` response header (Quantumult X v1.0.10+). Unused. Quota rows are filtered from the body instead. |
| `$resource.tag` | `tag=` on the `[server_remote]` line (v1.0.10+). Unused. |
| `$resource.user_agent` | User-Agent for this download; non-empty only during a retry (v1.5.6+). Unused. |

HTTP request APIs and persistent storage are **not** available in a resource parser. The script cannot fetch a second URL, cannot read the keychain, and cannot write files. If the input is empty or malformed, the only options are `$done({ content })` or `$done({ error })`.

## What the parser must return

| Call | Effect |
| --- | --- |
| `$done({ content: "..." })` | Replace the resource with this UTF-8 string. For a server resource, each line is one Quantumult X server. |
| `$done({ error: "..." })` | Show the message in the app; the resource is not updated. |
| `$done({ retry: { user_agent: "..." } })` | Ask Quantumult X v1.5.6+ to download once more with that User-Agent. This repository does not use retries. |

`$done` must be called exactly once. Returning both `error` and `content` is not useful for this parser: a successful extract always returns `content` only.

## Input shape this parser expects

Nexitally’s Quantumult X **full configuration** is a complete profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, and so on. Re-importing that file as a profile would replace local policy and rewrite sections.

The parser therefore:

1. Strips a UTF-8 BOM and normalizes CRLF to `\n`.
2. Finds the `[server_local]` section (case-insensitive).
3. Stops at the next INI section header, so `[server_remote]`, `[filter_local]`, and `[mitm]` never leak.
4. Keeps lines whose scheme is `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, or `socks5`.
5. Drops comments (`;`, `#`, `//`), blanks, `[Premium]` placeholders, and quota/expiry rows.
6. Drops exact-line duplicates, keeping the first copy.

The output is **only** those server lines, joined by `\n`. Quantumult X then stores them as the `[server_remote]` resource named by `tag=`.

This is narrower than community parsers such as KOP-XIAO’s `resource-parser.js`, which convert Clash / Surge / V2RayN subscriptions and accept hash parameters (`#in=`, `rename=`, …). Those parameters do not apply here. `nexitally-node-parser.js` does not read the URL fragment.

## Server line formats (documentation placeholders)

Formats follow Quantumult X `sample.conf`. AnyTLS needs Quantumult X **1.5.6** or later.

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022-blake3-aes-128-gcm
vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vmess-01
vless=example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, fast-open=false, udp-relay=false, tag=vless-tls-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01
http=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=http-01
socks5=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=socks5-01
```

AnyTLS already carries UDP over TCP; `udp-over-tcp=` is not required. Reality TLS is enabled by `reality-base64-pubkey=` on an `over-tls=true` line.

## Enabling the parser on a resource

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

| Parameter | Role |
| --- | --- |
| URL | Private full-configuration URL. Never committed to this repo. |
| `tag=` | Name of the resource in the app and the value `resource-tag-regex` can match. |
| `opt-parser=true` | Run `resource_parser_url` on this download. Without it, Quantumult X would try to treat the full profile as a server list and fail. |
| `update-interval=` | Auto-refresh in seconds. `21600` is six hours. A negative value disables auto-sync. |
| `enabled=true` | Load the resource. |

`as-policy=` is optional. Prefer an explicit `[policy]` group with `resource-tag-regex=^Nexitally` so local policy stays in the profile, not in the remote file. See [examples/quantumult-x](../examples/quantumult-x/README.md).

## Local evaluation

The iOS app is not required to check a fixture. Node 18+ can evaluate the same script with the harness in `test/harness.js`. Details: [Local testing](local-testing.md).
