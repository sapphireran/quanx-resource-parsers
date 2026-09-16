"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PARSER_FILE = path.resolve(__dirname, "..", "..", "nexitally-node-parser.js");

/**
 * Evaluate the Quantumult X parser against an in-memory resource body.
 *
 * @param {string} content
 * @param {{ link?: string, info?: string, tag?: string, user_agent?: string, parserFile?: string }} [extras]
 * @returns {{ content?: string, error?: string, retry?: object }}
 */
function runParser(content, extras) {
  extras = extras || {};
  const parserFile = extras.parserFile || PARSER_FILE;
  const source = fs.readFileSync(parserFile, "utf8");

  let result;
  let doneCount = 0;

  const sandbox = {
    $resource: {
      content: content == null ? "" : String(content),
      link: extras.link == null ? "" : String(extras.link),
      info: extras.info == null ? "" : String(extras.info),
      tag: extras.tag == null ? "" : String(extras.tag),
      user_agent: extras.user_agent == null ? "" : String(extras.user_agent),
    },
    $done: function $done(value) {
      doneCount += 1;
      result = value;
    },
    $notify: function $notify() {},
    console: console,
  };

  vm.runInNewContext(source, sandbox, {
    filename: path.basename(parserFile),
    timeout: 2000,
  });

  if (doneCount === 0) {
    throw new Error("Parser did not call $done()");
  }
  if (doneCount > 1) {
    throw new Error("Parser called $done() " + doneCount + " times");
  }
  if (result == null || typeof result !== "object") {
    throw new Error("Parser $done() value must be an object");
  }
  return result;
}

/**
 * Apply a documented input transform used by example fixtures.
 *
 * Fixtures stay LF-normalized in git. The harness can reintroduce a BOM
 * and/or CRLF so the parser's first two normalization steps are exercised.
 *
 * @param {string} text
 * @param {string} transform  "none" | "bom" | "crlf" | "bom-crlf"
 * @returns {string}
 */
function applyTransform(text, transform) {
  if (!transform || transform === "none") {
    return text;
  }

  var body = String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

  if (transform === "crlf" || transform === "bom-crlf") {
    body = body.replace(/\n/g, "\r\n");
  } else if (transform !== "bom") {
    throw new Error("Unknown transform: " + transform);
  }

  if (transform === "bom" || transform === "bom-crlf") {
    body = "\uFEFF" + body;
  }

  return body;
}

module.exports = {
  PARSER_FILE: PARSER_FILE,
  runParser: runParser,
  applyTransform: applyTransform,
};
