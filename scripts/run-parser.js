#!/usr/bin/env node
"use strict";

/**
 * Local Quantumult X resource-parser runner.
 *
 * Quantumult X injects $resource and $done into parser scripts. This helper
 * does the same in Node so personal examples can be checked without a phone.
 *
 * Usage:
 *   node scripts/run-parser.js <parser.js> <input.conf>
 *   node scripts/run-parser.js --json <parser.js> <input.conf>
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadParserSource(parserPath) {
  const resolved = path.resolve(parserPath);
  if (!fs.existsSync(resolved)) {
    throw new Error("Parser file not found: " + resolved);
  }
  return fs.readFileSync(resolved, "utf8");
}

function applyTransforms(text, transforms) {
  var result = String(text);
  (transforms || []).forEach(function (name) {
    if (name === "crlf") {
      result = result.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
      return;
    }
    if (name === "bom") {
      result = "\uFEFF" + result.replace(/^\uFEFF/, "");
      return;
    }
    throw new Error("Unknown transform: " + name);
  });
  return result;
}

function runParser(parserPath, content, extraResource) {
  const source = loadParserSource(parserPath);
  var doneValue;
  var doneCalled = 0;

  const context = {
    $resource: Object.assign(
      {
        content: String(content),
        link: "https://example.invalid/nexitally-full-config",
        info: "",
        tag: "Nexitally",
        user_agent: ""
      },
      extraResource || {}
    ),
    $done: function (value) {
      doneCalled += 1;
      doneValue = value;
    },
    $notify: function () {}
  };

  vm.runInNewContext(source, context, {
    filename: path.basename(parserPath),
    timeout: 2000
  });

  if (doneCalled !== 1) {
    throw new Error(
      "Parser called $done " + doneCalled + " time(s); expected exactly 1."
    );
  }

  return doneValue;
}

function printResult(result, asJson) {
  if (asJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  if (result && typeof result.error === "string") {
    process.stderr.write(result.error + "\n");
    process.exitCode = 2;
    return;
  }

  if (result && typeof result.content === "string") {
    process.stdout.write(result.content);
    if (result.content.length && !result.content.endsWith("\n")) {
      process.stdout.write("\n");
    }
    return;
  }

  process.stderr.write("Parser returned neither content nor error.\n");
  process.exitCode = 2;
}

function parseArgs(argv) {
  var args = argv.slice(2);
  var asJson = false;
  if (args[0] === "--json") {
    asJson = true;
    args = args.slice(1);
  }
  return { asJson: asJson, files: args };
}

function main() {
  var parsed = parseArgs(process.argv);
  if (parsed.files.length !== 2) {
    process.stderr.write(
      "Usage: node scripts/run-parser.js [--json] <parser.js> <input.conf>\n"
    );
    process.exit(1);
  }

  var parserPath = parsed.files[0];
  var inputPath = parsed.files[1];
  var content = fs.readFileSync(path.resolve(inputPath));
  var result = runParser(parserPath, content.toString("utf8"));
  printResult(result, parsed.asJson);
}

if (require.main === module) {
  main();
}

module.exports = {
  applyTransforms: applyTransforms,
  runParser: runParser
};
