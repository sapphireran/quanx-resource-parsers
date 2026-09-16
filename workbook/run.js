#!/usr/bin/env node
"use strict";

const cases = require("./cases.cjs");
const sandbox = require("./sandbox.cjs");

function expectedText(item) {
  if (item.expect === "error") return String(item.expected);
  return item.expected.join("\n");
}

function runOne(item) {
  const parser = item.parser || "nexitally-node-parser.js";
  const result = sandbox.runParser(parser, cases.wireInput(item));
  if (!result.ok) {
    return {
      id: item.id,
      ok: false,
      message: result.error + ": " + result.detail
    };
  }

  if (item.expect === "error") {
    if (result.kind !== "error") {
      return {
        id: item.id,
        ok: false,
        message: "expected error, got content (" + result.content.split("\n").length + " lines)"
      };
    }
    if (result.error !== expectedText(item)) {
      return {
        id: item.id,
        ok: false,
        message: "error mismatch\n  expected: " + expectedText(item) + "\n  actual:   " + result.error
      };
    }
    return { id: item.id, ok: true, kind: "error", error: result.error };
  }

  if (result.kind !== "content") {
    return {
      id: item.id,
      ok: false,
      message: "expected content, got error: " + result.error
    };
  }
  if (result.content !== expectedText(item)) {
    return {
      id: item.id,
      ok: false,
      message: "content mismatch\n--- expected ---\n" + expectedText(item) + "\n--- actual ---\n" + result.content
    };
  }
  return {
    id: item.id,
    ok: true,
    kind: "content",
    lines: result.content === "" ? 0 : result.content.split("\n").length
  };
}

function main() {
  const filter = process.argv.slice(2).filter(function (arg) {
    return arg !== "--update";
  });
  const selected = filter.length
    ? filter.map(function (id) { return cases.getCase(id); })
    : cases.CASES;

  let failed = 0;
  selected.forEach(function (item) {
    const outcome = runOne(item);
    if (outcome.ok) {
      const extra = outcome.kind === "error" ? outcome.error : outcome.lines + " server(s)";
      console.log("PASS  " + item.id + "  " + extra);
    } else {
      failed += 1;
      console.log("FAIL  " + item.id);
      console.log(outcome.message);
    }
  });

  const passed = selected.length - failed;
  console.log("");
  console.log(passed + " passed, " + failed + " failed, " + selected.length + " total");
  process.exit(failed ? 1 : 0);
}

main();
