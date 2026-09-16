# Local testing

Quantumult X is not required to prove that the parser keeps the right
lines. Node 18+ is enough.

## Run the suite

```bash
npm test
```

That is `node --test tests/*.test.js`. There are no npm dependencies.

The tests cover:

- protocol allow-list, comments, duplicates;
- traffic / expiry / `[Premium]` dropping;
- `[server_local]` extraction vs. bare server-list fallback;
- hash parameters, including invalid regex;
- BOM / CRLF;
- the files under `examples/` against `*.expected.txt`;
- `tools/run-parser.js` as a CLI.

## Parse a fixture by hand

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf
```

JSON:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf --json
```

Hash parameters via a fake `$resource.link`:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf \
  --link 'https://subscription.example.test/quantumult-x#in=HK+SG'
```

## Parse a private dump (do not commit it)

```bash
mkdir -p local
# copy a redacted or private profile to local/nexitally.conf
node tools/run-parser.js local/nexitally.conf
```

`local/` is gitignored. Still prefer redacting hosts and passwords before
the file ever sits in a working tree you might push.

## Use the parser as a library

```javascript
const parser = require("./nexitally-node-parser.js");

const result = parser.parseResource({
  content: fs.readFileSync("examples/nexitally-full-config.example.conf", "utf8"),
  link: "https://subscription.example.test/quantumult-x#in=HK"
});

if (result.error) throw new Error(result.error);
console.log(result.content);
```

Helpers used by the docs and tests:

| Export | Role |
| --- | --- |
| `parseResource` | `$resource` → `{content}` or `{error}` |
| `parseContent` | body + already-parsed hash params |
| `parseHashParams` | URL fragment → object |
| `extractSection` | `[name]` body |
| `collectServers` | filter + de-dupe |

Requiring the file does not call `$done`.

## When local tests are not enough

The Node suite cannot see:

- whether Quantumult X accepted the AnyTLS parameters on a given build;
- whether `resource_parser_url` was loaded;
- TLS / Reality handshake success.

Those still need a refresh of **Server Resources → Nexitally** on a
device. Use the example fixtures to debug *parsing*; use the app to
debug *connectivity*.
