# QuanX Resource Parsers

Personal Quantumult X resource parsers. Small scripts that run **inside the app** after Quantumult X downloads a private resource.

The first parser, `nexitally-node-parser.js`, turns Nexitally’s managed **full Quantumult X configuration** into a server-only `[server_remote]` body so a stable local profile is not overwritten on every refresh.

This repository is public and personal. It contains no subscription URL, account id, node password, or other private data.

## Contents

- [Nexitally node parser](#nexitally-node-parser)
- [Usage](#usage)
- [Why](#why)
- [Repository map](#repository-map)
- [Run the examples](#run-the-examples)
- [Compatibility](#compatibility)
- [Privacy](#privacy)

Longer notes live in [`docs/`](docs/README.md). Sanitized fixtures live in [`examples/`](examples/README.md).

## Nexitally node parser

`nexitally-node-parser.js` is a Quantumult X resource parser:

- reads the downloaded body from `$resource.content`;
- extracts the first `[server_local]` section;
- returns only Quantumult X server lines to `[server_remote]`;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` prefixes;
- drops comments, exact duplicate lines, `[Premium]` placeholders, and traffic / expiry text (`Traffic`, `Expire`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`);
- contains no subscription URL, account ID, node password, or other private data.

Quantumult X downloads the Nexitally URL itself. The parser only transforms the body.

Pipeline and regex details: [`docs/nexitally-parser.md`](docs/nexitally-parser.md).

## Usage

Add the parser URL to `[general]`. This repository’s canonical files are:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr is an equivalent CDN front for the same `main` file:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

A copy-paste fragment with an optional `resource-tag-regex` policy is in [`examples/local-profile-snippet.conf`](examples/local-profile-snippet.conf).

Keep the Nexitally URL only in your local configuration. Never commit it to this repository, a public Gist, or another public service.

After importing your stable Quantumult X profile, refresh **Server Resources → Nexitally** to update nodes. Your `[policy]`, `[filter_remote]`, and other local configuration sections remain unchanged.

Step-by-step personal workflow: [`docs/workflow.md`](docs/workflow.md). If a refresh fails: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. Using a resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription in the future, prefer the official server resource and remove this parser layer.

## Repository map

```text
nexitally-node-parser.js     # the script Quantumult X loads
docs/                        # API, pipeline, workflow, privacy
examples/
  run-parser.js              # Node stand-in for $resource / $done
  fixtures-manifest.json     # catalog of sanitized cases
  nexitally/*.conf           # fake full-config bodies
  local-profile-snippet.conf # local [general] + [server_remote] fragment
```

Official parser globals (`$resource`, `$done`, retry, `$parser`) are summarized in [`docs/resource-parser-api.md`](docs/resource-parser-api.md), from Quantumult X’s own sample parser.

## Run the examples

The fixtures are invented Quantumult X INI. They exist so a change to the keep / drop rules is visible without opening the app.

```bash
node examples/run-parser.js
node examples/run-parser.js --verbose
node examples/run-parser.js --only typical-full-config --verbose
```

`npm test` runs the same catalog. Node.js 18+ is enough; there are no runtime dependencies.

Do not point `--input` at a live download inside this clone. Redact first, keep the file outside git. See [`docs/privacy.md`](docs/privacy.md).

## Compatibility

Tested with Quantumult X configurations containing AnyTLS nodes. Requires a Quantumult X version that supports AnyTLS and resource parsers.

Version table and CDN notes: [`docs/compatibility.md`](docs/compatibility.md). Official server-line shapes the parser forwards: [`docs/qx-server-line-reference.md`](docs/qx-server-line-reference.md).

## Privacy

The parser is public. The resource it parses is not. Placeholder URLs in this tree are always `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` or `https://example.invalid/...`.

Adding another full-config extractor: [`docs/writing-a-parser.md`](docs/writing-a-parser.md).
