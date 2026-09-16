"use strict";

const fs = require("fs");
const path = require("path");

const UUID = "23ad6b10-8d1a-40f7-8ad0-e3e35cd32291";
const REALITY =
  "reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef";

const JP_A =
  "anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=JP-Tokyo-A";
const JP_B =
  "anytls=osaka-b.nodes.example.test:443, password=pwd, over-tls=true, tls-host=apple.com, " +
  REALITY +
  ", udp-relay=true, tag=JP-Osaka-B";
const HK_A =
  "shadowsocks=hk-a.nodes.example.test:443, method=chacha20-ietf-poly1305, password=pwd, obfs=wss, obfs-host=www.apple.com, udp-relay=true, tag=HK-A";
const SG_A =
  "vmess=sg-a.nodes.example.test:443, method=none, password=" +
  UUID +
  ", obfs=wss, obfs-host=www.apple.com, obfs-uri=/ws, udp-relay=true, tag=SG-A";
const US_A =
  "vless=us-a.nodes.example.test:443, method=none, password=" +
  UUID +
  ", obfs=over-tls, obfs-host=www.apple.com, udp-relay=true, tag=US-A";
const DE_A =
  "trojan=de-a.nodes.example.test:443, password=pwd, over-tls=true, tls-host=www.apple.com, tls-verification=true, udp-relay=true, tag=DE-A";
const HTTP_A =
  "http=helper-a.nodes.example.test:8080, username=user, password=pwd, over-tls=false, tag=Helper-HTTP";
const SOCKS_A =
  "socks5=helper-b.nodes.example.test:1080, username=user, password=pwd, over-tls=false, tag=Helper-SOCKS5";

const typical = `# Synthetic Nexitally-style Quantumult X full configuration.
# Hosts are *.example.test. Passwords are placeholders.
# This is NOT a live subscription and must not be fetched.

[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
server_check_url = http://www.apple.com/generate_204

[dns]
no-ipv6
server = 223.5.5.5

[policy]
static = Nexitally, JP-Tokyo-A, JP-Osaka-B, HK-A, img-url=https://example.test/icon.png
static = Proxy, Nexitally, DIRECT
static = Final, Proxy, DIRECT

[server_local]
# English info banners
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Traffic: 12.3/100GB
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Expire: 2099-12-31
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Reset: 5 Days Left

# Chinese info banners
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=流量: 12.3/100GB
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=到期: 2099-12-31
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=剩余: 5天
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=套餐: Premium

# Premium placeholder
anytls=premium.example.test:443, password=pwd, over-tls=true, tls-host=apple.com, tag=JP-01 [Premium]

${JP_A}
${JP_B}
${HK_A}
${SG_A}
${US_A}
${DE_A}
${HTTP_A}
${SOCKS_A}

# duplicate of JP-Tokyo-A
${JP_A}

;anytls=commented.example.test:443, password=pwd, over-tls=true, tag=Commented
#anytls=hash-comment.example.test:443, password=pwd, over-tls=true, tag=HashCommented
//anytls=slash-comment.example.test:443, password=pwd, over-tls=true, tag=SlashCommented

hysteria=hy.example.test:443, password=pwd, tag=HY-Drop
wireguard=wg.example.test:51820, tag=WG-Drop
https=https-helper.nodes.example.test:443, username=user, password=pwd, tag=HTTPS-Drop

[server_remote]
https://example.test/do-not-fetch, tag=Ignored

[filter_local]
host, example.test, direct
final, Proxy

[rewrite_local]

[mitm]
`;

