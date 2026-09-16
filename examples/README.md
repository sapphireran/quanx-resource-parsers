# Extra documented samples that are not part of npm test, plus notes for
# capturing a private download locally.

## Saving a private body for the harness (not for git)

```bash
# The file extension *.private.conf is gitignored.
# Download however you normally obtain the Quantumult X full configuration,
# then:
node test/harness.js /path/to/nexitally.private.conf
```

If the output is a list of `anytls=` / `shadowsocks=` lines and no `[policy]`
headers, the parser did what the app will do.

## Empty [server_local] shape

A managed file that only contains quota rows looks like
`test/fixtures/empty-server-local.conf`. The harness prints an error, which
matches the in-app resource error.

## Mixed protocols

`examples/nexitally/mixed-protocols.sample.conf` is the checklist of schemes
the parser accepts. A new protocol (for example a future Quantumult X
scheme) needs a parser change; do not expect this script to pass it through.
