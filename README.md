# QuanX Resource Parsers

Personal Quantumult X resource parsers. The scripts in this repository are written for a single-device setup and contain no company code, subscription URL, account id, or node credential.

## Nexitally node parser

`nexitally-node-parser.js` turns Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- keeps AnyTLS plus the other schemes Quantumult X documents for `[server_local]`;
- drops duplicate lines, traffic / expiry banners, and `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private data.

Quantumult X downloads the Nexitally URL. The parser runs on the device against that response.

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the Nexitally URL only in the local configuration. Never commit it to this repository, a public Gist, or another public service.

After importing a stable Quantumult X profile, refresh **Server Resources → Nexitally** to update nodes. `[policy]`, `[filter_remote]`, and other local sections stay as they are.

A longer personal-profile sketch lives at `examples/nexitally/local-profile.conf`.

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. A resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription later, prefer that resource and remove this parser layer.

## Compatibility

Tested with Quantumult X configurations that contain AnyTLS nodes. Requires a Quantumult X version that supports AnyTLS and resource parsers.

## Docs and examples

| Path | Contents |
| --- | --- |
| [docs/](docs/README.md) | Parser behavior, `$resource` / `$done` notes, server-line shapes, privacy, troubleshooting |
| [examples/](examples/README.md) | Sanitized fixtures and a local profile sketch |
| [docs/local-testing.md](docs/local-testing.md) | Desktop harness that runs the Quantumult X script in Node |

```bash
npm test
node scripts/run-nexitally-parser.js examples/nexitally/typical-full-config.conf
```

The fixtures use `*.example.invalid` hosts and official-sample passwords. Do not replace them with a live download.

## Privacy

See [docs/privacy.md](docs/privacy.md). The short version: this repository is public. Only fictional nodes belong in `examples/`.
