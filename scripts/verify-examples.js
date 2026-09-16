#!/usr/bin/env node
"use strict";

/**
 * Compare sanitized fixtures against expected parser output.
 *
 * Usage:
 *   node scripts/verify-examples.js
 *   node scripts/verify-examples.js --list
 */

const fs = require("node:fs");
const path = require("node:path");
const { ROOT, runParser, formatResult } = require("./run-parser");

const CASES_PATH = path.join(ROOT, "examples", "cases.json");

function parseArgs(argv) {
  const args = { list: false };
  for (const item of argv.slice(2)) {
    if (item === "--list" || item === "-l") {
      args.list = true;
    } else if (item === "--help" || item === "-h") {
      args.help = true;
    } else {
      throw new Error("Unknown argument: " + item);
    }
  }
  return args;
}

function readTrimmed(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

function loadCases() {
  const manifest = JSON.parse(fs.readFileSync(CASES_PATH, "utf8"));
  if (!manifest || !Array.isArray(manifest.cases)) {
    throw new Error("examples/cases.json is missing a cases array.");
  }
  return manifest;
}

function verifyCase(item) {
  const inputPath = path.join(ROOT, item.input);
  const expectPath = path.join(ROOT, item.expect.file);
  const input = fs.readFileSync(inputPath);
  const formatted = formatResult(runParser(input.toString("utf8"), { link: inputPath }));
  const expected = readTrimmed(expectPath);

  if (item.expect.type === "content") {
    if (formatted.kind !== "content") {
      return {
        name: item.name,
        passed: false,
        message: "expected server content, got " + formatted.kind + ": " + formatted.error,
      };
    }
    const actual = formatted.content.replace(/\r\n/g, "\n").trim();
    if (actual !== expected) {
      return {
        name: item.name,
        passed: false,
        message: diffMessage(expected, actual),
      };
    }
    return {
      name: item.name,
      passed: true,
      message: formatted.serverCount + " server line(s)",
    };
  }

  if (item.expect.type === "error") {
    if (formatted.kind !== "error") {
      return {
        name: item.name,
        passed: false,
        message: "expected an error, got " + formatted.kind,
      };
    }
    if (formatted.error.trim() !== expected) {
      return {
        name: item.name,
        passed: false,
        message: diffMessage(expected, formatted.error.trim()),
      };
    }
    return {
      name: item.name,
      passed: true,
      message: formatted.error,
    };
  }

  return {
    name: item.name,
    passed: false,
    message: "unknown expect.type: " + item.expect.type,
  };
}

function diffMessage(expected, actual) {
  return [
    "output did not match expected file",
    "--- expected",
    expected,
    "+++ actual",
    actual,
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv);
  const manifest = loadCases();

  if (args.help) {
    process.stdout.write(
      [
        "Verify sanitized parser fixtures.",
        "",
        "Usage:",
        "  node scripts/verify-examples.js",
        "  node scripts/verify-examples.js --list",
      ].join("\n") + "\n"
    );
    return;
  }

  if (args.list) {
    for (const item of manifest.cases) {
      process.stdout.write("- " + item.name + ": " + item.notes + "\n");
    }
    return;
  }

  let failed = 0;
  for (const item of manifest.cases) {
    const result = verifyCase(item);
    const mark = result.passed ? "ok" : "FAIL";
    process.stdout.write("[" + mark + "] " + result.name + " — " + result.message.split("\n")[0] + "\n");
    if (!result.passed) {
      failed += 1;
      process.stdout.write(result.message + "\n");
    }
  }

  const total = manifest.cases.length;
  const passed = total - failed;
  process.stdout.write("\n" + passed + "/" + total + " example cases passed\n");
  if (failed) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(String(error && error.message ? error.message : error) + "\n");
  process.exit(1);
}
