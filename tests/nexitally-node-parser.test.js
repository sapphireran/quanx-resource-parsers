"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var parser = require("../nexitally-node-parser.js");

var ANYTLS_HK =
  "anytls=hk-01.example.test:443, password=placeholder, over-tls=true, tls-host=hk-01.example.test, udp-relay=true, tag=HK-01";
var ANYTLS_SG =
  "anytls=sg-01.example.test:443, password=placeholder, over-tls=true, tls-host=sg-01.example.test, udp-relay=true, tag=SG-01";
var SS_JP =
  "shadowsocks=jp-01.example.test:443, method=chacha20-ietf-poly1305, password=placeholder, obfs=over-tls, obfs-host=jp-01.example.test, udp-relay=true, tag=JP-01";
var VMESS =
  "vmess=us-01.example.test:443, method=aes-128-gcm, password=00000000-0000-4000-8000-000000000000, obfs=wss, obfs-uri=/ws, obfs-host=us-01.example.test, tag=US-01";
var VLESS =
  "vless=de-01.example.test:443, method=none, password=00000000-0000-4000-8000-000000000001, obfs=wss, obfs-uri=/vless, obfs-host=de-01.example.test, tag=DE-01";
var TROJAN =
  "trojan=tw-01.example.test:443, password=placeholder, over-tls=true, tls-host=tw-01.example.test, udp-relay=true, tag=TW-01";
var HTTP =
  "http=proxy-01.example.test:8443, username=demo, password=placeholder, over-tls=true, tag=HTTP-01";
var SOCKS =
  "socks5=proxy-02.example.test:1080, username=demo, password=placeholder, over-tls=true, tag=SOCKS-01";
var TRAFFIC =
  "shadowsocks=info.example.test:1, method=aes-128-gcm, password=0, tag=Traffic: 128.00 GB";
var EXPIRE =
  "shadowsocks=info.example.test:1, method=aes-128-gcm, password=0, tag=Expire: 2099-12-31";
var RESET =
  "shadowsocks=info.example.test:1, method=aes-128-gcm, password=0, tag=Reset: 3 Days Left";
var CN_TRAFFIC =
  "shadowsocks=info.example.test:1, method=aes-128-gcm, password=0, tag=流量: 12.00 GB";
var CN_EXPIRE =
  "shadowsocks=info.example.test:1, method=aes-128-gcm, password=0, tag=到期: 2099-12-31";
var PREMIUM =
  "anytls=0.0.0.0:1, password=0, over-tls=true, tag=[Premium] JP-VIP-01";
var UNSUPPORTED = "wireguard=wg.example.test:51820, tag=WG-01";

function wrapLocal(body) {
  return [
    "[general]",
    "server_check_url = http://www.apple.com/generate_204",
    "",
    "[server_local]",
    body,
    "",
    "[policy]",
    "static = Demo, HK-01, direct"
  ].join("\n");
}

function contentOf(result) {
  assert.equal(result.error, undefined, result.error);
  return result.content.split("\n");
}

test("normalizeText strips BOM and unifies newlines", function () {
  var text = parser.normalizeText("\uFEFF" + "a\r\nb\rc");
  assert.equal(text, "a\nb\nc");
});

test("extractSection is case-insensitive and stops at the next section", function () {
  var text = [
    "[General]",
    "foo = 1",
    "[SERVER_LOCAL]",
    ANYTLS_HK,
    ANYTLS_SG,
    "[Policy]",
    "static = Demo, HK-01"
  ].join("\n");
  var section = parser.extractSection(text, "server_local");
  assert.ok(section.indexOf("HK-01") !== -1);
  assert.ok(section.indexOf("SG-01") !== -1);
  assert.equal(section.indexOf("[Policy]"), -1);
  assert.equal(section.indexOf("static ="), -1);
});

test("extractSection returns the tail when server_local is the last section", function () {
  var text = "[dns]\nserver = 1.1.1.1\n[server_local]\n" + ANYTLS_HK + "\n";
  var section = parser.extractSection(text, "server_local");
  assert.equal(section.trim(), ANYTLS_HK);
});

test("parseContent extracts supported protocols and keeps order", function () {
  var result = parser.parseContent(
    wrapLocal(
      [
        ANYTLS_HK,
        SS_JP,
        VMESS,
        VLESS,
        TROJAN,
        HTTP,
        SOCKS
      ].join("\n")
    )
  );
  assert.deepEqual(contentOf(result), [
    ANYTLS_HK,
    SS_JP,
    VMESS,
    VLESS,
    TROJAN,
    HTTP,
    SOCKS
  ]);
});

test("comments, blanks, and unsupported lines are ignored", function () {
  var result = parser.parseContent(
    wrapLocal(
      [
        "",
        "; comment semicolon",
        "# comment hash",
        "// comment slash",
        UNSUPPORTED,
        "not-a-server = nope",
        ANYTLS_HK
      ].join("\n")
    )
  );
  assert.deepEqual(contentOf(result), [ANYTLS_HK]);
});

test("duplicate server lines are removed", function () {
  var result = parser.parseContent(
    wrapLocal([ANYTLS_HK, ANYTLS_SG, ANYTLS_HK].join("\n"))
  );
  assert.deepEqual(contentOf(result), [ANYTLS_HK, ANYTLS_SG]);
});

