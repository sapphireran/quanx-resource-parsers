#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var harness = require("./lib/qx-harness");
var tracer = require("./lib/nexitally-trace");

var ROOT = path.resolve(__dirname, "..");
var CASES_DIR = path.join(ROOT, "examples", "atlas", "cases");
var CATALOG_PATH = path.join(ROOT, "examples", "atlas", "catalog.json");

function usage() {
  console.log("Usage:");
  console.log("  node scripts/atlas.js verify              Replay every atlas case");
  console.log("  node scripts/atlas.js run <file>          Print the parser $done payload");
  console.log("  node scripts/atlas.js trace <file>        Print keep/drop reason codes");
  console.log("  node scripts/atlas.js gallery             Print a markdown table of cases");
}

function readUtf8(file) {
  return fs.readFileSync(file, "utf8");
}

function stripTrailingNewlines(text) {
  return String(text).replace(/(?:\r?\n)+$/, "");
}

function doneKey(payload) {
  if (payload && Object.prototype.hasOwnProperty.call(payload, "error")) {
    return { kind: "error", value: String(payload.error) };
  }
  if (payload && Object.prototype.hasOwnProperty.call(payload, "content")) {
    return { kind: "content", value: String(payload.content) };
  }
  return { kind: "unknown", value: JSON.stringify(payload) };
}

function loadCatalog() {
  return JSON.parse(readUtf8(CATALOG_PATH));
}

function listCaseDirs() {
  return fs.readdirSync(CASES_DIR).filter(function (name) {
    return fs.statSync(path.join(CASES_DIR, name)).isDirectory();
  }).sort();
}

function loadCase(id) {
  var dir = path.join(CASES_DIR, id);
  var inputPath = path.join(dir, "input.conf");
  var expectedContent = path.join(dir, "expected.txt");
  var expectedError = path.join(dir, "expected-error.txt");
  var notesPath = path.join(dir, "notes.md");

  if (!fs.existsSync(inputPath)) {
    throw new Error(id + ": missing input.conf");
  }

  var hasContent = fs.existsSync(expectedContent);
  var hasError = fs.existsSync(expectedError);
  if (hasContent === hasError) {
    throw new Error(id + ": need exactly one of expected.txt or expected-error.txt");
  }

  return {
    id: id,
    dir: dir,
    input: readUtf8(inputPath),
    notes: fs.existsSync(notesPath) ? readUtf8(notesPath).trim() : "",
    expected: hasError
      ? { kind: "error", value: stripTrailingNewlines(readUtf8(expectedError)) }
      : { kind: "content", value: stripTrailingNewlines(readUtf8(expectedContent)) }
  };
}

function sameDone(a, b) {
  return a.kind === b.kind && a.value === b.value;
}

function formatDone(done) {
  if (done.kind === "error") {
    return "error: " + done.value;
  }
  if (done.kind === "content") {
    var lines = done.value ? done.value.split("\n").length : 0;
    return "content: " + lines + " server line(s)";
  }
  return done.kind + ": " + done.value;
}

