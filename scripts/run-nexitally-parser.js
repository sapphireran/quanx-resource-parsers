#!/usr/bin/env node
"use strict";

/*
 * Desktop stand-in for the Quantumult X resource-parser runtime.
 *
 * Injects $resource and $done, then loads nexitally-node-parser.js.
 * HTTP APIs and $notify are not provided on purpose: the Nexitally
 * parser does not use them.
 *
 * Usage:
 *   node scripts/run-nexitally-parser.js
 *   node scripts/run-nexitally-parser.js examples/fixtures/typical-full-config.input.conf
 *   node scripts/run-nexitally-parser.js --write-expected
 */

var fs = require("fs");
var path = require("path");

var repoRoot = path.resolve(__dirname, "..");
var parserPath = path.join(repoRoot, "nexitally-node-parser.js");
var fixturesDir = path.join(repoRoot, "examples", "fixtures");
var INPUT_SUFFIX = ".input.conf";
var EXPECTED_SUFFIX = ".expected.txt";
var EXPECTED_ERROR_SUFFIX = ".expected-error.txt";

function runParser(content) {
  var $resource = { content: content };
  var settled = false;
  var result;
  function $done(value) {
    if (settled) {
      throw new Error("Nexitally parser called $done more than once");
    }
    settled = true;
    result = value || {};
  }
  var code = fs.readFileSync(parserPath, "utf8");
  var invoke = new Function("$resource", "$done", code);
  invoke($resource, $done);
  if (!settled) {
    throw new Error("Nexitally parser did not call $done");
  }
  return result;
}

function normalizeText(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/g, "");
}

function listCases() {
  return fs.readdirSync(fixturesDir).filter(function (name) {
    return name.slice(-INPUT_SUFFIX.length) === INPUT_SUFFIX;
  }).sort().map(function (inputName) {
    var stem = inputName.slice(0, -INPUT_SUFFIX.length);
    var expectedPath = path.join(fixturesDir, stem + EXPECTED_SUFFIX);
    var expectedErrorPath = path.join(fixturesDir, stem + EXPECTED_ERROR_SUFFIX);
    var hasContent = fs.existsSync(expectedPath);
    var hasError = fs.existsSync(expectedErrorPath);
    return {
      stem: stem,
      inputPath: path.join(fixturesDir, inputName),
      expectedPath: hasContent ? expectedPath : expectedErrorPath,
      expectError: hasError,
      hasContent: hasContent,
      hasError: hasError
    };
  });
}

function formatResult(result) {
  if (result && typeof result.error === "string") {
    return { kind: "error", text: normalizeText(result.error) };
  }
  if (result && typeof result.content === "string") {
    return { kind: "content", text: normalizeText(result.content) };
  }
  return { kind: "invalid", text: JSON.stringify(result) };
}

function writeExpected(c, formatted) {
  var contentPath = path.join(fixturesDir, c.stem + EXPECTED_SUFFIX);
  var errorPath = path.join(fixturesDir, c.stem + EXPECTED_ERROR_SUFFIX);
  if (formatted.kind === "error") {
    if (fs.existsSync(contentPath)) fs.unlinkSync(contentPath);
    fs.writeFileSync(errorPath, formatted.text + "\n");
    return errorPath;
  }
  if (formatted.kind === "content") {
    if (fs.existsSync(errorPath)) fs.unlinkSync(errorPath);
    fs.writeFileSync(contentPath, formatted.text + "\n");
    return contentPath;
  }
  throw new Error(c.stem + " produced an invalid $done value: " + formatted.text);
}

function runCase(c) {
  var raw = fs.readFileSync(c.inputPath, "utf8");
  var formatted = formatResult(runParser(raw));
  if (!c.hasContent && !c.hasError) {
    return {
      stem: c.stem,
      ok: false,
      detail: "missing " + c.stem + EXPECTED_SUFFIX + " or " + c.stem + EXPECTED_ERROR_SUFFIX
    };
  }
  if (c.hasContent && c.hasError) {
    return {
      stem: c.stem,
      ok: false,
      detail: "has both " + EXPECTED_SUFFIX + " and " + EXPECTED_ERROR_SUFFIX
    };
  }
  var expectedKind = c.expectError ? "error" : "content";
  var expected = normalizeText(fs.readFileSync(c.expectedPath, "utf8"));
  if (formatted.kind !== expectedKind || formatted.text !== expected) {
    return {
      stem: c.stem,
      ok: false,
      detail:
        "expected " + expectedKind + ":\n" + expected + "\n---\nactual " +
        formatted.kind + ":\n" + formatted.text
    };
  }
  return { stem: c.stem, ok: true, detail: formatted.kind };
}

function printSingle(filePath) {
  var raw = fs.readFileSync(filePath, "utf8");
  var formatted = formatResult(runParser(raw));
  if (formatted.kind === "error") {
    process.stdout.write("error: " + formatted.text + "\n");
    process.exitCode = 1;
    return;
  }
  if (formatted.kind === "content") {
    process.stdout.write(formatted.text + "\n");
    return;
  }
  process.stderr.write("invalid parser result: " + formatted.text + "\n");
  process.exitCode = 2;
}

function main(argv) {
  var shouldWriteExpected = argv.indexOf("--write-expected") !== -1;
  var files = argv.filter(function (arg) {
    return arg !== "--write-expected" && arg.charAt(0) !== "-";
  });

  if (files.length > 1) {
    process.stderr.write("usage: node scripts/run-nexitally-parser.js [file] [--write-expected]\n");
    process.exitCode = 2;
    return;
  }

  if (files.length === 1 && !shouldWriteExpected) {
    printSingle(path.resolve(process.cwd(), files[0]));
    return;
  }

  var cases = listCases();
  if (!cases.length) {
    process.stderr.write("no fixtures found in " + fixturesDir + "\n");
    process.exitCode = 2;
    return;
  }

  if (shouldWriteExpected) {
    cases.forEach(function (c) {
      var formatted = formatResult(runParser(fs.readFileSync(c.inputPath, "utf8")));
      var dest = writeExpected(c, formatted);
      process.stdout.write("wrote " + path.relative(repoRoot, dest) + "\n");
    });
    return;
  }

  var failed = 0;
  cases.forEach(function (c) {
    var result = runCase(c);
    if (result.ok) {
      process.stdout.write("ok    " + result.stem + "\n");
    } else {
      failed += 1;
      process.stdout.write("FAIL  " + result.stem + "\n");
      process.stderr.write(result.detail + "\n");
    }
  });

  process.stdout.write((cases.length - failed) + "/" + cases.length + " fixtures passed\n");
  if (failed) process.exitCode = 1;
}

main(process.argv.slice(2));
