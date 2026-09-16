#!/usr/bin/env node
"use strict";

/**
 * Run the Nexitally Quantumult X parser against a local file.
 *
 * Usage:
 *   node tools/run-parser.js examples/nexitally-full-config.example.conf
 *   node tools/run-parser.js path/to/file.conf --link 'https://example.test/qx#in=HK'
 *   node tools/run-parser.js path/to/file.conf --json
 *
 * The --link flag only supplies $resource.link (including hash parameters).
 * Never pass a real Nexitally URL; use a placeholder like the examples.
 */

var fs = require("fs");
var path = require("path");
var parser = require("../nexitally-node-parser.js");

function printHelp(stream) {
  stream.write(
    [
      "Usage: node tools/run-parser.js <file> [--link <url-with-optional-hash>] [--json]",
      "",
      "Reads a Quantumult X configuration or server list from <file> and prints",
      "the parser output. Exit code 0 on content, 1 on parser error or bad args.",
      "",
      "Options:",
      "  --link <url>  Fake $resource.link, used only for hash parameters.",
      "  --json        Print {content} or {error} as JSON.",
      "  --help        Show this message.",
      ""
    ].join("\n")
  );
}

function parseArgs(argv) {
  var args = {
    file: null,
    link: "https://subscription.example.test/quantumult-x",
    json: false,
    help: false
  };
  var i;
  var token;

  for (i = 0; i < argv.length; i++) {
    token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
    } else if (token === "--json") {
      args.json = true;
    } else if (token === "--link") {
      args.link = argv[++i];
      if (!args.link) {
        throw new Error("--link requires a value");
      }
    } else if (token.charAt(0) === "-") {
      throw new Error("unknown option: " + token);
    } else if (args.file) {
      throw new Error("unexpected extra argument: " + token);
    } else {
      args.file = token;
    }
  }
  return args;
}

function main() {
  var args;
  var content;
  var result;

  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(err.message + "\n");
    printHelp(process.stderr);
    process.exit(1);
  }

  if (args.help || !args.file) {
    printHelp(args.help ? process.stdout : process.stderr);
    process.exit(args.help ? 0 : 1);
  }

  try {
    content = fs.readFileSync(path.resolve(args.file), "utf8");
  } catch (err) {
    process.stderr.write("could not read file: " + err.message + "\n");
    process.exit(1);
  }

  result = parser.parseResource({
    content: content,
    link: args.link
  });

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else if (result.error) {
    process.stderr.write(result.error + "\n");
  } else {
    process.stdout.write(result.content + "\n");
  }

  process.exit(result.error ? 1 : 0);
}

main();
