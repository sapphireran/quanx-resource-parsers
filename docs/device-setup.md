# Personal device setup

A checklist for attaching `nexitally-node-parser.js` to a Quantumult X profile that you already like. It does not replace Nexitally's own dashboard help.

## 1. Keep the current profile

Export or iCloud-sync the working Quantumult X configuration before changing `[general]` or `[server_remote]`. The parser is meant to stop a full Nexitally download from overwriting that profile. It cannot undo an overwrite that already happened.

## 2. Point `[general]` at the parser

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

That jsDelivr path is the original GitHub owner slug (`pang990801/quanx-resource-parsers`). This clone lives at `sapphireran/quanx-resource-parsers`. Either of these is a reasonable fallback if the CDN is stale:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Quantumult X accepts one `resource_parser_url`. If another parser is already there, decide which resources still need it before replacing the line.

## 3. Add the private Nexitally URL under `[server_remote]`

On the Nexitally site, copy **Configuration File → Download** (the full Quantumult X profile), not a Clash or Surge link.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Without it, Quantumult X may try to ingest the entire managed profile as a server list.

Leave `[policy]`, `[filter_remote]`, `[filter_local]`, and `[rewrite_remote]` as they already are. `examples/nexitally/local-profile.conf` is a sketch of that split.

## 4. Refresh once

In Quantumult X: **Server Resources → Nexitally → update**.

Expected result:

- The Nexitally resource lists AnyTLS (and any other kept) nodes.
- Traffic / expiry banners and `[Premium]` rows are absent.
- Personal policy groups still point at `resource-tag-regex=^Nexitally` or whatever they used before.
- Filter and rewrite resources are unchanged.

## 5. Confirm nothing private left the device

The parser URL is public. The Nexitally URL is not. It should appear only on the phone (and maybe a private backup). See [privacy.md](privacy.md).

## 6. Optional desktop check

If a refresh looks wrong, save the downloaded body on the desktop (still do not commit it) and run:

```bash
node scripts/run-nexitally-parser.js /path/to/local-copy.conf
```

Compare that output to the fixture set under `examples/nexitally/`. If the desktop result is a clean server list and the app is empty, the app did not receive the same body.

## 7. When to stop using the parser

Remove `opt-parser=true` and this `resource_parser_url` once Nexitally offers a server-only Quantumult X subscription, or once you no longer use Nexitally nodes.
