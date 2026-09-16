# Personal workbook

Sanitized Quantumult X samples for `nexitally-node-parser.js`. Every host is documentation-only. There is no live Nexitally URL in this tree.

## Run

```bash
npm test
npm run workbook
npm run trace -- substring-reset-trap
npm run book
```

`workbook/cases.cjs` is the source of truth. `npm run materialize` writes `workbook/cases/<id>/input.conf` plus expected files so the samples can be opened without Node.

## Case index

| id | Expect |
| --- | --- |
| `managed-full-profile` | 4 servers |
| `info-banners-en-zh` | 1 server |
| `comment-styles` | 1 server |
| `comment-false-header` | 1 server |
| `duplicates-after-trim` | 1 server |
| `protocol-roster` | 7 servers |
| `section-fence-filter-policy` | 1 server |
| `header-mixed-case` | 1 server |
| `header-indented` | 1 server |
| `header-trailing-space` | 1 server |
| `section-at-eof` | 2 servers |
| `bom-crlf` | 2 servers |
| `substring-reset-trap` | 1 server (`HK-RST-01` only) |
| `days-left-variants` | 1 server (`DaysLeft-12`) |
| `unicode-and-ipv6` | 2 servers |
| `first-of-two-server-local` | 1 server |
| `policy-lookalikes` | 1 server |
| `filter-rules-inside-section` | 1 server |
| `unsupported-families` | 1 server |
| `quoted-overlong-params` | 2 servers |
| `protocol-mixed-case` | 2 servers |
| `spaced-protocol-equals` | 2 servers |
| `tab-prefixed-server` | 1 server |
| `preamble-banner` | 1 server |
| `premium-section-terminator` | 1 server |
| `missing-server-local` | error, section missing |
| `empty-usable` | error, no keepers |
| `html-interstitial` | error, section missing |
| `clash-yaml` | error, section missing |
| `glued-header` | error, section missing |
| `header-no-newline` | error, section missing |
| `inner-spaced-header` | error, section missing |
| `server-remote-only` | error, section missing |
| `empty-file` | error, section missing |

Open [`book.html`](book.html) for the same cases with keep/drop traces.

Profile copy-paste snippets live in [`profiles/`](profiles/).
