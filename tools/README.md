# Tools

Personal helpers for this repository. They run on a laptop with Node.js.
They are not Quantumult X scripts and they must not download a
subscription.

## `run-examples.js`

Mocks `$resource` and `$done`, then evaluates each committed parser against
the fictional fixtures in `examples/manifest.json`.

```bash
node tools/run-examples.js
```

Set `EXAMPLES_VERBOSE=1` to print the passing detail even when a fixture
succeeds.

The runner:

- reads parser files from the repository root;
- applies optional transforms such as `crlf-bom`;
- requires `$done` to be called exactly once;
- compares returned `content` or `error` with the manifest.

It does not prove that AnyTLS handshakes, that jsDelivr is serving the
latest commit, or that a live Nexitally body still uses `[server_local]`.
Those checks stay on the device that holds the private URL.
