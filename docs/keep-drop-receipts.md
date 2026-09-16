# Keep / drop receipts

A **receipt** is a JSON explanation of one parse: which section was cut, why each line was kept or dropped, and whether `$done` returned `content` or `error`. Receipts are for humans and for `tools/check.js`. They are not used by Quantumult X.

## Produce one

```bash
node tools/ledger.js examples/cases/typical-managed-full/input.conf
```

The command:

1. Reads the file (optional BOM / CRLF wrap from flags or the catalog).
2. Runs **`nexitally-node-parser.js` unchanged** in `tools/qx-vm.js`.
3. Runs `tools/classify.js` with the same normalize + regex cut.
4. Prints a receipt. Classifier keeps must equal `$done({content})` lines, or the process exits non-zero.

## Receipt shape

```json
{
  "input": "examples/cases/typical-managed-full/input.conf",
  "normalizedBytes": 2140,
  "section": {
    "found": true,
    "header": "[server_local]",
    "endReason": "next-section",
    "nextHeader": "[server_remote]"
  },
  "parser": { "kind": "content", "lineCount": 8 },
  "lines": [
    {
      "where": "inside",
      "text": "anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=JP-Tokyo-A",
      "decision": "KEEP"
    },
    {
      "where": "inside",
      "text": "shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Traffic: 12.3/100GB",
      "decision": "DROP_INFO",
      "needle": "Traffic"
    }
  ]
}
```

`decision` is one of:

| Code | Meaning |
| --- | --- |
| `OUTSIDE_BEFORE` | Line before the `[server_local]` header |
| `HEADER` | The `[server_local]` line itself |
| `BLANK` | Empty after trim |
| `COMMENT` | Whole-line `;` / `#` / `//` |
| `DROP_SCHEME` | Not one of the seven prefixes |
| `DROP_INFO` | Info / `[Premium]` / CN-EN banner needle |
| `DROP_DUPLICATE` | Same trimmed line already kept |
| `KEEP` | Emitted to `$done({content})` |
| `SECTION_CUT` | Next `[section]` header that ended the cut |
| `OUTSIDE_AFTER` | Line after the cut |

## Catalog

[`examples/catalog.json`](../examples/catalog.json) lists every checked case. `node tools/check.js`:

- replays the real parser;
- diffs `expected.txt` / `expected-error.txt`;
- rebuilds receipts and diffs `receipt.json`;
- secret-scans the repo;
- writes [`examples/gallery.html`](../examples/gallery.html) if `--write-gallery` is set.

Open the gallery in a browser for a color-coded keep/drop view. No network is required; the HTML inlines the catalog.
