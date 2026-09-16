#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "fixtures");

const ANYTLS =
  "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01";
const ANYTLS_HK =
  "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01";
const ANYTLS_SG =
  "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=SG-01";
const ANYTLS_JP =
  "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=JP-01";
const ANYTLS_REALITY =
  "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01";
const SS =
  "shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=apple.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, tag=ss-obfs-http-02";
const SS_SSR =
  "shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, ssr-protocol-param=def, obfs=tls1.2_ticket_fastauth, obfs-host=apple.com, tag=ssr";
const VMESS =
  "vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vmess-01";
const VLESS =
  "vless=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vless-01";
const TROJAN =
  "trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01";
const HTTP =
  "http=example.com:80,fast-open=false, udp-relay=false, tag=http-01";
const SOCKS =
  "socks5=example.com:80,fast-open=false, udp-relay=false, tag=socks5-01";
const TLS_PUB =
  "http=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tls-verification=true, tls-pubkey-sha256=eb5ec6684564fd0d04975903ed75342d1b9fdc2096ea54b4cf8caf4740f4ae25, fast-open=false, udp-relay=false, tag=http-tls-02";

const fixtures = {
  "managed-full-profile": {
    notes: "Invented Nexitally-style full profile. Hosts are example.com only.",
    text: [
      "# invented managed full profile — not a live export",
      "[general]",
      "server_check_url = http://www.google.com/generate_204",
      "",
      "[dns]",
      "server = 223.5.5.5",
      "",
      "[policy]",
      "static = Proxy, HK-01, SG-01, JP-01",
      "",
      "[server_local]",
      ANYTLS_HK,
      ANYTLS_SG,
      ANYTLS_JP,
      ANYTLS_HK,
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=Traffic 128GB",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=Expire 2099-01-01",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=流量 剩余 12 天",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=[Premium]",
      SS,
      "; commented leftover",
      "",
      "[filter_local]",
      "host-suffix, example.com, proxy",
      "final, proxy",
      "",
      "[rewrite_local]",
      "; none",
      "",
    ].join("\n"),
  },
  "info-banners-en-zh": {
    notes: "One real server plus every exclusion token as a tag.",
    text: [
      "[server_local]",
      ANYTLS,
      "anytls=example.com:443, password=pwd, tag=Traffic",
      "anytls=example.com:443, password=pwd, tag=Expire",
      "anytls=example.com:443, password=pwd, tag=Reset",
      "anytls=example.com:443, password=pwd, tag=Days Left 3",
      "anytls=example.com:443, password=pwd, tag=流量",
      "anytls=example.com:443, password=pwd, tag=到期",
      "anytls=example.com:443, password=pwd, tag=剩余",
      "anytls=example.com:443, password=pwd, tag=套餐",
      "anytls=example.com:443, password=pwd, tag=node [Premium] stub",
      "",
    ].join("\n"),
  },
  "reset-substring-trap": {
    notes: "Reset is a substring of both Reset and Preset.",
    text: [
      "[server_local]",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-RST-01",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-Reset-01",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-Preset-01",
      "",
    ].join("\n"),
  },
  "days-left-spacing": {
    notes: "Days Left is space-sensitive.",
    text: [
      "[server_local]",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=DaysLeft",
      "anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=Days Left",
      "",
    ].join("\n"),
  },
  "premium-as-section": {
    notes: "[Premium] as its own INI header ends the capture.",
    text: [
      "[server_local]",
      ANYTLS_HK,
      "[Premium]",
      ANYTLS_SG,
      "",
    ].join("\n"),
  },
  "section-cut-by-filter": {
    notes: "[filter_local] terminates the server capture.",
    text: [
      "[server_local]",
      ANYTLS_HK,
      "[filter_local]",
      "host-suffix, apple.com, proxy",
      ANYTLS_SG,
      "",
    ].join("\n"),
  },
  "first-of-two-server-local": {
    notes: "Second [server_local] is a terminator, not a second source.",
    text: [
      "[server_local]",
      ANYTLS_HK,
      "[server_local]",
      ANYTLS_SG,
      "",
    ].join("\n"),
  },
  "server-local-at-eof": {
    notes: "No following section.",
    text: [
      "[general]",
      "network_check_url = http://bing.com",
      "",
      "[server_local]",
      ANYTLS_HK,
      ANYTLS_SG,
    ].join("\n"),
  },
  "header-mixed-case": {
    notes: "Header match is case-insensitive.",
    text: [
      "[Server_Local]",
      ANYTLS,
      "[POLICY]",
      "static = Proxy, anytls-standard-tls-01",
      "",
    ].join("\n"),
  },
  "header-indented": {
    notes: "Leading whitespace before the header is allowed.",
    text: [
      "    [server_local]",
      ANYTLS,
      "",
    ].join("\n"),
  },
  "header-no-newline": {
    notes: "The regex requires a newline after the header.",
    text: "[server_local]",
  },
  "glued-header": {
    notes: "Header glued to the first server line.",
    text: "[server_local]" + ANYTLS + "\n",
  },
  "inner-spaced-header": {
    notes: "Space inside the brackets is a different header.",
    text: [
      "[server local]",
      ANYTLS,
      "",
    ].join("\n"),
  },
  "missing-server-local": {
    notes: "Looks like a local profile without a vendor [server_local].",
    text: [
      "[general]",
      "resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js",
      "",
      "[server_remote]",
      "YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true",
      "",
      "[policy]",
      "static = Proxy, resource-tag-regex=^Nexitally",
      "",
    ].join("\n"),
  },
  "empty-usable": {
    notes: "Section exists but every line is a comment or banner.",
    text: [
      "[server_local]",
      "; leftover",
      "# leftover",
      "// leftover",
      "anytls=example.com:443, password=pwd, tag=Traffic 1GB",
      "",
    ].join("\n"),
  },
  "placeholders-only": {
    notes: "Premium stub plus Chinese expiry only.",
    text: [
      "[server_local]",
      "anytls=example.com:443, password=pwd, tag=[Premium]",
      "anytls=example.com:443, password=pwd, tag=套餐到期",
      "",
    ].join("\n"),
  },
  "protocol-roster": {
    notes: "Official sample.conf lines for every supported prefix.",
    text: [
      "[server_local]",
      ANYTLS,
      SS,
      VMESS,
      VLESS,
      TROJAN,
      HTTP,
      SOCKS,
      "",
    ].join("\n"),
  },
  "anytls-reality": {
    notes: "Official Reality demo pubkey from sample.conf.",
    text: [
      "[server_local]",
      ANYTLS_REALITY,
      "",
    ].join("\n"),
  },
  "comments-and-duplicates": {
    notes: "Three comment styles and one exact duplicate after trim.",
    text: [
      "[server_local]",
      ANYTLS_HK,
      "  " + ANYTLS_HK,
      ";" + ANYTLS_SG,
      "#" + ANYTLS_SG,
      "//" + ANYTLS_SG,
      ANYTLS_JP,
      "",
    ].join("\n"),
  },
  "bom-crlf": {
    notes: "Written as UTF-8 BOM + CRLF bytes. See .gitattributes.",
    binary: true,
    text: "\uFEFF[server_local]\r\n" + ANYTLS_HK + "\r\n" + ANYTLS_SG + "\r\n",
  },
  "unsupported-family": {
    notes: "Foreign schemes drop. shadowsocks with ssr-protocol is still shadowsocks=.",
    text: [
      "[server_local]",
      "wireguard=192.0.2.10:51820, tag=wg-01",
      "hysteria2=example.com:443, tag=hy2-01",
      "tuic=example.com:443, tag=tuic-01",
      "ssr=example.com:443, tag=ssr-scheme",
      SS_SSR,
      "",
    ].join("\n"),
  },
  "policy-lookalikes": {
    notes: "Policy constructors are not server lines.",
    text: [
      "[server_local]",
      ANYTLS,
      "static = Proxy, HK-01, SG-01",
      "available = Auto, HK-01, SG-01",
      "",
    ].join("\n"),
  },
  "filter-rules-inside-section": {
    notes: "Filter syntax leaked into [server_local].",
    text: [
      "[server_local]",
      ANYTLS,
      "host, www.example.com, proxy",
      "ip-cidr, 192.0.2.0/24, direct",
      "",
    ].join("\n"),
  },
  "html-interstitial": {
    notes: "A login page is not a Quantumult X profile.",
    text: [
      "<!DOCTYPE html>",
      "<html><body>",
      "<form action=\"https://example.com/login\">",
      "<input name=\"user\"/>",
      "</form>",
      "</body></html>",
      "",
    ].join("\n"),
  },
  "clash-yaml": {
    notes: "Clash YAML uses proxies: not [server_local].",
    text: [
      "proxies:",
      "  - name: HK-01",
      "    type: ss",
      "    server: example.com",
      "    port: 443",
      "    cipher: chacha20-ietf-poly1305",
      "    password: pwd",
      "",
    ].join("\n"),
  },
  "wrong-section-server-remote": {
    notes: "Vendor already published a server-only list under the wrong header for this parser.",
    text: [
      "[server_remote]",
      ANYTLS,
      "",
    ].join("\n"),
  },
  "preamble-then-section": {
    notes: "Marketing lines before the real section.",
    text: [
      "Thanks for using this invented sample.",
      "Traffic: 0 / 0",
      "",
      "[server_local]",
      ANYTLS,
      "",
    ].join("\n"),
  },
  "protocol-case-and-spacing": {
    notes: "Scheme regex is case-insensitive and allows spaces before =.",
    text: [
      "[server_local]",
      "ANYTLS = example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=ANYTLS-CASE",
      "ShadowSocks=example.com:80, method=chacha20, password=pwd, tag=SS-CASE",
      "",
    ].join("\n"),
  },
  "ipv6-and-tabs": {
    notes: "Documentation IPv6 and a tab-indented line.",
    text: [
      "[server_local]",
      "anytls=[2001:db8::10]:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=v6-01",
      "\t" + ANYTLS,
      "",
    ].join("\n"),
  },
  "quoted-overlong-params": {
    notes: "Official long TLS and Reality fields.",
    text: [
      "[server_local]",
      TLS_PUB,
      ANYTLS_REALITY,
      "",
    ].join("\n"),
  },
};

Object.keys(fixtures).forEach(function (id) {
  const dir = path.join(ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  const item = fixtures[id];
  const inputPath = path.join(dir, "input.conf");
  if (item.binary) {
    fs.writeFileSync(inputPath, Buffer.from(item.text, "utf8"));
  } else {
    fs.writeFileSync(inputPath, item.text.endsWith("\n") ? item.text : item.text + "\n");
  }
  fs.writeFileSync(path.join(dir, "notes.md"), item.notes + "\n");
  process.stdout.write("seeded " + id + "\n");
});
