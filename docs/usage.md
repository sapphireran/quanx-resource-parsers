# Usage

Goal: keep a **stable local Quantumult X profile**, and refresh only Nexitally nodes.

## 1. Keep the private download URL on the device

Nexitally's managed Quantumult X file is fetched by Quantumult X. Copy that URL from the provider dashboard. Do not put it in this repository, a public Gist, or a screenshot that might be committed.

A one-time import of the full file is a reasonable way to seed `[server_remote]` if the URL is awkward to copy. After that, stop re-downloading the full profile as the update path.

## 2. Point `[general]` at this parser

Only one `resource_parser_url` is allowed. If another general-purpose parser is already installed and still needed for Clash or Surge lists, this Nexitally workflow will conflict. In that case keep the general parser and do not use this file until the profile can isolate the Nexitally resource.

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub also works:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

An older jsDelivr path under `pang990801/quanx-resource-parsers` may still resolve if that clone stays published. Prefer the `sapphireran` URL above for this repository.

After editing `[general]`, refresh resources and fully restart Quantumult X if the app still says there is no custom parser.

## 3. Attach the download URL as a server resource

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

| Parameter | Why it is set |
| --- | --- |
| `tag=Nexitally` | Name shown in the app; policy groups can match it with `resource-tag-regex` |
| `opt-parser=true` | Run `resource_parser_url` on this resource |
| `update-interval=21600` | Refresh every six hours. Use a negative value to disable auto sync |
| `enabled=true` | Load the resource |

Do not append community converter parameters (`#emoji=1&in=...`) unless `resource_parser_url` is a parser that understands them.

## 4. Bind policy groups to the resource tag

A static group that lists `HK-01, JP-01` by name goes stale when Nexitally renames nodes. Prefer a regex on the resource tag:

```ini
[policy]
static = Proxy, resource-tag-regex=^Nexitally, img-url=https://example.com/proxy.png
```

See [`examples/profiles/stable-profile-skeleton.conf`](../examples/profiles/stable-profile-skeleton.conf).

## 5. Refresh only the server resource

In the app: **Server Resources → Nexitally → update**. `[policy]`, `[filter_remote]`, and local rewrite/MITM sections stay as they are in the stable profile.

## 6. Optional local check before trusting a new parser revision

Save a redacted copy of a download body under `private/` and run:

```bash
node scripts/run-parser.js private/nexitally-latest.conf
```

Confirm the printed lines are only servers, with no traffic rows and no `[filter_local]` leftovers.

## Sample snippets

- [`examples/profiles/server-remote-snippet.conf`](../examples/profiles/server-remote-snippet.conf) — minimum `[general]` + `[server_remote]`
- [`examples/profiles/stable-profile-skeleton.conf`](../examples/profiles/stable-profile-skeleton.conf) — longer local profile shape
- [`examples/walkthrough.md`](../examples/walkthrough.md) — fixture-based walkthrough
