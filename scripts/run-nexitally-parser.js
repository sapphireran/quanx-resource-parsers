#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { DEFAULT_PARSER, runResourceParserFile } = require("./lib/quanx-resource-parser");

function printUsage(stream) {
  stream.write(
    [
      "Usage: node scripts/run-nexitally-parser.js <config-file> [--json]",
      "",
      "Runs nexitally-node-parser.js against a local Quantumult X snippet.",
      "The file is treated as $resource.content. Nothing is downloaded.",
      "",
      "  --json    print the raw $done payload",
      "  --help    show this message",
      ""
    ].join("\n")
  );
}

function parseArgs(argv) {
  const args = { file: null, json: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
    } else if (token === "--json") {
      args.json = true;
    } else if (token.startsWith("-")) {
      throw new Error("Unknown option: " + token);
    } else if (args.file) {
      throw new Error("Only one input file is accepted.");
    } else {
      args.file = token;
    }
  }
  return args;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(error.message + "\n");
    printUsage(process.stderr);
    process.exitCode = 2;
    return;
  }

  if (args.help || !args.file) {
    printUsage(args.help ? process.stdout : process.stderr);
    process.exitCode = args.help ? 0 : 2;
    return;
  }

  const filePath = path.resolve(process.cwd(), args.file);
  if (!fs.existsSync(filePath)) {
    process.stderr.write("File not found: " + filePath + "\n");
    process.exitCode = 2;
    return;
  }

  const result = runResourceParserFile(filePath, { parserPath: DEFAULT_PARSER });

  if (args.json) {
    process.stdout.write(JSON.stringify(result.raw, null, 2) + "\n");
  } else if (result.error) {
    process.stderr.write(result.error + "\n");
  } else if (typeof result.content === "string") {
    process.stdout.write(result.content);
    if (result.content.length && !result.content.endsWith("\n")) {
      process.stdout.write("\n");
    }
  } else {
    process.stderr.write("Parser returned neither content nor error.\n");
    process.exitCode = 1;
    return;
  }

  process.exitCode = result.error ? 1 : 0;
}

main();
