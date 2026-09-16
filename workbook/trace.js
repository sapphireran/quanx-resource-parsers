#!/usr/bin/env node
"use strict";

const cases = require("./cases.cjs");
const classify = require("./classify.cjs");

function traceOne(item) {
  const wired = cases.wireInput(item);
  const sliced = classify.sliceServerLocal(wired);
  console.log("## " + item.id + " — " + item.title);
  console.log(item.summary);
  if (!sliced.found) {
    console.log("section: missing → error");
    console.log("");
    return;
  }
  console.log("section: found (" + sliced.body.split("\n").length + " raw lines)");
  classify.traceBody(sliced.body).forEach(function (row, index) {
    const mark = row.action === "keep" ? "KEEP" : "drop";
    const preview = row.line.length > 96 ? row.line.slice(0, 93) + "…" : row.line;
    console.log(String(index + 1).padStart(3, " ") + "  " + mark + "  " + row.reason.padEnd(20, " ") + "  " + preview);
  });
  console.log("");
}

function main() {
  const filter = process.argv.slice(2);
  const selected = filter.length
    ? filter.map(function (id) { return cases.getCase(id); })
    : cases.CASES;
  selected.forEach(traceOne);
}

main();
