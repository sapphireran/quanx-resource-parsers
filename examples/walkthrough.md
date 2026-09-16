# Walkthrough: full managed profile → server list

This is the path Quantumult X takes when `opt-parser=true` is set on a Nexitally full-configuration URL. The fixture stands in for that download.

## Input

[`fixtures/nexitally-full-config.conf`](fixtures/nexitally-full-config.conf) looks like a provider-generated profile:

- `[general]`, `[dns]`, `[policy]`, `[filter_*]`, `[rewrite_local]`, `[mitm]`
- `[server_local]` with AnyTLS + Shadowsocks + VMess
- quota comments (`Traffic`, `Expire`, `流量`, `套餐`)
- a `[Premium]` placeholder
- an exact duplicate of `HK-01`
- commented leftovers (`;anytls`, `//`, `#`)

## Command

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.conf
```

## Output

The harness prints the same text Quantumult X stores as the server resource:

```text
anytls = hk-01.nodes.example.test:443, password=example-password, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=HK-01
anytls = jp-01.nodes.example.test:443, password=example-password, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=JP-01
anytls = sg-01.nodes.example.test:443, password=example-password, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=SG-01
shadowsocks = ss-01.nodes.example.test:8388, method=2022-blake3-aes-128-gcm, password=ZXhhbXBsZS1zczIwMjItc2VjcmV0, udp-relay=true, tag=SS-HK-01
vmess = vmess-01.nodes.example.test:80, method=aes-128-gcm, password=00000000-0000-4000-8000-000000000001, fast-open=false, udp-relay=false, tag=VMESS-01
```

Checked in as [`expected/nexitally-full-config.servers`](expected/nexitally-full-config.servers).

## What was discarded

| Input | Why it disappeared |
| --- | --- |
| `; Traffic: ...` / `; 流量: ...` | Comment, and also matches the exclusion keywords |
| `tag=US-01 [Premium]` | Exclusion regex |
| Second `tag=HK-01` line | Exact duplicate after trim |
| `;anytls = dead...` | Comment |
| `[policy]`, `[filter_local]`, `[mitm]` | Outside `[server_local]` |

## How that output is used on the device

The five lines become the Nexitally server resource. A local policy group can attach to `tag=Nexitally` instead of hard-coding `HK-01`:

```ini
[policy]
static = Proxy, resource-tag-regex=^Nexitally
```

See [`profiles/stable-profile-skeleton.conf`](profiles/stable-profile-skeleton.conf).

## Error path

If the download is empty or not a Quantumult X profile, the parser calls `$done({error})` instead of inventing nodes:

```bash
node scripts/run-parser.js examples/fixtures/nexitally-missing-section.conf
# Nexitally parser: [server_local] section was not found.
```
