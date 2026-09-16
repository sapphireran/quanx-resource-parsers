"use strict";

const fs = require("fs");
const path = require("path");

const FIXTURES_DIR = path.resolve(__dirname, "..", "fixtures");

function loadCatalog() {
  const catalogPath = path.join(FIXTURES_DIR, "catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  return catalog.cases.map(function (entry) {
    const dir = path.join(FIXTURES_DIR, entry.id);
    const files = {
      input: path.join(dir, "input.conf"),
      expected: path.join(dir, "expected.txt"),
      expectedError: path.join(dir, "expected-error.txt"),
      expectedTrace: path.join(dir, "expected-trace.json"),
      notes: path.join(dir, "notes.md"),
    };
    return Object.assign({}, entry, { dir, files });
  });
}

function readInput(entry) {
  return fs.readFileSync(entry.files.input);
}

function readExpected(entry) {
  if (fs.existsSync(entry.files.expectedError)) {
    return {
      kind: "error",
      error: fs.readFileSync(entry.files.expectedError, "utf8").replace(/\n$/, ""),
    };
  }
  if (fs.existsSync(entry.files.expected)) {
    const text = fs.readFileSync(entry.files.expected, "utf8").replace(/\n$/, "");
    return { kind: "content", content: text };
  }
  throw new Error("fixture " + entry.id + " has neither expected.txt nor expected-error.txt");
}

function readExpectedTrace(entry) {
  return JSON.parse(fs.readFileSync(entry.files.expectedTrace, "utf8"));
}

module.exports = {
  FIXTURES_DIR,
  loadCatalog,
  readInput,
  readExpected,
  readExpectedTrace,
};
