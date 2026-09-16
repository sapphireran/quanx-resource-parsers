# Keep / drop matrix

Generated from `lab/fixtures/catalog.json` by `node lab/run.js --matrix`.
Counts are **inside** the first `[server_local]` section after BOM/CRLF normalization.
The explainer uses the same keep/drop rules as `nexitally-node-parser.js` and is checked against the real parser on every `npm test`.

| Fixture | Section | Result | Keep | Empty | Comment | Unsupported | Info/Premium | Duplicate |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [`nexitally-style-full`](../lab/fixtures/nexitally-style-full.conf) | yes | 3 kept | 3 | 0 | 1 | 0 | 3 | 1 |
| [`zh-info-nodes`](../lab/fixtures/zh-info-nodes.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 4 | 0 |
| [`en-info-nodes`](../lab/fixtures/en-info-nodes.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 4 | 0 |
| [`premium-tag-and-stub`](../lab/fixtures/premium-tag-and-stub.conf) | yes | 1 kept | 1 | 0 | 0 | 0 | 1 | 0 |
| [`official-protocol-mix`](../lab/fixtures/official-protocol-mix.conf) | yes | 8 kept | 8 | 1 | 0 | 0 | 0 | 0 |
| [`unsupported-family`](../lab/fixtures/unsupported-family.conf) | yes | 1 kept | 1 | 1 | 0 | 4 | 0 | 0 |
| [`comment-styles`](../lab/fixtures/comment-styles.conf) | yes | 1 kept | 1 | 1 | 3 | 0 | 0 | 0 |
| [`duplicate-after-trim`](../lab/fixtures/duplicate-after-trim.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 0 | 2 |
| [`crlf-utf8-bom`](../lab/fixtures/crlf-utf8-bom.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 0 | 1 |
| [`section-case-and-indent`](../lab/fixtures/section-case-and-indent.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 0 | 0 |
| [`section-eof`](../lab/fixtures/section-eof.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 0 | 0 |
| [`section-cut-by-filter`](../lab/fixtures/section-cut-by-filter.conf) | yes | 1 kept | 1 | 0 | 0 | 0 | 0 | 0 |
| [`missing-server-local`](../lab/fixtures/missing-server-local.conf) | no | [server_local] section was not found. | 0 | 0 | 0 | 0 | 0 | 0 |
| [`empty-usable`](../lab/fixtures/empty-usable.conf) | yes | no usable server entries were found. | 0 | 1 | 2 | 0 | 1 | 0 |
| [`header-no-newline`](../lab/fixtures/header-no-newline.conf) | no | [server_local] section was not found. | 0 | 0 | 0 | 0 | 0 | 0 |
| [`wrong-section-server-remote`](../lab/fixtures/wrong-section-server-remote.conf) | no | [server_local] section was not found. | 0 | 0 | 0 | 0 | 0 | 0 |
| [`ipv6-and-tabs`](../lab/fixtures/ipv6-and-tabs.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 0 | 0 |
| [`first-of-two-sections`](../lab/fixtures/first-of-two-sections.conf) | yes | 1 kept | 1 | 0 | 0 | 0 | 0 | 0 |
| [`protocol-case-and-spacing`](../lab/fixtures/protocol-case-and-spacing.conf) | yes | 2 kept | 2 | 1 | 0 | 0 | 0 | 0 |
| [`reset-substring`](../lab/fixtures/reset-substring.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 1 | 0 |
| [`days-left-spacing`](../lab/fixtures/days-left-spacing.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 1 | 0 |
| [`policy-lookalikes`](../lab/fixtures/policy-lookalikes.conf) | yes | 1 kept | 1 | 1 | 0 | 2 | 0 | 0 |
| [`http-socks-helpers`](../lab/fixtures/http-socks-helpers.conf) | yes | 2 kept | 2 | 1 | 0 | 0 | 0 | 0 |
| [`preamble-then-section`](../lab/fixtures/preamble-then-section.conf) | yes | 1 kept | 1 | 1 | 0 | 0 | 0 | 0 |

## Rule order

1. Strip a leading UTF-8 BOM and rewrite CRLF to LF.
2. Take the first `[server_local]` block that is followed by a newline. The next `[section]` header ends the block.
3. Trim each line.
4. Drop empty lines and `;` / `#` / `//` comments.
5. Keep only `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5` prefixes (case-insensitive, spaces before `=` allowed).
6. Drop lines matching `[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, or `套餐`.
7. Drop an exact duplicate of an earlier kept line.
8. If nothing remains, return the documented error instead of an empty resource.
