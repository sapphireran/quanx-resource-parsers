#!/usr/bin/env node
/**
 * Local usage-example runner for nexitally-node-parser.js.
 *
 * Quantumult X injects $resource and $done into a resource-parser script.
 * HTTP and persistent-storage APIs are not available in that sandbox, so
 * this runner only mocks the two globals the Nexitally parser uses.
 *
 * Usage (repository root):
 *   node docs/examples/run-examples.js
 */

"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "../..");
var PARSER_PATH = path.join(ROOT, "nexitally-node-parser.js");
var EXAMPLES = __dirname;

var cases = [
  {
    name: "happy-path: extract [server_local] and drop placeholders",
    input: "nexitally-full-config.sample.conf",
    expectedKind: "content",
    expected: "nexitally-server-remote.expected.txt"
  },
  {
    name: "error: missing [server_local]",
    input: "error-missing-section.sample.conf",
    expectedKind: "error",
    expected: "error-missing-section.expected.txt"
  },
  {
    name: "error: no usable servers",
    input: "error-no-usable-servers.sample.conf",
    expectedKind: "error",
    expected: "error-no-usable-servers.expected.txt"
  }
];

function read(rel) {
  return fs.readFileSync(path.join(EXAMPLES, rel), "utf8");
}

function normalizeExpected(text) {
  return String(text)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/, "");
}

function runParser(content, extras) {
  extras = extras || {};
  var result;
  var doneCalls = 0;
  var sandbox = {
    $resource: {
      content: content,
      link: extras.link || "https://example.invalid/nexitally-quantumult-x.conf",
      tag: extras.tag || "Nexitally",
      info: extras.info || "",
      user_agent: extras.user_agent || ""
    },
    $done: function (payload) {
      doneCalls += 1;
      result = payload;
    }
  };

  vm.runInNewContext(
    fs.readFileSync(PARSER_PATH, "utf8"),
    sandbox,
    { filename: "nexitally-node-parser.js" }
  );

  if (doneCalls !== 1) {
    throw new Error("parser called $done " + doneCalls + " time(s); expected 1");
  }
  if (!result || typeof result !== "object") {
    throw new Error("parser $done payload was not an object");
  }
  return result;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      label +
        " mismatch\n--- actual ---\n" +
        actual +
        "\n--- expected ---\n" +
        expected +
        "\n"
    );
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runCase(spec) {
  var input = read(spec.input);
  var expected = normalizeExpected(read(spec.expected));
  var result = runParser(input);

  if (spec.expectedKind === "content") {
    assert(typeof result.content === "string", spec.name + ": expected content");
    assert(result.error == null, spec.name + ": unexpected error: " + result.error);
    assertEqual(normalizeExpected(result.content), expected, spec.name);
    return result.content.split("\n").length;
  }

  assert(typeof result.error === "string", spec.name + ": expected error");
  assert(result.content == null, spec.name + ": error case leaked content");
  assertEqual(normalizeExpected(result.error), expected, spec.name);
  return 0;
}

function runBomCrlfCheck() {
  var unix = read("nexitally-full-config.sample.conf");
  var expected = normalizeExpected(read("nexitally-server-remote.expected.txt"));
  var decorated = "\uFEFF" + unix.replace(/\n/g, "\r\n");
  var result = runParser(decorated);
  assert(typeof result.content === "string", "BOM/CRLF: expected content");
  assertEqual(normalizeExpected(result.content), expected, "BOM/CRLF normalization");
}

function runIsolationCheck() {
  var result = runParser(read("nexitally-full-config.sample.conf"));
  var content = result.content || "";
  var leaked = ["[policy]", "[filter_local]", "[dns]", "[general]", "[server_remote]", "hysteria2=", "[Premium]", "Traffic:", "Expire:", "流量:", "到期:"];
  leaked.forEach(function (token) {
    assert(content.indexOf(token) === -1, "isolation: output still contains " + token);
  });
}

function printUsagePreview(content) {
  var lines = content.split("\n");
  process.stdout.write("\nUsage preview (parser output, first 3 servers):\n");
  lines.slice(0, 3).forEach(function (line) {
    process.stdout.write("  " + line + "\n");
  });
  process.stdout.write("  … " + (lines.length - 3) + " more server line(s)\n");
}

function main() {
  var failed = 0;
  var passed = 0;
  var serverCount = 0;

  process.stdout.write("Nexitally parser usage examples\n");
  process.stdout.write("parser: " + path.relative(ROOT, PARSER_PATH) + "\n\n");

  cases.forEach(function (spec) {
    try {
      var count = runCase(spec);
      if (spec.expectedKind === "content") serverCount = count;
      passed += 1;
      process.stdout.write("ok  " + spec.name + "\n");
    } catch (error) {
      failed += 1;
      process.stderr.write("not ok  " + spec.name + "\n" + error.message + "\n");
    }
  });

  try {
    runBomCrlfCheck();
    passed += 1;
    process.stdout.write("ok  BOM and CRLF input matches the Unix expected file\n");
  } catch (error) {
    failed += 1;
    process.stderr.write("not ok  BOM/CRLF\n" + error.message + "\n");
  }

  try {
    runIsolationCheck();
    passed += 1;
    process.stdout.write("ok  policy, filters, and placeholders stay out of the server list\n");
  } catch (error) {
    failed += 1;
    process.stderr.write("not ok  isolation\n" + error.message + "\n");
  }

  if (failed === 0 && serverCount) {
    printUsagePreview(normalizeExpected(read("nexitally-server-remote.expected.txt")));
  }

  process.stdout.write(
    "\n" + passed + " passed, " + failed + " failed, " + serverCount + " kept servers\n"
  );
  process.exit(failed === 0 ? 0 : 1);
}

main();
