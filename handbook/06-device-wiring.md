# 06 — Device wiring

Keep the private Nexitally URL on the phone. The snippets under `studio/profiles/` are the public shape of that profile.

## 1. Point `[general]` at this parser

Quantumult X allows **one** `resource_parser_url`. Use the current personal owner:

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub is the fallback when jsDelivr is stale:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

After changing the URL: refresh resources, force-quit Quantumult X, reopen, then refresh **Server Resources** again. The in-app cache can keep an old parser for one cycle.

## 2. Add the private URL as a server resource

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

| Field | Why |
| --- | --- |
| `YOUR_PRIVATE_…` | Placeholder only. Paste the real Configuration-File URL on the device. |
| `tag=Nexitally` | Name shown in Server Resources. Policy regexes can match this tag. |
| `opt-parser=true` | Runs `resource_parser_url` on this resource. |
| `update-interval=21600` | Six hours. Use `-1` to disable auto refresh. |

## 3. Keep local policy

Do **not** import the vendor `[policy]` section. Point existing groups at the resource tag:

```ini
[policy]
static = Proxy, resource-tag-regex=^Nexitally, server-tag-regex=., img-url=https://raw.githubusercontent.com/crossutility/Quantumult-X/master/quantumult-x.png
available = Nexitally-Auto, resource-tag-regex=^Nexitally, server-tag-regex=^(HK|SG|JP|US)
```

`studio/profiles/keep-local-policy.snippet.conf` is the copy-paste form.

## 4. Refresh path

1. Import or edit the **stable** local profile once.
2. Quantumult X → Server Resources → Nexitally → update.
3. Confirm the node list is servers only (no Traffic / 流量 rows).
4. Confirm `[filter_remote]` and `[rewrite_local]` are still yours.

If the resource shows the full vendor profile, `opt-parser` is off or the parser URL did not load.

## iCloud vs raw URL

Either host the parser from this GitHub repo (above) or copy `nexitally-node-parser.js` into `iCloud Drive / Quantumult X / Scripts` and point `resource_parser_url` at that local script. Local files still do not need the subscription URL inside the script.
