#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PARSER_PATH = path.join(ROOT, "nexitally-node-parser.js");
const CATALOG_PATH = path.join(ROOT, "examples", "catalog.json");
const FIXTURES_DIR = path.join(ROOT, "examples", "fixtures");

const ERROR_NO_SECTION = "Nexitally parser: [server_local] section was not found.";
const ERROR_NO_SERVERS = "Nexitally parser: no usable server entries were found.";

function readParserSource() {
  return fs.readFileSync(PARSER_PATH, "utf8");
}

function extractRegexLiteral(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error("Cannot extract " + label + " from nexitally-node-parser.js");
  }
  try {
    const value = vm.runInNewContext(match[1]);
    if (!value || typeof value.source !== "string") {
      throw new Error("extracted value is not a RegExp");
    }
    return new RegExp(value.source, value.flags);
  } catch (err) {
    throw new Error("Cannot evaluate " + label + ": " + err.message);
  }
}

function loadRulesFromParser(source) {
  return {
    section: extractRegexLiteral(
      source,
      /text\.match\((\/(?:\\.|[^/])+\/[a-z]*)\)/,
      "section"
    ),
    supported: extractRegexLiteral(
      source,
      /var supported = (\/(?:\\.|[^/])+\/[a-z]*)/,
      "supported"
    ),
    excluded: extractRegexLiteral(
      source,
      /var excluded = (\/(?:\\.|[^/])+\/[a-z]*)/,
      "excluded"
    ),
    comment: extractRegexLiteral(
      source,
      /if \(!line \|\| (\/(?:\\.|[^/])+\/[a-z]*)\.test\(line\)\)/,
      "comment"
    ),
  };
}

function encodeResource(raw, encode) {
  const flags = encode || {};
  let text = String(raw);
  if (flags.stripTrailingNewline) {
    text = text.replace(/[\r\n]+$/g, "");
  }
  if (flags.newlines === "crlf") {
    text = text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
  } else if (flags.newlines === "cr") {
    text = text.replace(/\r\n/g, "\n").replace(/\n/g, "\r");
  }
  if (flags.bom) {
    text = "\uFEFF" + text;
  }
  return text;
}

function runParser(content, extraResource) {
  const source = readParserSource();
  let result;
  const sandbox = {
    $resource: Object.assign(
      {
        content: String(content),
        link: "",
        info: "",
        tag: "",
        user_agent: "",
      },
      extraResource || {}
    ),
    $done: function (value) {
      if (result !== undefined) {
        throw new Error("$done called more than once");
      }
      result = value;
    },
    $notify: function () {},
    console: console,
  };
  vm.runInNewContext(source, sandbox, { filename: "nexitally-node-parser.js" });
  if (result === undefined) {
    throw new Error("$done was not called");
  }
  return result;
}

function annotate(rawContent) {
  const rules = loadRulesFromParser(readParserSource());
  const steps = [];
  let text = String(rawContent || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  steps.push({
    step: "normalize",
    bomStripped: String(rawContent || "").charCodeAt(0) === 0xfeff,
    crlfFolded: /\r\n/.test(String(rawContent || "")),
    loneCrRemaining: /\r/.test(text),
  });

  const match = text.match(rules.section);
  if (!match) {
    return {
      error: ERROR_NO_SECTION,
      keeps: [],
      rows: [],
      steps: steps.concat([{ step: "section", found: false }]),
    };
  }

  const rows = [];
  const seen = {};
  const keeps = [];
  match[1].split("\n").forEach(function (rawLine, index) {
    const line = rawLine.trim();
    const row = { index: index + 1, raw: rawLine, line: line, decision: "drop", reason: "" };
    if (!line) {
      row.reason = "empty";
    } else if (rules.comment.test(line)) {
      row.reason = "comment";
    } else if (!rules.supported.test(line)) {
      row.reason = "unsupported-prefix";
    } else if (rules.excluded.test(line)) {
      row.reason = "info-or-premium";
    } else if (seen[line]) {
      row.reason = "duplicate";
    } else {
      seen[line] = true;
      row.decision = "keep";
      row.reason = "server";
      keeps.push(line);
    }
    rows.push(row);
  });

  if (!keeps.length) {
    return {
      error: ERROR_NO_SERVERS,
      keeps: [],
      rows: rows,
      steps: steps.concat([{ step: "section", found: true, capturedLines: rows.length }]),
    };
  }

  return {
    content: keeps.join("\n"),
    keeps: keeps,
    rows: rows,
    steps: steps.concat([{ step: "section", found: true, capturedLines: rows.length, kept: keeps.length }]),
  };
}

function formatAnnotation(annotation) {
  const lines = [];
  if (annotation.error) {
    lines.push("error: " + annotation.error);
  } else {
    lines.push("keeps: " + annotation.keeps.length);
  }
  annotation.rows.forEach(function (row) {
    const preview = row.line ? row.line.slice(0, 88) : "(blank)";
    lines.push(
      String(row.index).padStart(3, " ") +
        "  " +
        row.decision.toUpperCase().padEnd(4, " ") +
        "  " +
        row.reason.padEnd(20, " ") +
        "  " +
        preview
    );
  });
  return lines.join("\n");
}

function loadCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
}

