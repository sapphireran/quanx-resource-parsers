# Privacy

The parser is a **pure function of a response body**. It does not log, upload, or persist. Quantumult X already had the body; the script only returns a subset.

## Never commit

- The Nexitally (or any provider) download URL, including query tokens.
- Account ids, emails, invoice ids.
- Real node hostnames or IPs.
- Real passwords, UUIDs, Reality keys, TLS pinning hashes from a live deployment.
- `subscription-userinfo` header dumps (`upload=…; download=…; total=…; expire=…`).
- Quantumult device ids from `require-devices=`.
- Screenshots of the Quantumult X resource page that show a live URL.

## Allowed in examples

- Hosts: `*.example.test`, `example.com` (as used in Quantumult X’s public sample), documentation IPv6 `2001:db8::/32`, TEST-NET IPv4 `192.0.2.0/24`.
- Passwords: `pwd`, `placeholder`, `user`.
- UUID: `23ad6b10-8d1a-40f7-8ad0-e3e35cd32291` from upstream `sample.conf`.
- Reality sample pubkey / short id from the same public file.
- Placeholder URL `https://example.test/do-not-fetch` and `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`.

## Secret scan

`tools/secrets.js` walks the git tree (minus `.git`) and fails on:

- `nexitally.` hostnames;
- query-ish `token=`, `auth=`, `uuid=` with long hex;
- `vmess://` / `vless://` / `ss://` / `trojan://` URIs;
- IPv4 that is not loopback / RFC 5737 documentation / RFC 1918 used as an obvious lab label (the scan allowlists `192.0.2.`, `198.51.100.`, `203.0.113.`, `127.`, `192.168.`, `10.`, `example.test`, `example.com`, `apple.com`);
- a `[server_remote]` line whose URL host is not `example.test` / `example.com` / `raw.githubusercontent.com/sapphireran/` / `cdn.jsdelivr.net/gh/sapphireran/`.

False positives should be fixed by rewriting the example, not by weakening the scan without a comment in `tools/secrets.js`.
