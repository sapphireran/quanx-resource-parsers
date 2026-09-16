# Adding another personal parser

This repo is allowed to grow, but only with the same constraints as the Nexitally script.

## When a second file is justified

Add a new `*-parser.js` at the repository root when **all** of the following are true:

1. The source is a personal provider (or a personal export format), not a workplace profile.
2. The input is already Quantumult X text, or you are extracting a Quantumult X section — not converting Clash YAML in this repository unless you are ready to own that converter.
3. The script still contains **no** subscription URL and **no** account identifier.
4. You can describe keep / drop in one page of this field guide and lock it with fixtures under `examples/fixtures/`.

If Nexitally ships an official server-only subscription, do **not** add a parser. Delete the `[server_remote]` parser flag instead.

## Suggested shape (do not invent a framework)

Keep the Quantumult X file ES5, one `$done`, no Node `require`. Copy the Nexitally file's header comment style:

```javascript
/*
 * Quantumult X resource parser for <provider> managed full configurations.
 *
 * The subscription is fetched directly by Quantumult X. This parser
 * contains no subscription URL, account identifier, node password,
 * or other private information.
 */
```

Put laptop-only code in `scripts/`. The device never sees `scripts/`.

## Checklist before opening a PR

- [ ] New fixtures use `*.example.test` (or official `sample.conf` placeholders).
- [ ] `examples/catalog.json` lists every new fixture.
- [ ] `node scripts/verify.js` passes.
- [ ] Field guide page names the new error strings.
- [ ] README table lists the new file.
- [ ] No live URL, no real password, no `subscription-userinfo` dump.

## Dispatcher temptation

Quantumult X has a single `resource_parser_url`. A dispatcher that peeks at `$resource.content` and delegates is possible, but it is a new personal project with its own fixtures. Do not grow `nexitally-node-parser.js` into that dispatcher "just for now."
