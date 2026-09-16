"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_PARSER = path.resolve(__dirname, "..", "..", "nexitally-node-parser.js");

/**
 * Run a Quantumult X resource-parser script against local text.
 *
 * Resource parsers are ordinary JavaScript files that read `$resource` and
 * finish with `$done({ content })` or `$done({ error })`. Quantumult X does
 * not expose HTTP or persistent-storage APIs in this environment, so the
 * desktop harness only injects those two globals.
 *
 * @param {object} options
 * @param {string} [options.parserPath]
 * @param {string} options.content
 * @param {string} [options.link]
 * @param {string} [options.info]
 * @param {string} [options.tag]
 * @param {string} [options.userAgent]
 * @returns {{ content?: string, error?: string, retry?: object, raw: object }}
 */
function runResourceParser(options) {
  const parserPath = options.parserPath || DEFAULT_PARSER;
  const source = fs.readFileSync(parserPath, "utf8");
  let doneValue;
  let doneCalls = 0;

  const sandbox = {
    $resource: {
      content: options.content == null ? "" : String(options.content),
      link: options.link == null ? "" : String(options.link),
      info: options.info == null ? "" : String(options.info),
      tag: options.tag == null ? "" : String(options.tag),
      user_agent: options.userAgent == null ? "" : String(options.userAgent)
    },
    $done: function $done(value) {
      doneCalls += 1;
      doneValue = value;
    },
    $notify: function $notify() {},
    console: console
  };

  vm.runInNewContext(source, sandbox, {
    filename: path.basename(parserPath),
    timeout: 5000
  });

  if (doneCalls === 0) {
    throw new Error("Parser finished without calling $done().");
  }
  if (doneCalls > 1) {
    throw new Error("Parser called $done() more than once.");
  }
  if (doneValue == null || typeof doneValue !== "object") {
    throw new Error("Parser called $done() without an object payload.");
  }

  return {
    content: typeof doneValue.content === "string" ? doneValue.content : undefined,
    error: typeof doneValue.error === "string" ? doneValue.error : undefined,
    retry: doneValue.retry,
    raw: doneValue
  };
}

function runResourceParserFile(filePath, extra) {
  const content = fs.readFileSync(filePath);
  // Preserve BOM / CRLF bytes; the parser itself normalizes them.
  return runResourceParser(Object.assign({ content: content.toString("utf8") }, extra || {}));
}

module.exports = {
  DEFAULT_PARSER,
  runResourceParser,
  runResourceParserFile
};
