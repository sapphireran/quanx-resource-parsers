# Troubleshooting

Personal checklist for the Nexitally Quantumult X parser. Work through it in order. Most failures are configuration mistakes in Quantumult X, not bugs in the thirty-line script.

## 1. Confirm the parser is actually running

**Symptom:** The Nexitally resource imports a huge profile, policy groups appear from the provider, or Quantumult X complains that the resource is not a server list.

**Checks:**

1. `[general]` contains `resource_parser_url` pointing at this repository's `nexitally-node-parser.js`.
2. The `[server_remote]` line has `opt-parser=true`.
3. After editing `[general]`, reload the profile (or toggle the resource off/on) so Quantumult X re-fetches the script.

Without `opt-parser=true`, Quantumult X never calls `$done` and tries to treat the full configuration as servers.

jsDelivr can serve a cached older file. Pin a commit SHA or use the GitHub raw URL from [`examples/quantumult-x/general-resource-parser.snippet.conf`](../examples/quantumult-x/general-resource-parser.snippet.conf) if a change on `main` is not visible yet.

## 2. Read the resource error text

The parser uses two explicit errors:

| Message | Meaning | What to look at |
| --- | --- | --- |
| `Nexitally parser: [server_local] section was not found.` | The download is not a Quantumult X full configuration, the section header is missing, or the header has no newline after it | You pasted a Clash file, a Surge module, an HTML login page, or a server-only list |
| `Nexitally parser: no usable server entries were found.` | `[server_local]` exists but every line was a comment, an unsupported prefix, or an excluded info node | The provider only emitted traffic placeholders, or Every node tag hit the exclude list |

Reproduce the same message locally:

```bash
node tests/run.js --dump /path/to/redacted.conf
```

Redact the file first. See [privacy.md](privacy.md).

## 3. Nodes refresh but your filters and policies vanish

You re-downloaded Nexitally via **Configuration File → Download** and imported it as the **active profile**. That path replaces everything. The parser cannot help after the fact.

Recovery:

1. Keep a local profile (iCloud / AirDrop / a private note) that contains your `[policy]`, `[filter_remote]`, `[filter_local]`, and `[rewrite_*]`.
2. Put Nexitally only under `[server_remote]` with `opt-parser=true`.
3. Refresh **Server Resources → Nexitally**, not the whole configuration.

[`examples/quantumult-x/keep-local-policy.snippet.conf`](../examples/quantumult-x/keep-local-policy.snippet.conf) is the intended shape.

## 4. Some nodes are missing after a successful parse

The parser dropped them on purpose, or the extractor stopped early.

| What you see | Likely cause | Fixture |
| --- | --- | --- |
| Locked / upgrade nodes gone | Tag contains `[Premium]` | `traffic-and-premium` |
| Info / traffic dummy nodes gone | Tag contains `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, or `套餐` | `traffic-and-premium` |
| Duplicate names collapsed | Exact same line appeared twice | `duplicates-and-comments` |
| Nodes after a `[Premium]` heading gone | That heading closed `[server_local]` | `premium-as-section-header` |
| `hysteria2=` / `ss=` / `wireguard=` gone | Prefix is not in the allow list | `unsupported-protocol` |
| A real node named `Reset-01` gone | The `Reset` keyword is a substring | tighten the regex in a dedicated change |

Compare the downloaded (redacted) `[server_local]` with the parser output. If the line is absent from `[server_local]`, the provider did not publish it.

## 5. AnyTLS nodes import but cannot connect

The parser only copies lines. It does not change SNI, Reality parameters, or passwords.

- Client must be Quantumult X 1.5.6 (build 914) or later.
- `over-tls=true` should be present on AnyTLS lines (Nexitally's managed file already does this when it emits AnyTLS).
- Reality nodes need `reality-base64-pubkey` and usually `reality-hex-shortid`. Missing fields are a provider issue.
- UDP over AnyTLS does not need `udp-over-tcp`; the protocol already tunnels UDP.

## 6. Resource updates every launch or never updates

`update-interval` is seconds on the `[server_remote]` line. `21600` is six hours. Quantumult X also lets you pull to refresh. A very small interval wastes battery and hammers the provider; a huge interval makes new nodes late. This is a local setting, not a parser setting.

## 7. Parser URL fails to download

Quantumult X must be able to reach GitHub raw or jsDelivr, depending on which URL you set. If GitHub is unreachable on the current network, switch to the other host or vendor the script as a **local** resource (copy the file into the Quantumult X data directory and point `resource_parser_url` at that local path). Do not paste the script into a public note that also contains your subscription URL.

## 8. You want Clash-style filtering (`in=香港`, `emoji=1`)

This parser will not honor hash parameters. Options:

1. Filter in Quantumult X with `server-tag-regex` / `resource-tag-regex` on `[policy]`.
2. Put a general parser on a **server-only** subscription, if the provider has one.
3. Fork this script and add the extra filters — keep the change personal and fixture-covered.

Do not chain this parser and a general parser on the same full-configuration URL unless you have tested the order. Quantumult X runs one `resource_parser_url` for the whole app.

## 9. Local fixtures pass, Quantumult X still fails

Then the live download differs from the fixtures. Common live-only bodies:

- An HTML interstitial or HTTP 403 page (`[server_local]` missing)
- A gzip or non-UTF-8 body (Quantumult X normally decodes this before `$resource.content`; if it did not, you will see garbage and a missing section)
- A server-only list that already has no section headers (this parser will error; that is correct — use the list directly and turn `opt-parser` off)

Save a **redacted** copy of `$resource.content` (replace every hostname, password, and the URL) and add a fixture if the parser should learn a new shape.
