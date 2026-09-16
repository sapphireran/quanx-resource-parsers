# Personal Quantumult X profile snippets

These snippets show how the Nexitally parser is wired into a **local** Quantumult X profile. They are not a complete profile and they do not include a Nexitally URL.

Copy the shape. Replace the placeholder URL on your device only.

## Pieces

1. `general-parser.conf` — point `[general]` at this repository's parser.
2. `server-remote.conf` — subscribe to Nexitally's full-configuration URL as a server resource and opt into the parser.
3. `policy-with-resource-tag.conf` — build a policy from every server that arrived with `tag=Nexitally`.

Together they replace "download the whole Nexitally profile again" with "refresh one server resource".

## Local vs remote URLs

| URL | Public? | Where it lives |
| --- | --- | --- |
| Parser (`resource_parser_url`) | yes | this repository / jsDelivr / GitHub raw |
| Nexitally full-configuration URL | **no** | only in the Quantumult X profile on your device |

If a snippet in this folder ever shows a URL that is not `example.com`, `example.invalid`, GitHub, or jsDelivr for **this** repository, treat that as a bug and remove it.
