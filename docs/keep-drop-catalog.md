# Keep / drop catalog

Reason codes used by `bench/classify.js` and [bench/gallery.html](../bench/gallery.html).

| code | verdict | rule |
| --- | --- | --- |
| `keep` | keep | Supported prefix, no exclusion token, first exact copy |
| `empty` | drop | Blank after trim |
| `comment` | drop | Trimmed line starts with `;`, `#`, or `//` |
| `unsupported` | drop | Prefix is not the seven-name allow list |
| `excluded` | drop | Unanchored match on an exclusion token |
| `duplicate` | drop | Exact trimmed line already kept |

## Exclusion tokens

The parser uses one regex:

```
(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)
```

It is case-insensitive and **unanchored**. A token in `tag=`, `password=`, or the host will drop the whole line.

| token | typical vendor row | trap |
| --- | --- | --- |
| `[Premium]` | placeholder node or a later heading | As a heading it also **ends** the section. See `premium-as-section`. |
| `Traffic` | `tag=Traffic: 12.3 GB` | `password=pwdTraffic` drops. See `false-friend-password`. |
| `Expire` | `tag=Expire: 2099-12-31` | `Expire-01` as a node name would drop too. |
| `Reset` | `tag=Reset in 12 days` | `HK-Reset-01` drops. **`Preset` contains `Reset`**, so `HK-Preset-01` drops. `HK-RST-01` stays. |
| `Days Left` | `tag=Days Left: 12` | Space required. `DaysLeft` and `Days_Left` stay. |
| `流量` / `到期` / `剩余` / `套餐` | Chinese info rows | `剩余-01` as a tag drops because `剩余` is inside it. `香港-01` stays. |

Replay a single line:

```bash
node bench/run.js --why "anytls=example.com:443, password=pwd, tag=HK-Preset-01"
```

Expected classifier output: `excluded` / `matched Reset`.

## Prefix allow list

`anytls` `shadowsocks` `vmess` `vless` `trojan` `http` `socks5`, optional spaces before `=`, case-insensitive.

| written | result |
| --- | --- |
| `AnyTLS=...` | keep (spelling preserved) |
| `anytls =host` | keep |
| `https=` `socks=` `ss=` | unsupported |
| `hysteria2=` `tuic=` `wireguard=` | unsupported |
| `vmess://...` | no `[server_local]` at all |

## Comments

Quantumult X comments are prefix-only (official `sample.conf`: lines starting with `;` or `#` or `//`).

| line | result |
| --- | --- |
| `; anytls=...` | comment |
| `anytls=..., tag=HK-01 # note` | **keep**, including the `# note` |
| `/* anytls=... */` | unsupported (not a comment) |

## Dedup

The `seen` map keys on the **whole trimmed line**. Two nodes that share a host but differ by `tag=` are both kept (`same-host-different-tag`).
