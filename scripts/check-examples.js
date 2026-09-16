#!/usr/bin/env node
"use strict";

/**
 * Compare every examples/cases.json entry against its expected file.
 *
 * Usage:
 *   node scripts/check-examples.js
 *   node scripts/check-examples.js --update
 */

const fs = require("fs");
const path = require("path");
const { runParser } = require("./lib/qx-parser-vm");

const ROOT = path.resolve(__dirname, "..");
const CASES_PATH = path.join(ROOT, "examples", "cases.json");

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function normalizeExpected(text) {
  return String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\s+$/, "");
}

function actualFromResult(result, kind) {
  if (kind === "content") {
    if (!result || typeof result.content !== "string") {
      return { mismatch: "expected $done({content}) but got " + JSON.stringify(result) };
    }
    return { value: result.content };
  }
  if (kind === "error") {
    if (!result || typeof result.error !== "string") {
      return { mismatch: "expected $done({error}) but got " + JSON.stringify(result) };
    }
    return { value: result.error };
  }
  return { mismatch: "unknown case kind: " + kind };
}

function loadCases() {
  const raw = JSON.parse(readUtf8(CASES_PATH));
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("examples/cases.json must be a non-empty array");
  }
  return raw;
}

function main() {
  const update = process.argv.includes("--update");
  const cases = loadCases();
  let failed = 0;

  cases.forEach(function (entry) {
    const id = entry.id;
    const fixturePath = path.join(ROOT, "examples", entry.fixture);
    const expectedPath = path.join(ROOT, "examples", entry.expected);
    const result = runParser(readUtf8(fixturePath));
    const actual = actualFromResult(result, entry.kind);

    if (actual.mismatch) {
      failed += 1;
      process.stderr.write("FAIL  " + id + "  " + actual.mismatch + "\n");
      return;
    }

    if (update) {
      fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
      const suffix = actual.value.endsWith("\n") ? "" : "\n";
      fs.writeFileSync(expectedPath, actual.value + suffix, "utf8");
      process.stdout.write("UPDATE  " + id + "\n");
      return;
    }

    if (!fs.existsSync(expectedPath)) {
      failed += 1;
      process.stderr.write("FAIL  " + id + "  missing expected file " + entry.expected + "\n");
      return;
    }

    const expected = normalizeExpected(readUtf8(expectedPath));
    const got = normalizeExpected(actual.value);
    if (expected !== got) {
      failed += 1;
      process.stderr.write("FAIL  " + id + "\n");
      process.stderr.write("  expected:\n" + indent(expected) + "\n");
      process.stderr.write("  actual:\n" + indent(got) + "\n");
      return;
    }

    process.stdout.write("PASS  " + id + "\n");
  });

  if (update) {
    process.stdout.write("Wrote " + cases.length + " expected file(s).\n");
    process.exit(0);
  }

  process.stdout.write(
    (failed ? "Failed " + failed + " of " : "Passed ") + cases.length + " example case(s).\n"
  );
  process.exit(failed ? 1 : 0);
}

function indent(text) {
  if (!text) return "    <empty>";
  return text.split("\n").map(function (line) { return "    " + line; }).join("\n");
}

main();
