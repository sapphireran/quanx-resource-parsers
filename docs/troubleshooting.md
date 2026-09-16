# Troubleshooting

## The resource shows ` [server_local] section was not found`

Quantumult X fetched something that is not a managed full profile, or the header is malformed.

Check, in order:

1. The `[server_remote]` URL is the **full Quantumult X configuration** download, not a Clash / Surge / base64 node list.
2. The body actually contains a `[server_local]` line followed by a newline. The `header-no-newline` fixture fails on purpose.
3. The file is not empty. The `blank-content` fixture is the empty-body case.
4. Replay a redacted local copy: `node scripts/run-parser.js private/nexitally-latest.conf`.

## The resource shows `no usable server entries were found`

The section was found, but every line was filtered out.

Typical causes:

- Only comments or quota rows (see `comments-only`, `empty-section`)
- Only `[Premium]` / `Traffic` / `Expire` / `套餐` lines (see `duplicates-and-meta`, `exclusion-in-tag`)
- Only unsupported prefixes such as `hysteria2=` (see `unsupported-only`)
- A Quantumult X version that still understands the resource, while the provider file uses a prefix this parser does not list

Open the downloaded body and look at the first non-comment lines under `[server_local]`. If they start with `anytls=` or `shadowsocks=` and still vanish, search those lines for the exclusion keywords.

## Nodes refresh, but my policy / rewrite / MITM vanished

The full managed file was imported as a **profile**, not attached as a server resource. Restore the stable local profile and use `[server_remote]` as in [usage.md](usage.md).

## `opt-parser` appears on, but nothing changes

- Confirm `[general]` has exactly one `resource_parser_url` and that it points at `nexitally-node-parser.js`.
- Confirm the Nexitally line has `opt-parser=true`.
- Fully quit Quantumult X after the first parser-URL change.
- jsDelivr may still be serving an older `@main` for a few minutes. Pin a commit SHA if a parser edit must be visible immediately:

  ```text
  https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@<commit>/nexitally-node-parser.js
  ```

## AnyTLS nodes appear in the resource but fail to connect

The parser only forwards text. The app must be a build that implements AnyTLS (Quantumult X 1.5.6+). A successful parse is not a connectivity test.

## Duplicate-looking nodes remain

Dedup is exact-line. `tag=HK-01` and `tag=HK 01` are different lines. Rename collisions are left to Quantumult X.

## `#in=` / `#emoji=` parameters do nothing

Those belong to a general community parser, not this file. See [resource-parser-contract.md](resource-parser-contract.md).

## Local harness disagrees with the phone

The harness feeds the file bytes to the same script. If the phone differs, the downloaded body differs (redirect, UA, or a non-config HTML error page). Save the on-device body and compare it to `private/nexitally-latest.conf`.
