"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function runParser(parserRelPath, content) {
  const parserPath = path.resolve(ROOT, parserRelPath);
  const source = fs.readFileSync(parserPath, "utf8");
  const calls = [];

  const sandbox = {
    $resource: { content: content },
    $done: function (result) {
      calls.push(result);
    },
    String: String,
    console: console
  };

  try {
    vm.runInNewContext(source, sandbox, {
      filename: parserPath,
      timeout: 2000
    });
  } catch (err) {
    return { ok: false, error: "parser-threw", detail: String(err && err.message ? err.message : err), calls: calls };
  }

  if (calls.length !== 1) {
    return { ok: false, error: "done-count", detail: "expected one $done call, got " + calls.length, calls: calls };
  }

  const result = calls[0];
  if (!result || typeof result !== "object") {
    return { ok: false, error: "done-shape", detail: " $done argument must be an object", calls: calls };
  }

  const hasContent = Object.prototype.hasOwnProperty.call(result, "content");
  const hasError = Object.prototype.hasOwnProperty.call(result, "error");
  if (hasContent === hasError) {
    return { ok: false, error: "done-shape", detail: "$done must set exactly one of content or error", calls: calls };
  }

  if (hasError) {
    return { ok: true, kind: "error", error: String(result.error), calls: calls };
  }

  return { ok: true, kind: "content", content: String(result.content), calls: calls };
}

module.exports = {
  ROOT: ROOT,
  runParser: runParser
};
