# Device setup (personal Quantumult X)

Do this on the phone that already has a **stable** profile you do not want overwritten. Do not paste a live Nexitally URL into this repository, a gist, or a screenshot you will commit.

## 1. Keep a copy of the current profile

Quantumult X → **Settings → Configuration File → Export**. Store that export somewhere that is not this git checkout. If the next steps go wrong, import that export and stop.

## 2. Point `[general]` at this parser

Edit the local configuration. Under `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

A jsDelivr mirror of the same path is fine if raw GitHub is slow:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

One `resource_parser_url` is global. If you already use a general-purpose parser (KOP-XIAO and similar), you cannot run both as the single global parser. Options:

- Use this script only while Nexitally is the resource that needs `opt-parser=true`, and accept that other resources will also hit this script. This script returns an error on non-`[server_local]` bodies, so a Clash subscription would fail instead of converting.
- Or host a tiny dispatcher later (see [09-adding-another-parser.md](09-adding-another-parser.md)). This repo does not ship one yet.

## 3. Add the server resource, not the configuration download

In Nexitally's panel, copy the **Quantumult X full-configuration** URL. That URL stays on the device.

In the local profile:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. `update-interval=21600` is six hours; pick any positive number you like. A negative interval disables auto refresh.

Do **not** use **Configuration File → Download** for daily updates. That path still replaces the whole profile.

## 4. Refresh only the resource

Quantumult X → **Server Resources → Nexitally → update**.

Expected: a list of AnyTLS (and any other kept) nodes. Unexpected: one of the two parser error strings. Read [08-troubleshooting.md](08-troubleshooting.md) before downloading a managed profile "just to see."

## 5. Point your existing policies at the new tag

Your `[policy]` lines should keep using `resource-tag-regex` / `server-tag-regex` the way they already do. A typical personal pattern:

```ini
[policy]
static = PROXY, resource-tag-regex=^Nexitally, server-tag-regex=^.*, img-url=https://raw.githubusercontent.com/crossutility/Quantumult-X/master/quantumult-x.png
```

Adjust the regex to the tags you actually want. The parser does not invent policy groups.

## 6. Confirm the rest of the profile is still yours

After the first successful refresh, open Filter / Rewrite / MitM and check that yesterday's entries are still there. If they vanished, the managed profile was imported as a configuration, not as a server resource. Restore the export from step 1.

A complete local snippet (still with the placeholder URL) lives at [`examples/profile/stable-local.snippet.conf`](../examples/profile/stable-local.snippet.conf).
