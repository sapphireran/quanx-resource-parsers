#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runParser, runParserFile } = require("./qx-parser-sandbox");

function printUsage(stream) {
  stream.write(
    [
      "Usage:",
      "  node scripts/run-parser.js <file>",
      "  node scripts/run-parser.js --stdin",
      "",
      "Runs nexitally-node-parser.js in a Quantumult X-shaped sandbox and",
      "prints the $done payload as JSON. Use this on sanitized fixtures or",
      "on a private copy of a live body that is not in git.",
      "",
    ].join("\n")
  );
}

function main(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
    printUsage(process.stdout);
    process.exit(args.length === 0 ? 2 : 0);
  }

  let result;
  if (args[0] === "--stdin") {
    const content = fs.readFileSync(0, "utf8");
    result = runParser(content);
  } else {
    const inputPath = path.resolve(args[0]);
    result = runParserFile(inputPath);
  }

  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (result && result.error) {
    process.exit(1);
  }
}

if (require.main === module) {
  main(process.argv);
}

module.exports = { main };
