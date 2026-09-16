# Nexitally node parser

`nexitally-node-parser.js` is a personal Quantumult X resource parser. It takes the **managed full Quantumult X configuration** Nexitally distributes and returns only the usable `[server_local]` entries.

The script contains no subscription URL, account identifier, node password, or other private data. Quantumult X downloads the private configuration itself. The parser only sees the response body.

## Why a parser exists

Nexitally's in-app **Configuration File → Download** path produces a complete Quantumult X profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, rewrites, and so on.

Re-importing that file is convenient the first time and destructive after you have a stable personal profile. It replaces:

- policy groups you named and nested yourself;
- `[filter_remote]` / `[filter_local]` entries;
- `[rewrite_remote]` / `[rewrite_local]` entries;
- MitM hostnames and other local sections.

The useful part of a later download is almost always the node list inside `[server_local]`. A resource parser turns that section into an independently refreshable `[server_remote]` resource.

```text
Nexitally managed full config          Personal Quantumult X profile
┌──────────────────────────┐           ┌────────────────────────────┐
│ [general]                │           │ [general]  (yours)         │
│ [dns]                    │           │ [dns]      (yours)         │
│ [policy]                 │           │ [policy]   (yours)         │
│ [server_local]  ──┐      │  parser   │ [server_remote] Nexitally  │
│ [filter_*]        │      │ ═══════►  │    HK-01, JP-01, …         │
│ [rewrite_*]       │      │           │ [filter_*] (yours)         │
│ [mitm]            │      │           │ [rewrite_*](yours)         │
└───────────────────┘      │           └────────────────────────────┘
                           │
                           └─ discarded: policies, filters,
                              rewrites, MitM, info nodes
```

If Nexitally later publishes an official **server-only** Quantumult X subscription, prefer that resource and delete this parser layer.

## What the parser keeps

From `[server_local]`, a line is kept when all of the following are true:

1. It is not empty and not a `;` / `#` / `//` comment.
2. It starts with a supported scheme: `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, or `socks5`.
3. It does not look like a traffic, expiry, or placeholder row.
4. The exact trimmed line has not already been kept.

The placeholder / info filter is intentionally broad:

```text
[Premium]   Traffic   Expire   Reset   Days Left
流量         到期      剩余      套餐
```

Those tokens appear in the managed configuration as fake nodes or tag text. They are not servers you can connect to, and they pollute policy groups if they leak through.

The parser does **not**:

- rewrite node names;
- add emoji or region flags;
- change UDP, TFO, or TLS flags;
- read `$resource.link` or `$resource.info`;
- fetch anything itself.

## What a successful result looks like

Input is a full configuration (see `examples/nexitally/full-config.conf`). Output is only server lines:

```text
anytls=hk-01.example.test:443, password=example-password, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=HK-01
anytls=jp-01.example.test:443, password=example-password, over-tls=true, tls-host=www.apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=JP-01
```

Quantumult X stores those lines under the `[server_remote]` tag you chose, usually `Nexitally`.

## Personal profile setup

Do this once after you already have a profile you want to keep.

### 1. Point `[general]` at this parser

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr is an alternative if raw GitHub is slow:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

If Quantumult X says there is no custom parser, save the profile, leave the app, and reopen it so `[general]` is reloaded.

### 2. Add the private Nexitally URL as a server resource

Use the same URL Nexitally gives you for the full Quantumult X configuration. Keep it only in the local profile.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Required flags:

| Flag | Why |
| --- | --- |
| `opt-parser=true` | Without this, Quantumult X stores the full downloaded config as if it were already a server list. |
| `tag=Nexitally` | Policy groups can select the resource with `resource-tag-regex=^Nexitally`. |
| `update-interval=21600` | Six hours. Use a negative value to disable auto-sync. |

### 3. Point personal policy groups at the resource

Leave the rest of the profile alone. Add or adjust groups so they consume the remote tag instead of copying node names by hand:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, img-url=https://example.com/icon.png
available = Nexitally-Auto, resource-tag-regex=^Nexitally
url-latency-benchmark = Nexitally-Latency, resource-tag-regex=^Nexitally, check-interval=600, alive-checking=false, tolerance=100
static = Proxy, Nexitally, Nexitally-Auto, direct
```

A complete copy-paste skeleton lives in `examples/nexitally/personal-profile-snippet.conf`.

### 4. Refresh only the server resource

After saving:

1. Open **Server Resources**.
2. Refresh the **Nexitally** resource.
3. Confirm the node list is servers only — no `Traffic`, `Expire`, or `[Premium]` rows.
4. Confirm your filter and rewrite resources were not reset.

Do **not** use **Configuration File → Download** again unless you intend to replace the whole profile.

## Compatibility

- Quantumult X must support resource parsers (`resource_parser_url` / `opt-parser`).
- AnyTLS nodes require Quantumult X **1.5.6+**. Older builds will drop or reject those lines even if this parser emits them.
- Reality lines (`reality-base64-pubkey`, `reality-hex-shortid`) follow the official sample.conf fields. This parser does not rewrite them.

## Failure messages

The script returns a short `$done({error})` instead of an empty server list:

| Message | Typical cause |
| --- | --- |
| `Nexitally parser: [server_local] section was not found.` | The download was not a Quantumult X config, the section name changed, or the body is HTML / an auth error page. |
| `Nexitally parser: no usable server entries were found.` | The section exists but every line was a comment, info placeholder, duplicate, or unsupported scheme. |

See [troubleshooting](troubleshooting.md) for the recovery steps.

## Checking the synthetic fixtures

```bash
node scripts/run-parser.js nexitally-node-parser.js examples/nexitally/full-config.conf
node scripts/verify-examples.js
```

The fixtures use `*.example.test` hosts and documented placeholder passwords. They are not a live Nexitally subscription.
