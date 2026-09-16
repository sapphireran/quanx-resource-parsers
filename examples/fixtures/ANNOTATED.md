# Annotated sanitized full config

This is a reading guide for [`nexitally-full-config.sanitized.conf`](nexitally-full-config.sanitized.conf). Every hostname and password is fake.

## Sections Quantumult X would overwrite on a full import

The file starts like a vendor Configuration File download:

```ini
[general]
[dns]
[policy]
[server_remote]
```

Those blocks are why this parser exists. If you import the file as a profile, they replace your personal DNS, policy groups, and other remote resources. When the same bytes arrive as a `[server_remote]` body, the parser never returns them.

`[server_remote]` inside the managed file is empty on purpose: the vendor put nodes in `[server_local]` instead.

## `[server_local]` — what the parser sees

### Metadata the parser must drop

```ini
# Traffic: 128.50 GB / 500.00 GB
# Expire: 2099-12-31
anytls = info.nodes.example.com:1, password=0, over-tls=true, tag=Traffic: 128.50 GB / 500.00 GB
anytls = info.nodes.example.com:1, password=0, over-tls=true, tag=Expire: 2099-12-31
anytls = info.nodes.example.com:1, password=0, over-tls=true, tag=流量剩余 371.50 GB
anytls = info.nodes.example.com:1, password=0, over-tls=true, tag=套餐重置 Reset: 2099-01-01
```

Comment lines are discarded because they start with `#` or `;`. The `anytls = info.nodes...` rows look like servers, so they have to be excluded by **content**: `Traffic`, `Expire`, `流量`, `剩余`, `套餐`, `Reset`.

### Real nodes the parser must keep

| tag | Family | Notes |
| --- | --- | --- |
| `HK-01` | AnyTLS | Standard TLS, first of two identical lines |
| `JP-01` | AnyTLS | Standard TLS |
| `SG-01` | AnyTLS | Reality (`reality-base64-pubkey`) |
| `US-01` | Shadowsocks 2022 | `obfs=over-tls` |
| `DE-01` | Trojan | |
| `TW-01` | VMess | `obfs=wss` |
| `KR-01` | VLESS | |
| `AU-01` | AnyTLS | Prefix written `ANYTLS =` to prove case-insensitivity |

The second `HK-01` line is byte-for-byte the first. Dedup keeps one.

### Inventory the parser must drop

```ini
anytls = premium.nodes.example.com:443, ..., tag=JP-02 [Premium]
```

`[Premium]` is in the exclusion regex. A locked node should not appear in a personal policy group.

## Sections after `[server_local]`

```ini
[filter_remote]
[filter_local]
[rewrite_local]
[mitm]
```

The section regex stops at `[filter_remote]`. If a future parser bug leaks `host-suffix, apple.com, direct` or `url reject-200` into `content`, `npm test` fails.

## Expected `content`

[`nexitally-parsed-servers.expected.txt`](nexitally-parsed-servers.expected.txt) is eight lines, no header, no trailing metadata:

```text
tag=HK-01
tag=JP-01
tag=SG-01
tag=US-01
tag=DE-01
tag=TW-01
tag=KR-01
tag=AU-01
```

Re-run after you edit the fixture:

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sanitized.conf
```

If you change kept nodes, update the expected file in the same commit.
