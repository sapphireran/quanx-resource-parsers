# Contributing (personal repo)

This repository is a personal Quantumult X toolkit. It is not company code. Keep company configs, internal hostnames, and work subscriptions out of pull requests.

## What belongs here

- Sanitized fixtures and documentation for `nexitally-node-parser.js`
- Lab harness improvements that replay the real parser
- Extra personal parsers that follow the same privacy rules

## What does not belong here

- Live Nexitally (or any provider) URLs, tokens, or node credentials
- Unrelated company repositories or private work notes
- Generic Clash converters copied from other authors without a personal reason

Read [docs/privacy.md](docs/privacy.md) before adding a file.

## How to change parser behavior

1. Add or update a fixture in `lab/fixtures/` and `catalog.json`.
2. Run `npm test`.
3. Refresh `docs/keep-drop-matrix.md` and `lab/gallery.html`.
4. Update `docs/parser-spec.md` (and the Chinese pages if the user-visible rules changed).
5. Keep the success and error strings stable unless the spec change is intentional.

## How to run the lab

```bash
npm test
node lab/run.js --explain lab/fixtures/nexitally-style-full.conf
node lab/run.js --gallery
```

Node.js 18+ is enough. There are no production dependencies.
