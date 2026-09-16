#!/usr/bin/env node
"use strict";

/**
 * Run the fictional Quantumult X fixtures in examples/manifest.json
 * against the committed resource parsers.
 *
 * Quantumult X is not required. This script only mocks $resource and
 * $done so the keep/drop rules stay honest. It does not fetch any URL.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var repoRoot = path.resolve(__dirname, "..");
var manifestPath = path.join(repoRoot, "examples", "manifest.json");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function applyTransform(content, transform) {
  if (!transform) return content;
  if (transform === "crlf-bom") {
    return "\uFEFF" + content.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
  }
  throw new Error("Unknown transform: " + transform);
}

function normalizeExpected(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/, "");
}

function runParser(parserSource, resourceContent) {
  var result = null;
  var doneCount = 0;
  var context = {
    String: String,
    $resource: {
      content: resourceContent,
      link: "",
      info: "",
      tag: "Nexitally",
      user_agent: ""
    },
    $done: function (value) {
      doneCount += 1;
      result = value;
    }
  };

  vm.runInNewContext(parserSource, context, {
    filename: "resource-parser.js",
    timeout: 2000
  });

  if (doneCount !== 1) {
    throw new Error("$done was called " + doneCount + " time(s); expected 1");
  }
  if (!result || typeof result !== "object") {
    throw new Error("$done did not receive an object");
  }
  return result;
}

function formatUnexpected(result) {
  if (result.error) return "error: " + JSON.stringify(result.error);
  if (Object.prototype.hasOwnProperty.call(result, "content")) {
    return "content:\n" + result.content;
  }
  return JSON.stringify(result);
}

function runFixture(fixture, parserCache) {
  if (!parserCache[fixture.parser]) {
    parserCache[fixture.parser] = readRepoFile(fixture.parser);
  }

  var input = applyTransform(readRepoFile(fixture.input), fixture.transform);
  var result = runParser(parserCache[fixture.parser], input);

  if (fixture.expectedError) {
    if (result.error !== fixture.expectedError) {
      return {
        ok: false,
        detail:
          "expected error " +
          JSON.stringify(fixture.expectedError) +
          "\n  received " +
          formatUnexpected(result)
      };
    }
    if (result.content) {
      return {
        ok: false,
        detail: "expected an error but $done also returned content"
      };
    }
    return { ok: true, detail: "error as expected" };
  }

  if (!fixture.expectedContent) {
    return { ok: false, detail: "fixture is missing expectedContent or expectedError" };
  }

  var expected = normalizeExpected(readRepoFile(fixture.expectedContent));
  var actual = normalizeExpected(result.content);

  if (result.error) {
    return {
      ok: false,
      detail: "expected content but received error: " + result.error
    };
  }
  if (actual !== expected) {
    return {
      ok: false,
      detail:
        "content mismatch\n--- expected ---\n" +
        expected +
        "\n--- actual ---\n" +
        actual
    };
  }
  return { ok: true, detail: actual.split("\n").filter(Boolean).length + " server line(s)" };
}

function main() {
  var manifest = JSON.parse(readRepoFile(path.relative(repoRoot, manifestPath)));
  if (!manifest.fixtures || !manifest.fixtures.length) {
    console.error("examples/manifest.json has no fixtures");
    process.exit(2);
  }

  var parserCache = {};
  var failed = 0;

  console.log("Running " + manifest.fixtures.length + " personal parser fixtures\n");

  manifest.fixtures.forEach(function (fixture) {
    var outcome;
    try {
      outcome = runFixture(fixture, parserCache);
    } catch (error) {
      outcome = { ok: false, detail: error.message };
    }

    var mark = outcome.ok ? "ok  " : "FAIL";
    if (!outcome.ok) failed += 1;
    console.log(mark + "  " + fixture.name);
    if (!outcome.ok || process.env.EXAMPLES_VERBOSE) {
      console.log("      " + outcome.detail.split("\n").join("\n      "));
    } else {
      console.log("      " + outcome.detail);
    }
  });

  console.log("");
  if (failed) {
    console.log(failed + " fixture(s) failed");
    process.exit(1);
  }
  console.log("All fixtures passed");
}

main();
