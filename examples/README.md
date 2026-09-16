# Personal examples

Sanitized Quantumult X inputs and the server lists `nexitally-node-parser.js` should emit. Every host is `example.com`, `apple.com`, `127.0.0.1`, or `192.168.1.1`. Every password is the official sample value `pwd` or the official sample UUID `23ad6b10-8d1a-40f7-8ad0-e3e35cd32291`. Nothing here is a subscription.

## Run the fixtures

From the repository root, with any modern Node:

```bash
node examples/run-fixtures.js
```

The helper loads `nexitally-node-parser.js` in a `vm` sandbox, injects `$resource` / `$done`, and compares each case in `manifest.json` to the file under `expected/` or to a documented error string.

## Layout

| Path | Role |
| --- | --- |
| `fixtures/` | Inputs that stand in for `$resource.content` |
| `expected/` | Successful parser `content` payloads (LF, no trailing section headers) |
| `manifest.json` | Case list for the runner |
| `run-fixtures.js` | Node harness (no network) |
| `local-profile.sample.conf` | How a personal profile attaches the parser |
| `policy-groups.sample.conf` | Local policy regexes that consume `tag=Nexitally` |
| `walkthrough.md` | Line-by-line reading of the full-config sample |

## Fixture catalog

| Id | Input | Outcome |
| --- | --- | --- |
| `nexitally-full-config` | Full provider-shaped `.conf` with quota rows, comments, duplicates, Premium, mixed protocols, unknown prefixes | Eight official-sample server lines |
| `crlf-and-bom` | Same keepers as `mixed-protocols`, UTF-8 BOM + CRLF | Same content as `mixed-protocols` |
| `mixed-protocols` | One line per allow-listed prefix, plus rejected aliases and URIs | Seven server lines |
| `server-local-at-eof` | `[server_local]` is the last section | Two server lines |
| `case-and-spacing` | `[Server_Local]` and `Name =` | Three lines, spacing preserved |
| `duplicates-and-comments` | Repeated lines and all three comment styles | Three unique lines |
| `whitespace-and-blank-lines` | Blank lines and a tab-only line | Two server lines |
| `exclusion-false-friends` | Valid prefixes whose tags contain `Traffic` / `Expire` / … | Only tags without those words |
| `missing-server-local` | No `[server_local]` header | Error: section was not found |
| `only-traffic-and-premium` | Header present, nothing connectable | Error: no usable server entries |
| `empty-server-local` | Empty section body | Error: no usable server entries |
| `server-local-header-only-no-newline` | Literal `[server_local]` with no trailing newline | Error: section was not found |
| `clash-yaml-not-qx` | Clash `proxies:` YAML | Error: section was not found |

## Local files that must not be committed

Add these names to a personal `.gitignore` if you keep device dumps beside the clone (the repository already ignores them):

```text
*.local.conf
secrets/
```

A filled-in copy of `local-profile.sample.conf` is a `.local.conf` file. Keep it on the device.

## Adding a case

1. Write a new `fixtures/<id>.conf` using only documentation hosts.
2. Run the parser once by adding a temporary `kind: "content"` entry, or call the runner after you add `expected/<id>.txt`.
3. For errors, set `"kind": "error"` and `"expectedError"` to one of the two stable parser strings.
4. Mention the case in this table and, if it changes behavior, in `docs/`.
