# QuanX Resource Parsers

Small, focused resource parsers for Quantumult X.

## Nexitally node parser

`nexitally-node-parser.js` converts Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts entries from `[server_local]`;
- returns only Quantumult X server lines to `[server_remote]`;
- supports AnyTLS and other common Quantumult X server formats;
- removes duplicate entries and excludes traffic/expiry information plus `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private data.

The Nexitally subscription is downloaded directly by Quantumult X. The parser runs in Quantumult X's resource-parser environment.

## Usage

Add the parser URL to `[general]`:

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

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. Using a resource parser turns the embedded `[server_local]` section into an independently refreshable `[server_remote]` resource.

If Nexitally provides an official server-only Quantumult X subscription in the future, prefer the official server resource and remove this parser layer.

## Compatibility

Tested with Quantumult X configurations containing AnyTLS nodes. Requires a Quantumult X version that supports AnyTLS and resource parsers.
