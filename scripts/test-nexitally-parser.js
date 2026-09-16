#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runResourceParserFile } = require("./lib/quanx-resource-parser");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "examples", "nexitally", "cases.json");
const PARSER = path.join(ROOT, "nexitally-node-parser.js");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
}

function normalizeExpected(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (!manifest || !Array.isArray(manifest.cases)) {
    throw new Error("examples/nexitally/cases.json must contain a cases array.");
  }
  return manifest;
}

function runCase(item) {
  const inputPath = path.join(ROOT, "examples", "nexitally", item.input);
  const result = runResourceParserFile(inputPath, { parserPath: PARSER });

  if (item.error) {
    if (result.error !== item.error) {
      return {
        ok: false,
        message:
          "expected error:\n  " +
          item.error +
          "\nactual:\n  " +
          (result.error || "(content, " + (result.content || "").split("\n").length + " lines)")
      };
    }
    if (result.content) {
      return { ok: false, message: "error case also returned content." };
    }
    return { ok: true };
  }

  if (!item.expected) {
    return { ok: false, message: "case is missing both expected and error." };
  }

  const expectedPath = path.join(ROOT, "examples", "nexitally", item.expected);
  const expected = normalizeExpected(readText(expectedPath));

  if (result.error) {
    return { ok: false, message: "unexpected error: " + result.error };
  }
  if (typeof result.content !== "string") {
    return { ok: false, message: "parser returned no content string." };
  }

  const actual = normalizeExpected(result.content);
  if (actual !== expected) {
    return {
      ok: false,
      message:
        "content mismatch\n--- expected ---\n" +
        expected +
        "\n--- actual ---\n" +
        actual +
        "\n"
    };
  }
  return { ok: true };
}

function main() {
  const manifest = loadManifest();
  let failed = 0;

  process.stdout.write("Nexitally parser fixtures (" + manifest.cases.length + ")\n");

  manifest.cases.forEach(function (item) {
    const name = item.name || item.input;
    try {
      const outcome = runCase(item);
      if (outcome.ok) {
        process.stdout.write("  pass  " + name + "\n");
      } else {
        failed += 1;
        process.stdout.write("  FAIL  " + name + "\n" + outcome.message + "\n");
      }
    } catch (error) {
      failed += 1;
      process.stdout.write("  FAIL  " + name + "\n" + error.stack + "\n");
    }
  });

  if (failed) {
    process.stdout.write("\n" + failed + " fixture(s) failed.\n");
    process.exitCode = 1;
    return;
  }

  process.stdout.write("\nAll fixtures passed.\n");
}

main();