function verify() {
  var catalog = loadCatalog();
  var catalogIds = catalog.cases.map(function (item) { return item.id; });
  var dirIds = listCaseDirs();
  var failures = [];
  var seen = {};

  catalogIds.forEach(function (id) {
    if (seen[id]) {
      failures.push("catalog lists " + id + " more than once");
    }
    seen[id] = true;
    if (dirIds.indexOf(id) === -1) {
      failures.push("catalog lists " + id + " but examples/atlas/cases/" + id + " is missing");
    }
  });

  dirIds.forEach(function (id) {
    if (!seen[id]) {
      failures.push("examples/atlas/cases/" + id + " exists but is not in catalog.json");
    }
  });

  catalog.cases.forEach(function (meta) {
    var fixture;
    try {
      fixture = loadCase(meta.id);
    } catch (err) {
      failures.push(String(err.message || err));
      return;
    }

    if (meta.outcome !== fixture.expected.kind) {
      failures.push(meta.id + ": catalog outcome " + meta.outcome + " != fixture " + fixture.expected.kind);
    }

    var parsed = doneKey(harness.parseResource(fixture.input));
    var traced = doneKey(tracer.toDone(tracer.trace(fixture.input)));

    if (!sameDone(parsed, traced)) {
      failures.push(
        meta.id + ": real parser and tracer disagree\n    parser: " +
        formatDone(parsed) + "\n    tracer: " + formatDone(traced)
      );
    }

    if (!sameDone(parsed, fixture.expected)) {
      failures.push(
        meta.id + ": parser output != expected\n    parser:   " +
        formatDone(parsed) + "\n    expected: " + formatDone(fixture.expected)
      );
      if (parsed.kind === fixture.expected.kind && parsed.kind === "content") {
        failures.push("    --- expected ---\n" + fixture.expected.value + "\n    --- parser ---\n" + parsed.value);
      } else if (parsed.kind === fixture.expected.kind && parsed.kind === "error") {
        failures.push("    expected error: " + fixture.expected.value);
        failures.push("    parser error:   " + parsed.value);
      }
    }
  });

  if (failures.length) {
    console.error("Atlas verify failed:\n");
    failures.forEach(function (line) {
      console.error("  - " + line);
    });
    process.exit(1);
  }

  console.log("Atlas verify: " + catalog.cases.length + "/" + catalog.cases.length + " cases passed");
  console.log("Parser file:  " + path.relative(ROOT, harness.PARSER_PATH));
  console.log("Checked:      real nexitally-node-parser.js === tracer === expected fixtures");
}

function runFile(file) {
  var raw = readUtf8(file);
  var parsed = harness.parseResource(raw);
  var traced = tracer.toDone(tracer.trace(raw));
  console.log(JSON.stringify({ parser: parsed, tracer: traced }, null, 2));
  if (!sameDone(doneKey(parsed), doneKey(traced))) {
    console.error("parser and tracer disagree");
    process.exit(1);
  }
}

function traceFile(file) {
  var raw = readUtf8(file);
  var traced = tracer.trace(raw);
  var parsed = harness.parseResource(raw);

  if (!sameDone(doneKey(parsed), doneKey(tracer.toDone(traced)))) {
    console.error("parser and tracer disagree");
    process.exit(1);
  }

  if (!traced.sectionFound) {
    console.log("section: not found");
    console.log("error:   " + traced.error);
    return;
  }

  console.log("section: found");
  console.log("kept:    " + traced.servers.length);
  traced.traces.forEach(function (rec) {
    var preview = rec.line || "(blank)";
    if (preview.length > 92) {
      preview = preview.slice(0, 89) + "...";
    }
    console.log(
      String(rec.index).padStart(3, " ") +
      "  " +
      rec.decision.toUpperCase().padEnd(4, " ") +
      "  " +
      rec.reason.padEnd(20, " ") +
      "  " +
      preview
    );
  });

  if (!traced.ok) {
    console.log("error:   " + traced.error);
  }
}

function gallery() {
  var catalog = loadCatalog();
  console.log("| Case | Outcome | Summary |");
  console.log("| --- | --- | --- |");
  catalog.cases.forEach(function (item) {
    console.log("| `" + item.id + "` | " + item.outcome + " | " + item.summary + " |");
  });
}

var command = process.argv[2] || "verify";
var target = process.argv[3];

if (command === "verify") {
  verify();
} else if (command === "run") {
  if (!target) {
    usage();
    process.exit(2);
  }
  runFile(target);
} else if (command === "trace") {
  if (!target) {
    usage();
    process.exit(2);
  }
  traceFile(target);
} else if (command === "gallery") {
  gallery();
} else if (command === "-h" || command === "--help") {
  usage();
} else {
  usage();
  process.exit(2);
}
