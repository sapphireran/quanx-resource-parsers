# 09 — Adding another *personal* parser

Only do this for a **personal** provider you pay for. Do not import employer or client configuration.

## Checklist

1. **Name the script** after the provider + job, e.g. `someprovider-node-parser.js`. Keep Nexitally's file untouched unless the keep/drop contract itself changed.
2. **Do not embed the URL.** Quantumult X fetches it. The script reads `$resource.content` only.
3. **Decide the extract target.** Another full-profile vendor probably still uses `[server_local]`. A Clash vendor is a different problem and does not belong in this Nexitally script.
4. **Write fixtures first.** Add `studio/fixtures/<id>/` with invented hosts. Record the claim in `catalog.json`.
5. **Reuse the sandbox.** `studio/lib/sandbox.js` can load any parser path: `node studio/replay.js dump <id> --parser ./other-parser.js`.
6. **One `resource_parser_url`.** The device can only point at one script. Document which personal profile uses which file.
7. **Scan secrets** before committing: `node studio/replay.js scan`.
8. **Update the handbook** if keep/drop codes or prefixes change. If they do not change, do not rewrite chapters 04–05.

## What to copy vs what to rewrite

Safe to copy: sandbox, secrets scan, profile-snippet style, reason-code table *if the regexes stay the same*.

Do not copy: another vendor's live sample, company filter lists, or Shawn's parameterized parser. This repo stays small and content-only.
