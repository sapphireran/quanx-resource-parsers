# Troubleshooting

The parser can say only two things. Start with which string you actually got.

## `Nexitally parser: [server_local] section was not found.`

The body, after BOM-strip and CRLF normalization, never matched the section regex.

| Likely cause | What to check | Fixture that locks it |
| --- | --- | --- |
| The panel served Clash / Surge / a node URI list | First bytes are `proxies:` or `vmess://`, not `[server_local]` | `clash-yaml`, `already-server-only` |
| Captive portal or HTML error | First bytes are `<!DOCTYPE` / `<html` | `html-interstitial` |
| You pointed `[server_remote]` at a server-only URL that has no INI header | Add a `[server_local]` wrapper, or stop using this parser | `already-server-only` |
| Header is commented | `; [server_local]` does not count | `commented-section-name` (the *uncommented* header still works) |
| Spaces inside the brackets | `[ server_local ]` | `inner-spaced-header` |
| No newline after `]` | `[server_local]anytls=...` | `glued-header`, `header-no-newline` |
| CR-only line endings | Classic Mac save, or a broken proxy | `cr-only-newlines` |
| Empty download | Zero-length body | `empty-file` |

What not to do: **Configuration File → Download** "to debug." That overwrites the profile you are trying to protect.

## `Nexitally parser: no usable server entries were found.`

A `[server_local]` section was found, and the sieve kept nothing.

| Likely cause | What to check | Fixture |
| --- | --- | --- |
| Only traffic / expiry rows | `Traffic`, `Expire`, `流量`, `套餐`, … | `info-only` |
| Only `[Premium]` stubs | Placeholder nodes | `premium-placeholders` |
| Only unsupported schemes | `https=`, `ss=`, `hysteria2=` | `unsupported-only` |
| Only comments or blanks | Accidental empty section | `empty-usable` |
| Every real tag hit a false friend | `Preset`, `unexpired` | `false-friend-preset-unexpired` |

If *some* nodes appear but a region is missing, look at that region's tags for `Reset` / `Expire` / `Premium` substrings before assuming Nexitally dropped the region.

## The resource imports a huge broken list

`opt-parser=true` is missing. Quantumult X ingested the managed profile as if it were server lines. Restore yesterday's exported profile, then add the flag.

## The resource updates but policies are empty

The parser does not emit `[policy]`. Wire `resource-tag-regex=^Nexitally` (or your tag) in the local profile. See [06-device-setup.md](06-device-setup.md).

## Hash filters (`#in=香港`) do nothing

This script ignores `$resource.link`. Filter in `[policy]`, or use a different parser for that resource.

## I need to see what the sieve did

Save the managed body **outside git**, then:

```bash
node scripts/replay.js /path/to/private-download.conf --annotate
```

Read the reason column. Do not commit the file.
