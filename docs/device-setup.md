# Device setup

These steps assume a stable local Quantumult X profile already exists. The goal is to refresh Nexitally **nodes only**.

## 1. Publish or pin the parser URL

Until a release tag exists, the script on `main` is:

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr is an optional cache:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

If Quantumult X says there is no custom parser, save the profile, leave the app, and reopen it so `[general]` is reloaded.

## 2. Add the private Nexitally URL as a server resource

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

| Field | Why |
| --- | --- |
| Private URL | Downloaded by Quantumult X. Never committed here. |
| `tag=Nexitally` | Name shown in Server Resources. Use the same tag in policy regexes. |
| `opt-parser=true` | Sends the body through `resource_parser_url`. |
| `update-interval=21600` | Six hours. Raise or lower as needed; `=-1` disables auto sync. |
| `enabled=true` | Resource is active. |

## 3. Point policy groups at the resource tag

Nexitally's downloaded `[policy]` section is discarded. Keep local groups and select refreshed nodes by tag:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, img-url=https://raw.githubusercontent.com/crossutility/Quantumult-X/master/quantumult-x.png
```

`available`, `round-robin`, `dest-hash`, and `url-latency-benchmark` accept the same `resource-tag-regex`.

## 4. Refresh

After importing the local profile, open **Server Resources → Nexitally** and update. A successful parse replaces the resource's node list. Filters and rewrites do not change.

## 5. Keep the rest of the profile local

A minimal skeleton that stays under local control is in [`examples/snippets/local-profile.skeleton.conf`](../examples/snippets/local-profile.skeleton.conf). Copy the shape, not the placeholder URL.
