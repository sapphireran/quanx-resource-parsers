# 09 — Second personal parser checklist

Add another parser only for a **personal** provider that also ships a full Quantumult X configuration and no official server-only resource.

## Do this first

1. Confirm the vendor has no official `[server_remote]` subscription.
2. Confirm you are willing to keep the live URL on the device only.
3. Save one managed file to a private scratch directory that is **gitignored** (`scratch/` is in `.gitignore`).
4. Decide the keep / drop rules **before** writing regex. Copy the catalog format from [05](05-keep-drop-decision-catalog.md).

## Script shape

Stay close to `nexitally-node-parser.js`:

- read `$resource.content` only;
- normalize BOM + CRLF;
- slice one section;
- filter lines with explicit prefix + exclusion regexes;
- `$done({ content })` or `$done({ error })`;
- no `$task.fetch`, no logging of `$resource.link`.

Name the file after the provider, lowercase, hyphenated: `example-provider-node-parser.js`.

## Workbook

Add a new prefix folder only if the keep / drop rules differ. If they are identical, add cases under `workbook/cases.cjs` with a `parser` field (the runner already accepts `parser` and defaults to `nexitally-node-parser.js`).

Materialize, scan, and trace before opening a PR.

## Privacy review

- `npm run scan` must pass.
- Grep the new fixtures for `@`, `http`, and long hex. Documentation hosts only.
- README must keep the live URL as `<YOUR_PRIVATE_…_URL>`.

## When not to add a parser

- The vendor already has a server-only Quantumult X URL.
- The source is Clash / Surge / sing-box and you would be writing a translator.
- The sample you would commit is a company profile.

This repo stays a small personal kit. A translator for every proxy dialect is a different project.
