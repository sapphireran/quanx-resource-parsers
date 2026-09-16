# Examples

Synthetic Quantumult X files for reading and for the desktop runner. None of these files is a live subscription.

## Files

| Path | What it is |
| --- | --- |
| [parser-template.js](parser-template.js) | Skeleton for another personal parser |
| [local-profile.snippet.conf](local-profile.snippet.conf) | How a stable local profile attaches the Nexitally parser |
| [server-line-reference.md](server-line-reference.md) | Server prefixes this repository cares about |
| [fixtures/](fixtures/) | Input configurations and expected parser results |

## Fixture index

| Case | Expected result |
| --- | --- |
| `typical-full-config` | AnyTLS + mixed live nodes; traffic and `[Premium]` rows removed |
| `mixed-protocols` | One kept line per supported prefix |
| `comments-duplicates-meta` | Comments, exact duplicates, and metadata rows dropped |
| `server-local-at-eof` | `[server_local]` with no following section still parses |
| `crlf-bom` | Leading BOM and CRLF newlines still parse |
| `section-header-case` | `[Server_Local]` is accepted |
| `missing-server-local` | Error: section not found |
| `empty-server-local` | Error: no usable servers |
| `already-server-only` | Error: a server-only snippet is not this parser's input |

## Run every fixture

From the repository root:

```bash
node scripts/run-nexitally-parser.js
```

The process exits `0` when every fixture matches its expected file. It prints a short table:

```
ok    typical-full-config
ok    mixed-protocols
...
```

## Run one file

```bash
node scripts/run-nexitally-parser.js examples/fixtures/typical-full-config.input.conf
```

Stdout is the parsed server list, or a `error:` line on failure. This is the same `$done({ content })` / `$done({ error })` pair Quantumult X receives.

## How fixtures are named

The runner pairs files by stem:

```
<stem>.input.conf
<stem>.expected.txt           # $done({ content })
<stem>.expected-error.txt     # $done({ error })
```

A stem must have exactly one expected file. Adding a case is: write the input, run the parser once, save the output as the expected file, then re-run the suite.

## What these examples are not

- They are not a Nexitally account.
- They are not an official Quantumult X profile.
- They are not Clash or Surge conversions.
- Passwords and UUIDs are documentation values from the official sample configuration, or obvious placeholders such as `pwd`.
