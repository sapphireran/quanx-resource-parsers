#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { runParser, runParserFile } = require("../scripts/qx-parser-sandbox");
const { CASES, verifyOne } = require("../scripts/verify-examples");

const ROOT = path.resolve(__dirname, "..");
const FIXTURE_DIR = path.join(ROOT, "examples", "fixtures");
const PARSER = path.join(ROOT, "nexitally-node-parser.js");

let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  process.stdout.write("ok  " + name + "\n");
}

test("parser source has no subscription URL or account token", function () {
  const src = fs.readFileSync(PARSER, "utf8");
  assert.doesNotMatch(src, /https?:\/\/\S*nexitally/i);
  assert.doesNotMatch(src, /token=|sid=|uuid=/i);
  assert.match(src, /\$resource\.content/);
  assert.match(src, /\$done/);
});

test("every documented example fixture matches the parser", function () {
  CASES.forEach(verifyOne);
});

test("sanitized full config keeps eight real nodes and drops metadata", function () {
  const result = runParserFile(
    path.join(FIXTURE_DIR, "nexitally-full-config.sanitized.conf")
  );
  const lines = result.content.split("\n");
  assert.strictEqual(lines.length, 8);
  assert.ok(lines.some(function (line) { return /tag=HK-01$/.test(line); }));
  assert.ok(lines.some(function (line) { return /tag=SG-01$/.test(line); }));
  assert.ok(lines.some(function (line) { return /tag=AU-01$/.test(line); }));
  assert.ok(
    lines.every(function (line) {
      return !/Traffic|Expire|Premium|流量|到期|套餐|Reset/.test(line);
    })
  );
  assert.ok(
    lines.every(function (line) {
      return !/^\[/.test(line);
    })
  );
});

test("section capture stops before [filter_local] and [mitm]", function () {
  const result = runParserFile(
    path.join(FIXTURE_DIR, "nexitally-full-config.sanitized.conf")
  );
  assert.doesNotMatch(result.content, /filter_local|host-suffix|mitm|advert/i);
});

test("missing [server_local] is a dedicated error", function () {
  const result = runParser("[general]\nserver_check_url = http://example.com\n");
  assert.strictEqual(
    result.error,
    "Nexitally parser: [server_local] section was not found."
  );
  assert.strictEqual(result.content, undefined);
});

test("[Server_Local] header is accepted case-insensitively", function () {
  const result = runParser(
    "[Server_Local]\nanytls = keep.example.com:443, password=x, over-tls=true, tag=Keep\n"
  );
  assert.strictEqual(
    result.content,
    "anytls = keep.example.com:443, password=x, over-tls=true, tag=Keep"
  );
});

test("null $resource.content becomes an empty string and errors", function () {
  const result = runParser(null);
  assert.strictEqual(
    result.error,
    "Nexitally parser: [server_local] section was not found."
  );
});

test("comment prefixes ; # // are ignored even when they look like servers", function () {
  const result = runParser(
    [
      "[server_local]",
      ";anytls = a.example.com:443, password=x, over-tls=true, tag=A",
      "#anytls = b.example.com:443, password=x, over-tls=true, tag=B",
      "//anytls = c.example.com:443, password=x, over-tls=true, tag=C",
      "anytls = d.example.com:443, password=x, over-tls=true, tag=D",
      "",
    ].join("\n")
  );
  assert.strictEqual(
    result.content,
    "anytls = d.example.com:443, password=x, over-tls=true, tag=D"
  );
});

test("duplicate lines keep the first copy only", function () {
  const line = "trojan = dup.example.com:443, password=x, over-tls=true, tag=Dup";
  const result = runParser("[server_local]\n" + line + "\n" + line + "\n" + line + "\n");
  assert.strictEqual(result.content, line);
});

test("exclusion regex covers English and Chinese quota markers", function () {
  const markers = [
    "tag=Traffic: 1 GB",
    "tag=Expire: 2099-01-01",
    "tag=Reset: 2099-01-01",
    "tag=Days Left: 3",
    "tag=剩余 1 GB",
    "tag=流量 1 GB",
    "tag=到期 2099-01-01",
    "tag=套餐 Demo",
    "tag=Node [Premium]",
  ];
  markers.forEach(function (tag) {
    const result = runParser(
      "[server_local]\nanytls = info.example.com:1, password=0, over-tls=true, " +
        tag +
        "\n"
    );
    assert.strictEqual(
      result.error,
      "Nexitally parser: no usable server entries were found.",
      tag
    );
  });
});

test("supported protocol prefixes are case-insensitive", function () {
  const result = runParser(
    [
      "[server_local]",
      "ANYTLS=a.example.com:443, password=x, over-tls=true, tag=A",
      "Shadowsocks=b.example.com:443, method=chacha20-ietf-poly1305, password=x, tag=B",
      "VMess=c.example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, tag=C",
      "VLESS=d.example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, tag=D",
      "Trojan=e.example.com:443, password=x, over-tls=true, tag=E",
      "HTTP=f.example.com:80, tag=F",
      "SOCKS5=g.example.com:1080, tag=G",
      "",
    ].join("\n")
  );
  assert.strictEqual(result.content.split("\n").length, 7);
});

test("bare ss= alias is not treated as shadowsocks", function () {
  const result = runParser(
    "[server_local]\nss = legacy.example.com:443, method=chacha20-ietf-poly1305, password=x, tag=Legacy\n"
  );
  assert.strictEqual(
    result.error,
    "Nexitally parser: no usable server entries were found."
  );
});

test("UTF-8 BOM plus CRLF still parses", function () {
  const result = runParserFile(path.join(FIXTURE_DIR, "crlf-and-bom.conf"));
  assert.ok(result.content.indexOf("tag=BOM-01") !== -1);
  assert.ok(result.content.indexOf("tag=CRLF-01") !== -1);
  assert.ok(result.content.indexOf("\r") === -1);
});

test("parser does not use $resource.link", function () {
  const src = fs.readFileSync(PARSER, "utf8");
  assert.doesNotMatch(src, /\$resource\.link/);
  const result = runParser(
    "[server_local]\nanytls = keep.example.com:443, password=x, over-tls=true, tag=Keep\n",
    { link: "https://secret.example.com/account/never-read" }
  );
  assert.doesNotMatch(result.content, /secret\.example\.com/);
});

test("example local-profile snippet never contains a live Nexitally URL", function () {
  const snippet = fs.readFileSync(
    path.join(ROOT, "examples", "local-profile", "quantumult-x-local.snippet.conf"),
    "utf8"
  );
  assert.match(snippet, /opt-parser=true/);
  assert.match(snippet, /resource_parser_url/);
  assert.match(snippet, /example\.com\/replace-with-private-nexitally/);
  assert.doesNotMatch(snippet, /nexitally\.[a-z]/i);
});

process.stdout.write("\n" + passed + " tests passed\n");
