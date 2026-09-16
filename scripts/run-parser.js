#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runParserFile } = require("./qx-parser-harness");

function usage() {
  return [
    "Usage:",
    "  node scripts/run-parser.js <input-file> [--parser <parser.js>]",
    "",
    "Runs a Quantumult X resource parser locally against a fixture or a",
    "saved response body. Prints parsed server lines or the parser error.",
    "",
    "Do not pass a live Nexitally URL here. Quantumult X downloads that",
    "URL itself; this script only reads a file already on disk.",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    input: null,
    parser: path.resolve(__dirname, "..", "nexitally-node-parser.js"),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
    } else if (token === "--parser") {
      i += 1;
      if (!argv[i]) throw new Error("--parser requires a path");
      args.parser = path.resolve(argv[i]);
    } else if (token.startsWith("-")) {
      throw new Error("unknown option: " + token);
    } else if (!args.input) {
      args.input = path.resolve(token);
    } else {
      throw new Error("unexpected argument: " + token);
    }
  }

  return args;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exit(2);
  }

  if (args.help || !args.input) {
    console.log(usage());
    process.exit(args.help ? 0 : 2);
  }

  if (!fs.existsSync(args.input)) {
    console.error("input file not found: " + args.input);
    process.exit(2);
  }
  if (!fs.existsSync(args.parser)) {
    console.error("parser file not found: " + args.parser);
    process.exit(2);
  }

  const content = fs.readFileSync(args.input);
  const result = runParserFile(args.parser, {
    content: content.toString("utf8"),
    link: args.input,
    tag: "local-fixture",
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  process.stdout.write(String(result.content || ""));
  if (result.content && !String(result.content).endsWith("\n")) {
    process.stdout.write("\n");
  }
}

if (require.main === module) {
  main();
}
