# Annotated walkthrough: managed full profile

This is the `managed-full-profile` fixture. Every hostname and secret is synthetic.

## Input (abridged)

```ini
[general]
server_check_url = http://www.apple.com/generate_204

[dns]
server = 223.5.5.5

[policy]
static = Nexitally, HK-01, JP-01, img-url=http://example.com/icon.png

[server_local]
; provider banner — not a node
# hash comment
// slash comment

http=127.0.0.1:80, tag=Traffic: 12.30 GB / 500.00 GB
http=127.0.0.1:80, tag=Expire: 2099-12-31
http=127.0.0.1:80, tag=Reset: 7 Days Left
http=127.0.0.1:80, tag=流量：12.30 GB / 500.00 GB
http=127.0.0.1:80, tag=到期：2099-12-31
http=127.0.0.1:80, tag=剩余：7 天
http=127.0.0.1:80, tag=套餐：Premium

anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01
anytls=example.net:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=JP-01
anytls=example.org:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=US [Premium]
shadowsocks=example.com:80, method=chacha20, password=pwd, udp-relay=false, tag=SS-01
vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, udp-relay=false, tag=VM-01

[filter_remote]
https://raw.githubusercontent.com/crossutility/Quantumult-X/master/filter.snippet, tag=Sample, enabled=true
```

## Section match

`[general]`, `[dns]`, and `[policy]` are skipped. The first `[server_local]` opens the body. `[filter_remote]` closes it. Nothing after that header is visible to the parser, including Nexitally-style remote filters.

## Line decisions

| Line (trimmed) | Decision | Reason |
| --- | --- | --- |
| `; provider banner — not a node` | drop | `comment` |
| `# hash comment` | drop | `comment` |
| `// slash comment` | drop | `comment` |
| *(blank)* | drop | `empty` |
| `http=127.0.0.1:80, tag=Traffic: …` | drop | `excluded-metadata` (`Traffic`) |
| `http=127.0.0.1:80, tag=Expire: …` | drop | `excluded-metadata` (`Expire`) |
| `http=127.0.0.1:80, tag=Reset: …` | drop | `excluded-metadata` (`Reset` and `Days Left`) |
| `http=127.0.0.1:80, tag=流量：…` | drop | `excluded-metadata` (`流量`) |
| `http=127.0.0.1:80, tag=到期：…` | drop | `excluded-metadata` (`到期`) |
| `http=127.0.0.1:80, tag=剩余：…` | drop | `excluded-metadata` (`剩余`) |
| `http=127.0.0.1:80, tag=套餐：…` | drop | `excluded-metadata` (`套餐`) |
| `anytls=… tag=HK-01` (first) | keep | `usable-server` |
| `anytls=… tag=HK-01` (second) | drop | `duplicate` |
| `anytls=… tag=JP-01` | keep | `usable-server` |
| `anytls=… tag=US [Premium]` | drop | `excluded-metadata` (`[Premium]`) |
| `shadowsocks=… tag=SS-01` | keep | `usable-server` |
| `vmess=… tag=VM-01` | keep | `usable-server` |

## Output Quantumult X receives

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01
anytls=example.net:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=JP-01
shadowsocks=example.com:80, method=chacha20, password=pwd, udp-relay=false, tag=SS-01
vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, udp-relay=false, tag=VM-01
```

Those four lines become the Nexitally **server resource**. The local `[policy]` group is unchanged; bind it with `resource-tag-regex=^Nexitally` as shown in [`../snippets/policy-with-resource-tag.conf`](../snippets/policy-with-resource-tag.conf).

Replay:

```bash
node scripts/atlas.js trace examples/atlas/cases/managed-full-profile/input.conf
```
