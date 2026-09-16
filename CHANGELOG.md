# Changelog

Personal notes for this repository. Dates are UTC.

## Unreleased

### Added

- `docs/` for the Quantumult X resource-parser API, server line formats, the Nexitally parser contract, privacy rules, troubleshooting, and local verification.
- `examples/fixtures/` sanitized full-config and edge-case inputs, including a UTF-8 BOM + CRLF copy of the full-config fixture.
- `examples/expected/` and `examples/expected-errors/` pinned parser output.
- `examples/snippets/` local Quantumult X fragments for `resource_parser_url`, `[server_remote]`, resource-tag policies, and a stable profile skeleton.
- `examples/walkthroughs/nexitally-local-refresh.md` for the device-side refresh path.
- `scripts/run-parser.js` and `scripts/verify-examples.js` so fixtures can be checked with Node. `npm run verify` runs the suite.

### Changed

- README now points `resource_parser_url` at this repository (`sapphireran/quanx-resource-parsers`) and links the new docs/examples.

## 2026-07-14

- Initial Nexitally node parser and README.
