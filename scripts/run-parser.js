#!/usr/bin/env node
"use strict";

/**
 * Run nexitally-node-parser.js outside Quantumult X.
 *
 * Quantumult X injects $resource and $done into the parser. This CLI recreates
 * that contract with Node's vm module so fixtures can be inspected locally.
 *
 * Usage:
 *   node scripts/run-parser.js <fixture-path>
 *   node scripts/run-parser.js --json <fixture-path>
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const PARSER_PATH = path.join(ROOT, "nexitally-node-parser.js");

function parseArgs(argv) {
  const args = {
    json: false,
    help: false,
    file: null,
  };

  for (const item of argv.slice(2)) {
    if (item === "--json" || item === "-j") {
      args.json = true;
    } else if (item === "--help" || item === "-h") {
      args.help = true;
    } else if (!item.startsWith("-") && !args.file) {
      args.file = item;
    } else {
      throw new Error("Unknown argument: " + item);
    }
  }

  return args;
}

function printHelp() {
  const text = [
    "Run the Nexitally Quantumult X resource parser against a local file.",
    "",
    "Usage:",
    "  node scripts/run-parser.js <fixture-path>",
    "  node scripts/run-parser.js --json <fixture-path>",
    "",
    "The script loads nexitally-node-parser.js in a sandbox that provides the",
    "same $resource / $done globals Quantumult X injects. It does not download",
    "subscriptions and never needs a private URL.",
  ].join("\n");
  process.stdout.write(text + "\n");
}

function loadParserSource() {
  return fs.readFileSync(PARSER_PATH, "utf8");
}

function runParser(content, extras) {
  const source = loadParserSource();
  let result;
  let doneCount = 0;

  const sandbox = {
    $resource: {
      content: content,
      link: extras && extras.link ? extras.link : "",
      info: extras && extras.info ? extras.info : "",
      tag: extras && extras.tag ? extras.tag : "Nexitally",
      user_agent: extras && extras.user_agent ? extras.user_agent : "",
    },
    $notify: function () {},
    $done: function (value) {
      doneCount += 1;
      result = value;
    },
  };

  vm.runInNewContext(source, sandbox, {
    filename: "nexitally-node-parser.js",
  });

  if (doneCount === 0) {
    throw new Error("Parser did not call $done().");
  }
  if (doneCount > 1) {
    throw new Error("Parser called $done() more than once.");
  }

  return result;
}

function formatResult(result) {
  if (result && typeof result.error === "string") {
    return {
      ok: false,
      kind: "error",
      error: result.error,
      serverCount: 0,
    };
  }

  if (!result || typeof result.content !== "string") {
    return {
      ok: false,
      kind: "invalid",
      error: "Parser returned neither content nor error.",
      serverCount: 0,
    };
  }

  const servers = result.content
    .split("\n")
    .map(function (line) {
      return line.trim();
    })
    .filter(Boolean);

  return {
    ok: true,
    kind: "content",
    content: result.content,
    servers: servers,
    serverCount: servers.length,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (!args.file) {
    printHelp();
    process.exit(2);
  }

  const filePath = path.resolve(process.cwd(), args.file);
  const content = fs.readFileSync(filePath);
  const text = content.toString("utf8");
  const formatted = formatResult(runParser(text, { link: filePath }));

  if (args.json) {
    process.stdout.write(JSON.stringify(formatted, null, 2) + "\n");
  } else if (formatted.kind === "content") {
    process.stdout.write(formatted.content);
    if (!formatted.content.endsWith("\n")) {
      process.stdout.write("\n");
    }
  } else {
    process.stderr.write(formatted.error + "\n");
    process.exit(1);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(String(error && error.message ? error.message : error) + "\n");
    process.exit(1);
  }
}

module.exports = {
  PARSER_PATH: PARSER_PATH,
  ROOT: ROOT,
  runParser: runParser,
  formatResult: formatResult,
};
