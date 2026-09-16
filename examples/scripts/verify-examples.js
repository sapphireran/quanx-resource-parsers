#!/usr/bin/env node
"use strict";

const { loadAllCases } = require("./lib/cases");
const { runParser, compareParserResult } = require("./lib/run-parser");

function main() {
  const cases = loadAllCases();
  let failed = 0;

  console.log("Verifying " + cases.length + " Nexitally example cases.\n");

  cases.forEach(function (example) {
    let comparison;
    try {
      const ran = runParser(example.input);
      comparison = compareParserResult(ran, example.expected);
    } catch (error) {
      comparison = { ok: false, message: error.message };
    }

    if (comparison.ok) {
      const kind = example.expected.error != null ? "error" : "servers";
      console.log("ok   " + example.name + " (" + kind + ")");
    } else {
      failed += 1;
      console.log("FAIL " + example.name);
      console.log(comparison.message.replace(/^/gm, "     "));
    }
  });

  console.log("");
  if (failed) {
    console.log(failed + " of " + cases.length + " example(s) failed.");
    process.exit(1);
  }

  console.log("All " + cases.length + " examples matched.");
}

main();
