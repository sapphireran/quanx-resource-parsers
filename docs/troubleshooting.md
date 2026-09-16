# Troubleshooting

Personal runbook for "the Nexitally resource is empty / stale / erroring"
without pasting a live configuration into chat or git.

## 1. Quantumult X shows the parser error string

| Message | Likely cause | What to do |
| --- | --- | --- |
| `[server_local] section was not found.` | The URL is not a full Quantumult X config, the download is an HTML login page, or the section name changed | Open the URL on the phone *only* to confirm it starts with QuanX sections. Do not save that file into this repo. Re-copy the download link from the dashboard. |
| `no usable server entries were found.` | Section is comments-only, every row is a traffic banner, or the protocol prefix is new | Compare against `empty-server-local` and `unsupported-only`. If the prefix is new and Quantumult X understands it, add it in the parser and add a fixture. |

The example runner prints the same strings:

```bash
node examples/scripts/run-example.js missing-server-local
node examples/scripts/run-example.js empty-server-local
```

## 2. Resource updates but nodes are missing

- **`[Premium]` / 流量 / Traffic rows vanished.** Intended. Those are not
  endpoints. See `placeholders-and-traffic`.
- **A real node vanished.** Check whether its `tag=` contains `Traffic`,
  `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`, or
  `[Premium]`. Rename the tag on the provider side or loosen the regex
  *after* adding a fixture that documents the exception.
- **A duplicate vanished.** Intended. The second identical line is dropped.
- **A line under another section vanished.** Intended. Only `[server_local]`
  is read. See `section-boundaries`.

## 3. Resource still looks like a full profile

`opt-parser=true` is missing or the global `resource_parser_url` is blank.
Quantumult X then stores the downloaded body unchanged. The stored resource
will contain `[policy]` and `[filter_local]`. Fix the two profile lines in
`examples/nexitally/quanx-profile-snippet.conf` and refresh again.

## 4. Nodes refresh, policy does not

The parser does not emit policies. If a new region appears (for example a
new `TW-Tpe-01` tag), add it to the personal `[policy]` group or rely on a
policy that references the resource tag as a whole.

## 5. jsDelivr is serving an old parser

CDN cache. Either:

- wait, or
- pin `resource_parser_url` to a commit SHA:

  ```text
  https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@<full-sha>/nexitally-node-parser.js
  ```

Do not put a GitHub personal access token in that URL.

## 6. Want to see what the parser would do to a local file

Redact first. Copy the download to a scratch file, replace every hostname
and password, then:

```bash
# not committed — scratch only
node -e '
const fs = require("fs");
const { runParser } = require("./examples/scripts/lib/run-parser");
const raw = fs.readFileSync(process.argv[1], "utf8");
const ran = runParser(raw);
if (ran.error) { console.error(ran.error); process.exit(1); }
console.log(ran.content);
' /tmp/redacted.conf
```

Delete `/tmp/redacted.conf` afterwards. Do not leave it in the repo.

## 7. Parser change broke a fixture

```bash
node examples/scripts/verify-examples.js
```

If the new behaviour is intentional:

```bash
node examples/scripts/run-example.js <case> --write-expected
```

Read the diff of `expected.txt` / `expected-error.txt`. Commit the fixture
update in the same change as the parser edit.
