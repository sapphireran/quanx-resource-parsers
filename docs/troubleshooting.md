# Troubleshooting the Nexitally node parser

These notes cover the failures this personal parser can produce, and the
Quantumult X setup mistakes that look like parser bugs. All examples stay
fictional. Do not paste a live subscription URL into an issue, commit, or
screenshot.

## Parser error: `[server_local]` section was not found

The downloaded body has no `[server_local]` heading after BOM and CRLF
normalization.

Typical causes:

1. The resource URL is already a server-only Quantumult X snippet. This
   parser is unnecessary in that case. Disable `opt-parser` or point
   `[server_remote]` at the official server subscription if one exists.
2. The URL returned Clash YAML, a Surge profile, a base64 subscription, or
   an HTML login / challenge page. This parser does not convert those
   formats.
3. The download failed and Quantumult X passed an error document. Open the
   resource in Quantumult X and inspect the raw body if the client allows it.
4. The heading uses a different name, such as `[servers]` or
   `[Proxy]`. Only `[server_local]` is accepted.

Local reproduction: `examples/nexitally/edge-cases/missing-server-local.conf`.

## Parser error: no usable server entries were found

The `[server_local]` section existed, but every line was dropped.

Typical causes:

1. The section contains only comments, blank lines, or quota placeholders.
2. Every node tag includes `[Premium]`, `Traffic`, `Expire`, `Reset`,
   `Days Left`, `流量`, `到期`, `剩余`, or `套餐`.
3. The lines are Surge / Clash / URI-scheme nodes (`ss://`, `vmess://`)
   rather than Quantumult X `scheme=host:port, ...` lines.
4. The section is present but empty.

Local reproductions:

- `examples/nexitally/edge-cases/empty-server-local.conf`
- `examples/nexitally/edge-cases/placeholders-only.conf`
- `examples/nexitally/edge-cases/unsupported-schemes.conf`

## Quantumult X stores a full configuration instead of nodes

`opt-parser` is false or missing, or `resource_parser_url` is empty.

Check both places:

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Then refresh **Server Resources → Nexitally**, not **Configuration File →
Download**.

## Refresh replaced the whole Quantumult X profile

The full Nexitally configuration was imported as the active profile. That
path is what this parser exists to avoid.

Recovery:

1. Restore the previous local profile if Quantumult X still has it.
2. Put the private URL back under `[server_remote]` with `opt-parser=true`.
3. Keep `[policy]`, `[filter_remote]`, DNS, and MITM from the local profile.

## Nodes appear, but AnyTLS lines are missing or unused

The parser keeps `anytls=` lines. Quantumult X still has to understand the
scheme.

- Use a Quantumult X build that documents AnyTLS support (official samples
  mention 1.5.6).
- Confirm the raw `[server_local]` line already uses `anytls=`, not a
  converted Clash name such as `any-tls`.
- Confirm the tag does not contain `[Premium]`.

## Duplicate nodes still appear

The parser only drops **exact** duplicate lines.

Two lines that differ by tag, port, or a single flag are both kept. If
Nexitally emits `HK-01` and `HK-01-copy` as different strings, both survive.
Deduplicate in a policy group, or fork the parser if you want fuzzy matching.

## A real node disappeared

Read the excluded regex before assuming a download failure:

```text
[Premium] | Traffic | Expire | Reset | Days Left | 流量 | 到期 | 剩余 | 套餐
```

If a usable node's tag contains one of those words, the parser drops it on
purpose. Rename the node in the local profile after import, or change the
regex in a personal fork.

## jsDelivr is serving an old parser

`resource_parser_url` currently points at:

```text
https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

CDN caches can lag `main`. For a one-off test, point
`resource_parser_url` at the raw GitHub file for the same public script, then
switch back to jsDelivr if you prefer a CDN.

Do not replace that URL with a private gist that contains a subscription.

## Local check before touching Quantumult X

From the repository root:

```bash
node tools/run-examples.js
```

If a fixture fails, the parser and the documented examples have drifted. Fix
that mismatch first. If the fixtures pass and Quantumult X still fails, the
live download body is different from the fictional fixtures — usually a
different format, an error page, or a missing `[server_local]` heading.

## What to include when asking for help

Safe to share:

- the exact parser error string;
- whether `[server_local]` exists in the downloaded body;
- Quantumult X version / build;
- a **fictional** fixture that reproduces the keep/drop mistake.

Unsafe to share:

- the private resource URL;
- a raw export that still contains real hosts or passwords;
- traffic or expiry text that identifies an account.

Copy a fixture from `examples/nexitally/edge-cases/` and adjust only
placeholder values.
