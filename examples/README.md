# Personal examples

Synthetic Quantumult X text. Nothing here is a live subscription.

Hosts use `*.example.test` or the documentation addresses from [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf). Passwords are `placeholder-password`, official `pwd`, or the official sample UUID / Reality pubkey. The private Nexitally URL is always written `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`.

## Layout

| Path | Role |
| --- | --- |
| [`catalog.json`](catalog.json) | Index consumed by `scripts/verify.js` and `scripts/replay.js --catalog` |
| [`fixtures/<id>/input.conf`](fixtures) | Body that becomes `$resource.content` (LF on disk) |
| `fixtures/<id>/expected.txt` | Successful `$done({ content })` |
| `fixtures/<id>/expected-error.txt` | Exact `$done({ error })` string |
| `fixtures/<id>/notes.md` | Why the fixture exists |
| [`profile/stable-local.snippet.conf`](profile/stable-local.snippet.conf) | Local profile fragment with the placeholder URL |
| [`walkthrough/managed-full-profile.md`](walkthrough/managed-full-profile.md) | Annotated reading of the largest fixture |

Some catalog entries set `encode.bom` / `encode.newlines` so a readable LF file can still represent BOM+CRLF or CR-only downloads.

## Run

```bash
node scripts/verify.js
node scripts/replay.js examples/fixtures/managed-full-profile/input.conf --annotate
```

`examples/catalog.json` currently lists **34** fixtures, including BOM+CRLF, CR-only endings, `Preset`/`unexpired` false friends, and a synthetic full profile.

Do not add a real Nexitally download next to these fixtures.
