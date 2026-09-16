"use strict";

/**
 * Run a Quantumult X resource-parser script locally.
 *
 * Official parsers receive `$resource` and must call `$done` exactly once.
 * HTTP request and persistent-storage APIs are not available in that
 * environment, so this shim does not provide them.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_PARSER = path.resolve(__dirname, "../../nexitally-node-parser.js");

function runParser(content, options) {
  const opts = options || {};
  const parserPath = opts.parserPath || DEFAULT_PARSER;
  const code = fs.readFileSync(parserPath, "utf8");
  let settled = false;
  let result;

  const sandbox = {
    $resource: {
      content: content == null ? "" : String(content),
      link: opts.link || "https://example.test/nexitally-full.conf",
      tag: opts.tag || "Nexitally",
      info: opts.info || "",
      user_agent: opts.userAgent || "",
    },
    $notify: function () {},
    $done: function (value) {
      if (settled) {
        throw new Error("$done was called more than once");
      }
      settled = true;
      result = value;
    },
  };

  vm.runInNewContext(code, sandbox, {
    filename: path.basename(parserPath),
    timeout: opts.timeoutMs || 2000,
  });

  if (!settled) {
    throw new Error("parser did not call $done");
  }

  return result;
}

function runParserFile(filePath, options) {
  return runParser(fs.readFileSync(filePath, "utf8"), options);
}

module.exports = {
  DEFAULT_PARSER,
  runParser,
  runParserFile,
};
