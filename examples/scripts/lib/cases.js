"use strict";

const fs = require("fs");
const path = require("path");

const CASES_ROOT = path.resolve(__dirname, "../../nexitally/cases");

function listCaseNames() {
  return fs
    .readdirSync(CASES_ROOT, { withFileTypes: true })
    .filter(function (entry) {
      return entry.isDirectory();
    })
    .map(function (entry) {
      return entry.name;
    })
    .sort();
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
}

function loadCase(name) {
  const dir = path.join(CASES_ROOT, name);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error("Unknown example case: " + name);
  }

  const inputPath = path.join(dir, "input.conf");
  if (!fs.existsSync(inputPath)) {
    throw new Error("Case " + name + " is missing input.conf");
  }

  const expectedContent = readIfExists(path.join(dir, "expected.txt"));
  const expectedError = readIfExists(path.join(dir, "expected-error.txt"));
  if (expectedContent == null && expectedError == null) {
    throw new Error("Case " + name + " needs expected.txt or expected-error.txt");
  }
  if (expectedContent != null && expectedError != null) {
    throw new Error("Case " + name + " has both expected.txt and expected-error.txt");
  }

  return {
    name: name,
    dir: dir,
    inputPath: inputPath,
    notes: readIfExists(path.join(dir, "notes.md")),
    input: fs.readFileSync(inputPath, "utf8"),
    expected: {
      content: expectedContent,
      error: expectedError
    }
  };
}

function loadAllCases() {
  return listCaseNames().map(loadCase);
}

module.exports = {
  CASES_ROOT,
  listCaseNames,
  loadCase,
  loadAllCases
};
