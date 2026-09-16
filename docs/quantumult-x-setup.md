# Quantumult X setup

Use the parser from a **stable local profile**. Do not re-import Nexitally's
full configuration after the first time you have a profile you like.

Quantumult X allows **one** `resource_parser_url` in `[general]`. If you
already use Shawn's general parser, you cannot also point
`resource_parser_url` at this file. See [Troubleshooting](troubleshooting.md).

## 1. Pin the parser URL

In `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr mirror:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

To freeze behavior, replace `main` with a commit SHA.

After saving, long-press the Quantumult X home button and refresh
resources until the app reports that a custom parser is loaded. Fully
quit the app once if it still says there is no parser.

## 2. Add Nexitally as a server resource

Nexitally → **Configuration File → Download** (Quantumult X). Copy that
URL. It is an account-specific full profile. Keep it on the device.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Without it Quantumult X stores the raw
full configuration as if it were a node list, and the resource fails.

`update-interval=21600` is six hours. Use `-1` to refresh only manually.

Optional hash filters go on the URL, before the comma:

```ini
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>#in=HK+SG, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

See [Hash parameters](hash-parameters.md).

## 3. Refresh once

Server Resources → **Nexitally** → update. You should see node names such
as region tags, not `[general]` or filter rules.

Your `[policy]`, `[filter_remote]`, `[filter_local]`, and `[rewrite_*]`
sections stay as you wrote them. Point policy groups at the `Nexitally`
resource or at individual tags the parser emitted.

## 4. Do not mix import styles

| Action | Result |
| --- | --- |
| Import Nexitally's full config as the **profile** | Replaces the whole app configuration |
| Add the same URL under `[server_remote]` with this parser | Updates nodes only |
| Add the URL under `[server_remote]` **without** `opt-parser=true` | Invalid server resource |

After the local profile is in place, only use the server-resource path.

## Sample local profile

`examples/quantumult-x.local.example.conf` is a sketch of steps 1–2 with
a fake URL. Copy the shape, not the host.

## Compatibility

- Tested against Quantumult X configurations that include AnyTLS nodes.
- Requires a Quantumult X build that supports AnyTLS **and** resource
  parsers (AnyTLS landed in the 1.5.6 series).
- The parser script itself uses only `$resource` / `$done`, which exist
  from v1.0.8-build253 onward.
