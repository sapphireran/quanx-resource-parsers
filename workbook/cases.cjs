"use strict";

const MISSING = "Nexitally parser: [server_local] section was not found.";
const EMPTY = "Nexitally parser: no usable server entries were found.";

const JP = "anytls = jp.example.invalid:443, password=example-password, tls-verification=true, tls-host=jp.example.invalid, tag=JP-Tokyo-01";
const HK = "shadowsocks = hk.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, obfs=http, obfs-host=hk.example.invalid, tag=HK-Central-01";
const US = "vmess = us.example.invalid:443, method=aes-128-gcm, password=00000000-0000-4000-8000-000000000000, obfs=wss, obfs-host=us.example.invalid, obfs-uri=/vmess, tls13=true, tag=US-SJC-01";
const SG = "trojan = sg.example.invalid:443, password=example-password, over-tls=true, tls-host=sg.example.invalid, tls-verification=true, tag=SG-CBD-01";

const CASES = [
  {
    id: "managed-full-profile",
    title: "Managed full profile",
    summary: "Nexitally-shaped Quantumult X file: keep four nodes, drop dashboard chrome, ignore later sections.",
    expect: "content",
    expected: [JP, HK, US, SG],
    notes: [
      "This is the happy path the device sees after Configuration File → Download.",
      "Traffic / Expire / 流量 / [Premium] rows are not servers.",
      "[policy] and [filter_local] must not leak into the resource."
    ].join("\n"),
    input: [
      "# Fictional Quantumult X export. Hosts are documentation-only.",
      "[general]",
      "resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js",
      "dns_exclusion_list = *.example.invalid",
      "",
      "[dns]",
      "server = 192.0.2.53",
      "server = 192.0.2.54",
      "",
      "[policy]",
      "static = Nexitally, Nexitally, img-url=https://example.invalid/nexitally.png",
      "static = Proxy, Nexitally, direct",
      "",
      "[server_local]",
      "; dashboard chrome — not nodes",
      "shadowsocks = info.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, tag=Traffic: 128.00 GB / 500.00 GB",
      "shadowsocks = info.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, tag=Expire: 2099-12-31",
      "shadowsocks = info.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, tag=流量: 128.00 GB",
      "anytls = premium.example.invalid:443, password=example-password, tls-host=premium.example.invalid, tag=[Premium] Reserved",
      JP,
      HK,
      US,
      SG,
      "",
      "[filter_local]",
      "host, example.invalid, direct",
      "ip-cidr, 192.0.2.0/24, direct",
      "anytls = leaked.example.invalid:443, password=example-password, tag=Must-Not-Leak",
      "",
      "[rewrite_local]",
      "",
      "[mitm]",
      "hostname = *.example.invalid"
    ].join("\n") + "\n"
  },
  {
    id: "info-banners-en-zh",
    title: "English and Chinese info banners",
    summary: "Every excluded substring appears once; one ordinary node remains.",
    expect: "content",
    expected: ["anytls = osaka.example.invalid:443, password=example-password, tls-host=osaka.example.invalid, tag=JP-Osaka-01"],
    notes: "Excluded: Traffic, Expire, Reset, Days Left, 流量, 到期, 剩余, 套餐, [Premium].",
    input: [
      "[server_local]",
      "anytls = osaka.example.invalid:443, password=example-password, tls-host=osaka.example.invalid, tag=JP-Osaka-01",
      "anytls = info.example.invalid:443, password=example-password, tag=Traffic: 12 GB",
      "anytls = info.example.invalid:443, password=example-password, tag=Expire: 2099-12-31",
      "anytls = info.example.invalid:443, password=example-password, tag=Reset on the 1st",
      "anytls = info.example.invalid:443, password=example-password, tag=Days Left: 12",
      "anytls = info.example.invalid:443, password=example-password, tag=流量: 12 GB",
      "anytls = info.example.invalid:443, password=example-password, tag=到期: 2099-12-31",
      "anytls = info.example.invalid:443, password=example-password, tag=剩余: 12",
      "anytls = info.example.invalid:443, password=example-password, tag=套餐: Premium",
      "anytls = info.example.invalid:443, password=example-password, tag=[Premium] Slot",
      "[filter_local]",
      "geoip, cn, direct"
    ].join("\n") + "\n"
  },
  {
    id: "comment-styles",
    title: "Comment styles and blanks",
    summary: "; # // and empty lines are ignored after trim.",
    expect: "content",
    expected: ["anytls = kyoto.example.invalid:443, password=example-password, tag=JP-Kyoto-01"],
    notes: "A commented-out server line is still a comment, not a node.",
    input: [
      "[server_local]",
      "",
      "; semicolon comment",
      "# hash comment",
      "// slash comment",
      "; anytls = hidden.example.invalid:443, password=example-password, tag=Hidden",
      "   ",
      "anytls = kyoto.example.invalid:443, password=example-password, tag=JP-Kyoto-01",
      ""
    ].join("\n")
  },
  {
    id: "comment-false-header",
    title: "Commented [server_local] text",
    summary: "A comment that mentions [server_local] does not start or end the section.",
    expect: "content",
    expected: ["anytls = nagoya.example.invalid:443, password=example-password, tag=JP-Nagoya-01"],
    notes: "The section regex requires the header at the start of a line with only indent before `[`.",
    input: [
      "[server_local]",
      "; [server_local]",
      "# [server_local]",
      "anytls = nagoya.example.invalid:443, password=example-password, tag=JP-Nagoya-01",
      "[dns]",
      "server = 192.0.2.53"
    ].join("\n") + "\n"
  },
  {
    id: "duplicates-after-trim",
    title: "Duplicates after trim",
    summary: "The same server written twice, once indented, is kept once.",
    expect: "content",
    expected: ["anytls = fukuoka.example.invalid:443, password=example-password, tag=JP-Fukuoka-01"],
    notes: "Dedup key is the trimmed line, not the raw line.",
    input: [
      "[server_local]",
      "anytls = fukuoka.example.invalid:443, password=example-password, tag=JP-Fukuoka-01",
      "  anytls = fukuoka.example.invalid:443, password=example-password, tag=JP-Fukuoka-01",
      "anytls = fukuoka.example.invalid:443, password=example-password, tag=JP-Fukuoka-01"
    ].join("\n") + "\n"
  },
  {
    id: "protocol-roster",
    title: "All supported prefixes",
    summary: "anytls, shadowsocks, vmess, vless, trojan, http, socks5.",
    expect: "content",
    expected: [
      "anytls = a.example.invalid:443, password=example-password, tag=AnyTLS-01",
      "shadowsocks = b.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, tag=SS-01",
      "vmess = c.example.invalid:443, method=aes-128-gcm, password=00000000-0000-4000-8000-000000000000, tag=VMess-01",
      "vless = d.example.invalid:443, method=none, password=00000000-0000-4000-8000-000000000000, tag=VLESS-01",
      "trojan = e.example.invalid:443, password=example-password, over-tls=true, tag=Trojan-01",
      "http = f.example.invalid:8443, username=example-user, password=example-password, over-tls=true, tag=HTTP-01",
      "socks5 = g.example.invalid:1080, username=example-user, password=example-password, over-tls=true, tag=SOCKS5-01"
    ],
    notes: "The parser does not validate methods or ports. Prefix plus exclusions is enough.",
    input: [
      "[server_local]",
      "anytls = a.example.invalid:443, password=example-password, tag=AnyTLS-01",
      "shadowsocks = b.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, tag=SS-01",
      "vmess = c.example.invalid:443, method=aes-128-gcm, password=00000000-0000-4000-8000-000000000000, tag=VMess-01",
      "vless = d.example.invalid:443, method=none, password=00000000-0000-4000-8000-000000000000, tag=VLESS-01",
      "trojan = e.example.invalid:443, password=example-password, over-tls=true, tag=Trojan-01",
      "http = f.example.invalid:8443, username=example-user, password=example-password, over-tls=true, tag=HTTP-01",
      "socks5 = g.example.invalid:1080, username=example-user, password=example-password, over-tls=true, tag=SOCKS5-01"
    ].join("\n") + "\n"
  },
  {
    id: "section-fence-filter-policy",
    title: "Section fence",
    summary: "Lookalike server lines after [policy] / [filter_local] must not appear.",
    expect: "content",
    expected: ["anytls = only.example.invalid:443, password=example-password, tag=Only-In-Server-Local"],
    notes: "The slice is non-greedy up to the next [section] line.",
    input: [
      "[server_local]",
      "anytls = only.example.invalid:443, password=example-password, tag=Only-In-Server-Local",
      "[policy]",
      "anytls = policy.example.invalid:443, password=example-password, tag=Leaked-From-Policy",
      "static = Nexitally, Only-In-Server-Local",
      "[filter_local]",
      "anytls = filter.example.invalid:443, password=example-password, tag=Leaked-From-Filter"
    ].join("\n") + "\n"
  },
  {
    id: "header-mixed-case",
    title: "Mixed-case header",
    summary: "[Server_Local] matches; [POLICY] still terminates.",
    expect: "content",
    expected: ["anytls = case.example.invalid:443, password=example-password, tag=Case-01"],
    notes: "The /i flag applies to the header, not to later classification only.",
    input: [
      "[Server_Local]",
      "anytls = case.example.invalid:443, password=example-password, tag=Case-01",
      "[POLICY]",
      "static = Nexitally, Case-01"
    ].join("\n") + "\n"
  },
  {
    id: "header-indented",
    title: "Indented header",
    summary: "Spaces before [server_local] are allowed.",
    expect: "content",
    expected: ["anytls = indent.example.invalid:443, password=example-password, tag=Indent-01"],
    notes: "\\s* sits between the newline (or start) and the bracket.",
    input: [
      "[general]",
      "profile_img_url = https://example.invalid/profile.png",
      "  [server_local]",
      "anytls = indent.example.invalid:443, password=example-password, tag=Indent-01",
      "[filter_remote]",
      "https://example.invalid/rules.txt, tag=Rules, enabled=true"
    ].join("\n") + "\n"
  },
  {
    id: "header-trailing-space",
    title: "Trailing space on the header",
    summary: "[server_local] followed by spaces still matches.",
    expect: "content",
    expected: ["anytls = trail.example.invalid:443, password=example-password, tag=Trail-01"],
    notes: "The regex is \\[server_local\\]\\s*\\n.",
    input: [
      "[server_local]   ",
      "anytls = trail.example.invalid:443, password=example-password, tag=Trail-01"
    ].join("\n") + "\n"
  },
  {
    id: "section-at-eof",
    title: "Section at end of file",
    summary: "No following [section]; the slice runs to EOF.",
    expect: "content",
    expected: [
      "anytls = eof-a.example.invalid:443, password=example-password, tag=EOF-A",
      "anytls = eof-b.example.invalid:443, password=example-password, tag=EOF-B"
    ],
    notes: "The lookahead alternates with $.",
    input: [
      "[general]",
      "server_check_url = https://example.invalid/generate_204",
      "[server_local]",
      "anytls = eof-a.example.invalid:443, password=example-password, tag=EOF-A",
      "anytls = eof-b.example.invalid:443, password=example-password, tag=EOF-B"
    ].join("\n")
  },
  {
    id: "bom-crlf",
    title: "UTF-8 BOM and CRLF",
    summary: "Leading BOM is stripped; CRLF becomes LF before the section regex.",
    expect: "content",
    expected: [
      "anytls = bom-a.example.invalid:443, password=example-password, tag=BOM-A",
      "anytls = bom-b.example.invalid:443, password=example-password, tag=BOM-B"
    ],
    notes: "Materialize writes this file as UTF-8 BOM + CRLF bytes.",
    crlf: true,
    bom: true,
    input: [
      "[server_local]",
      "anytls = bom-a.example.invalid:443, password=example-password, tag=BOM-A",
      "anytls = bom-b.example.invalid:443, password=example-password, tag=BOM-B",
      "[filter_local]",
      "final, proxy"
    ].join("\n")
  },
  {
    id: "substring-reset-trap",
    title: "Reset / Traffic substring trap",
    summary: "HK-Reset-01 is dropped; HK-RST-01 is kept. Traffic-Info is dropped.",
    expect: "content",
    expected: ["anytls = rst.example.invalid:443, password=example-password, tag=HK-RST-01"],
    notes: "excluded is a substring test. Rename personal tags if they contain Reset or Traffic.",
    input: [
      "[server_local]",
      "anytls = reset.example.invalid:443, password=example-password, tag=HK-Reset-01",
      "anytls = rst.example.invalid:443, password=example-password, tag=HK-RST-01",
      "shadowsocks = info.example.invalid:443, method=chacha20-ietf-poly1305, password=example-password, tag=Traffic-Info"
    ].join("\n") + "\n"
  },
  {
    id: "days-left-variants",
    title: "Days Left versus DaysLeft",
    summary: "The exclusion is the two-word phrase. DaysLeft survives.",
    expect: "content",
    expected: ["anytls = compact.example.invalid:443, password=example-password, tag=DaysLeft-12"],
    notes: "days left (any case) still matches the phrase. DaysLeft does not.",
    input: [
      "[server_local]",
      "anytls = spaced.example.invalid:443, password=example-password, tag=Days Left: 12",
      "anytls = lower.example.invalid:443, password=example-password, tag=days left: 12",
      "anytls = compact.example.invalid:443, password=example-password, tag=DaysLeft-12"
    ].join("\n") + "\n"
  },
  {
    id: "unicode-and-ipv6",
    title: "Unicode tags and IPv6 host",
    summary: "Documentation IPv6 and CJK tags are ordinary server lines.",
    expect: "content",
    expected: [
      "anytls = tokyo.example.invalid:443, password=example-password, tag=东京-01",
      "anytls = [2001:db8::10]:443, password=example-password, tls-host=ipv6.example.invalid, tag=香港-中继"
    ],
    notes: "2001:db8::/32 only. Do not commit a real IPv6 node address.",
    input: [
      "[server_local]",
      "anytls = tokyo.example.invalid:443, password=example-password, tag=东京-01",
      "anytls = [2001:db8::10]:443, password=example-password, tls-host=ipv6.example.invalid, tag=香港-中继"
    ].join("\n") + "\n"
  },
  {
    id: "first-of-two-server-local",
    title: "First of two [server_local] blocks",
    summary: "String.match returns the first slice only.",
    expect: "content",
    expected: ["anytls = first.example.invalid:443, password=example-password, tag=First-Block"],
    notes: "A vendor file should not have two of these. If it does, the second is invisible.",
    input: [
      "[server_local]",
      "anytls = first.example.invalid:443, password=example-password, tag=First-Block",
      "[filter_local]",
      "host, example.invalid, direct",
      "[server_local]",
      "anytls = second.example.invalid:443, password=example-password, tag=Second-Block"
    ].join("\n") + "\n"
  },
  {
    id: "policy-lookalikes",
    title: "Policy lines inside [server_local]",
    summary: "static= / available= / round-robin= are unsupported prefixes.",
    expect: "content",
    expected: ["anytls = real.example.invalid:443, password=example-password, tag=Real-01"],
    notes: "If a vendor pastes a policy group into server_local, those lines are dropped, not converted.",
    input: [
      "[server_local]",
      "static = Nexitally, Real-01, direct",
      "available = Auto, Real-01",
      "round-robin = Rotate, Real-01",
      "anytls = real.example.invalid:443, password=example-password, tag=Real-01"
    ].join("\n") + "\n"
  },
  {
    id: "filter-rules-inside-section",
    title: "Filter rules inside [server_local]",
    summary: "host, and ip-cidr, lines are not servers.",
    expect: "content",
    expected: ["anytls = keep.example.invalid:443, password=example-password, tag=Keep-01"],
    notes: "Comma-style Quantumult X filters never match the prefix regex.",
    input: [
      "[server_local]",
      "host, example.invalid, direct",
      "ip-cidr, 192.0.2.0/24, direct",
      "geoip, cn, direct",
      "anytls = keep.example.invalid:443, password=example-password, tag=Keep-01"
    ].join("\n") + "\n"
  },
  {
    id: "unsupported-families",
    title: "Unsupported families",
    summary: "Keep socks5; drop wireguard, hysteria2, tuic, and a vmess:// URI.",
    expect: "content",
    expected: ["socks5 = helper.example.invalid:1080, username=example-user, password=example-password, tag=Helper-SOCKS5"],
    notes: "URI shares are a different dialect. This parser will not grow a translator.",
    input: [
      "[server_local]",
      "socks5 = helper.example.invalid:1080, username=example-user, password=example-password, tag=Helper-SOCKS5",
      "wireguard = 192.0.2.8:51820, private-key=example-password, tag=WG-01",
      "hysteria2 = hy2.example.invalid:443, password=example-password, tag=HY2-01",
      "tuic = tuic.example.invalid:443, password=example-password, tag=TUIC-01",
      "vmess://example-not-a-real-share"
    ].join("\n") + "\n"
  },
  {
    id: "quoted-overlong-params",
    title: "Long parameter lists",
    summary: "AnyTLS Reality-style extras and VLESS+ws; parser ignores fields it does not know.",
    expect: "content",
    expected: [
      "anytls = reality.example.invalid:443, password=example-password, tls-host=reality.example.invalid, tls-verification=true, public-key=examplepublickey, short-id=abcd, server-name=reality.example.invalid, tag=AnyTLS-Reality-01",
      "vless = ws.example.invalid:443, method=none, password=00000000-0000-4000-8000-000000000000, obfs=wss, obfs-host=ws.example.invalid, obfs-uri=/vless, tls13=true, fast-open=false, udp-relay=true, tag=VLESS-WS-01"
    ],
    notes: "public-key here is the documentation word examplepublickey, not a live Reality key.",
    input: [
      "[server_local]",
      "anytls = reality.example.invalid:443, password=example-password, tls-host=reality.example.invalid, tls-verification=true, public-key=examplepublickey, short-id=abcd, server-name=reality.example.invalid, tag=AnyTLS-Reality-01",
      "vless = ws.example.invalid:443, method=none, password=00000000-0000-4000-8000-000000000000, obfs=wss, obfs-host=ws.example.invalid, obfs-uri=/vless, tls13=true, fast-open=false, udp-relay=true, tag=VLESS-WS-01"
    ].join("\n") + "\n"
  },
  {
    id: "protocol-mixed-case",
    title: "Mixed-case schemes",
    summary: "AnyTLS= and Shadowsocks = both match supported.",
    expect: "content",
    expected: [
      "AnyTLS=mix-a.example.invalid:443, password=example-password, tag=Mix-A",
      "Shadowsocks = mix-b.example.invalid:443, method=aes-128-gcm, password=example-password, tag=Mix-B"
    ],
    notes: "Kept lines are emitted as trimmed, not lowercased.",
    input: [
      "[server_local]",
      "AnyTLS=mix-a.example.invalid:443, password=example-password, tag=Mix-A",
      "Shadowsocks = mix-b.example.invalid:443, method=aes-128-gcm, password=example-password, tag=Mix-B"
    ].join("\n") + "\n"
  },
  {
    id: "spaced-protocol-equals",
    title: "Spaces around =",
    summary: "supported allows whitespace between the scheme and =.",
    expect: "content",
    expected: [
      "anytls = space.example.invalid:443, password=example-password, tag=Space-01",
      "trojan=tight.example.invalid:443, password=example-password, tag=Tight-01"
    ],
    notes: "No space is required. Extra space is allowed.",
    input: [
      "[server_local]",
      "anytls = space.example.invalid:443, password=example-password, tag=Space-01",
      "trojan=tight.example.invalid:443, password=example-password, tag=Tight-01"
    ].join("\n") + "\n"
  },
  {
    id: "tab-prefixed-server",
    title: "Tab before a server line",
    summary: "trim() removes the tab; the line is kept without it.",
    expect: "content",
    expected: ["anytls = tab.example.invalid:443, password=example-password, tag=Tab-01"],
    notes: "Output is the trimmed line, so the tab does not survive into [server_remote].",
    input: [
      "[server_local]",
      "\tanytls = tab.example.invalid:443, password=example-password, tag=Tab-01"
    ].join("\n") + "\n"
  },
  {
    id: "preamble-banner",
    title: "Preamble then section",
    summary: "Vendor banners above the first [section] are ignored.",
    expect: "content",
    expected: ["anytls = after-banner.example.invalid:443, password=example-password, tag=After-Banner"],
    notes: "The header may appear after arbitrary text as long as it starts a line.",
    input: [
      "Nexitally Quantumult X (fictional sample)",
      "Do not commit a live download.",
      "",
      "[server_local]",
      "anytls = after-banner.example.invalid:443, password=example-password, tag=After-Banner",
      "[mitm]",
      "hostname = -*.example.invalid"
    ].join("\n") + "\n"
  },
  {
    id: "premium-section-terminator",
    title: "[Premium] as a section fence",
    summary: "A later [Premium] header ends the slice. The node after it is never classified.",
    expect: "content",
    expected: ["anytls = before-premium.example.invalid:443, password=example-password, tag=Before-Premium"],
    notes: "This is different from tag=[Premium], which is a line-level exclusion.",
    input: [
      "[server_local]",
      "anytls = before-premium.example.invalid:443, password=example-password, tag=Before-Premium",
      "[Premium]",
      "anytls = after-premium.example.invalid:443, password=example-password, tag=After-Premium"
    ].join("\n") + "\n"
  },
  {
    id: "missing-server-local",
    title: "No [server_local] section",
    summary: "A local-looking profile that never declares the section.",
    expect: "error",
    expected: MISSING,
    notes: "This is the error you want when the wrong URL was pasted into [server_remote].",
    input: [
      "[general]",
      "resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js",
      "[policy]",
      "static = Proxy, direct",
      "[filter_local]",
      "final, direct"
    ].join("\n") + "\n"
  },
  {
    id: "empty-usable",
    title: "Section with no keepers",
    summary: "Comments plus info rows plus a premium placeholder.",
    expect: "error",
    expected: EMPTY,
    notes: "The section regex succeeded. The filter loop emptied the list.",
    input: [
      "[server_local]",
      "; nothing usable below",
      "anytls = info.example.invalid:443, password=example-password, tag=Traffic: 0 GB",
      "anytls = info.example.invalid:443, password=example-password, tag=Expire: 2099-12-31",
      "anytls = info.example.invalid:443, password=example-password, tag=[Premium] Empty"
    ].join("\n") + "\n"
  },
  {
    id: "html-interstitial",
    title: "HTML interstitial",
    summary: "A login or payment page has no [server_local].",
    expect: "error",
    expected: MISSING,
    notes: "The parser does not special-case HTML. Missing section is enough.",
    input: [
      "<!doctype html>",
      "<html lang=\"en\">",
      "<head><title>Sign in</title></head>",
      "<body>",
      "<p>Please sign in to download your Quantumult X file.</p>",
      "<form action=\"https://example.invalid/login\" method=\"post\">",
      "<input name=\"user\" value=\"example-user\">",
      "</form>",
      "</body>",
      "</html>"
    ].join("\n") + "\n"
  },
  {
    id: "clash-yaml",
    title: "Clash YAML is not Quantumult X",
    summary: "proxies: mappings never contain [server_local].",
    expect: "error",
    expected: MISSING,
    notes: "Use an official Clash subscription elsewhere. Do not translate YAML in this repo.",
    input: [
      "port: 7890",
      "socks-port: 7891",
      "proxies:",
      "  - name: JP-Tokyo-01",
      "    type: ss",
      "    server: jp.example.invalid",
      "    port: 443",
      "    cipher: chacha20-ietf-poly1305",
      "    password: example-password",
      "proxy-groups:",
      "  - name: PROXY",
      "    type: select",
      "    proxies: [JP-Tokyo-01]"
    ].join("\n") + "\n"
  },
  {
    id: "glued-header",
    title: "Header glued to the first server",
    summary: "A newline after ] is required.",
    expect: "error",
    expected: MISSING,
    notes: "Looks almost valid to a human. The regex rejects it.",
    input: "[server_local]anytls = glued.example.invalid:443, password=example-password, tag=Glued-01\n"
  },
  {
    id: "header-no-newline",
    title: "Header without a trailing newline",
    summary: "A file that is only [server_local] does not match.",
    expect: "error",
    expected: MISSING,
    notes: "\\s*\\n is mandatory after the header.",
    input: "[server_local]"
  },
  {
    id: "inner-spaced-header",
    title: "Spaces inside the header brackets",
    summary: "[ server_local ] is not [server_local].",
    expect: "error",
    expected: MISSING,
    notes: "Do not loosen this without a vendor sample that actually ships that spelling.",
    input: [
      "[ server_local ]",
      "anytls = inner.example.invalid:443, password=example-password, tag=Inner-01"
    ].join("\n") + "\n"
  },
  {
    id: "server-remote-only",
    title: "Official server-only list",
    summary: "[server_remote] is the wrong section for this parser.",
    expect: "error",
    expected: MISSING,
    notes: "If a vendor already publishes this shape, drop opt-parser=true.",
    input: [
      "[server_remote]",
      "https://example.invalid/official-server-only, tag=Official, enabled=true",
      "anytls = official.example.invalid:443, password=example-password, tag=Official-01"
    ].join("\n") + "\n"
  },
  {
    id: "empty-file",
    title: "Empty download",
    summary: "Zero bytes after String() normalization.",
    expect: "error",
    expected: MISSING,
    notes: "Quantumult X still calls the parser. The script must not throw.",
    input: ""
  }
];

function getCase(id) {
  const found = CASES.find(function (item) { return item.id === id; });
  if (!found) throw new Error("Unknown workbook case: " + id);
  return found;
}

function wireInput(item) {
  var text = item.input;
  if (item.crlf) text = text.replace(/\n/g, "\r\n");
  if (item.bom) text = "\uFEFF" + text;
  return text;
}

module.exports = {
  CASES: CASES,
  MISSING: MISSING,
  EMPTY: EMPTY,
  getCase: getCase,
  wireInput: wireInput
};