const cases = [
  {
    id: "typical-managed-full",
    title: "Synthetic Nexitally-style full profile",
    group: "happy-path",
    expect: "content",
    notes:
      "Looks like a provider full-config download. The cut stops at [server_remote]. Info banners, [Premium], comments, duplicates, and non-QX schemes are dropped. Eight usable servers remain.",
    input: typical,
  },
  {
    id: "protocol-roster",
    title: "All seven supported prefixes",
    group: "happy-path",
    expect: "content",
    notes:
      "One line per supported scheme, mixed case on the last two prefixes. http is kept; this file does not include https=.",
    input: `[server_local]
${JP_A}
${HK_A}
${SG_A}
${US_A}
${DE_A}
HTTP=helper-a.nodes.example.test:8080, username=user, password=pwd, tag=Helper-HTTP-UC
Socks5=helper-b.nodes.example.test:1080, username=user, password=pwd, tag=Helper-SOCKS5-UC
`,
  },
  {
    id: "anytls-reality",
    title: "AnyTLS with Reality sample keys",
    group: "happy-path",
    expect: "content",
    notes:
      "Reality parameters come from Quantumult X public sample.conf. The parser does not inspect them; the whole anytls= line is kept.",
    input: `[server_local]
${JP_B}
`,
  },
  {
    id: "ss2022-and-ssr-extras",
    title: "Shadowsocks 2022 and ssr-protocol extras",
    group: "happy-path",
    expect: "content",
    notes:
      "Prefix is shadowsocks, so SS2022 methods and ssr-protocol= extras are kept. A line starting shadowsocksr= would not be.",
    input: `[server_local]
shadowsocks=ss2022.nodes.example.test:80, method=2022-blake3-aes-128-gcm, password=placeholder, udp-relay=true, tag=SS2022-A
shadowsocks=ssr-extra.nodes.example.test:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, ssr-protocol-param=def, obfs=tls1.2_ticket_fastauth, obfs-host=apple.com, tag=SSR-as-SS
shadowsocksr=not-a-prefix.nodes.example.test:443, password=pwd, tag=SSR-Drop
`,
  },
  {
    id: "ipv6-and-cjk-tags",
    title: "IPv6 literal and CJK tags",
    group: "happy-path",
    expect: "content",
    notes:
      "Documentation IPv6 2001:db8::10. CJK in the tag is kept unless the line also matches 流量/到期/剩余/套餐.",
    input: `[server_local]
anytls=[2001:db8::10]:443, password=pwd, over-tls=true, tls-host=apple.com, tag=文档-东京-A
trojan=de-a.nodes.example.test:443, password=pwd, over-tls=true, tls-host=www.apple.com, tag=法兰克福-A
`,
  },
  {
    id: "header-mixed-case",
    title: "[SERVER_LOCAL] mixed case",
    group: "header",
    expect: "content",
    notes: "The section regex is case-insensitive.",
    input: `[SERVER_LOCAL]
${JP_A}
`,
  },
  {
    id: "header-leading-ws",
    title: "Indented [server_local]",
    group: "header",
    expect: "content",
    notes: "Horizontal whitespace before the header is allowed.",
    input: `   [server_local]
${JP_A}
`,
  },
  {
    id: "header-inner-spaces",
    title: "[ server_local ] does not match",
    group: "header",
    expect: "error-missing",
    notes:
      "Inner spaces around the name are not \\s* inside the brackets. This is a miss, not an empty section.",
    input: `[ server_local ]
${JP_A}
`,
  },
  {
    id: "section-at-eof",
    title: "[server_local] last section",
    group: "header",
    expect: "content",
    notes: "Lookahead also accepts EOF, so no following [section] is required.",
    input: `[general]
server_check_url = http://www.apple.com/generate_204

[server_local]
${JP_A}
${HK_A}
`,
  },
  {
    id: "first-of-two-sections",
    title: "First of two [server_local] blocks",
    group: "header",
    expect: "content",
    notes:
      "Non-greedy match + next [header] terminator. The second block is after [filter_local] and is ignored. A second [server_local] would also be ignored if it followed the first without a terminator — only the first cut is used.",
    input: `[server_local]
${JP_A}

[filter_local]
final, direct

[server_local]
${HK_A}
`,
  },
  {
    id: "premium-section-terminator",
    title: "[Premium] as a section header ends the cut",
    group: "header",
    expect: "content",
    notes:
      "Lookahead is any [bracket] line, not a whitelist of QX sections. Nodes after [Premium] never reach the filter.",
    input: `[server_local]
${JP_A}

[Premium]
${HK_A}
`,
  },
  {
    id: "preamble-then-section",
    title: "Banner text before [server_local]",
    group: "header",
    expect: "content",
    notes: "Preamble is outside the cut. The first real header still matches after a newline.",
    input: `Nexitally Quantumult X
Traffic notice: ignore this preamble

[server_local]
${JP_A}
`,
  },
  {
    id: "commented-false-header",
    title: "Commented [server_local] is not a header",
    group: "header",
    expect: "content",
    notes:
      ";[server_local] does not match. The later uncommented header is the cut.",
    input: `;[server_local]
anytls=trap.example.test:443, password=pwd, over-tls=true, tag=Trap

[server_local]
${JP_A}
`,
  },
  {
    id: "glued-header",
    title: "Header glued to a server line",
    group: "errors",
    expect: "error-missing",
    notes: "A newline after [server_local] is required.",
    input: `[server_local]${JP_A}
`,
  },
  {
    id: "header-no-newline",
    title: "[server_local] at EOF without body newline",
    group: "errors",
    expect: "error-missing",
    notes: "The regex needs \\\\s*\\\\n after the header. A file that is only the header is a miss.",
    input: `[server_local]`,
  },
  {
    id: "comments-and-duplicates",
    title: "Comment styles and exact-line dedup",
    group: "keep-drop",
    expect: "content",
    notes:
      "Three comment prefixes. Duplicate after surrounding spaces is trimmed then dropped. Same host, different tag, is kept twice.",
    input: `[server_local]
; comment semicolon
# comment hash
// comment slash

${JP_A}
  ${JP_A}  
${JP_A.replace("tag=JP-Tokyo-A", "tag=JP-Tokyo-A-backup")}
`,
  },
  {
    id: "inline-hash-kept",
    title: "Inline # in a tag is not a comment",
    group: "keep-drop",
    expect: "content",
    notes: "Comments are whole-line only. tag=JP-#1 is kept.",
    input: `[server_local]
anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tls-host=apple.com, tag=JP-#1
`,
  },
  {
    id: "space-before-equals",
    title: "Space before = on the scheme",
    group: "keep-drop",
    expect: "content",
    notes: "supported allows \\\\s*= so AnyTLS =host is kept.",
    input: `[server_local]
anytls =tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tag=JP-Spaced
`,
  },
  {
    id: "tabs-trimmed",
    title: "Leading tabs trimmed",
    group: "keep-drop",
    expect: "content",
    notes: "trim() removes tabs before the scheme test.",
    input: `[server_local]
\t${JP_A}
`,
  },
  {
    id: "http-vs-https",
    title: "http kept, https dropped",
    group: "keep-drop",
    expect: "content",
    notes: "http\\\\s*= does not match https=.",
    input: `[server_local]
${HTTP_A}
https=https-helper.nodes.example.test:443, username=user, password=pwd, tag=HTTPS-Drop
http =helper-c.nodes.example.test:8080, username=user, password=pwd, tag=Helper-HTTP-Spaced
`,
  },
  {
    id: "socks5-vs-socks",
    title: "socks5 kept, socks dropped",
    group: "keep-drop",
    expect: "content",
    notes: "socks= is not in the prefix list.",
    input: `[server_local]
${SOCKS_A}
socks=legacy.nodes.example.test:1080, username=user, password=pwd, tag=SOCKS-Drop
`,
  },
  {
    id: "unsupported-family",
    title: "Hysteria, TUIC, WireGuard, URI lines",
    group: "keep-drop",
    expect: "content",
    notes:
      "Only the shadowsocks line is kept. URI schemes and Clash-ish keys are DROP_SCHEME. The section still has one usable server so this is content, not the empty-section error.",
    input: `[server_local]
hysteria=hy.example.test:443, password=pwd, tag=HY
hysteria2=hy2.example.test:443, password=pwd, tag=HY2
tuic=tuic.example.test:443, password=pwd, tag=TUIC
wireguard=wg.example.test:51820, tag=WG
vmess://example.test
${HK_A}
`,
  },
  {
    id: "en-info-banners",
    title: "English Traffic/Expire/Reset/Days Left",
    group: "keep-drop",
    expect: "content",
    notes: "Banners dropped; JP-Tokyo-A kept. Days Left needs the space.",
    input: `[server_local]
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Traffic: 12.3/100GB
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Expire: 2099-12-31
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Reset: 5 Days Left
${JP_A}
`,
  },
  {
    id: "zh-info-banners",
    title: "Chinese 流量/到期/剩余/套餐",
    group: "keep-drop",
    expect: "content",
    notes: "Four CN needles. The real node is kept.",
    input: `[server_local]
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=流量: 12.3/100GB
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=到期: 2099-12-31
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=剩余: 5天
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=套餐: 标准
${JP_A}
`,
  },
  {
    id: "premium-in-tag",
    title: "[Premium] in tag vs Premium without brackets",
    group: "keep-drop",
    expect: "content",
    notes:
      "tag=JP-01 [Premium] is dropped. tag=JP-01 Premium is kept because the needle is [Premium] with brackets.",
    input: `[server_local]
anytls=premium.example.test:443, password=pwd, over-tls=true, tag=JP-01 [Premium]
anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tag=JP-01 Premium
`,
  },
  {
    id: "reset-substring-trap",
    title: "Reset as a substring of a real tag",
    group: "keep-drop",
    expect: "content",
    notes:
      "tag=Reset-HK-01 is dropped. tag=restart-HK-01 is kept. This locks current unanchored behavior.",
    input: `[server_local]
anytls=hk-reset.nodes.example.test:443, password=pwd, over-tls=true, tag=Reset-HK-01
anytls=hk-restart.nodes.example.test:443, password=pwd, over-tls=true, tag=restart-HK-01
`,
  },
  {
    id: "days-left-spacing",
    title: "Days Left vs DaysLeft",
    group: "keep-drop",
    expect: "content",
    notes: "Needle is the two-word phrase. DaysLeft is kept.",
    input: `[server_local]
anytls=info.example.test:443, password=pwd, over-tls=true, tag=Days Left-01
anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tag=DaysLeft-01
`,
  },
  {
    id: "false-friend-password",
    title: "Traffic inside password=",
    group: "keep-drop",
    expect: "content",
    notes:
      "Unanchored Traffic drops password=TrafficJam. The sibling node is kept.",
    input: `[server_local]
anytls=trap.example.test:443, password=TrafficJam, over-tls=true, tag=Trap
${JP_A}
`,
  },
  {
    id: "filter-rules-inside-section",
    title: "Filter rules mixed into [server_local]",
    group: "keep-drop",
    expect: "content",
    notes: "HOST / IP-CIDR / final lines are DROP_SCHEME.",
    input: `[server_local]
${JP_A}
host, example.test, direct
ip-cidr, 192.0.2.0/24, direct
final, Proxy
`,
  },
  {
    id: "policy-lookalikes",
    title: "Policy lines inside [server_local]",
    group: "keep-drop",
    expect: "content",
    notes: "static = … is not a server prefix.",
    input: `[server_local]
static = Nexitally, JP-Tokyo-A, DIRECT
${JP_A}
`,
  },
  {
    id: "block-comment-not-recognized",
    title: "C-style block comment is not a comment",
    group: "keep-drop",
    expect: "content",
    notes:
      "/* … */ is DROP_SCHEME, not COMMENT. The anytls line after it is kept.",
    input: `[server_local]
/* not a Quantumult X comment */
${JP_A}
`,
  },
  {
    id: "same-host-different-tag",
    title: "Same host, different tag, both kept",
    group: "keep-drop",
    expect: "content",
    notes: "Dedup key is the whole trimmed line.",
    input: `[server_local]
anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tag=JP-A
anytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tag=JP-B
`,
  },
  {
    id: "missing-server-local",
    title: "Full profile without [server_local]",
    group: "errors",
    expect: "error-missing",
    notes: "Policy and filters are present; the cut still fails.",
    input: `[general]
server_check_url = http://www.apple.com/generate_204

[policy]
static = Proxy, DIRECT

[filter_local]
final, Proxy
`,
  },
  {
    id: "empty-server-local",
    title: "Empty [server_local] then [policy]",
    group: "errors",
    expect: "error-empty",
    notes: "Header matches; no usable lines.",
    input: `[server_local]

[policy]
static = Proxy, DIRECT
`,
  },
  {
    id: "comments-only",
    title: "Only comments inside the section",
    group: "errors",
    expect: "error-empty",
    notes: "Comments are not usable servers.",
    input: `[server_local]
; ${JP_A}
# ${HK_A}
// ${SG_A}
`,
  },
  {
    id: "placeholders-only",
    title: "Only banners and [Premium]",
    group: "errors",
    expect: "error-empty",
    notes: "Section found, every line DROP_INFO.",
    input: `[server_local]
shadowsocks=info.example.test:443, method=aes-128-gcm, password=pwd, tag=Traffic: 0
anytls=premium.example.test:443, password=pwd, over-tls=true, tag=XX [Premium]
`,
  },
  {
    id: "already-server-only",
    title: "Server lines without a section header",
    group: "errors",
    expect: "error-missing",
    notes: "A provider server-only resource does not need this parser.",
    input: `${JP_A}
${HK_A}
`,
  },
  {
    id: "server-remote-not-local",
    title: "Servers listed under [server_remote]",
    group: "errors",
    expect: "error-missing",
    notes: "Wrong section name.",
    input: `[server_remote]
${JP_A}
`,
  },
  {
    id: "clash-yaml",
    title: "Clash YAML body",
    group: "errors",
    expect: "error-missing",
    notes: "Wrong download format in the provider dashboard.",
    input: `proxies:
  - name: JP-Tokyo-A
    type: ss
    server: tokyo-a.nodes.example.test
    port: 443
    cipher: chacha20-ietf-poly1305
    password: pwd
`,
  },
  {
    id: "html-interstitial",
    title: "HTML login/interstitial page",
    group: "errors",
    expect: "error-missing",
    notes: "Expired token or a URL that needs a browser cookie.",
    input: `<!doctype html>
<html>
  <head><title>Sign in</title></head>
  <body>
    <h1>Sign in</h1>
    <p>This is not a Quantumult X configuration.</p>
  </body>
</html>
`,
  },
  {
    id: "empty-file",
    title: "Empty body",
    group: "errors",
    expect: "error-missing",
    notes: "Missing $resource.content and empty downloads both normalize to empty string.",
    input: "",
  },
  {
    id: "bom-crlf",
    title: "UTF-8 BOM and CRLF wrap",
    group: "encoding",
    expect: "content",
    wrap: { bom: true, crlf: true },
    notes:
      "The fixture file is LF. tools/check.js prefixes U+FEFF and maps newlines to CRLF before $resource.content. The parser strips both.",
    input: `[server_local]
${JP_A}
${HK_A}
`,
  },
];

