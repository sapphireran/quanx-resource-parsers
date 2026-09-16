#!/usr/bin/env node
"use strict";

/**
 * Run nexitally-node-parser.js outside Quantumult X.
 *
 * Usage:
 *   node scripts/run-parser.js <input-file>
 *   node scripts/run-parser.js --json <input-file>
 *
 * The Quantumult X parser file is evaluated in a sandbox that supplies
 * $resource and $done. Nothing is sent to a network. The input file should
 * be a fictional or locally exported configuration you are willing to keep
 * on this machine. Do not pass a real subscription URL into this script.
 */

const fs = require("fs");
const path = require("path");
const { runParser, applyTransform } = require("./lib/qx-parser-harness");

function printUsage() {
  const rel = path.relative(process.cwd(), __filename) || "scripts/run-parser.js";
  console.error("Usage:");
  console.error("  node " + rel + " [--json] [--transform bom-crlf|crlf|bom] <input-file>");
  console.error("");
  console.error("Prints parsed server lines to stdout, or a JSON object when --json is set.");
  console.error("Exits 1 when the parser returns { error }, 2 on usage / I/O errors.");
}

function parseArgs(argv) {
  const args = {
    json: false,
    transform: null,
    file: null,
  };

  for (var i = 0; i < argv.length; i++) {
    var token = argv[i];
    if (token === "--json") {
      args.json = true;
      continue;
    }
    if (token === "--transform") {
      args.transform = argv[++i] || null;
      continue;
    }
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token.charAt(0) === "-") {
      throw new Error("Unknown flag: " + token);
    }
    if (args.file) {
      throw new Error("Unexpected extra argument: " + token);
    }
    args.file = token;
  }

  return args;
}

function main() {
  var args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    printUsage();
    process.exit(2);
    return;
  }

  if (args.help || !args.file) {
    printUsage();
    process.exit(args.help ? 0 : 2);
    return;
  }

  var abs = path.resolve(process.cwd(), args.file);
  var raw;
  try {
    raw = fs.readFileSync(abs);
  } catch (err) {
    console.error("Could not read " + abs + ": " + err.message);
    process.exit(2);
    return;
  }

  var text = raw.toString("utf8");
  if (args.transform) {
    text = applyTransform(text, args.transform);
  }

  var result;
  try {
    result = runParser(text, {
      link: "file://" + abs,
      tag: "local-example",
    });
  } catch (err) {
    console.error(err.message);
    process.exit(2);
    return;
  }

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else if (result.error) {
    console.error(result.error);
  } else {
    var content = result.content == null ? "" : String(result.content);
    if (content && content.charAt(content.length - 1) !== "\n") {
      content += "\n";
    }
    process.stdout.write(content);
  }

  process.exit(result.error ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs };
