# 08 — Failure playbook

Symptoms are what Quantumult X shows. Causes are what this parser actually did.

## Refresh says `[server_local] section was not found`

| Likely cause | Check |
| --- | --- |
| The URL is a dashboard HTML page (login, payment, Cloudflare) | Save the resource once and look for `<!doctype` / `<html`. Workbook: `html-interstitial` |
| The URL is Clash YAML | Look for `proxies:` / `port:`. Workbook: `clash-yaml` |
| You pointed `[server_remote]` at an official server-only list that uses `[server_remote]` | That list does not need this parser. Workbook: `server-remote-only` |
| Header is `[ server_local ]` or glued to the first node | Workbook: `inner-spaced-header`, `glued-header` |
| The download is empty | Workbook: `empty-file` |

Fix the URL or stop using `opt-parser` on a server-only subscription. Do not add the live body to git.

## Refresh says `no usable server entries were found`

The section existed, but every line was a comment, an info row, a `[Premium]` placeholder, or an unsupported prefix.

| Likely cause | Check |
| --- | --- |
| Vendor only shipped traffic / expiry / premium rows | Workbook: `empty-usable`, `info-banners-en-zh` |
| Nodes use `wireguard` / `hysteria2` / URI shares | Workbook: `unsupported-families` |
| Every real tag contains `Reset` or `Traffic` | Workbook: `substring-reset-trap` |

If you need a new prefix, that is a parser change, not a profile change. Keep it personal; do not paste vendor samples into the patch.

## Refresh succeeds but nodes are missing

| Likely cause | Check |
| --- | --- |
| Nodes sit below `[Premium]` or `[policy]` | Those headers end the slice. Workbook: `premium-section-terminator`, `section-fence-filter-policy` |
| Second `[server_local]` block | Only the first counts. Workbook: `first-of-two-server-local` |
| Tag contains `Reset` / `Expire` / `套餐` / … | Substring filter. Workbook: `substring-reset-trap` |
| Duplicate lines after trim | Second copy is silent. Workbook: `duplicates-after-trim` |
| jsDelivr is serving an old parser | Switch `resource_parser_url` to raw.githubusercontent.com or wait |

## Refresh succeeds but policies / filters vanished

You re-imported the vendor **full configuration**. The parser never writes those sections. Restore the stable personal profile from iCloud / your backup and refresh **Server Resources** only.

## Parser URL 404

`resource_parser_url` still points at `pang990801/quanx-resource-parsers` on a deleted tree, or jsDelivr has not pulled `main`. Use `sapphireran/quanx-resource-parsers` as in [06 — Device wiring](06-device-wiring.md).

## Local workbook fails, device works (or the reverse)

The sandbox runs the same file. A mismatch usually means the case snapshot is wrong, not that Quantumult X has a second parser. Re-read the case, then `npm run trace -- <id>`.
