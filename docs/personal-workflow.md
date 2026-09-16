# Personal workflow

A local-only sequence for using `nexitally-node-parser.js` without letting a managed full configuration overwrite a hand-maintained Quantumult X profile.

This is a personal runbook. It is not a Nexitally support document and it does not replace the official Quantumult X sample configuration.

## One-time: keep a stable local profile

1. Build or import the profile you actually want: `[general]`, `[dns]`, `[policy]`, `[filter_remote]`, `[rewrite_remote]`, `[mitm]`, and any local servers that are not Nexitally.
2. Export or back up that profile **on the device**. Do not copy it into this git repository if it contains the private URL.
3. Confirm you can restore that backup. The whole point of the parser is that a future Nexitally "Download configuration" click is optional.

## One-time: attach the parser

In `[general]`, set the public parser URL (no secrets):

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

In `[server_remote]`, add the private configuration-download URL that only exists on the device:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Do not commit the filled-in line.

Optional policy groups that select whatever that resource imports:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=., img-url=https://example.com/nexitally.png
available = Nexitally-Auto, resource-tag-regex=^Nexitally, server-tag-regex=., check-interval=600
url-latency-benchmark = Nexitally-Latency, resource-tag-regex=^Nexitally, server-tag-regex=., check-interval=600, tolerance=100
```

Wire those groups into your existing `PROXY` / region / streaming policies. Leave filter resources on whatever lists you already trust. The Nexitally full configuration's `[filter_remote]` is discarded by the parser and should stay discarded.

## Recurring: refresh nodes only

1. Open **Server Resources**.
2. Refresh the `Nexitally` resource.
3. Confirm the node count looks plausible (not zero, not "one node per configuration section").
4. Run a URL latency test on `Nexitally-Auto` or `Nexitally-Latency` if you use those groups.

You should **not** need to:

- re-download the official full configuration
- re-paste `[server_local]` by hand
- reset MITM certificates
- re-add filter or rewrite resources

## When Nexitally changes node tags

Policy regexes are local. If a region prefix changes (`HongKong` → `HK`), update `server-tag-regex` in the local profile. The parser does not rename tags, so a regex you wrote last year can go stale without the extractor being "broken."

## When you are tempted to click Download again

Don't, unless you are discarding the personal profile on purpose.

If you do download it (curiosity, a friend asked, a provider ticket), treat the result as untrusted:

1. Do not save it over the active profile.
2. Do not paste `[server_local]` into this repository.
3. If the format changed (new prefix, new quota-row wording), rebuild a sanitized fixture and extend the parser.

## Local debugging without the live URL

1. Clone this repository on a machine with Node.
2. Run `node examples/run-fixtures.js`.
3. If a new shape appears in the wild, write a fixture that uses `example.com` only.
4. Keep the live URL on the phone.

Quantumult X can also parse a file dropped into its Profiles directory (`nexitally-full.conf, tag=Nexitally, opt-parser=true`). Only do that with a copy you have already stripped of real hosts and passwords. The committed fixtures are safer because they never contained real data.

## Suggested local filenames (not in git)

| File | Purpose |
| --- | --- |
| `~/Quantumult/Profiles/personal.conf` | Active profile with the private URL |
| `~/Quantumult/Backups/personal-YYYYMMDD.conf` | Restore point |
| `secrets/nexitally.url` | Optional offline reminder of the URL; gitignored |

See `examples/README.md` for the ignore patterns this project expects.

## Relationship to other personal parsers

This repository can grow more personal extractors (another provider that only ships a full configuration, or a local snippet cleaner). Each extractor should:

- live as its own `.js` file
- have its own `examples/fixtures/<name>-*.conf`
- refuse to embed URLs
- be documented in `docs/` before it is pointed at from README

Do not merge two providers into one regex "for convenience." A missed section header in provider B should not change provider A's output.
