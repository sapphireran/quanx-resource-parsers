# The Nexitally problem

Nexitally's Quantumult X download is a **complete profile**: `[general]`, `[dns]`, `[policy]`, `[server_local]`, `[filter_local]`, and whatever else the panel decided to emit that day.

That is convenient on a blank install. It is hostile to a profile you already tuned:

1. **Configuration File → Download** replaces the active profile.
2. Local `[policy]` names, `[filter_remote]` pins, rewrite sets, and MitM hostnames disappear.
3. The next panel change (a new region tag, a traffic banner, a `[Premium]` stub) arrives only if you download again — and overwrite again.

Quantumult X already has the primitive this repo needs. A `[server_remote]` line can point at a URL, optionally run a **resource parser** on the response, and keep the rest of the profile untouched.

```
Nexitally panel
      │
      │  HTTPS, fetched by Quantumult X itself
      ▼
$resource.content   = full managed .conf
      │
      │  nexitally-node-parser.js  (this repo)
      ▼
$done({ content })  = server lines only
      │
      ▼
[server_remote] tag=Nexitally
      │
      ▼
your local [policy] / [filter_remote] / [rewrite_local] stay yours
```

The parser is a **section extractor**, not a protocol converter. If the response is Clash YAML, an HTML login page, or an already-flat node list without `[server_local]`, it returns an error instead of guessing.

## What we keep from the managed file

Only lines that, after trim:

- sit inside the first `[server_local]` section,
- start with one of the seven Quantumult X server prefixes the script lists,
- do not look like traffic / expiry / `[Premium]` banners,
- have not already been kept (exact-line dedupe).

Everything else in the managed file is discarded on purpose. That includes `[policy]` groups that Nexitally may have generated. Those groups belong in *your* profile, named the way you already reference them.

## What we do not keep from the managed file

- `[general]` / `[dns]` / `[mitm]` — those are device policy, not nodes.
- Filter and rewrite sections — a node refresh must not rewrite your rule set.
- Info rows such as `Traffic: 128 GB` or `剩余流量` — they are not servers, and they leak plan data into a resource you might screenshot.
- Duplicate server lines — Quantumult X would otherwise show two identical candidates.

## Exit condition

If Nexitally later publishes an official **server-only** Quantumult X subscription, delete `resource_parser_url` for this resource and point `[server_remote]` at that official URL. The parser is a compatibility shim, not a product.
