# Nexitally node parser

`nexitally-node-parser.js` turns a Nexitally **full Quantumult X
configuration** into a server-only resource.

Nexitally's dashboard offers *Configuration File → Download*. That file is a
complete profile. Importing it again overwrites `[policy]`, `[filter_*]`,
rewrite, and MITM. The workaround: keep a stable personal profile, put the
Nexitally download URL on `[server_remote]`, and let this parser lift
`[server_local]` out of the download.

If Nexitally later publishes an official server-only Quantumult X
subscription, delete the parser line and use that URL directly.

## Pipeline

```
Quantumult X GET (private URL)
        │
        ▼
$resource.content          full .conf text, maybe BOM + CRLF
        │
        ▼
strip BOM, normalize \r\n
        │
        ▼
extract [server_local] … next [section]
        │
        ▼
per line: trim → drop blanks/comments
        │
        ▼
keep supported prefixes, drop placeholders, drop duplicates
        │
        ▼
$done({ content }) or $done({ error })
```

The script is a single file on purpose. Quantumult X fetches it from
jsDelivr / GitHub and evaluates it as-is.

## Section extractor

```js
/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
```

Properties that matter:

- `[server_local]` may be preceded by other sections or sit at byte 0.
- Surrounding whitespace on the header is tolerated.
- The body stops at the next `[name]` header **or** end of file.
- The match is case-insensitive (`[Server_Local]` would still work).

If the header is missing, the parser returns:

```text
Nexitally parser: [server_local] section was not found.
```

Covered by `examples/nexitally/cases/missing-server-local`.

## Line filter

A line is kept when all of the following hold:

1. Non-empty after trim.
2. Not a comment (`#`, `;`, `//`).
3. Matches a supported prefix (see [server line reference](quanx-server-line-reference.md)).
4. Does not match the placeholder / traffic regex.
5. Has not already been seen (exact string, after trim).

If the section exists but every line fails the filter:

```text
Nexitally parser: no usable server entries were found.
```

Covered by `empty-server-local` and `unsupported-only`.

## What is not rewritten

The parser does not:

- rename `tag=` values
- force `udp-relay` or `tls-verification`
- sort regions
- collapse `HK-Central-01` / `HK-Central-02` into a policy
- fetch geo lists or emoji flags

Policy groups stay in the personal profile. That is the whole point of not
importing the managed file.

## Device setup

1. Import (or keep) a stable Quantumult X profile that already has the
   desired `[policy]`, `[filter_local]`, and rewrite rules.
2. Set `resource_parser_url` in `[general]` to this file on jsDelivr.
3. Add one `[server_remote]` line with the **private** Nexitally full-config
   URL, `opt-parser=true`, and a tag such as `Nexitally`.
4. Refresh **Server Resources → Nexitally**.
5. Point a `static` or `available` policy at that tag, or at individual
   node names if the profile lists them.

A copy-paste skeleton lives in
[`examples/nexitally/quanx-profile-snippet.conf`](../examples/nexitally/quanx-profile-snippet.conf).

jsDelivr URL used in that snippet:

```text
https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Older notes pointed at `pang990801/quanx-resource-parsers`. This repository
is `sapphireran/quanx-resource-parsers`. Use the current owner in new
profiles; a stale CDN path will 404 after a rename.

## Local check

```bash
node examples/scripts/run-example.js typical-full-config
node examples/scripts/verify-examples.js
```

The runner never opens the private URL. It only evaluates the parser against
files already in `examples/`.
