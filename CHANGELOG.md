# Changelog

Personal notes for this repository. Dates use the day the change landed on `main` or on a pull request branch.

## Unreleased

### Examples

- Add a Nexitally fixture suite covering a typical full profile, mixed protocols, traffic/Premium placeholders, mixed case, BOM+CRLF, EOF sections, and both parser error paths.
- Add Quantumult X local-profile snippets that show `resource_parser_url`, `opt-parser=true`, and a policy group that does not get overwritten.

### Tooling

- Add a Node harness that runs a Quantumult X resource parser (`$resource` / `$done`) without the iOS/macOS app.
- Add `npm run check-examples` / `node scripts/check-examples.js` to compare fixtures with expected output.

### Documentation

- Expand the README with the current GitHub / jsDelivr URLs, a contents table, and pointers at the new docs.
- Add pages for the parser contract, Nexitally workflow, troubleshooting, security, and writing another personal parser.

## 2026-07-14

- Add `nexitally-node-parser.js`.
- Document the original Nexitally usage notes in the README.
