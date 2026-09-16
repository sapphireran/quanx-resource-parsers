# Compatibility

## Quantumult X

| Feature | Minimum |
| --- | --- |
| Resource parsers (`resource_parser_url`, `opt-parser`) | 1.0.8 (build 253), per the official sample |
| `$resource.info` / `$resource.tag` | 1.0.10 (build 277) |
| `$resource.user_agent` and `$done({ retry })` | 1.5.6 (build 921) |
| AnyTLS server lines | 1.5.6 (build 914+) |

This parser uses only `$resource.content` and `$done({ content | error })`, so it should run on any Quantumult X that already supports resource parsers. **Importing AnyTLS lines** still requires a build that understands `anytls=`.

Tested shape: full Quantumult X documents whose `[server_local]` is mostly AnyTLS, with occasional Shadowsocks / Trojan / VMess / VLESS.

## Supported server prefixes

Copied from `nexitally-node-parser.js`:

```text
anytls
shadowsocks
vmess
vless
trojan
http
socks5
```

Prefixes are case-insensitive. Spaces around `=` are allowed.

Not supported (silently dropped):

```text
wireguard
hysteria / hysteria2 / hy2
tuic
ss          (use shadowsocks=)
ssr         (Quantumult X encodes SSR as shadowsocks= plus ssr-protocol=)
vmess:// and other URI schemes
Clash / Surge / sing-box YAML or JSON
```

Nexitally's Quantumult X download is already native QX syntax. URI-scheme conversion is out of scope.

## AnyTLS line shapes

From the official Quantumult X 1.5.6 notes and `sample.conf`:

Standard TLS:

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
```

Reality TLS (the `reality-base64-pubkey` field replaces standard TLS):

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

AnyTLS carries UDP over its own TCP session. Do not add `udp-over-tcp` for these lines.

## CDN and git hosts

| URL | Notes |
| --- | --- |
| `raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js` | Tracks `main` immediately after push |
| `cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js` | Cached; pin `@<sha>` if you need a freeze |
| `cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js` | Historical personal path from the first upload |

The device must be able to reach the parser host **and** the private Nexitally host. Those are independent downloads.

## Platforms

Quantumult X runs on iOS, macOS, and tvOS. The parser is plain ES5-ish JavaScript (`var`, no modules) so the same file works on all of them. The Node helpers in `scripts/` and `test/` are for this git repo only; they are not installed on the phone.
