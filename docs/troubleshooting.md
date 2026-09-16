# Troubleshooting

All of these assume the parser URL is reachable and the Nexitally URL stays private on the device.

## Quantumult X says there is no custom resource parser

`[general]` is missing `resource_parser_url`, or the line is still commented with `;`.

Use one of the URLs in `examples/nexitally/snippets/general-parser.conf`. Then toggle the parser on for the Nexitally resource (`opt-parser=true`).

## Refresh succeeds but the node list is empty

Work through this list in order:

1. **Parser not attached.** The resource line lacks `opt-parser=true`. Quantumult X then tries to import a full profile as a server list and keeps nothing useful.
2. **Wrong URL.** The resource is a dashboard HTML page, a Clash file, or a server-only list that has no `[server_local]` section. The parser error is `Nexitally parser: [server_local] section was not found.`
3. **Section is only metadata.** The download has `[server_local]` but every line is traffic, `[Premium]`, or an unsupported prefix. Error: `Nexitally parser: no usable server entries were found.`
4. **AnyTLS-only list on an old Quantumult X.** The parser will still *return* `anytls =` lines. The app may hide or reject them if that build cannot use AnyTLS. Update Quantumult X.
5. **Policy still points at old local names.** Nodes imported, but groups were hardcoded to `[server_local]` tags from a previous full-profile import. Point groups at `resource-tag-regex=^Nexitally` (see `examples/nexitally/snippets/policy-unchanged.conf`).

Reproduce the body-shape failures locally by saving a **redacted** copy and running:

```bash
node scripts/run-parser.js --json /path/to/redacted.conf
```

Redact hostnames and passwords before the file touches a shared disk. Do not add that file to git.

## Refresh shows the `[server_local] section was not found` error

The body the app downloaded is not a Quantumult X configuration with that heading.

Common causes:

- URL is the provider dashboard, not Configuration File → Download
- HTTP body is a login page or JSON error
- File is Clash / Surge / base64 URI list
- Copy-paste added a UTF-16 export that still parses as text but lost the heading (rare)

The local fixtures `examples/nexitally/missing-server-local/` and `examples/nexitally/happy-path/` are the two ends of this check.

## Refresh shows `no usable server entries`

The heading exists. Every line inside it failed the keep rules.

Compare against `examples/nexitally/only-comments-and-excluded/` and `examples/nexitally/premium-and-traffic/`. If a real node is being dropped, it almost always contains one of:

`[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`

Those tokens are matched case-insensitively as substrings. A tag like `Reset-HK-01` will be dropped. If that happens on a genuine node name, change the filter in the parser **and** add a fixture that states the new rule. Do not special-case a live hostname.

## Nodes appear twice

Two different `[server_remote]` lines, or leftover `[server_local]` copies from an old full-profile import, plus the parsed resource.

The parser only dedupes **inside one response**. It cannot see servers that already exist in the profile. Remove the old local copies.

Exact duplicates *inside* one Nexitally body are collapsed; see `examples/nexitally/duplicates/`.

## Policy / filter / MITM changed after a refresh

You refreshed the wrong thing. **Configuration File → Download** replaces the profile. **Server Resources → Nexitally** should only replace that resource.

If a server parser ever starts returning INI section headers, Quantumult X may mis-import them. This parser must keep returning bare server lines. `npm test` fails if a happy-path fixture suddenly includes `[policy]`.

## Parser URL 404s

`main` moved, the file was renamed, or jsDelivr has not picked up the commit yet. Raw GitHub URLs update with the push. jsDelivr can lag; pin a SHA if a device must stay on a known file.

## Local `npm test` fails after a parser edit

The fixtures are the spec. Either update the expected file because the behavior change is intentional, or the edit is a regression.

```bash
node scripts/run-parser.js examples/nexitally/happy-path/input.conf
diff -u examples/nexitally/happy-path/expected.txt -
```

Do not "fix" a test by pasting a live export into `input.conf`.
