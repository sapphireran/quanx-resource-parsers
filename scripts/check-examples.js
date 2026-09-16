#!/usr/bin/env node
"use strict";

/**
 * Validate every examples/*/manifest.json case against the named parser.
 *
 * Success cases compare $done({content}) to a fixture file.
 * Error cases compare $done({error}) to an exact string.
 */

const fs = require("fs");
const path = require("path");
const { applyTransforms, runParser } = require("./run-parser");

const repoRoot = path.resolve(__dirname, "..");
const examplesRoot = path.join(repoRoot, "examples");

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function normalizeNewlines(text) {
  return String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
}

function stripTrailingNewlines(text) {
  return normalizeNewlines(text).replace(/\n+$/, "");
}

function listManifests() {
  if (!fs.existsSync(examplesRoot)) {
    return [];
  }

  return fs
    .readdirSync(examplesRoot, { withFileTypes: true })
    .filter(function (entry) {
      return entry.isDirectory();
    })
    .map(function (entry) {
      return path.join(examplesRoot, entry.name, "manifest.json");
    })
    .filter(function (manifestPath) {
      return fs.existsSync(manifestPath);
    })
    .sort();
}

function loadManifest(manifestPath) {
  var raw = readUtf8(manifestPath);
  var manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (error) {
    throw new Error("Invalid JSON in " + manifestPath + ": " + error.message);
  }

  if (!manifest || typeof manifest.parser !== "string") {
    throw new Error(manifestPath + " is missing a string parser field.");
  }
  if (!Array.isArray(manifest.cases) || !manifest.cases.length) {
    throw new Error(manifestPath + " must list at least one case.");
  }

  return manifest;
}

function resolveFrom(manifestDir, relativePath) {
  return path.resolve(manifestDir, relativePath);
}

function formatLines(text) {
  return stripTrailingNewlines(text)
    .split("\n")
    .map(function (line, index) {
      return String(index + 1).padStart(3, " ") + " | " + line;
    })
    .join("\n");
}

function checkCase(manifestDir, parserPath, testCase) {
  if (!testCase || typeof testCase.name !== "string") {
    throw new Error("A case is missing a name.");
  }
  if (typeof testCase.input !== "string") {
    throw new Error(testCase.name + " is missing an input file.");
  }

  var inputPath = resolveFrom(manifestDir, testCase.input);
  if (!fs.existsSync(inputPath)) {
    throw new Error(testCase.name + " input not found: " + inputPath);
  }

  var input = applyTransforms(readUtf8(inputPath), testCase.transforms);
  var result = runParser(parserPath, input, testCase.resource || {});

  if (typeof testCase.expectedError === "string") {
    if (!result || result.error !== testCase.expectedError) {
      throw new Error(
        testCase.name +
          " expected error:\n  " +
          JSON.stringify(testCase.expectedError) +
          "\nreceived:\n  " +
          JSON.stringify(result)
      );
    }
    if (typeof result.content === "string") {
      throw new Error(testCase.name + " returned both error and content.");
    }
    return;
  }

  if (typeof testCase.expectedContent !== "string") {
    throw new Error(
      testCase.name + " must set expectedContent or expectedError."
    );
  }

  var expectedPath = resolveFrom(manifestDir, testCase.expectedContent);
  if (!fs.existsSync(expectedPath)) {
    throw new Error(testCase.name + " expected file not found: " + expectedPath);
  }

  var expected = stripTrailingNewlines(readUtf8(expectedPath));
  var actual = result && typeof result.content === "string"
    ? stripTrailingNewlines(result.content)
    : null;

  if (actual === null) {
    throw new Error(
      testCase.name + " expected content but received:\n  " + JSON.stringify(result)
    );
  }

  if (actual !== expected) {
    throw new Error(
      testCase.name +
        " content mismatch.\n\nexpected:\n" +
        formatLines(expected) +
        "\n\nactual:\n" +
        formatLines(actual)
    );
  }
}

function main() {
  var manifests = listManifests();
  if (!manifests.length) {
    process.stderr.write("No examples/*/manifest.json files found.\n");
    process.exit(1);
  }

  var passed = 0;
  var failed = 0;

  manifests.forEach(function (manifestPath) {
    var manifestDir = path.dirname(manifestPath);
    var relativeManifest = path.relative(repoRoot, manifestPath);
    var manifest = loadManifest(manifestPath);
    var parserPath = resolveFrom(manifestDir, manifest.parser);

    process.stdout.write("\n" + relativeManifest + "\n");
    process.stdout.write("  parser: " + path.relative(repoRoot, parserPath) + "\n");

    manifest.cases.forEach(function (testCase) {
      var label = "  - " + testCase.name;
      try {
        checkCase(manifestDir, parserPath, testCase);
        passed += 1;
        process.stdout.write(label + "  ok\n");
      } catch (error) {
        failed += 1;
        process.stdout.write(label + "  FAIL\n");
        process.stderr.write(String(error.message || error) + "\n");
      }
    });
  });

  process.stdout.write(
    "\n" + passed + " passed, " + failed + " failed, " + (passed + failed) + " total\n"
  );

  if (failed) {
    process.exit(1);
  }
}

main();
