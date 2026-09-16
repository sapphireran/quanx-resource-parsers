# Troubleshooting

Personal notes for failures seen while wiring
`nexitally-node-parser.js` into a local Quantumult X profile.

## Parser error: `[server_local] section was not found`

The URL is probably not a managed **full configuration**.

| What you likely added | What this parser expects |
| --- | --- |
| A Clash / Surge / SIP008 node subscription | A Quantumult X configuration that contains `[server_local]` |
| An official server-only Quantumult X resource | Bare server lines, no section header |
| An HTML login page or expired-link page | No INI sections at all |

Fix: in Nexitally, use **Configuration File → Download** (Quantumult X), not a
generic subscription export. If Nexitally already offers a Quantumult X
**server** resource, skip this parser (`opt-parser=false`) and use that URL.

Reproduce locally with the redacted fixture:

```bash
node scripts/run-parser.js --json examples/nexitally/fixtures/already-a-server-list.txt
```

## Parser error: `no usable server entries were found`

`[server_local]` existed, but every line was a comment, `[Premium]`
placeholder, traffic/expiry row, duplicate, or unsupported type.

Typical causes:

- The managed file only contained plan-metadata nodes that day.
- A new protocol prefix appeared (add it to the `supported` regex after
  confirming Quantumult X accepts that line shape).
- Every live node tag accidentally matched `Traffic` / `流量` / `套餐`.

Reproduce:

```bash
node scripts/run-parser.js --json examples/nexitally/fixtures/empty-servers.conf
```

## Quantumult X says there is no custom parser

`resource_parser_url` is missing or the profile was replaced by Nexitally's
full download. Put the parser URL back in **the local** `[general]` section:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then confirm the Nexitally resource has `opt-parser=true`.

jsDelivr caches GitHub. After a parser change, either wait or pin a commit:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@<commit>/nexitally-node-parser.js
```

Raw GitHub avoids the CDN cache:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

## Resource refreshes but local filters disappeared

The active profile is still the managed full configuration, not the local
one. This parser can only protect filters if Nexitally is a `[server_remote]`
resource inside a profile you control.

Check:

1. `[general]` still has your `resource_parser_url`.
2. `[filter_local]` / `[rewrite_local]` are still the personal rules.
3. The Nexitally resource is under `[server_remote]`, not imported via
   **Configuration File → Download** as the whole profile.

See [`../examples/quantumult-x/keep-local-filters.conf`](../examples/quantumult-x/keep-local-filters.conf).

## Nodes appear, but policy is empty

The parser does not emit `[policy]`. Select imported servers with
`resource-tag-regex` matching the resource `tag=`:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, enabled=true

[policy]
static = nexitally, resource-tag-regex=^Nexitally
```

If `tag=` on the resource is `Nexitally` and the regex is `^nexitally$`, it
will not match. Quantumult X regex matching is case-sensitive unless the
pattern says otherwise.

## Duplicate nodes in the UI

The parser only collapses **exact** trimmed lines. Two lines that differ by
`tag=` or a trailing parameter are both kept. That is covered by
`duplicates-and-premium`. If the provider emits the same host under two tags
on purpose, leave both.

## AnyTLS nodes import but never connect

This parser does not change protocol parameters. If Quantumult X is older
than the AnyTLS-capable build, the line is stored and the handshake fails in
the app. Update Quantumult X. Reality TLS also needs a current build and
should not enable TCP Fast Open.

## Checker failures on a laptop

```bash
node scripts/check-examples.js
```

| Symptom | Likely cause |
| --- | --- |
| `crlf-and-bom` fails | Working-tree line endings were rewritten; confirm `.gitattributes` |
| `policy-must-not-leak` fails | Section-boundary regex became greedy |
| `quantumult-x-$done-runtime` fails | `$done` path broke while the Node export still works |
| `header-case-and-spacing` fails | The `i` flag or `\s*=` support was removed |

Do not "fix" a failing fixture by pasting a live subscription into
`examples/`. Redact first.