const ERROR_MISSING = "Nexitally parser: [server_local] section was not found.";
const ERROR_EMPTY = "Nexitally parser: no usable server entries were found.";

function errorMessage(kind) {
  if (kind === "error-missing") return ERROR_MISSING;
  if (kind === "error-empty") return ERROR_EMPTY;
  return null;
}

const root = path.join(__dirname, "..", "examples");
const casesRoot = path.join(root, "cases");
fs.mkdirSync(casesRoot, { recursive: true });

const catalog = {
  parser: "nexitally-node-parser.js",
  errorMissing: ERROR_MISSING,
  errorEmpty: ERROR_EMPTY,
  cases: [],
};

for (const c of cases) {
  const dir = path.join(casesRoot, c.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "input.conf"), c.input, "utf8");
  fs.writeFileSync(path.join(dir, "notes.md"), c.notes.trim() + "\n", "utf8");
  const err = errorMessage(c.expect);
  if (err) {
    fs.writeFileSync(path.join(dir, "expected-error.txt"), err + "\n", "utf8");
  }
  catalog.cases.push({
    id: c.id,
    title: c.title,
    group: c.group,
    input: `examples/cases/${c.id}/input.conf`,
    notes: `examples/cases/${c.id}/notes.md`,
    expect:
      c.expect === "content"
        ? { kind: "content", file: `examples/cases/${c.id}/expected.txt` }
        : { kind: "error", file: `examples/cases/${c.id}/expected-error.txt` },
    receipt: `examples/cases/${c.id}/receipt.json`,
    wrap: c.wrap || null,
  });
}

fs.writeFileSync(
  path.join(root, "catalog.json"),
  JSON.stringify(catalog, null, 2) + "\n",
  "utf8"
);

console.log("seeded %d cases", cases.length);
