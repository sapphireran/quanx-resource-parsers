# Example walkthrough

This is a line-level reading of
`examples/nexitally-full-config.example.conf`. Run the same file with:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf
```

The printed output is `examples/nexitally-expected-servers.txt`.

## The provider sends a whole profile

The example starts like a managed Quantumult X download, not a node list:

```ini
[general]
server_check_url = http://www.apple.com/generate_204

[dns]
server = 1.1.1.1

[policy]
static = Nexitally, HK-01, HK-02, SG-01, …
```

The parser ignores every section except `[server_local]`. Your real
`[policy]` on the device is never replaced, because this text is only a
**resource**, not an imported profile.

## `[server_local]` is the only payload that matters

Usable nodes look like ordinary Quantumult X server lines. The first
kept line is:

```text
anytls=hk-01.example.test:443, password=placeholder-not-a-real-secret, over-tls=true, tls-host=hk-01.example.test, tls-verification=true, udp-relay=true, tag=HK-01
```

The example repeats that same HK-01 line later. Exact-line de-duplication
keeps it once.

Mixed protocols are kept in source order: AnyTLS regions, then
Shadowsocks, VMess, VLESS, Trojan, HTTP, SOCKS5. That is 13 unique
servers in the snapshot (7 AnyTLS + 6 others). HK-01 is not counted
twice.

## Placeholders are not servers

Nexitally-style profiles often inject dashboard rows as fake
`shadowsocks=` nodes:

```text
tag=Traffic: 128.00 GB
tag=Expire: 2099-12-31
tag=Reset: 3 Days Left
tag=流量: 128.00 GB
tag=到期: 2099-12-31
```

and locked-plan stubs:

```text
tag=[Premium] JP-VIP-01
tag=[Premium] US-VIP-01
```

Default parsing drops all of those. They are still in the example file
so the tests can prove they disappear.

Debug flags to keep them (local only):

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf \
  --link 'https://subscription.example.test/qx#keep-info=1&keep-premium=1'
```

## Comments and unknown protocols

`;`, `#`, and `//` lines are skipped. `wireguard=` and `not-a-server =`
are skipped because they are not on the allow-list.

## After `[server_local]`

```ini
[filter_local]
host-suffix, apple.com, direct
final, Nexitally
```

These lines are part of the **provider** profile. They never reach
`[server_remote]`. Filters in *your* local profile are a different
section and stay untouched.

## Hash filter variant

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf \
  --link 'https://subscription.example.test/quantumult-x#in=HK'
```

`in` matches the `tag=` field. `HK-01` and `HK-02` remain;
`SG-01` / `JP-SS-01` / `HTTP-01` do not. Snapshot:
`examples/hash-in-hk.expected.txt`.

## Bare list fallback

`examples/already-server-list.example.txt` has no `[server_local]`
heading. The parser still keeps `HK-01` and `SG-01` and still drops the
`Traffic:` row. Use this when a provider later ships nodes without a
full profile wrapper.

## What a local profile copies

`examples/quantumult-x.local.example.conf` is not parsed. It is the
**device** side: `resource_parser_url` plus a `[server_remote]` line
with `opt-parser=true`. Replace `subscription.example.test` with the
private Nexitally URL and keep that URL off git.

## Count check

| Kind | In the full example | In default output |
| --- | ---: | ---: |
| AnyTLS region nodes (unique) | 7 | 7 |
| Other supported protocols | 6 | 6 |
| Duplicate HK-01 | 1 extra | 0 |
| Traffic / expiry placeholders | 5 | 0 |
| `[Premium]` stubs | 2 | 0 |
| Comments / unsupported | several | 0 |
| **Server lines emitted** | | **13** |
