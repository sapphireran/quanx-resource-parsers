# Parser URL variants

Quantumult X accepts a remote URL or a local script path in `[general] resource_parser_url`. This personal repo publishes one script: `nexitally-node-parser.js`.

## Remote URLs

Use either:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Pin a commit if you do not want a moving `@main` target:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@COMMIT_SHA/nexitally-node-parser.js
```

An older jsDelivr path under `pang990801/quanx-resource-parsers` may still be cached from the original personal upload. Prefer `sapphireran/quanx-resource-parsers`.

## Local / iCloud copy

1. Save `nexitally-node-parser.js` to `Quantumult X/Scripts` on iCloud Drive or On My iPhone.
2. Point the profile at the filename:

```ini
resource_parser_url = nexitally-node-parser.js
```

Local copies are useful when GitHub or jsDelivr is unreachable from the device. Remember to copy the file again after you pull parser changes.

## Resource line

The parser only runs for resources with `opt-parser=true`:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`update-interval=21600` is six hours. Use a negative value to disable automatic refresh.

`tag=Nexitally` is what `[policy] resource-tag-regex=^Nexitally` matches. Rename both together if you want a different label.
