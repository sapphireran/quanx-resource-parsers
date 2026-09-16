# Troubleshooting

Refresh **Server Resources → Nexitally** and read the parser error before changing the profile. The script only emits two error strings.

## `Nexitally parser: [server_local] section was not found.`

Quantumult X downloaded something that is not a Quantumult X full configuration, or the section header is spelled differently.

Check, in order:

1. **Wrong URL.** The resource must be the Nexitally *Quantumult X Configuration File* download, not a Clash YAML, a Surge profile, a V2RayN share link, or an HTML login page.
2. **`opt-parser` is off.** Without `opt-parser=true`, Quantumult X will not run this script. You would usually see a generic import failure instead of this string — still verify the flag.
3. **HTTP error body.** A 401/403/302 login page has no `[server_local]`. Open the URL on the device (Safari) and confirm it starts with `[general]` or at least contains `[server_local]`.
4. **Section rename.** If the vendor starts shipping nodes under `[server_remote]` inside the downloaded file, this parser will not see them. Save the body privately and inspect headers.

The fixture [`examples/fixtures/missing-server-local.conf`](../examples/fixtures/missing-server-local.conf) reproduces this error in `npm test`.

## `Nexitally parser: no usable server entries were found.`

`[server_local]` existed, but every line was a comment, a traffic / expiry / `[Premium]` placeholder, an unsupported protocol, or a duplicate of an already-dropped line.

Check:

1. **Plan inventory.** A dashboard that only lists `[Premium]` placeholders will parse to zero nodes. That is intentional. See [`examples/fixtures/premium-and-traffic-only.conf`](../examples/fixtures/premium-and-traffic-only.conf).
2. **New protocol prefix.** If Nexitally ships `hy2 =` / `hysteria2 =` / `wireguard =` only, this parser will ignore those lines. Open an issue with a *redacted* sample line if you want the allow-list extended.
3. **Everything tagged with a banned word.** A node named `Traffic-HK-01` is excluded because `Traffic` is in the exclusion regex. Rename on the vendor side is not possible; you would need a private fork that tightens the regex to `tag=Traffic` only.

## Nodes refresh but some are missing

Compare the private downloaded body to the parser output:

```bash
node scripts/run-parser.js ~/private/nexitally-latest.conf
```

Typical intentional drops:

| Input | Why it disappeared |
| --- | --- |
| `tag=JP-02 [Premium]` | Exclusion list |
| `tag=Traffic: 12 GB` | Exclusion list |
| Second copy of the same line | Dedup |
| `;anytls = ...` | Comment |
| `wireguard = ...` | Not in the allow-list |
| Lines under `[filter_local]` | Outside the captured section |

If a line you consider a real node is dropped, it almost always matches the exclusion regex (`Reset`, `剩余`, `套餐`, …).

## Parser never runs

Symptoms: Quantumult X imports a huge profile as "servers", or shows a built-in parse error, and you never see a `Nexitally parser:` prefix.

- `[general] resource_parser_url` is missing or still points at another parser.
- The `[server_remote]` line omitted `opt-parser=true`.
- You refreshed **Configuration File** instead of **Server Resources**.

## Other resources broke after installing this parser

This file is not a general subscription converter. If `resource_parser_url` used to point at KOP-XIAO's parser, every `opt-parser=true` resource now hits the Nexitally script.

Fix: remove `opt-parser=true` from non-Nexitally resources, or restore the previous parser and convert Nexitally offline.

## AnyTLS nodes appear as unavailable

The parser only copies lines. It does not speak AnyTLS.

- Quantumult X must be **1.5.6+** (AnyTLS shipped in the 1.5.6 test flight / release train).
- `over-tls=true` and a sensible `tls-host` must be on the vendor line.
- Reality nodes need `reality-base64-pubkey` (and usually `reality-hex-shortid`). TCP Fast Open is a bad idea on Reality; the official sample.conf says so.

## Local Node run works, Quantumult X fails

The sandbox in `scripts/run-parser.js` is not Quantumult X. Differences that matter:

- Quantumult X may download a different body (mobile User-Agent, TLS fingerprint).
- iCloud copies of the script can be stale relative to `main`.
- jsDelivr can cache `@main` for several minutes after a push.

Pin a commit SHA on jsDelivr or use `raw.githubusercontent.com` if you just pushed.

## Still stuck

File a GitHub issue with:

- The exact `Nexitally parser:` error, or "no error, N nodes missing"
- Quantumult X version
- Whether `[server_local]` exists in a **redacted** body
- One redacted example of a dropped line you expected to keep

Do not attach the live Configuration File URL.
