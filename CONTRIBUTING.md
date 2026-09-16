# Contributing (personal repo)

This is a personal Quantumult X helper. Issues and PRs are welcome when they stay in that scope.

## Rules

- No live subscription URLs, account ids, or node passwords.
- No employer / client / company configuration.
- Fixtures use `example.com`, `apple.com`, documentation IPs, and official Quantumult X sample secrets only.
- Do not change keep/drop behavior in `nexitally-node-parser.js` unless a fixture proves the current regex is wrong **and** the handbook reason-code table is updated in the same change.
- Run `npm test` before sending a change. That replays every studio fixture and scans for live-looking secrets.

## Adding a fixture

1. Create `studio/fixtures/<id>/input.conf`.
2. Run `node studio/replay.js dump <id>` and `node studio/replay.js explain <id>`.
3. Save `expected.txt` or `expected-error.txt` plus `expected-trace.json`.
4. Write `notes.md` with the claim the case proves.
5. Register the id in `studio/fixtures/catalog.json`.
6. Run `node studio/replay.js report` so `studio/report/` stays current.
