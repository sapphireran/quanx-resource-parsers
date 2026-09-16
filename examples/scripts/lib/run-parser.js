"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_PARSER = path.join(REPO_ROOT, "nexitally-node-parser.js");

/**
 * Run a Quantumult X resource parser in a tiny sandbox.
 *
 * Quantumult X injects `$resource` and `$done`. This helper does the same so
 * fixtures can be checked from Node without opening the app or fetching a URL.
 *
 * The parser source is evaluated as-is. It must not require(), process.exit(),
 * or reach the network — none of those exist in the Quantumult X parser VM.
 */
function runParser(content, options) {
  const parserPath = (options && options.parserPath) || DEFAULT_PARSER;
  const source = fs.readFileSync(parserPath, "utf8");
  let settled = null;
  let doneCalls = 0;

  const sandbox = {
    $resource: {
      content: content == null ? "" : String(content)
    },
    $done: function $done(value) {
      doneCalls += 1;
      settled = value;
    }
  };

  vm.runInNewContext(source, sandbox, {
    filename: path.basename(parserPath),
    timeout: (options && options.timeoutMs) || 2000
  });

  if (doneCalls === 0) {
    throw new Error("Parser did not call $done().");
  }
  if (doneCalls > 1) {
    throw new Error("Parser called $done() more than once.");
  }
  if (settled == null || typeof settled !== "object") {
    throw new Error("Parser called $done() without an object result.");
  }

  return {
    result: settled,
    content: typeof settled.content === "string" ? settled.content : null,
    error: typeof settled.error === "string" ? settled.error : null
  };
}

function normalizeExpected(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/, "");
}

function compareParserResult(actual, expected) {
  if (expected.error != null) {
    const got = actual.error == null ? "" : normalizeExpected(actual.error);
    const want = normalizeExpected(expected.error);
    if (actual.content != null) {
      return {
        ok: false,
        message: "Expected an error, but the parser returned server content."
      };
    }
    if (got !== want) {
      return {
        ok: false,
        message: "Error text did not match.\n  expected: " + want + "\n  actual:   " + got
      };
    }
    return { ok: true };
  }

  const got = normalizeExpected(actual.content);
  const want = normalizeExpected(expected.content);
  if (actual.error != null) {
    return {
      ok: false,
      message: "Expected server content, but the parser returned an error:\n  " + actual.error
    };
  }
  if (got !== want) {
    return {
      ok: false,
      message:
        "Server content did not match.\n--- expected ---\n" +
        want +
        "\n--- actual ---\n" +
        got
    };
  }
  return { ok: true };
}

module.exports = {
  REPO_ROOT,
  DEFAULT_PARSER,
  runParser,
  normalizeExpected,
  compareParserResult
};
