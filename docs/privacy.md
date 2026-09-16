# Privacy

This repository is public. Treat every commit as world-readable.

## Never commit

- Nexitally (or any provider) subscription / configuration-download URLs
- Account ids, tokens, invoice ids
- Node hostnames that are not `example.com` / `example.test`
- Real passwords, UUIDs, Reality public keys from a live plan
- Screenshots or logs that include the above
- A full Quantumult X profile exported from a phone

The parser file itself must stay free of those values. It only reads `$resource.content` at runtime.

## What the fixtures are allowed to contain

`examples/fixtures/` uses reserved documentation hosts (`*.example.test`, `example.com`) and obvious placeholders (`example-password`, `00000000-0000-4000-8000-000000000001`). Reality sample keys in `nexitally-mixed-protocols.conf` are copied from Quantumult X `sample.conf`, not from a live node.

If a fixture ever looks like a real dump, delete it from git history. Do not "fix" it by renaming tags.

## Local private copies

`.gitignore` excludes `private/**` except `private/README.md`, plus `*.local.conf` and `*.local.txt`.

```bash
node scripts/run-parser.js private/nexitally-latest.conf
```

That path is for personal debugging. It is not an input to `npm run examples`.

## Parser URL vs subscription URL

`resource_parser_url` is a public script URL. It is safe to commit.

The `[server_remote]` URL is a credential. Keep it in the on-device profile only.

## jsDelivr and raw GitHub

Pinning `@main` on jsDelivr caches the parser. That is fine for a public script. Do not attempt to "hide" a private URL by wrapping it in a parser — Quantumult X still fetches the resource directly.
