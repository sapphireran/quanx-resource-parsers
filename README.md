# QuanX Resource Parsers

Personal Quantumult X resource parsers. Each script turns a **managed full
configuration** into a server-only `[server_remote]` resource so a stable
on-device profile is not overwritten on every refresh.

This repository is not an official Nexitally (or Quantumult X) project. It
holds one private-use parser, sanitized examples, and working notes.

## Contents

| Path | What it is |
| --- | --- |
| [`nexitally-node-parser.js`](nexitally-node-parser.js) | Extract `[server_local]` from a Nexitally full Quantumult X config |
| [`docs/`](docs/README.md) | Privacy rules, parser notes, server-line cheat sheet, troubleshooting |
| [`examples/`](examples/README.md) | Invented fixtures plus a Node runner that mocks `$resource` / `$done` |

## Nexitally node parser

`nexitally-node-parser.js` receives the body Quantumult X already downloaded
and returns only usable server lines:

- reads the `[server_local]` section and stops at the next `[section]`;
- keeps `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`;
- drops comments, exact duplicates, `[Premium]` placeholders, and
  traffic / expiry / 套餐 banners;
- ships no subscription URL, account id, node password, or other private data.

The subscription URL stays in the local Quantumult X profile. The parser
never fetches anything.

Longer write-up: [docs/nexitally-node-parser.md](docs/nexitally-node-parser.md).

## Usage

Add the parser URL to `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a
server resource (`opt-parser=true` is required):

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the device. Do not commit it here, to a Gist, or to any
other public host. See [docs/privacy-and-secrets.md](docs/privacy-and-secrets.md).

After the rest of the profile (`[policy]`, `[filter_remote]`, rewrite) is
the way it should stay, refresh **Server Resources → Nexitally**. A copy-paste
skeleton is in [`examples/nexitally/quanx-profile-snippet.conf`](examples/nexitally/quanx-profile-snippet.conf).

Pin a commit SHA in the jsDelivr URL if the profile should not track `@main`.

## Why

Nexitally distributes a complete Quantumult X configuration through
**Configuration File → Download**. Re-importing it replaces the active
profile. A resource parser turns the embedded `[server_local]` section into
an independently refreshable server list.

If Nexitally ships an official server-only Quantumult X subscription, use
that and remove this parser.

## Local examples

Fixtures use `*.example.test` hostnames and `example-*-password` values. They
are not a working subscription.

```bash
# every case, including the error paths
node examples/scripts/verify-examples.js

# one case, with a short input summary
node examples/scripts/run-example.js typical-full-config
node examples/scripts/run-example.js --list
```

Requires Node.js 18+. No npm packages. `npm run examples` is the same
verifier if you prefer a named script.

| Case | Result |
| --- | --- |
| `typical-full-config` | Four mixed-protocol servers; banners dropped |
| `placeholders-and-traffic` | English + Chinese info rows dropped |
| `comments-duplicates-crlf` | BOM, CRLF, comments, duplicates |
| `mixed-protocols` | All seven supported prefixes |
| `section-boundaries` | No leak from later sections |
| `missing-server-local` | Error |
| `empty-server-local` | Error |
| `unsupported-only` | Error |

## Compatibility

Exercised against Quantumult X configurations that include AnyTLS nodes.
The installed Quantumult X build must support AnyTLS and resource parsers.

The JavaScript itself is ES5-style so the in-app VM can evaluate it. The
example runner uses the same globals the app injects; it is not a substitute
for a device refresh.

## Documentation

- [Privacy and secrets](docs/privacy-and-secrets.md)
- [Resource parser environment](docs/resource-parser-environment.md)
- [Server line reference](docs/quanx-server-line-reference.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Adding another personal parser](docs/adding-a-parser.md)
- [Worked example: typical-full-config](docs/worked-example-typical-full-config.md)
