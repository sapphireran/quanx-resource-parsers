"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var parser = require("../nexitally-node-parser.js");

var ROOT = path.join(__dirname, "..");
var EXAMPLES = path.join(ROOT, "examples");

function readExample(name) {
  return fs.readFileSync(path.join(EXAMPLES, name), "utf8");
}

function expectedLines(name) {
  return parser
    .normalizeText(readExample(name))
    .replace(/^\s+|\s+$/g, "")
    .split("\n")
    .filter(Boolean);
}

test("full-config example matches nexitally-expected-servers.txt", function () {
  var result = parser.parseContent(readExample("nexitally-full-config.example.conf"));
  assert.equal(result.error, undefined, result.error);
  assert.deepEqual(result.content.split("\n"), expectedLines("nexitally-expected-servers.txt"));
  assert.equal(result.content.split("\n").length, 13);
});

test("full-config example with #in=HK matches hash-in-hk.expected.txt", function () {
  var result = parser.parseResource({
    content: readExample("nexitally-full-config.example.conf"),
    link: "https://subscription.example.test/quantumult-x#in=HK"
  });
  assert.equal(result.error, undefined, result.error);
  assert.deepEqual(result.content.split("\n"), expectedLines("hash-in-hk.expected.txt"));
});

test("already-server-list example matches its expected snapshot", function () {
  var result = parser.parseContent(readExample("already-server-list.example.txt"));
  assert.equal(result.error, undefined, result.error);
  assert.deepEqual(
    result.content.split("\n"),
    expectedLines("already-server-list.expected.txt")
  );
});

test("example files do not contain a live subscription host", function () {
  var files = fs.readdirSync(EXAMPLES);
  var i;
  var name;
  var body;
  for (i = 0; i < files.length; i++) {
    name = files[i];
    if (name.charAt(0) === ".") continue;
    body = readExample(name);
    assert.equal(
      /nexitally\.com|naixt/i.test(body),
      false,
      name + " looks like it contains a provider host"
    );
    assert.equal(
      /cdn\.jsdelivr\.net\/gh\/pang990801/i.test(body),
      false,
      name + " still points at the old jsDelivr owner path"
    );
  }
});

test("local profile sketch sets opt-parser and a parser URL for this repo", function () {
  var profile = readExample("quantumult-x.local.example.conf");
  assert.match(profile, /resource_parser_url\s*=\s*https:\/\/raw\.githubusercontent\.com\/sapphireran\/quanx-resource-parsers/);
  assert.match(profile, /opt-parser\s*=\s*true/);
  assert.match(profile, /subscription\.example\.test/);
});
