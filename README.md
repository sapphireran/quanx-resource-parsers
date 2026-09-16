# QuanX Resource Parsers

Personal Quantumult X resource parsers. The first (and so far only) production script turns a Nexitally **full configuration** download into a server-only `[server_remote]` resource.

This repository is a public personal project. It is not a company codebase and it does not ship subscription URLs, account ids, or node passwords.

## Contents

| Path | Role |
| --- | --- |
| `nexitally-node-parser.js` | Parser Quantumult X runs on the device |
| [`docs/`](docs/) | Workflow, contract, safety, troubleshooting |
| [`examples/`](examples/) | Synthetic fixtures and profile snippets |
| [`scripts/`](scripts/) | Local `$resource` / `$done` runner and fixture checker |

## Nexitally node parser

`nexitally-node-parser.js` converts Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- supports AnyTLS and other common Quantumult X server formats;
- removes duplicate entries and excludes traffic/expiry information plus `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private data.

The Nexitally subscription is downloaded directly by Quantumult X. The parser runs in Quantumult X's resource-parser environment.

The keep / drop rules are spelled out in [`docs/parser-contract.md`](docs/parser-contract.md). The synthetic file that exercises the happy path is [`examples/nexitally/fixtures/happy-path.conf`](examples/nexitally/fixtures/happy-path.conf).

## Usage

Add the parser URL to `[general]`. Prefer the current repository:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr mirrors of the same file:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the Nexitally URL only in your local configuration. Never commit it to this repository, a public Gist, or another public service.

After importing your stable Quantumult X profile, refresh **Server Resources → Nexitally** to update nodes. Your `[policy]`, `[filter_remote]`, and other local configuration sections remain unchanged.

Ready-to-copy fragments live in [`examples/profile-snippets/`](examples/profile-snippets/). The longer setup narrative is [`docs/nexitally-workflow.md`](docs/nexitally-workflow.md).

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. Using a resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription in the future, prefer the official server resource and remove this parser layer.

## Local examples

The `examples/` tree is reserved example data (`example.com`, `example-password`). It is not a Nexitally export.

```bash
npm test
```

That runs `node scripts/check-examples.js`, which loads every `examples/*/manifest.json` and compares `$done({content})` / `$done({error})` to the fixtures.

Parse one file by hand:

```bash
node scripts/run-parser.js \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/happy-path.conf
```

See [`docs/local-verification.md`](docs/local-verification.md) and [`examples/README.md`](examples/README.md).

`examples/generic-server-local/` is a teaching parser that extracts `[server_local]` **without** the Nexitally exclusions. Do not point a daily profile at it.

## Compatibility

Tested with Quantumult X configurations containing AnyTLS nodes. Requires a Quantumult X version that supports AnyTLS and resource parsers.

## Safety

Parser scripts and fixtures must stay free of live URLs and credentials. Read [`docs/safety.md`](docs/safety.md) before adding files or pasting a refresh error into an issue.

## Docs index

- [Quantumult X resource parsers](docs/quantumult-x-resource-parsers.md)
- [Personal Nexitally workflow](docs/nexitally-workflow.md)
- [Nexitally parser contract](docs/parser-contract.md)
- [Local verification](docs/local-verification.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Safety](docs/safety.md)
- [Writing another personal parser](docs/writing-a-parser.md)
