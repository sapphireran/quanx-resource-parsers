# Privacy rules for this repository

This is a public personal repository. Treat every commit as if a stranger will clone it.

## Never commit

- Nexitally (or any provider) subscription URLs, tokens, or query strings.
- Account identifiers, emails, invoice ids, or dashboard screenshots.
- Real hostnames, ports that identify a rented server, passwords, UUIDs, Reality keys, or TLS pin hashes from a live node.
- A full Quantumult X profile exported from a device that has already been used.
- MitM `passphrase` / `p12` material. The official sample.conf warns about this for a reason.
- Company or work profiles, internal hostnames, or anything that is not yours to publish.

The parser JavaScript must stay free of those values. The examples must stay synthetic.

## Safe to commit

- Parser source that only reads `$resource.content`.
- Docs that use `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` as a placeholder.
- Fixtures under `*.example.test` / `example.com` with documented sample passwords.
- Expected parser output derived from those fixtures.
- The Node harness, which never performs a network fetch of a subscription.

## How Quantumult X keeps the secret on the device

Quantumult X downloads the `[server_remote]` URL itself. The parser script is a separate URL. Splitting them is the point of this repo:

```text
resource_parser_url  →  public script in this repository
server_remote URL    →  private, only in the local profile
```

If you paste the private URL into `resource_parser_url`, or hard-code it inside the script, the split is gone.

## Redacting before you ask for help

If a refresh fails and you want a new fixture:

1. Copy the downloaded body to a file **outside** this clone.
2. Delete `[mitm]`, rewrite scripts, and any filter that mentions a real hostname you care about.
3. Replace every server address, password, UUID, and Reality field with the placeholders used in `examples/nexitally/full-config.conf`.
4. Keep the section names, comment style, and info-line wording. That is the only part a parser test needs.
5. Add the redacted file under `examples/` and a matching expected output.

Do not open a GitHub issue with the unredacted file attached.

## jsDelivr and raw GitHub

Publishing the parser on `main` makes the **script** cacheable on public CDNs. That is intended. It does not publish your subscription, because the subscription is not in the script.

Pinning `@main` on jsDelivr can lag a few minutes after a push. That affects which parser revision devices run, not whether private URLs leak.
