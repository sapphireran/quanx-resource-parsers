# Examples

Runnable examples are the sanitized fixtures in [`../studio/fixtures/`](../studio/fixtures/).

```bash
node studio/replay.js list
node studio/replay.js dump managed-full-profile
node studio/replay.js explain reset-substring-trap
```

Device copy-paste snippets (URL kept as a token):

- [`../studio/profiles/general.snippet.conf`](../studio/profiles/general.snippet.conf)
- [`../studio/profiles/server-remote.snippet.conf`](../studio/profiles/server-remote.snippet.conf)
- [`../studio/profiles/keep-local-policy.snippet.conf`](../studio/profiles/keep-local-policy.snippet.conf)
- [`../studio/profiles/full-local.snippet.conf`](../studio/profiles/full-local.snippet.conf)

Do not add a live Nexitally export here. Invent the shape, swap hosts to `example.com`, then register a new fixture in `studio/fixtures/catalog.json`.
