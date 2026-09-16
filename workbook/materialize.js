#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const cases = require("./cases.cjs");

const ROOT = path.join(__dirname, "cases");

function writeInput(dir, item) {
  const file = path.join(dir, "input.conf");
  const wired = cases.wireInput(item);
  if (item.bom || item.crlf) {
    fs.writeFileSync(file, wired, "utf8");
    return;
  }
  fs.writeFileSync(file, wired, "utf8");
}

function main() {
  fs.mkdirSync(ROOT, { recursive: true });
  cases.CASES.forEach(function (item) {
    const dir = path.join(ROOT, item.id);
    fs.mkdirSync(dir, { recursive: true });
    writeInput(dir, item);
    if (item.expect === "error") {
      fs.writeFileSync(path.join(dir, "expected-error.txt"), item.expected + "\n", "utf8");
      try { fs.unlinkSync(path.join(dir, "expected.txt")); } catch (err) { /* absent is fine */ }
    } else {
      fs.writeFileSync(path.join(dir, "expected.txt"), item.expected.join("\n") + "\n", "utf8");
      try { fs.unlinkSync(path.join(dir, "expected-error.txt")); } catch (err) { /* absent is fine */ }
    }
    fs.writeFileSync(path.join(dir, "notes.md"), item.notes + "\n", "utf8");
  });
  console.log("materialized " + cases.CASES.length + " cases under workbook/cases/");
}

main();
