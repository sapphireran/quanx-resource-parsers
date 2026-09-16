# 07 — Replay studio

The studio evaluates the **committed** parser with Quantumult X-shaped globals. It never downloads a URL.

```bash
npm test                          # every fixture + secrets scan
node studio/replay.js list
node studio/replay.js dump managed-full-profile
node studio/replay.js explain reset-substring-trap
node studio/replay.js why "anytls=example.com:443, password=pwd, tag=HK-Reset-01"
node studio/replay.js report      # rewrite studio/report/
```

## Layout

```text
studio/
  replay.js           CLI
  lib/sandbox.js      vm + $resource / $done
  lib/explain.js      per-line reason codes
  lib/catalog.js      fixture index
  lib/secrets.js      reject live-looking text
  fixtures/<id>/      input.conf + expected output + notes
  profiles/           device snippets with a URL token
  report/             generated TRACEBOOK.md + traces.json + gallery.html
```

## What a fixture is

Each `studio/fixtures/<id>/` directory has:

| File | Role |
| --- | --- |
| `input.conf` | Sanitized Quantumult X text (`$resource.content`) |
| `expected.txt` | Kept server lines, or omitted on error paths |
| `expected-error.txt` | Exact `$done({ error })` string on failure paths |
| `expected-trace.json` | Reason-code list the explainer must reproduce |
| `notes.md` | Why the case exists |

`catalog.json` lists ids, titles, and the claim each case proves.

## Sandbox rules

- `$resource.link` throws if the parser reads it.
- `$done` may be called once. A second call fails the run.
- `$task`, `$httpClient`, `$prefs` are absent.
- BOM (`U+FEFF`) and CRLF are left in the fixture bytes; the parser normalizes them.

## Generating the tracebook

`node studio/replay.js report` rebuilds:

- `studio/report/TRACEBOOK.md` — keep/drop tables for every case
- `studio/report/traces.json` — machine-readable traces
- `studio/report/gallery.html` — static gallery (open the file locally)

`npm test` fails if a generated report is stale, so the handbook and the parser cannot drift silently.
