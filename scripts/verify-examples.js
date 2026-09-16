#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runParserFile } = require("./qx-parser-sandbox");

const FIXTURE_DIR = path.resolve(__dirname, "..", "examples", "fixtures");

const CASES = [
  {
    name: "sanitized full Nexitally-style profile",
    input: "nexitally-full-config.sanitized.conf",
    expected: "nexitally-parsed-servers.expected.txt",
  },
  {
    name: "comments and exact duplicates",
    input: "comments-and-duplicates.conf",
    expected: "comments-and-duplicates.expected.txt",
  },
  {
    name: "mixed Quantumult X protocols",
    input: "mixed-protocols.conf",
    expected: "mixed-protocols.expected.txt",
  },
  {
    name: "UTF-8 BOM and CRLF",
    input: "crlf-and-bom.conf",
    expected: "crlf-and-bom.expected.txt",
  },
  {
    name: "unsupported protocol prefixes",
    input: "unsupported-lines.conf",
    expected: "unsupported-lines.expected.txt",
  },
  {
    name: "missing [server_local]",
    input: "missing-server-local.conf",
    error: "Nexitally parser: [server_local] section was not found.",
  },
  {
    name: "empty [server_local]",
    input: "empty-server-local.conf",
    error: "Nexitally parser: no usable server entries were found.",
  },
  {
    name: "premium and traffic placeholders only",
    input: "premium-and-traffic-only.conf",
    error: "Nexitally parser: no usable server entries were found.",
  },
];

function readExpected(rel) {
  return fs
    .readFileSync(path.join(FIXTURE_DIR, rel), "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/, "");
}

function verifyOne(testCase) {
  const inputPath = path.join(FIXTURE_DIR, testCase.input);
  const result = runParserFile(inputPath);

  if (testCase.error) {
    if (!result || result.error !== testCase.error) {
      throw new Error(
        testCase.name +
          ": expected error " +
          JSON.stringify(testCase.error) +
          " but got " +
          JSON.stringify(result)
      );
    }
    if (result.content) {
      throw new Error(testCase.name + ": error result unexpectedly included content");
    }
    return;
  }

  if (!result || result.error) {
    throw new Error(testCase.name + ": unexpected error " + JSON.stringify(result));
  }
  const actual = String(result.content || "").replace(/\s+$/, "");
  const expected = readExpected(testCase.expected);
  if (actual !== expected) {
    throw new Error(
      testCase.name +
        ":\n--- expected ---\n" +
        expected +
        "\n--- actual ---\n" +
        actual +
        "\n"
    );
  }
}

function main() {
  const failures = [];
  CASES.forEach(function (testCase) {
    try {
      verifyOne(testCase);
      process.stdout.write("ok  " + testCase.name + "\n");
    } catch (err) {
      failures.push(err);
      process.stdout.write("not ok  " + testCase.name + "\n");
      process.stderr.write(String(err && err.message ? err.message : err) + "\n");
    }
  });

  process.stdout.write(
    "\n" + (CASES.length - failures.length) + "/" + CASES.length + " example fixtures matched\n"
  );
  if (failures.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CASES, verifyOne, main };
