#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseNexitallyResource } = require("../nexitally-node-parser.js");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "examples/nexitally/fixtures.json");

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

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (manifest.parser !== "nexitally-node-parser.js") {
    throw new Error(`unexpected parser in fixtures.json: ${manifest.parser}`);
  }

  let failed = 0;

  for (const testCase of manifest.cases) {
    const result = parseNexitallyResource(readUtf8(testCase.input));

    if (testCase.error) {
      if (!result.error) {
        fail(
          testCase.name,
          `expected error ${JSON.stringify(testCase.error)}, got content (${result.content.split("\n").length} lines)`
        );
        failed += 1;
        continue;
      }
      if (result.error !== testCase.error) {
        fail(
          testCase.name,
          `error mismatch\n  expected: ${testCase.error}\n  actual:   ${result.error}`
        );
        failed += 1;
        continue;
      }
      pass(testCase.name);
      continue;
    }

    if (result.error) {
      fail(testCase.name, `unexpected error: ${result.error}`);
      failed += 1;
      continue;
    }

    const expected = normalizeBody(readUtf8(testCase.expected));
    const actual = normalizeBody(result.content);
    if (actual !== expected) {
      fail(
        testCase.name,
        `content mismatch\n  expected:\n${expected}\n  actual:\n${actual}`
      );
      failed += 1;
      continue;
    }

    pass(testCase.name);
  }

  const qxName = "quantumult-x-$done-runtime";
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

  const total = manifest.cases.length + 1;
  process.stdout.write(
    `\n${total - failed} passed, ${failed} failed, ${total} total\n`
  );
  process.exitCode = failed ? 1 : 0;
}

main();
