#!/usr/bin/env node
"use strict";

const harness = require("./harness");

function listFixtures() {
  harness.discoverFixtures().forEach(function (fixture) {
    console.log(fixture.kind + "\t" + fixture.name);
  });
}

function dumpFile(filePath) {
  const fs = require("fs");
  const result = harness.parseResource(fs.readFileSync(filePath).toString("utf8"));
  if (result && result.error) {
    console.error("error: " + result.error);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(result.content + "\n");
}

function runAll() {
  const started = Date.now();
  const results = [];

  harness.parserSourceGuards().forEach(function (guard) {
    results.push({ name: guard.message, ok: guard.ok, message: guard.ok ? "" : guard.message });
    const mark = guard.ok ? "ok" : "FAIL";
    console.log(mark + "  " + guard.message);
  });

  harness.discoverFixtures().forEach(function (fixture) {
    const result = harness.runFixture(fixture);
    results.push({ name: fixture.name, ok: result.ok, message: result.message || "" });
    if (result.ok) {
      const extra = result.actual && result.actual.content
        ? " (" + result.actual.content.split("\n").length + " servers)"
        : " (error path)";
      console.log("ok  " + fixture.name + extra);
    } else {
      console.log("FAIL  " + fixture.name);
      console.log(result.message);
    }
  });

  const failed = results.filter(function (row) { return !row.ok; });
  const elapsed = Date.now() - started;
  console.log("");
  console.log(
    results.length - failed.length + " passed, " +
      failed.length + " failed, " +
      results.length + " total (" + elapsed + " ms)"
  );

  if (failed.length) {
    process.exitCode = 1;
  }
}

const args = process.argv.slice(2);
if (args[0] === "--list") {
  listFixtures();
} else if (args[0] === "--dump") {
  if (!args[1]) {
    console.error("usage: node tests/run.js --dump <file.conf>");
    process.exit(2);
  }
  dumpFile(args[1]);
} else if (args.length) {
  console.error("usage: node tests/run.js [--list | --dump <file.conf>]");
  process.exit(2);
} else {
  runAll();
}
