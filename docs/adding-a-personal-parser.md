# Adding another personal parser

Add a second script only for another **personal** provider that also ships a full Quantumult X configuration and has no official server-only subscription.

Do not use this checklist for company, employer, or client traffic.

## 1. Decide whether a new file is required

Reuse `nexitally-node-parser.js` when the other provider:

- already emits Quantumult X `[server_local]` lines;
- uses the same seven protocol prefixes;
- only needs the same metadata exclusions.

Write a new file when the remote body is a different format (Clash YAML, base64 URI lists, Surge modules) or when the keep / drop rules would diverge.

## 2. Keep Quantumult X constraints

- One `resource_parser_url` is shared by every `opt-parser=true` resource.
- The script must be a single file. Quantumult X cannot `require()` Node modules.
- Use `$resource.content` and `$done`. Do not call HTTP APIs.
- Return `{ content }` or `{ error }` only, unless a UA retry is actually required.

## 3. Stay secret-free

The new file must not embed the provider URL, account id, or any live credential. Documentation may show `<YOUR_PRIVATE_…_URL>` and synthetic `example.com` lines.

## 4. Add atlas coverage before relying on it

1. Document the keep / drop contract next to this specification.
2. Add synthetic cases under `examples/atlas/cases/`.
3. Extend [`scripts/lib/nexitally-trace.js`](../scripts/lib/nexitally-trace.js) or add a sibling tracer that mirrors the new script exactly.
4. Run `npm test`. The harness must execute the **real** parser file, not only the tracer.

## 5. Wire the device last

Point `resource_parser_url` at the new script only when every other `opt-parser=true` resource is compatible with it. Otherwise leave Nexitally on this parser and do not enable `opt-parser` on unrelated subscriptions.
