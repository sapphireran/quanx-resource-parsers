# Privacy and what never lands in this repository

This repository is public. Treat every commit as if a stranger will clone it. The parser is only useful if the private Nexitally URL stays out of git, Gists, screenshots, and issue text.

## The parser must stay empty of secrets

`nexitally-node-parser.js` is allowed to contain:

- section-name matching (`[server_local]`)
- protocol allow-lists (`anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`)
- generic exclusion keywords (`Traffic`, `Expire`, `[Premium]`, `流量`, `到期`, and similar)
- error strings that do not name an account

It must never contain:

- a subscription or configuration-download URL
- an account id, token, or cookie
- a node host that is not a documentation placeholder
- a node password, UUID, Reality public key, or TLS pin from a live service
- a Quantumult device ID
- a personal Apple ID, email, or billing identifier

The live Nexitally URL is downloaded by Quantumult X on the device. The parser only sees the response body **after** that download, and only in memory on that device.

## What may appear in docs and examples

Allowed:

- `example.com`, `apple.com`, `192.168.1.1`, `203.0.113.10` (documentation / TEST-NET)
- Official Quantumult X sample secrets such as `password=pwd` and the sample VMess UUID `23ad6b10-8d1a-40f7-8ad0-e3e35cd32291` from [sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf)
- Placeholder resource URLs such as `https://example.invalid/nexitally-full.conf`
- The public parser URLs for **this** GitHub repository

Not allowed:

- A copied `[server_local]` block from a real refresh
- A redaction that still leaves a unique hostname, path, or token fragment
- A screenshot of Quantumult X that includes the subscription row

If a fixture would only be accurate with a real line, invent a new `example.com` line instead of redacting a real one.

## Local profile rules

The private URL belongs in one place: the Quantumult X configuration on your device (and an optional encrypted backup you do not commit).

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Do not replace the placeholder in this repository, even in a private branch you might later push by mistake.

iCloud / Files copies of `Quantumult X/Profiles/*.conf` can contain the same URL. Keep those files out of this working tree. A `.gitignore` entry for `*.local.conf` and `secrets/` is listed in the examples README so a future dump does not get added.

## Issue and PR hygiene

When something fails:

1. Reproduce against `examples/fixtures/` first.
2. If you need a new fixture, rewrite the failing input with `example.com` hosts and sample passwords.
3. Paste the **parser error string** (`Nexitally parser: ...`) and the fixture name, not the subscription body.

Never paste `$resource.content` from a live refresh into a GitHub issue, a PR comment, or a chat log that might be archived.

## Why the parser does not log the URL

`$resource.link` is available. Using it in an error message such as `failed to parse https://...` would write the private URL into Quantumult X logs and, if copied, into this repository. Errors stay generic:

- `Nexitally parser: [server_local] section was not found.`
- `Nexitally parser: no usable server entries were found.`

## Dual-use note

These parsers extract already-downloaded Quantumult X server lines for personal profile management. They are not a subscription cracker, a credential collector, or a bypass for a provider's official client. If Nexitally ships an official server-only Quantumult X resource, delete this parser from `[general]` and subscribe to that resource directly.
