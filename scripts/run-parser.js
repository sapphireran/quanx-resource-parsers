#!/usr/bin/env node
"use strict";

/**
 * Apply nexitally-node-parser.js to a local file and print the result.
 *
 * Usage:
 *   node scripts/run-parser.js examples/fixtures/nexitally-full-config.conf
 *   node scripts/run-parser.js --json path/to/file.conf
 */

const fs = require("fs");
const path = require("path");
const { runParser } = require("./lib/qx-parser-vm");

function parseArgs(argv) {
  const args = { json: false, files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--json") {
      args.json = true;
    } else if (item === "--help" || item === "-h") {
      args.help = true;
    } else if (item.startsWith("-")) {
      throw new Error("unknown flag: " + item);
    } else {
      args.files.push(item);
    }
  }
  return args;
}

function formatResult(result) {
  if (result && typeof result.error === "string") {
    return { ok: false, error: result.error };
  }
  if (result && typeof result.content === "string") {
    const lines = result.content.length ? result.content.split("\n") : [];
    return { ok: true, count: lines.length, content: result.content };
  }
  return { ok: false, error: "parser returned an unexpected $done payload", payload: result };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.files.length !== 1) {
    process.stdout.write(
      "Usage: node scripts/run-parser.js [--json] <file>\n"
    );
    process.exit(args.help ? 0 : 2);
  }

  const filePath = path.resolve(args.files[0]);
  const result = formatResult(runParser(fs.readFileSync(filePath, "utf8")));

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else if (result.ok) {
    process.stdout.write(result.content);
    if (result.content.length && !result.content.endsWith("\n")) {
      process.stdout.write("\n");
    }
  } else {
    process.stderr.write(result.error + "\n");
  }

  process.exit(result.ok ? 0 : 1);
}

main();
