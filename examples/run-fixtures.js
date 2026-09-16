#!/usr/bin/env node
/**
 * Local harness for nexitally-node-parser.js.
 *
 * Quantumult X injects $resource and $done. This script does the same in a
 * Node vm sandbox so the committed fixtures can be checked without the app
 * and without downloading a subscription.
 *
 * Usage (from the repository root):
 *   node examples/run-fixtures.js
 */

"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var here = __dirname;
var manifestPath = path.join(here, "manifest.json");
var manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
var parserPath = path.resolve(here, manifest.parser);
var parserSource = fs.readFileSync(parserPath, "utf8");

function normalizeExpected(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/, "");
}

function runParser(content, extra) {
  extra = extra || {};
  var result = { called: false, value: null };

  var sandbox = {
    $resource: {
      content: content,
      link: extra.link || "https://example.invalid/nexitally-full.conf",
      tag: extra.tag || "Nexitally",
      info: extra.info || "",
      user_agent: extra.user_agent || ""
    },
    $done: function (value) {
      result.called = true;
      result.value = value;
    },
    $notify: function () {}
  };

  try {
    vm.runInNewContext(parserSource, sandbox, {
      filename: path.basename(parserPath),
      timeout: 2000
    });
  } catch (err) {
    return { thrown: err };
  }

  if (!result.called) {
    return { thrown: new Error("$done was not called") };
  }
  return { value: result.value };
}

function formatBlock(label, text) {
  var body = text === undefined || text === null ? "<empty>" : String(text);
  return label + ":\n" + body.split("\n").map(function (line) {
    return "    " + line;
  }).join("\n");
}

function runCase(entry) {
  var inputPath = path.join(here, entry.input);
  var raw = fs.readFileSync(inputPath);
  var content = raw.toString("utf8");
  var parsed = runParser(content);

  if (parsed.thrown) {
    return {
      id: entry.id,
      ok: false,
      detail: parsed.thrown.stack || String(parsed.thrown)
    };
  }

  var value = parsed.value || {};

  if (entry.kind === "error") {
    if (value.content !== undefined) {
      return {
        id: entry.id,
        ok: false,
        detail: "expected error, parser returned content\n" +
          formatBlock("content", value.content)
      };
    }
    if (value.error !== entry.expectedError) {
      return {
        id: entry.id,
        ok: false,
        detail: "error string mismatch\n" +
          formatBlock("expected", entry.expectedError) + "\n" +
          formatBlock("actual", value.error)
      };
    }
    return { id: entry.id, ok: true, detail: value.error };
  }

  if (entry.kind === "content") {
    if (value.error) {
      return {
        id: entry.id,
        ok: false,
        detail: "expected content, parser returned error\n" +
          formatBlock("error", value.error)
      };
    }
    var expected = normalizeExpected(
      fs.readFileSync(path.join(here, entry.expected), "utf8")
    );
    var actual = normalizeExpected(value.content);
    if (actual !== expected) {
      return {
        id: entry.id,
        ok: false,
        detail: "content mismatch\n" +
          formatBlock("expected", expected) + "\n" +
          formatBlock("actual", actual)
      };
    }
    var lines = actual ? actual.split("\n").length : 0;
    return { id: entry.id, ok: true, detail: lines + " server line(s)" };
  }

  return {
    id: entry.id,
    ok: false,
    detail: "unknown kind: " + entry.kind
  };
}

function main() {
  if (!fs.existsSync(parserPath)) {
    console.error("parser not found: " + parserPath);
    process.exit(2);
  }

  var failed = 0;
  manifest.cases.forEach(function (entry) {
    var result = runCase(entry);
    var mark = result.ok ? "ok" : "FAIL";
    console.log("[" + mark + "] " + result.id + " — " + result.detail.split("\n")[0]);
    if (!result.ok) {
      failed += 1;
      console.log(result.detail.replace(/^/gm, "      "));
    }
  });

  var total = manifest.cases.length;
  var passed = total - failed;
  console.log("");
  console.log(passed + " passed, " + failed + " failed, " + total + " total");
  process.exit(failed ? 1 : 0);
}

main();
