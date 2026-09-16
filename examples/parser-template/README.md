# Resource parser template (personal)

A commented Quantumult X resource-parser skeleton. It is **not** the
Nexitally production script. Copy it when adding a second personal parser
to this repository.

Production parser: [`../../nexitally-node-parser.js`](../../nexitally-node-parser.js)

Runtime notes: [`../../docs/quantumult-x-parser-runtime.md`](../../docs/quantumult-x-parser-runtime.md)

## Rules for a new parser in this repo

- ES5 only (`var`, `function`). Quantumult X is JavaScriptCore, not Node 22.
- Call `$done` exactly once.
- Do not use `$httpClient`, `require`, or persistent storage on the device path.
- Do not read `$resource.link` unless the script truly needs hash parameters.
  Prefer not to log it.
- Keep secrets out of the file. Examples stay on `*.example.test`.
- If Node needs to unit-test it, export a named function and keep the
  `$resource` / `$done` branch at the bottom, same as the Nexitally parser.

## What this template does

`resource-parser-template.js` extracts `[server_local]` with no
Nexitally-specific traffic filters. It exists so the Nexitally exclusions
are obviously an extra policy, not "how every parser must look."
