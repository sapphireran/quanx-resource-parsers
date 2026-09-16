#!/usr/bin/env node
"use strict";

/**
 * Run a Quantumult X resource-parser script against a local file.
 *
 * Quantumult X injects $resource and $done. This harness does the same
 * so the personal examples can be checked without the iOS app.
 * It does not download subscriptions and does not emulate TLS or
 * Quantumult X server-line validation.
 *
 * Usage:
 *   node scripts/run-parser.js <parser.js> <input-file>
 *   node scripts/run-parser.js <parser.js> --content-stdin
 *   node scripts/run-parser.js <parser.js> <input-file> --json
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function printUsage() {
  process.stderr.write(
    "Usage: node scripts/run-parser.js <parser.js> <input-file|--content-stdin> [--json]\n"
  );
}

function parseArgs(argv) {
  var args = argv.slice(2);
  var json = false;
  var stdin = false;
  var positional = [];

  args.forEach(function (arg) {
    if (arg === "--json") {
      json = true;
    } else if (arg === "--content-stdin") {
      stdin = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      positional.push(arg);
    }
  });

  if (positional.length < 1 || (!stdin && positional.length < 2)) {
    printUsage();
    process.exit(2);
  }

  return {
    parserPath: positional[0],
    inputPath: stdin ? null : positional[1],
    stdin: stdin,
    json: json
  };
}

function readInput(options) {
  if (options.stdin) {
    return fs.readFileSync(0, "utf8");
  }
  return fs.readFileSync(options.inputPath, "utf8");
}

/**
 * Execute a Quantumult X parser script.
 *
 * @param {string} parserSource
 * @param {string} parserFilename
 * @param {string} content
 * @param {object} [resourceExtras]
 * @returns {{content?: string, error?: string, retry?: object, raw: object}}
 */
function runParserSource(parserSource, parserFilename, content, resourceExtras) {
  var result;
  var doneCalls = 0;
  var resource = {
    content: content,
    link: "",
    info: "",
    tag: "",
    user_agent: ""
  };

  if (resourceExtras) {
    Object.keys(resourceExtras).forEach(function (key) {
      resource[key] = resourceExtras[key];
    });
  }

  var sandbox = {
    $resource: resource,
    $done: function (payload) {
      doneCalls += 1;
      result = payload;
    },
    console: console,
    String: String
  };

  vm.runInNewContext(parserSource, sandbox, {
    filename: parserFilename,
    timeout: 5000
  });

  if (doneCalls === 0) {
    throw new Error("parser did not call $done");
  }
  if (doneCalls > 1) {
    throw new Error("parser called $done " + doneCalls + " times");
  }
  if (!result || typeof result !== "object") {
    throw new Error("parser called $done without an object payload");
  }

  return {
    content: typeof result.content === "string" ? result.content : undefined,
    error: typeof result.error === "string" ? result.error : undefined,
    retry: result.retry,
    raw: result
  };
}

function runParserFile(parserPath, content, resourceExtras) {
  var absolute = path.resolve(parserPath);
  var source = fs.readFileSync(absolute, "utf8");
  return runParserSource(source, absolute, content, resourceExtras);
}

function main() {
  var options = parseArgs(process.argv);
  var content = readInput(options);
  var extras = {};
  if (options.inputPath) {
    extras.link = path.resolve(options.inputPath);
  }

  var output = runParserFile(options.parserPath, content, extras);

  if (options.json) {
    process.stdout.write(
      JSON.stringify(
        {
          content: output.content,
          error: output.error,
          retry: output.retry || null
        },
        null,
        2
      ) + "\n"
    );
    process.exit(output.error ? 1 : 0);
  }

  if (output.error) {
    process.stderr.write(output.error + "\n");
    process.exit(1);
  }

  process.stdout.write(output.content);
  if (output.content && !output.content.endsWith("\n")) {
    process.stdout.write("\n");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    process.stderr.write(String(err && err.message ? err.message : err) + "\n");
    process.exit(1);
  }
}

module.exports = {
  runParserFile: runParserFile,
  runParserSource: runParserSource
};
