# Migration cookbook

Personal steps I use to stop downloading the entire Nexitally Quantumult X configuration on every node change.

## 0. Preconditions

- Quantumult X 1.6.0 (App Store, 2026-05-21) or 1.5.6 TestFlight build 914+ if the export is AnyTLS.
- A **stable local profile** you are willing to keep: filters, rewrites, DNS, policy groups.
- The private Nexitally full-configuration URL, stored only on the device.

If you do not yet have a local profile, import the Nexitally download **once**, then immediately copy `[policy]`, `[filter_*]`, and `[rewrite_*]` into your own file and switch to that file as the active profile before enabling the parser.

## 1. Point the global parser at this repo

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

If the UI says there is no custom parser, refresh resources and fully quit Quantumult X, then reopen it. The official sample uses the same key.

Do not leave a generic Clash converter as `resource_parser_url` while also expecting this script to run. There is only one global parser.

## 2. Add the private URL as a server resource

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is the line that actually invokes the script.

Copy-paste: [`lab/profiles/server-remote-only.snippet.conf`](../lab/profiles/server-remote-only.snippet.conf).

## 3. Select nodes from the resource tag

Do not enumerate every Nexitally tag in `[policy]`. Use regex against the resource tag so new cities appear without editing the profile:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=.
available = Nexitally-Auto, resource-tag-regex=^Nexitally, server-tag-regex=.
static = Proxy, Nexitally, Nexitally-Auto, direct
```

Full fragment: [`lab/profiles/keep-local-policy.snippet.conf`](../lab/profiles/keep-local-policy.snippet.conf).

## 4. Refresh only the server resource

In the app: **Server Resources → Nexitally → update**.

Expected: a list of real nodes (Hong Kong / Japan / Singapore / …). Traffic rows and `[Premium]` stubs should be absent.

If the update errors with `[server_local] section was not found`, the URL is not a full Quantumult X configuration (or the download failed and the body is HTML).

If the update errors with `no usable server entries`, the section existed but every line was a comment, an unsupported prefix, or an info/premium row.

## 5. Stop using Configuration File → Download

That menu still replaces the whole profile. After migration it is only useful as a **backup of Nexitally's own file**, not as the active config.

## 6. Optional local replay before trusting a format change

If Nexitally's export shape changes, sanitize a copy (see [privacy.md](privacy.md)) and run:

```bash
node lab/run.js --explain /tmp/sanitized-nexitally.conf
```

Add a new fixture if the keep/drop decision is surprising. Do not commit the unsanitized file.

## Rollback

1. Set `opt-parser=false` or remove the `[server_remote]` line.
2. Optionally blank `resource_parser_url` if no other resource needs it.
3. If Nexitally publishes a server-only Quantumult X subscription, use that URL instead and delete this parser from `[general]`.
