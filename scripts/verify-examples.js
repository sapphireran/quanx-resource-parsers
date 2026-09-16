#!/usr/bin/env node
"use strict";

/**
 * Verify the synthetic fixtures under examples/ against nexitally-node-parser.js.
 *
 * No network. No live subscription. Failures print a unified diff-ish
 * block so a drifting exclude regex is obvious.
 */

var fs = require("fs");
var path = require("path");
var runParserFile = require("./run-parser.js").runParserFile;

var ROOT = path.resolve(__dirname, "..");
var PARSER = path.join(ROOT, "nexitally-node-parser.js");

var cases = [
  {
    name: "full-config extracts eight mixed-protocol servers",
    input: "examples/nexitally/full-config.conf",
    expected: "examples/nexitally/expected-servers.txt"
  },
  {
    name: "full-config with CRLF + UTF-8 BOM matches the same servers",
    input: "examples/nexitally/full-config.conf",
    expected: "examples/nexitally/expected-servers.txt",
    transform: function (text) {
      return "\uFEFF" + text.replace(/\n/g, "\r\n");
    }
  },
  {
    name: "section at end of file still extracts servers",
    input: "examples/nexitally/section-at-eof.conf",
    expected: "examples/nexitally/expected-section-at-eof.txt"
  },
  {
    name: "comments and exact duplicates collapse to one server",
    input: "examples/nexitally/comments-and-duplicates.conf",
    expected: "examples/nexitally/expected-comments-and-duplicates.txt"
  },
  {
    name: "unsupported schemes are dropped",
    input: "examples/nexitally/unsupported-scheme.conf",
    expected: "examples/nexitally/expected-unsupported-scheme.txt"
  },
  {
    name: "missing [server_local] returns a clear error",
    input: "examples/nexitally/missing-section.conf",
    error: "Nexitally parser: [server_local] section was not found."
  },
  {
    name: "info-only [server_local] returns a clear error",
    input: "examples/nexitally/info-only.conf",
    error: "Nexitally parser: no usable server entries were found."
  },
  {
    name: "empty body returns the missing-section error",
    content: "",
    error: "Nexitally parser: [server_local] section was not found."
  }
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function normalizeExpected(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n+$/, "");
}

function firstDifference(actual, expected) {
  var a = actual.split("\n");
  var b = expected.split("\n");
  var max = Math.max(a.length, b.length);
  var i;
  for (i = 0; i < max; i += 1) {
    if (a[i] !== b[i]) {
      return {
        line: i + 1,
        actual: a[i] === undefined ? "<missing>" : a[i],
        expected: b[i] === undefined ? "<missing>" : b[i]
      };
    }
  }
  return null;
}

function runCase(spec) {
  var content;
  if (Object.prototype.hasOwnProperty.call(spec, "content")) {
    content = spec.content;
  } else {
    content = read(spec.input);
  }
  if (spec.transform) {
    content = spec.transform(content);
  }

  var result = runParserFile(PARSER, content, {
    tag: "Nexitally",
    link: spec.input ? path.join(ROOT, spec.input) : ""
  });

  if (spec.error) {
    if (result.content) {
      throw new Error("expected error, got content:\n" + result.content);
    }
    if (result.error !== spec.error) {
      throw new Error(
        "error mismatch\n  expected: " + spec.error + "\n  actual:   " + result.error
      );
    }
    return;
  }

  if (result.error) {
    throw new Error("unexpected error: " + result.error);
  }

  var actual = normalizeExpected(result.content);
  var expected = normalizeExpected(read(spec.expected));
  if (actual !== expected) {
    var diff = firstDifference(actual, expected);
    throw new Error(
      "content mismatch at line " +
        diff.line +
        "\n  expected: " +
        diff.expected +
        "\n  actual:   " +
        diff.actual +
        "\n--- expected ---\n" +
        expected +
        "\n--- actual ---\n" +
        actual
    );
  }
}

function main() {
  var failed = 0;

  cases.forEach(function (spec, index) {
    var label = String(index + 1).padStart(2, "0") + " " + spec.name;
    try {
      runCase(spec);
      process.stdout.write("ok   " + label + "\n");
    } catch (err) {
      failed += 1;
      process.stdout.write("FAIL " + label + "\n");
      process.stdout.write("     " + String(err.message || err).replace(/\n/g, "\n     ") + "\n");
    }
  });

  process.stdout.write(
    "\n" + (cases.length - failed) + " passed, " + failed + " failed, " + cases.length + " total\n"
  );

  if (failed) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  cases: cases,
  runCase: runCase
};
