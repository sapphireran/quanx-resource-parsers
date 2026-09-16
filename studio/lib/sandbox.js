"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_PARSER = path.resolve(__dirname, "..", "..", "nexitally-node-parser.js");

function runParser(content, options) {
  const opts = options || {};
  const parserPath = path.resolve(opts.parserPath || DEFAULT_PARSER);
  const source = fs.readFileSync(parserPath, "utf8");
  const calls = [];

  const $resource = {
    content: content,
    get link() {
      throw new Error("sandbox: parser must not read $resource.link");
    },
    info: opts.info || "",
    tag: opts.tag || "Nexitally",
    user_agent: opts.userAgent || "",
  };

  function $done(result) {
    calls.push(result);
  }

  const context = vm.createContext({
    $resource,
    $done,
    String,
    console: { log() {}, warn() {}, error() {} },
  });

  vm.runInContext(source, context, { filename: path.basename(parserPath) });

  if (calls.length !== 1) {
    throw new Error("sandbox: expected exactly one $done() call, got " + calls.length);
  }

  const result = calls[0] || {};
  return {
    content: typeof result.content === "string" ? result.content : null,
    error: typeof result.error === "string" ? result.error : null,
    raw: result,
  };
}

module.exports = { runParser, DEFAULT_PARSER };
