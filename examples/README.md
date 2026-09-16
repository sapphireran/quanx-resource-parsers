# Examples

Synthetic Quantumult X text only. No live subscription is downloaded. Hosts are `*.example.test`. Passwords are placeholders. The Reality pubkey and UUID are the public samples from [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf).

| Path | What it is |
| --- | --- |
| [`profile/`](profile/) | Snippets for a **local** profile that keeps `[policy]` |
| [`annotated-managed-full.md`](annotated-managed-full.md) | Walkthrough of the typical managed-full fixture |
| [`cases/`](cases/) | One folder per regression: `input.conf`, expected output or error, `notes.md`, `receipt.json` |
| [`catalog.json`](catalog.json) | Machine list consumed by `node tools/check.js` |
| [`gallery.html`](gallery.html) | Color-coded keep/drop view (generated, committed) |

## Replay

```bash
node tools/check.js
node tools/ledger.js examples/cases/typical-managed-full/input.conf
```

`$done({content})` is compared to `expected.txt`. `$done({error})` is compared to `expected-error.txt`.

## Catalog groups

- **happy-path** — a full-looking managed profile and the seven supported schemes
- **header** — `[server_local]` matching quirks
- **keep-drop** — comments, banners, schemes, duplicates, substring traps
- **errors** — bodies that must not silently become an empty node list
- **encoding** — BOM / CRLF wrap applied at check time
