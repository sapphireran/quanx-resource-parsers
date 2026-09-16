# Troubleshooting

Personal checklist when **Server Resources → Nexitally** misbehaves. No live URLs belong in issues or commits.

## The update says there is no custom parser

`resource_parser_url` is missing, commented, or still pointing at the old `pang990801/quanx-resource-parsers` jsDelivr path. This repository is `sapphireran/quanx-resource-parsers`. Use the raw GitHub URL in [README.md](../README.md), refresh resources, and fully quit the app.

## The update succeeds but the whole profile was replaced

That is **Configuration File → Download**, not a server-resource refresh. Put the private URL under `[server_remote]` with `opt-parser=true` and leave the local file as the active profile.

## Error: `[server_local] section was not found`

The body Quantumult X downloaded is not a full configuration, or `[server_local]` is spelled in a way the regex misses.

Lab twins:

- [`missing-server-local.conf`](../lab/fixtures/missing-server-local.conf) — only `[server_remote]`
- [`wrong-section-server-remote.conf`](../lab/fixtures/wrong-section-server-remote.conf) — nodes under the wrong header
- [`header-no-newline.conf`](../lab/fixtures/header-no-newline.conf) — header without a following newline

A login HTML page or a Clash YAML dump also fails this check.

## Error: `no usable server entries were found`

The section was found. After comments, prefix checks, info/premium filters, and dedup, nothing remained.

Lab twin: [`empty-usable.conf`](../lab/fixtures/empty-usable.conf).

If you expected nodes, look at the tags: `剩余`, `流量`, `到期`, `套餐`, `Traffic`, `Expire`, `Reset`, `Days Left`, and `[Premium]` all drop a line. `Preset` is dropped because it contains `Reset`.

## Nodes refresh but `[Premium]` or traffic rows still appear

The parser is not running. Confirm `opt-parser=true` on **that** resource. Confirm the global `resource_parser_url` is this script. A generic converter may keep info rows.

## Some real nodes are missing

1. They sit after a `[Premium]` or other `[section]` header — the extract stops there ([`premium-tag-and-stub.conf`](../lab/fixtures/premium-tag-and-stub.conf)).
2. They use an unsupported prefix ([`unsupported-family.conf`](../lab/fixtures/unsupported-family.conf)).
3. The tag tripped a substring filter ([`reset-substring.conf`](../lab/fixtures/reset-substring.conf), [`zh-info-nodes.conf`](../lab/fixtures/zh-info-nodes.conf)).
4. They are exact duplicates of an earlier line ([`duplicate-after-trim.conf`](../lab/fixtures/duplicate-after-trim.conf)).
5. They live in a **second** `[server_local]` ([`first-of-two-sections.conf`](../lab/fixtures/first-of-two-sections.conf)).

Replay a sanitized copy with `node lab/run.js --explain FILE` before changing the script.

## AnyTLS nodes appear as unknown / unavailable

The parser forwarded them; the Quantumult X build does not speak AnyTLS. Need 1.6.0 or 1.5.6 TF 914+.

## jsDelivr is serving an old parser

Switch `resource_parser_url` to `raw.githubusercontent.com` (see README). jsDelivr caches `@main`.

## I almost pasted a live export into the repo

Stop. Follow [privacy.md](privacy.md). Rewrite hosts to `.example.invalid` and secrets to `placeholder` before any `git add`.
