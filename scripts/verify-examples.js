#!/usr/bin/env node
"use strict";

/**
 * Verify every example fixture in examples/nexitally/manifest.json.
 *
 * This is the local stand-in for Quantumult X: it feeds each sample
 * configuration through nexitally-node-parser.js and compares the
 * $done() result with the checked-in expected file.
 */

const fs = require("fs");
const path = require("path");
const { runParser, applyTransform } = require("./lib/qx-parser-harness");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "examples", "nexitally", "manifest.json");

function readUtf8(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function normalizeExpectedContent(text) {
  return String(text)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n+$/, "");
}

function loadManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw);
  if (!manifest || !Array.isArray(manifest.cases)) {
    throw new Error("manifest.json must contain a cases array");
  }
  return manifest;
}

function runCase(item) {
  const input = applyTransform(readUtf8(item.input), item.transform || "none");
  const result = runParser(input, {
    link: "file://" + path.join(ROOT, item.input),
    tag: item.tag || "example",
  });

  if (item.expectedError) {
    const expectedError = normalizeExpectedContent(readUtf8(item.expectedError));
    if (!result.error) {
      return {
        ok: false,
        message: "expected error, parser returned content:\n" + (result.content || ""),
      };
    }
    if (String(result.error) !== expectedError) {
      return {
        ok: false,
        message:
          "error mismatch\n  expected: " +
          expectedError +
          "\n  actual:   " +
          result.error,
      };
    }
    if (result.content) {
      return {
        ok: false,
        message: "error result should not also include content",
      };
    }
    return { ok: true };
  }

  if (!item.expected) {
    return { ok: false, message: "case is missing expected or expectedError" };
  }

  if (result.error) {
    return { ok: false, message: "unexpected error: " + result.error };
  }

  const expected = normalizeExpectedContent(readUtf8(item.expected));
  const actual = normalizeExpectedContent(result.content || "");
  if (actual !== expected) {
    return {
      ok: false,
      message:
        "content mismatch\n--- expected ---\n" +
        expected +
        "\n--- actual ---\n" +
        actual,
    };
  }
  return { ok: true };
}

function main() {
  const manifest = loadManifest();
  const failures = [];
  const rows = [];

  manifest.cases.forEach(function (item, index) {
    const label = item.name || item.input || "case-" + index;
    try {
      const outcome = runCase(item);
      rows.push({ label: label, ok: outcome.ok, message: outcome.message });
      if (!outcome.ok) {
        failures.push({ label: label, message: outcome.message });
      }
    } catch (err) {
      rows.push({ label: label, ok: false, message: err.message });
      failures.push({ label: label, message: err.stack || err.message });
    }
  });

  rows.forEach(function (row) {
    console.log((row.ok ? "PASS" : "FAIL") + "  " + row.label);
    if (!row.ok && row.message) {
      console.log(row.message.replace(/^/gm, "      "));
    }
  });

  console.log("");
  console.log(
    rows.length +
      " example(s), " +
      (rows.length - failures.length) +
      " passed, " +
      failures.length +
      " failed"
  );

  process.exit(failures.length ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { runCase, loadManifest };
