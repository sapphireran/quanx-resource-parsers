# Before and after: managed file → server resource

This is the same transformation Quantumult X performs when
`nexitally-node-parser.js` is the `resource_parser_url` and the Nexitally
resource has `opt-parser=true`.

The input is [`managed-full-config.conf`](managed-full-config.conf). The
output is [`expected-servers.txt`](expected-servers.txt). All values are
fake.

## What Quantumult X downloads (`$resource.content`)

A managed full configuration is a **profile**, not a node list. The fixture
contains, in order:

1. `[general]` and `[dns]` — discarded
2. `[policy]` with `static = nexitally-managed, HK-01, ...` — discarded
3. `[server_remote]` pointing at `https://example.com/other-nodes.txt` — discarded
4. `[server_local]` — **this is the only section the parser reads**
5. `[filter_remote]`, `[filter_local]`, `[rewrite_remote]`, `[rewrite_local]`, `[mitm]` — discarded

Inside `[server_local]` the fixture mixes four kinds of lines:

| Kind | Example tag | Parser action |
| --- | --- | --- |
| Live AnyTLS node | `HK-01`, `JP-01`, `SG-01`, `US-01` | Keep, first-seen order |
| Exact duplicate | second `HK-01` | Drop |
| Comment | `;anytls=retired...`, `//anytls=also-commented...` | Drop |
| Metadata disguised as a node | `Traffic`, `Expire`, `Days Left`, `流量`, `套餐`, `[Premium]` | Drop |

## What `[server_remote]` stores after `$done({ content })`

```
anytls=hk-01.example.test:443, password=example-password-not-real, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=HK-01
anytls=jp-01.example.test:443, password=example-password-not-real, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=JP-01
anytls=sg-01.example.test:443, password=example-password-not-real, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=SG-01
anytls=us-01.example.test:443, password=example-password-not-real, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=US-01
```

No `[server_local]` header. No policy. No filters. No other-nodes URL.

## What the local profile still owns

The device profile (see [`local-profile-snippet.conf`](local-profile-snippet.conf)
and [`../quantumult-x/keep-local-filters.conf`](../quantumult-x/keep-local-filters.conf))
keeps:

- `resource_parser_url`
- personal `[policy]` that selects `resource-tag-regex=^Nexitally`
- personal `[filter_local]` / `[rewrite_local]`

Refreshing **Server Resources → Nexitally** re-runs this transformation. It
must not replace those local sections. If it does, the active profile is still
the managed download; see [../../docs/troubleshooting.md](../../docs/troubleshooting.md).

## Reproduce without Quantumult X

```bash
node scripts/run-parser.js examples/nexitally/managed-full-config.conf
diff -u examples/nexitally/expected-servers.txt <(node scripts/run-parser.js examples/nexitally/managed-full-config.conf)
```

`crlf-and-bom.conf` is the same input with a UTF-8 BOM and CRLF line
endings. It must produce the same four lines.
