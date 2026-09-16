#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  runParserFile,
  normalizeExpectedContent,
} = require("./qx-parser-harness");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "examples", "nexitally", "manifest.json");

function readUtf8(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath));
}

function fail(message) {
  console.error("FAIL  " + message);
}

function pass(message) {
  console.log("PASS  " + message);
}

function checkCase(parserPath, testCase) {
  const inputBuffer = readUtf8(testCase.input);
  const result = runParserFile(parserPath, {
    content: inputBuffer.toString("utf8"),
    link: path.join(ROOT, testCase.input),
    tag: testCase.id,
  });

  const expect = testCase.expect || {};

  if (expect.errorContains) {
    if (!result.error) {
      return (
        testCase.id +
        ": expected an error containing " +
        JSON.stringify(expect.errorContains) +
        " but $done returned content"
      );
    }
    if (String(result.error).indexOf(expect.errorContains) === -1) {
      return (
        testCase.id +
        ": error " +
        JSON.stringify(result.error) +
        " does not contain " +
        JSON.stringify(expect.errorContains)
      );
    }
    return null;
  }

  if (!expect.contentFile) {
    return testCase.id + ": manifest case is missing expect.contentFile or expect.errorContains";
  }

  if (result.error) {
    return testCase.id + ": unexpected parser error: " + result.error;
  }

  const actual = normalizeExpectedContent(result.content || "");
  const expected = normalizeExpectedContent(
    readUtf8(expect.contentFile).toString("utf8")
  );

  if (actual !== expected) {
    return [
      testCase.id + ": parsed content does not match " + expect.contentFile,
      "--- expected ---",
      expected,
      "--- actual ---",
      actual,
    ].join("\n");
  }

  return null;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const parserPath = path.join(ROOT, manifest.parser);
  const cases = manifest.cases || [];

  if (!fs.existsSync(parserPath)) {
    console.error("parser not found: " + parserPath);
    process.exit(2);
  }
  if (!cases.length) {
    console.error("manifest has no cases: " + MANIFEST_PATH);
    process.exit(2);
  }

  let failed = 0;
  cases.forEach(function (testCase) {
    try {
      const error = checkCase(parserPath, testCase);
      if (error) {
        failed += 1;
        fail(error);
      } else {
        pass(testCase.id);
      }
    } catch (error) {
      failed += 1;
      fail(testCase.id + ": " + error.message);
    }
  });

  console.log("");
  console.log(
    cases.length - failed + " passed, " + failed + " failed, " + cases.length + " total"
  );
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  main();
}
