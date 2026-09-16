# Walkthrough: `managed-full-profile`

This is the largest synthetic fixture. It pretends to be a Nexitally **full** Quantumult X configuration: general, DNS, a panel-generated policy, a `[server_local]` mix of keep and drop rows, then filters and an empty MitM block.

Replay it with:

```bash
node scripts/replay.js examples/fixtures/managed-full-profile/input.conf --annotate
```

## Outside the section — all discarded

`[general]`, `[dns]`, `[policy]`, `[server_remote]`, `[filter_local]`, `[rewrite_local]`, and `[mitm]` are not captured. The section regex stops at the first following `[...]` header, which here is `[filter_local]`.

The `[policy]` group `static = PROXY, Nexitally-HK, Nexitally-JP, direct` is **not** imported. After a real refresh you still need the local `resource-tag-regex` wiring from [`../profile/stable-local.snippet.conf`](../profile/stable-local.snippet.conf).

## Inside `[server_local]`

| Line (abridged) | Decision | Reason |
| --- | --- | --- |
| `; Traffic: 128.00 GB` | drop | comment (`^;`) |
| `; Expire: 2026-12-31` | drop | comment |
| `anytls=hk-01… tag=HK-01` | **keep** | supported prefix |
| `anytls=jp-02… reality-… tag=JP-02` | **keep** | AnyTLS + Reality params are still `anytls=` |
| `shadowsocks=sg-03… tag=SG-03` | **keep** | supported prefix |
| `vmess=us-04… tag=US-04` | **keep** | supported prefix |
| `# leftover from an old export` | drop | comment (`^#`) |
| second `anytls=hk-01… tag=HK-01` | drop | duplicate of the first keep |
| `shadowsocks=… tag=Traffic: 12 GB` | drop | unanchored `Traffic` |
| `anytls=… tag=[Premium] SG` | drop | unanchored `[Premium]` |
| `; 剩余流量 64 GB` | drop | comment (also would hit `剩余` / `流量` if uncommented) |
| `; 到期时间 2026-12-31` | drop | comment (also would hit `到期`) |

Expected `$done({ content })` is the four kept lines, in file order, LF-separated — see [`../fixtures/managed-full-profile/expected.txt`](../fixtures/managed-full-profile/expected.txt).

## What this fixture is not

It is not a recording of a live panel download. Hostnames end in `.nodes.example.test`. The Reality pubkey is the one printed in Quantumult X's own `sample.conf`. If a future Nexitally file adds a fifth kept protocol (for example `trojan=`), add a row here and update `expected.txt` in the same commit as the parser change — or, if the parser did not change, just the fixture.
