# QuanX Resource Parsers

Small, focused **personal** resource parsers for Quantumult X.

This repository is not a general subscription converter. Each script handles
one input format that a local Quantumult X profile actually needs. The first
parser extracts usable servers from a Nexitally managed full configuration.

There is no company configuration here. Do not add work profiles, internal
hosts, or private subscription URLs.

## Contents

| Path | What it is |
| --- | --- |
| [nexitally-node-parser.js](nexitally-node-parser.js) | Quantumult X resource parser. Public script, no secrets. |
| [docs/](docs/) | Parser API, keep/drop rules, privacy, troubleshooting. |
| [examples/](examples/) | Fictional full-configuration fixtures and expected snippets. |
| [tools/run-examples.js](tools/run-examples.js) | Local Node runner that checks those fixtures. |

## Nexitally node parser

`nexitally-node-parser.js` converts Nexitally's managed **full Quantumult X
configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- supports AnyTLS and other common Quantumult X server formats;
- removes duplicate entries and excludes traffic/expiry information plus
  `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private
  data.

The Nexitally subscription is downloaded directly by Quantumult X. The
parser runs in Quantumult X's resource-parser environment.

The keep/drop rules are spelled out in
[docs/nexitally-parser.md](docs/nexitally-parser.md). The same rules are
encoded as fixtures under [examples/nexitally/](examples/nexitally/).

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a
server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the Nexitally URL only in your local configuration. Never commit it to
this repository, a public Gist, or another public service. See
[docs/privacy.md](docs/privacy.md).

A copy-paste reminder lives at
[examples/nexitally/usage.quantumult.conf](examples/nexitally/usage.quantumult.conf).

After importing your stable Quantumult X profile, refresh **Server
Resources → Nexitally** to update nodes. Your `[policy]`, `[filter_remote]`,
and other local configuration sections remain unchanged.

## Why

Nexitally distributes a complete Quantumult X configuration through
**Configuration File → Download**. Re-downloading it replaces the whole
active profile. Using a resource parser turns the embedded `[server_local]`
section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription in
the future, prefer the official server resource and remove this parser
layer.

## Compatibility

Tested with Quantumult X configurations containing AnyTLS nodes. Requires a
Quantumult X version that supports AnyTLS and resource parsers. Official
Quantumult X samples document AnyTLS around 1.5.6.

The parser script uses conservative ES5-style JavaScript so it stays inside
the Quantumult X resource-parser runtime.

## Local examples

The files under `examples/` are fictional. They use `example.com`, TEST-NET
addresses, and the official-sample password `pwd`.

```bash
node tools/run-examples.js
```

That command evaluates the committed parser with mocked `$resource` /
`$done` objects. It checks section extraction, comment stripping,
placeholder removal, deduplication, and error strings. It does not download
a subscription and it does not talk to Quantumult X.

## Documentation

- [docs/quantumult-x-parser-api.md](docs/quantumult-x-parser-api.md) —
  `$resource`, `$done`, and what a server parser may return.
- [docs/nexitally-parser.md](docs/nexitally-parser.md) — processing steps
  and keep/drop rules.
- [docs/troubleshooting.md](docs/troubleshooting.md) — refresh failures and
  setup mistakes.
- [docs/privacy.md](docs/privacy.md) — what must never be committed.
- [docs/writing-a-parser.md](docs/writing-a-parser.md) — how to add another
  **personal** parser to this repository.