test("traffic, expiry, and Chinese info placeholders are dropped", function () {
  var result = parser.parseContent(
    wrapLocal(
      [TRAFFIC, EXPIRE, RESET, CN_TRAFFIC, CN_EXPIRE, ANYTLS_HK].join("\n")
    )
  );
  assert.deepEqual(contentOf(result), [ANYTLS_HK]);
});

test("Premium placeholders are dropped", function () {
  var result = parser.parseContent(wrapLocal([PREMIUM, ANYTLS_SG].join("\n")));
  assert.deepEqual(contentOf(result), [ANYTLS_SG]);
});

test("keep-info and keep-premium hash flags restore debug placeholders", function () {
  var result = parser.parseContent(
    wrapLocal([TRAFFIC, PREMIUM, ANYTLS_HK].join("\n")),
    { "keep-info": "1", "keep-premium": "1" }
  );
  assert.deepEqual(contentOf(result), [TRAFFIC, PREMIUM, ANYTLS_HK]);
});

test("missing [server_local] errors unless the body is already a server list", function () {
  var missing = parser.parseContent("[general]\nserver_check_url = http://example.test/\n");
  assert.equal(missing.error, parser.ERRORS.missingSection);

  var alreadyList = parser.parseContent([ANYTLS_HK, ANYTLS_SG].join("\n"));
  assert.deepEqual(contentOf(alreadyList), [ANYTLS_HK, ANYTLS_SG]);
});

test("empty body and no usable servers return distinct errors", function () {
  assert.equal(parser.parseContent("").error, parser.ERRORS.empty);
  assert.equal(parser.parseContent("   \n\n").error, parser.ERRORS.empty);
  assert.equal(
    parser.parseContent(wrapLocal("; only comments\n" + TRAFFIC)).error,
    parser.ERRORS.noServers
  );
});

test("in/out hash filters match the tag with + as OR", function () {
  var body = wrapLocal([ANYTLS_HK, ANYTLS_SG, SS_JP].join("\n"));
  var onlyHkSg = parser.parseContent(body, { in: "HK+SG" });
  assert.deepEqual(contentOf(onlyHkSg), [ANYTLS_HK, ANYTLS_SG]);

  var dropSg = parser.parseContent(body, { out: "SG" });
  assert.deepEqual(contentOf(dropSg), [ANYTLS_HK, SS_JP]);
});

test("in/out matching is case-insensitive on tags", function () {
  var result = parser.parseContent(wrapLocal([ANYTLS_HK, SS_JP].join("\n")), {
    in: "hk"
  });
  assert.deepEqual(contentOf(result), [ANYTLS_HK]);
});

test("regex keeps and regout drops against the full line", function () {
  var body = wrapLocal([ANYTLS_HK, SS_JP, VMESS].join("\n"));
  var onlyAnytls = parser.parseContent(body, { regex: "^anytls\\s*=" });
  assert.deepEqual(contentOf(onlyAnytls), [ANYTLS_HK]);

  var dropSs = parser.parseContent(body, { regout: "^shadowsocks\\s*=" });
  assert.deepEqual(contentOf(dropSs), [ANYTLS_HK, VMESS]);
});

test("invalid regex parameters return a parser error", function () {
  var result = parser.parseContent(wrapLocal(ANYTLS_HK), { regex: "(" });
  assert.match(result.error, /hash regex parameter was not valid/);
});

test("parseHashParams reads the fragment and keeps + as OR", function () {
  var params = parser.parseHashParams(
    "https://subscription.example.test/qx#in=HK+SG&out=VIP&keep-info=1"
  );
  assert.deepEqual(params, {
    in: "HK+SG",
    out: "VIP",
    "keep-info": "1"
  });
});

test("parseHashParams decodes percent-encoding but ignores a missing hash", function () {
  assert.deepEqual(parser.parseHashParams("https://example.test/qx"), {});
  assert.equal(
    parser.parseHashParams("https://example.test/qx#in=Hong%20Kong").in,
    "Hong Kong"
  );
});

test("parseResource combines link hash parameters with content", function () {
  var result = parser.parseResource({
    content: wrapLocal([ANYTLS_HK, ANYTLS_SG, SS_JP].join("\n")),
    link: "https://subscription.example.test/qx#in=HK"
  });
  assert.deepEqual(contentOf(result), [ANYTLS_HK]);
});

test("whitespace around protocol tokens is tolerated", function () {
  var spaced =
    "anytls = hk-02.example.test:443, password=placeholder, over-tls=true, tag=HK-02";
  var result = parser.parseContent(wrapLocal(spaced));
  assert.deepEqual(contentOf(result), [spaced]);
});

test("CRLF full configurations parse the same as LF", function () {
  var lf = wrapLocal([ANYTLS_HK, TRAFFIC, ANYTLS_SG].join("\n"));
  var crlf = lf.replace(/\n/g, "\r\n");
  assert.deepEqual(
    contentOf(parser.parseContent(crlf)),
    contentOf(parser.parseContent(lf))
  );
});

test("nodeTag reads the tag field and falls back to the whole line", function () {
  assert.equal(parser.nodeTag(ANYTLS_HK), "HK-01");
  assert.equal(parser.nodeTag("anytls=example.test:443"), "anytls=example.test:443");
});

test("looksLikeServerList ignores comments and section headers", function () {
  assert.equal(parser.looksLikeServerList("; just a comment\n[policy]\n"), false);
  assert.equal(parser.looksLikeServerList(ANYTLS_HK + "\n"), true);
});

test("require() does not invoke $done", function () {
  assert.equal(typeof parser.parseContent, "function");
  assert.equal(typeof parser.parseResource, "function");
});
