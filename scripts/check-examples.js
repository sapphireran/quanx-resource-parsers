#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseNexitallyResource } = require("../nexitally-node-parser.js");
const { extractServerLocal } = require("../examples/parser-template/resource-parser-template.js");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "examples/nexitally/fixtures.json");

const PARSERS = {
  "nexitally-node-parser.js": parseNexitallyResource,
  "resource-parser-template.js": extractServerLocal
};

function normalizeBody(text) {
  return String(text)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n+$/, "");
}

function readUtf8(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function runAsQuantumultX(content) {
  const source = fs.readFileSync(
    path.join(ROOT, "nexitally-node-parser.js"),
    "utf8"
  );
  let done;
  const sandbox = {
    $resource: {
      content,
      link: "https://example.test/private-nexitally-url",
      tag: "Nexitally",
      info: "",
      user_agent: ""
    },
    $done: function $done(result) {
      done = result;
    }
  };
  vm.runInNewContext(source, sandbox, { filename: "nexitally-node-parser.js" });
  if (!done) {
    throw new Error("parser did not call $done");
  }
  return done;
}

function fail(name, message) {
  process.stderr.write(`FAIL  ${name}: ${message}\n`);
}

function pass(name) {
  process.stdout.write(`PASS  ${name}\n`);
}

function runCase(parse, testCase, labelPrefix) {
  const name = labelPrefix ? `${labelPrefix}${testCase.name}` : testCase.name;
  const result = parse(readUtf8(testCase.input));

  if (testCase.error) {
    if (!result.error) {
      fail(
        name,
        `expected error ${JSON.stringify(testCase.error)}, got content (${result.content.split("\n").length} lines)`
      );
      return false;
    }
    if (result.error !== testCase.error) {
      fail(
        name,
        `error mismatch\n  expected: ${testCase.error}\n  actual:   ${result.error}`
      );
      return false;
    }
    pass(name);
    return true;
  }

  if (result.error) {
    fail(name, `unexpected error: ${result.error}`);
    return false;
  }

  const expected = normalizeBody(readUtf8(testCase.expected));
  const actual = normalizeBody(result.content);
  if (actual !== expected) {
    fail(
      name,
      `content mismatch\n  expected:\n${expected}\n  actual:\n${actual}`
    );
    return false;
  }

  pass(name);
  return true;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const parse = PARSERS[manifest.parser];
  if (!parse) {
    throw new Error(`unexpected parser in fixtures.json: ${manifest.parser}`);
  }

  let failed = 0;
  let total = 0;

  for (const testCase of manifest.cases) {
    total += 1;
    if (!runCase(parse, testCase)) failed += 1;
  }

  const qxName = "quantumult-x-$done-runtime";
  total += 1;
  try {
    const qxResult = runAsQuantumultX(
      readUtf8("examples/nexitally/managed-full-config.conf")
    );
    const expected = normalizeBody(
      readUtf8("examples/nexitally/expected-servers.txt")
    );
    const actual = normalizeBody(qxResult.content || "");
    if (qxResult.error) {
      fail(qxName, `unexpected error: ${qxResult.error}`);
      failed += 1;
    } else if (actual !== expected) {
      fail(
        qxName,
        `content mismatch\n  expected:\n${expected}\n  actual:\n${actual}`
      );
      failed += 1;
    } else {
      pass(qxName);
    }
  } catch (err) {
    fail(qxName, err.message);
    failed += 1;
  }

  const templateCases = [
    {
      name: "managed-full-config-keeps-metadata",
      input: "examples/nexitally/managed-full-config.conf",
      expected: "examples/parser-template/expected/managed-full-config.txt"
    },
    {
      name: "mixed-protocols-same-as-nexitally",
      input: "examples/nexitally/fixtures/mixed-protocols.conf",
      expected: "examples/nexitally/expected/mixed-protocols.txt"
    }
  ];

  for (const testCase of templateCases) {
    total += 1;
    if (!runCase(extractServerLocal, testCase, "template:")) failed += 1;
  }

  process.stdout.write(
    `\n${total - failed} passed, ${failed} failed, ${total} total\n`
  );
  process.exitCode = failed ? 1 : 0;
}

main();
