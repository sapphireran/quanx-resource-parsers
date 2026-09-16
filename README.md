# QuanX Resource Parsers

Personal Quantumult X resource parsers. Not a company repository.

The only production script today is `nexitally-node-parser.js`. It turns Nexitally's managed **full Quantumult X configuration** into a server-only resource:

- extracts `[server_local]`;
- returns Quantumult X server lines to `[server_remote]`;
- keeps AnyTLS, Shadowsocks, VMess, VLESS, Trojan, HTTP, and SOCKS5 prefixes;
- drops duplicates, traffic / expiry chrome, and `[Premium]` placeholders;
- contains no subscription URL, account ID, node password, or other private data.

Quantumult X downloads the Nexitally URL. The parser only sees that response body.

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add your **private** Nexitally Quantumult X full-configuration URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the device. Never commit it here.

After importing a stable personal profile, refresh **Server Resources → Nexitally**. `[policy]`, `[filter_remote]`, and the rest of the local profile stay put.

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the active profile. A resource parser makes `[server_local]` independently refreshable.

If Nexitally ships an official server-only Quantumult X subscription, use that and delete this parser layer.

## Docs and examples

| Path | What it is |
| --- | --- |
| [`notes/`](notes/README.md) | Personal field notes: runtime, source walkthrough, keep/drop catalog, device wiring, failure playbook |
| [`workbook/`](workbook/README.md) | 34 sanitized cases, a `$resource` / `$done` harness, and [`workbook/book.html`](workbook/book.html) |
| [`notes/zh-速查.md`](notes/zh-速查.md) | Short Chinese index |

```bash
npm test
```

Fixtures use `*.example.invalid`, `192.0.2.0/24`, `2001:db8::/32`, `example-password`, and `00000000-0000-4000-8000-000000000000` only.

## Compatibility

Tested with Quantumult X configurations that contain AnyTLS nodes. Requires a Quantumult X build that supports AnyTLS and resource parsers.
