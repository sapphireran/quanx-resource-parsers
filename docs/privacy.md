# Privacy

This repository is public-shaped personal tooling. Treat every commit as if a stranger will read it.

## Never commit

- Nexitally (or any vendor) subscription URLs, tokenized links, or `sid=` / `token=` query strings
- Account IDs, emails, invoice numbers
- Real node hostnames, ports that identify an account, passwords, UUIDs, TLS keys
- `subscription-userinfo` headers or traffic totals from a live account
- Screenshots of Quantumult X that still show the remote URL
- Exported full profiles, `.conf` backups, or QR dumps from a working device
- MITM CA material, rewrite cookies, or `hostname =` lists that describe a real device

The parser file is written so it does not need any of that. If a change "only works" after pasting a live URL into the repo, the change is wrong.

## Safe substitutions

| Live value | Replacement in this repo |
| --- | --- |
| Real subscription URL | `https://nexitally.example/replace-with-private-full-config` |
| Node host | `*.example.com` / `*.example.net` / `*.invalid` |
| Password / UUID | `placeholder`, `placeholder-*`, `00000000-0000-4000-8000-00000000000x` |
| Traffic line | `# Traffic: 12.34 GB / 200 GB` |
| Premium stub | `tag=[Premium] Placeholder` |

`*.invalid` is for rows that must never look routable (the Premium stub). `example.com` is for rows that demonstrate a keepable server line.

## Where the live URL belongs

Only in the Quantumult X profile on your phone / Mac, under `[server_remote]`.

Do not put it in:

- this git remote
- a public Gist used as `resource_parser_url`
- a jsDelivr or raw.githubusercontent URL
- issue trackers, chat logs, or CI artifacts
- `examples/` "to make the test more realistic"

Quantumult X fetches that URL. The parser runs on the result. The git repo only hosts the script.

## Review habit

Before `git add`:

```bash
git diff --cached
```

Search the staged diff for `http`, `token`, `password=`, `@`, and any hostname that is not `example.` / `invalid`. If a fixture needs a new server line, invent one.

`npm test` does not need the network and must keep working offline.

## Parser URL vs subscription URL

These are easy to mix up:

| URL | Public? | Purpose |
| --- | --- | --- |
| `resource_parser_url` pointing at `nexitally-node-parser.js` | Yes. That is this repo. | JavaScript that rewrites a response |
| Nexitally Configuration File → Download | No. Account-specific. | Input body for that JavaScript |

Publishing the parser is intentional. Publishing the download URL is an account leak.
