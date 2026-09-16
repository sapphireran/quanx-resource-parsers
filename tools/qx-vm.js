"use strict";

/**
 * Run a Quantumult X resource-parser script in Node.
 *
 * The sandbox only provides $resource, $notify, and $done — the same
 * surface the official sample parser documents. Do not add Node APIs.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_PARSER = path.join(__dirname, "..", "nexitally-node-parser.js");

function loadParserSource(parserPath) {
  const resolved = path.resolve(parserPath || DEFAULT_PARSER);
  return {
    resolved,
    source: fs.readFileSync(resolved, "utf8"),
  };
}

function applyWrap(content, wrap) {
  let text = String(content == null ? "" : content);
  if (wrap && wrap.crlf) {
    text = text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
  }
  if (wrap && wrap.bom) {
    text = "\uFEFF" + text;
  }
  return text;
}

function runResourceParser(options) {
  const parserPath = options.parserPath || DEFAULT_PARSER;
  const { resolved, source } = loadParserSource(parserPath);
  const content = applyWrap(options.content, options.wrap);

  let done;
  let doneCount = 0;

  const sandbox = {
    $resource: {
      content: content,
      link: options.link || "file://examples/synthetic.conf",
      tag: options.tag || "Nexitally",
      info: options.info || "",
      user_agent: options.userAgent || "",
    },
    $notify: function () {},
    $done: function (payload) {
      doneCount += 1;
      done = payload;
    },
  };

  vm.runInNewContext(source, sandbox, {
    filename: resolved,
    timeout: 2000,
  });

  if (doneCount === 0) {
    throw new Error("$done was not called");
  }
  if (doneCount > 1) {
    throw new Error("$done was called " + doneCount + " times");
  }
  if (!done || typeof done !== "object") {
    throw new Error("$done payload must be an object");
  }

  const hasContent = Object.prototype.hasOwnProperty.call(done, "content");
  const hasError = Object.prototype.hasOwnProperty.call(done, "error");
  if (hasContent && hasError) {
    throw new Error("$done payload has both content and error");
  }
  if (!hasContent && !hasError) {
    throw new Error("$done payload needs content or error");
  }

  return {
    parserPath: resolved,
    payload: done,
    kind: hasError ? "error" : "content",
    content: hasContent ? String(done.content) : null,
    error: hasError ? String(done.error) : null,
  };
}

module.exports = {
  DEFAULT_PARSER,
  applyWrap,
  loadParserSource,
  runResourceParser,
};
