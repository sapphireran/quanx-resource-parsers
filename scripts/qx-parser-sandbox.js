"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_PARSER = path.resolve(__dirname, "..", "nexitally-node-parser.js");

function loadParserSource(parserPath) {
  const resolved = path.resolve(parserPath || DEFAULT_PARSER);
  return {
    resolved,
    code: fs.readFileSync(resolved, "utf8"),
  };
}

/**
 * Run a Quantumult X resource parser in a minimal Node sandbox.
 *
 * The official parser environment exposes $resource, $done, and $notify.
 * HTTP / $prefs APIs are intentionally absent — matching Quantumult X.
 */
function runParser(content, options) {
  const opts = options || {};
  const { resolved, code } = loadParserSource(opts.parserPath);
  let settled = null;
  let doneCount = 0;

  const sandbox = {
    $resource: {
      content: content == null ? "" : String(content),
      link: opts.link == null ? "" : String(opts.link),
      info: opts.info == null ? "" : String(opts.info),
      tag: opts.tag == null ? "" : String(opts.tag),
      user_agent: opts.user_agent == null ? "" : String(opts.user_agent),
    },
    $done: function $done(value) {
      doneCount += 1;
      settled = value;
    },
    $notify: function $notify() {
      // Resource parsers may notify; this repo's script does not.
    },
    console: console,
  };

  vm.runInNewContext(code, sandbox, {
    filename: resolved,
    timeout: opts.timeoutMs || 2000,
  });

  if (doneCount === 0) {
    throw new Error("parser did not call $done");
  }
  if (doneCount > 1) {
    throw new Error("parser called $done more than once");
  }
  return settled;
}

function runParserFile(inputPath, options) {
  const raw = fs.readFileSync(inputPath);
  // Keep BOM bytes intact; the parser is responsible for stripping them.
  return runParser(raw.toString("utf8"), options);
}

module.exports = {
  DEFAULT_PARSER,
  loadParserSource,
  runParser,
  runParserFile,
};
