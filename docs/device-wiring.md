# Device wiring

Goal: refresh Nexitally **nodes** without replacing the rest of a personal Quantumult X profile.

## Once

1. Build (or keep) a local profile whose `[policy]`, filters, and rewrites you actually want.
2. In `[general]`, set `resource_parser_url` to this repo’s parser on `main`:

   ```ini
   resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
   ```

   jsDelivr is an optional CDN mirror:

   ```ini
   resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
   ```

3. In `[server_remote]`, add the **private** Nexitally Quantumult X full-configuration URL with `opt-parser=true`. Never paste that URL into git, a screenshot of this repo, or a public Gist.

   ```ini
   [server_remote]
   <YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
   ```

4. Point policy groups at the resource with `resource-tag-regex=Nexitally` (or whatever `tag=` you chose), not with a frozen list of node names.

5. Refresh **Server Resources → Nexitally**. The resource should list AnyTLS / other QX servers, not a second copy of `[policy]`.

Working snippets: [`examples/profile/`](../examples/profile/).

## After a Nexitally node change

Only refresh the Nexitally server resource. Do not tap **Download** on their full configuration unless you intend to replace the active profile.

## Pinning a parser version

Raw GitHub `main` moves. To pin:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/<commit-sha>/nexitally-node-parser.js
```

Re-pin after reading the diff. Resource parsers cannot `$task.fetch` a changelog; pinning is a profile edit.

## Compatibility

- Quantumult X must support **resource parsers** (v1.0.8-build253+).
- AnyTLS nodes need a build that speaks AnyTLS (v1.5.6+ in upstream notes).
- Reality lines need a build that accepts `reality-base64-pubkey` / `reality-hex-shortid`.
- The parser itself is ES5-ish (`var`, no `const`) so older JS runtimes inside Quantumult X stay happy.

## What not to do

- Do not put `opt-parser=true` on filter/rewrite resources unless you have a parser that understands those formats. This script will look for `[server_local]` and error.
- Do not set this parser as `resource_parser_url` if other resources also set `opt-parser=true` and expect the KOP-XIAO mega-parser. Quantumult X has **one** parser URL. Either give Nexitally its own profile, or stop opting other resources into the parser.
