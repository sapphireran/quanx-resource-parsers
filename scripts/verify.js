#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const replay = require("./replay");

function fail(id, message) {
  return { id: id, ok: false, message: message };
}

function pass(id) {
  return { id: id, ok: true };
}

function normalize(text) {
  return String(text == null ? "" : text).replace(/(?:\r\n|\n|\r)$/, "");
}

var PRIVACY_PATTERNS = [
  /nexitally\.(com|net|app|io)\b/i,
  /[?&](token|auth|key|uid)=[A-Za-z0-9._~%-]{8,}/i,
  /https?:\/\/[^\s,]+\/(sub|subscribe|s\/)[^\s,]*/i,
];

function checkPrivacy(entry, body) {
  for (var i = 0; i < PRIVACY_PATTERNS.length; i++) {
    if (PRIVACY_PATTERNS[i].test(body)) {
      return fail(entry.id, "privacy guard hit " + PRIVACY_PATTERNS[i]);
    }
  }
  if (body.indexOf("<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>") === -1 && /nexitally/i.test(body) && /https?:\/\//i.test(body)) {
    return fail(entry.id, "possible live Nexitally URL (use the placeholder)");
  }
  return null;
}

function checkFixture(entry) {
  const dir = path.join(replay.ROOT, "examples", "fixtures", entry.id);
  const inputPath = path.join(dir, "input.conf");
  if (!fs.existsSync(inputPath)) {
    return fail(entry.id, "missing input.conf");
  }

  const expectedFile = replay.expectedPath(entry);
  if (!fs.existsSync(expectedFile)) {
    return fail(entry.id, "missing " + path.basename(expectedFile));
  }

  const privacy = checkPrivacy(entry, fs.readFileSync(inputPath, "utf8"));
  if (privacy) {
    return privacy;
  }

  let replayed;
  try {
    replayed = replay.replayFixture(entry);
  } catch (err) {
    return fail(entry.id, "replay threw: " + err.message);
  }

  const expected = replay.loadExpected(entry);
  const result = replayed.result;
  const annotation = replayed.annotation;

  if (entry.expect === "error") {
    if (!result.error) {
      return fail(entry.id, "expected error, got content:\n" + String(result.content || ""));
    }
    if (normalize(result.error) !== expected) {
      return fail(
        entry.id,
        "error mismatch\n  expected: " + expected + "\n  actual:   " + result.error
      );
    }
    if (!annotation.error) {
      return fail(entry.id, "annotator did not produce an error (parser source regex drift?)");
    }
    if (annotation.error !== result.error) {
      return fail(
        entry.id,
        "annotator error differs from parser\n  parser:     " +
          result.error +
          "\n  annotator:  " +
          annotation.error
      );
    }
    return pass(entry.id);
  }

  if (result.error) {
    return fail(entry.id, "expected content, got error: " + result.error);
  }
  if (normalize(result.content) !== expected) {
    return fail(
      entry.id,
      "content mismatch\n  expected:\n" +
        expected +
        "\n  actual:\n" +
        String(result.content || "")
    );
  }
  if (annotation.error) {
    return fail(entry.id, "annotator errored on a content fixture: " + annotation.error);
  }
  if (normalize(annotation.content) !== normalize(result.content)) {
    return fail(entry.id, "annotator keeps differ from parser content (regex extractor drift)");
  }
  return pass(entry.id);
}

function main() {
  replay.loadRulesFromParser(replay.readParserSource());

  const catalog = replay.loadCatalog();
  const results = catalog.fixtures.map(checkFixture);
  const failed = results.filter(function (item) { return !item.ok; });

  results.forEach(function (item) {
    console.log((item.ok ? "ok   " : "FAIL ") + item.id);
    if (!item.ok) {
      console.log(item.message.replace(/^/gm, "     "));
    }
  });

  console.log("");
  console.log(results.length - failed.length + "/" + results.length + " fixtures passed");
  if (failed.length) {
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  console.error(err.stack || err.message || err);
  process.exit(1);
}
