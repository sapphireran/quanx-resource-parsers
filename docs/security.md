# Security

This repository is public. Treat every commit as world-readable.

## Never commit

- The Nexitally **Configuration File → Download** URL (it is an account capability, not a public CDN)
- Dashboard cookies, `token=`, `sid=`, or similar query parameters
- Real node hostnames, ports, or passwords
- Reality `reality-base64-pubkey` / `reality-hex-shortid` from a live node
- Invoice, traffic, or expiry numbers that identify an account
- A complete personal Quantumult X profile (`Quantumult.conf` export)

`.gitignore` already ignores `private/`, `*.private.conf`, and a few editor leftovers. That is a seatbelt, not a license to drop a live file into the tree.

## How the parser is designed to stay empty of secrets

`nexitally-node-parser.js` contains:

- A section regex
- A protocol allow-list
- An exclusion regex for traffic / expiry / `[Premium]`
- Error strings

It does **not** contain a default subscription URL, an account id, or a fallback node. Quantumult X supplies the body at runtime from **your** `[server_remote]` line.

If a future change adds a URL "for convenience", reject the change.

## Debugging a live failure without leaking

1. In Quantumult X, reproduce the refresh error.
2. If you can save the downloaded body, write it to a file **outside** this clone (`~/private/nexitally-latest.conf` or `private/` which is gitignored).
3. Run:

   ```bash
   node scripts/run-parser.js ~/private/nexitally-latest.conf
   ```

4. Describe the **shape** of the failure in an issue (missing section, zero usable lines, unexpected protocol prefix). Paste only redacted lines.

Redact by replacing hostnames with `example.com`, passwords with `example-password-not-real`, and account numbers with `0`.

## Parser URL is public; resource URL is not

These are safe to publish:

```text
https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

This is not:

```text
https://<nexitally-host>/link/<token>?quantumultx
```

The examples use `https://example.com/replace-with-private-nexitally-quantumult-x-url` as the resource placeholder.

## What the exclusion list is for

Traffic and expiry lines are not "secrets" in a cryptographic sense, but they are account telemetry. The parser drops them so a refreshed server resource does not grow fake nodes named `Traffic: 12 GB`. `[Premium]` placeholders are inventory the account cannot use; keeping them clutters policy groups.

Dropping those lines is a product choice, not a security boundary. A determined reader of a leaked full-config file still sees them. The boundary is: **do not put that file in git**.