function fixtureDir(id) {
  return path.join(FIXTURES_DIR, id);
}

function loadFixtureInput(entry) {
  const inputPath = path.join(fixtureDir(entry.id), "input.conf");
  const raw = fs.readFileSync(inputPath);
  // Preserve BOM if the file already has one; encodeResource may add another.
  const text = raw.toString("utf8");
  return encodeResource(text, entry.encode);
}

function expectedPath(entry) {
  const dir = fixtureDir(entry.id);
  if (entry.expect === "error") {
    return path.join(dir, "expected-error.txt");
  }
  return path.join(dir, "expected.txt");
}

function loadExpected(entry) {
  return fs.readFileSync(expectedPath(entry), "utf8").replace(/(?:\r\n|\n|\r)$/, "");
}

function replayFixture(entry) {
  const content = loadFixtureInput(entry);
  const result = runParser(content);
  const annotation = annotate(content);
  return { entry: entry, content: content, result: result, annotation: annotation };
}

function catalogReport(entries) {
  const lines = ["# Fixture report", "", "Generated by `node scripts/replay.js --catalog --report`.", ""];
  lines.push("| id | expect | result | keeps |");
  lines.push("| --- | --- | --- | ---: |");
  entries.forEach(function (entry) {
    const replayed = replayFixture(entry);
    const ok = replayed.result.error
      ? "error"
      : "content (" + (replayed.result.content ? replayed.result.content.split("\n").length : 0) + ")";
    const keeps = replayed.annotation.keeps ? replayed.annotation.keeps.length : 0;
    lines.push(
      "| `" +
        entry.id +
        "` | " +
        entry.expect +
        " | " +
        ok +
        " | " +
        keeps +
        " |"
    );
  });
  lines.push("");
  return lines.join("\n");
}

function printUsage() {
  const msg = [
    "Usage:",
    "  node scripts/replay.js <file.conf> [--annotate]",
    "  node scripts/replay.js --catalog [--report]",
    "  node scripts/replay.js --fixture <id> [--annotate]",
    "",
    "Never pass a live Nexitally URL. This tool only reads local files.",
  ].join("\n");
  console.error(msg);
}

function main(argv) {
  const args = argv.slice(2);
  if (!args.length || args[0] === "-h" || args[0] === "--help") {
    printUsage();
    process.exit(args.length ? 0 : 2);
  }

  if (args[0] === "--catalog") {
    const catalog = loadCatalog();
    if (args.indexOf("--report") !== -1) {
      process.stdout.write(catalogReport(catalog.fixtures));
      return;
    }
    catalog.fixtures.forEach(function (entry) {
      const replayed = replayFixture(entry);
      const status = replayed.result.error ? "ERROR" : "CONTENT";
      console.log(entry.id + "\t" + status);
    });
    return;
  }

  let filePath;
  let annotateFlag = args.indexOf("--annotate") !== -1;
  if (args[0] === "--fixture") {
    if (!args[1]) {
      printUsage();
      process.exit(2);
    }
    const catalog = loadCatalog();
    const entry = catalog.fixtures.filter(function (item) { return item.id === args[1]; })[0];
    if (!entry) {
      throw new Error("Unknown fixture id: " + args[1]);
    }
    const replayed = replayFixture(entry);
    if (annotateFlag) {
      console.log(formatAnnotation(replayed.annotation));
      console.log("");
    }
    if (replayed.result.error) {
      console.error(replayed.result.error);
      process.exit(1);
    }
    process.stdout.write(replayed.result.content + "\n");
    return;
  }

  filePath = args[0];
  const raw = fs.readFileSync(filePath);
  const body = raw.toString("utf8");
  const result = runParser(body);
  if (annotateFlag) {
    console.log(formatAnnotation(annotate(body)));
    console.log("");
  }
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  process.stdout.write(result.content + "\n");
}

module.exports = {
  ROOT: ROOT,
  ERROR_NO_SECTION: ERROR_NO_SECTION,
  ERROR_NO_SERVERS: ERROR_NO_SERVERS,
  encodeResource: encodeResource,
  runParser: runParser,
  annotate: annotate,
  formatAnnotation: formatAnnotation,
  loadCatalog: loadCatalog,
  loadFixtureInput: loadFixtureInput,
  loadExpected: loadExpected,
  expectedPath: expectedPath,
  replayFixture: replayFixture,
  loadRulesFromParser: loadRulesFromParser,
  readParserSource: readParserSource,
};

if (require.main === module) {
  try {
    main(process.argv);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
