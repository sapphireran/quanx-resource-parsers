#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { runParser } = require("./lib/sandbox");
const { explain, explainOneLine, compactTrace } = require("./lib/explain");
const { loadCatalog, readInput, readExpected, readExpectedTrace } = require("./lib/catalog");
const { scanRepo } = require("./lib/secrets");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(__dirname, "report");

function usage() {
  return [
    "Usage:",
    "  node studio/replay.js list",
    "  node studio/replay.js dump <id>",
    "  node studio/replay.js explain <id>",
    "  node studio/replay.js why <server-line>",
    "  node studio/replay.js check",
    "  node studio/replay.js report",
    "  node studio/replay.js scan",
    "  node studio/replay.js write-expected   # regenerate fixture expected files",
  ].join("\n");
}

function findCase(id) {
  const found = loadCatalog().filter(function (entry) { return entry.id === id; });
  if (!found.length) {
    throw new Error("unknown fixture: " + id);
  }
  return found[0];
}

function inputText(entry) {
  return readInput(entry).toString("utf8");
}

function printDump(id) {
  const entry = findCase(id);
  const parsed = runParser(inputText(entry));
  if (parsed.error) {
    process.stdout.write(parsed.error + "\n");
    return 1;
  }
  process.stdout.write(parsed.content + "\n");
  return 0;
}

function formatTrace(result) {
  const rows = result.lines.map(function (row) {
    const preview = (row.trimmed || row.raw || "").slice(0, 88);
    return String(row.index).padStart(3, " ") + "  " + row.code.padEnd(20, " ") + "  " + preview;
  });
  const header = result.error
    ? "error: " + result.error
    : "kept " + result.kept.length + " server line(s)";
  return header + "\n" + rows.join("\n");
}

function printExplain(id) {
  const entry = findCase(id);
  const result = explain(inputText(entry));
  process.stdout.write(formatTrace(result) + "\n");
  return result.error ? 1 : 0;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareCase(entry) {
  const content = inputText(entry);
  const parsed = runParser(content);
  const explained = explain(content);
  const expected = readExpected(entry);
  const expectedTrace = readExpectedTrace(entry);
  const problems = [];

  if (expected.kind === "error") {
    if (parsed.error !== expected.error) {
      problems.push("parser error mismatch\n  got:      " + parsed.error + "\n  expected: " + expected.error);
    }
    if (parsed.content != null) {
      problems.push("parser returned content on an error fixture");
    }
    if (explained.error !== expected.error) {
      problems.push("explainer error mismatch\n  got:      " + explained.error + "\n  expected: " + expected.error);
    }
  } else {
    if (parsed.error) {
      problems.push("parser error on a success fixture: " + parsed.error);
    }
    if (parsed.content !== expected.content) {
      problems.push("parser content mismatch\n--- got ---\n" + parsed.content + "\n--- expected ---\n" + expected.content);
    }
    if (explained.kept.join("\n") !== expected.content) {
      problems.push("explainer KEEP lines do not match expected.txt");
    }
    if (explained.error) {
      problems.push("explainer reported an error on a success fixture: " + explained.error);
    }
  }

  const compact = compactTrace(explained);
  if (!deepEqual(compact, expectedTrace)) {
    problems.push("trace mismatch versus expected-trace.json");
  }

  return { ok: problems.length === 0, problems, parsed, explained };
}

function checkAll() {
  const catalog = loadCatalog();
  let failed = 0;
  catalog.forEach(function (entry) {
    const result = compareCase(entry);
    if (result.ok) {
      const n = result.explained.kept.length;
      process.stdout.write("ok    " + entry.id + " (" + (result.parsed.error ? "error" : n + " kept") + ")\n");
    } else {
      failed += 1;
      process.stdout.write("FAIL  " + entry.id + "\n");
      result.problems.forEach(function (problem) {
        process.stdout.write("      " + problem.replace(/\n/g, "\n      ") + "\n");
      });
    }
  });

  const secrets = scanRepo();
  if (secrets.hits.length) {
    failed += 1;
    process.stdout.write("FAIL  secrets scan (" + secrets.hits.length + " hit(s) in " + secrets.files + " files)\n");
    secrets.hits.forEach(function (hit) {
      process.stdout.write("      " + hit.file + "  " + hit.kind + "  " + hit.value + "\n");
    });
  } else {
    process.stdout.write("ok    secrets scan (" + secrets.files + " files)\n");
  }

  const stale = reportIsStale();
  if (stale.length) {
    failed += 1;
    process.stdout.write("FAIL  generated report is stale (" + stale.join(", ") + ")\n");
    process.stdout.write("      run: node studio/replay.js report\n");
  } else {
    process.stdout.write("ok    generated report\n");
  }

  const total = catalog.length;
  process.stdout.write(total + " fixtures, " + failed + " failed\n");
  return failed ? 1 : 0;
}

function writeExpected() {
  loadCatalog().forEach(function (entry) {
    const explained = explain(inputText(entry));
    if (explained.error) {
      fs.writeFileSync(entry.files.expectedError, explained.error + "\n");
      if (fs.existsSync(entry.files.expected)) fs.unlinkSync(entry.files.expected);
    } else {
      fs.writeFileSync(entry.files.expected, explained.kept.join("\n") + "\n");
      if (fs.existsSync(entry.files.expectedError)) fs.unlinkSync(entry.files.expectedError);
    }
    fs.writeFileSync(entry.files.expectedTrace, JSON.stringify(compactTrace(explained), null, 2) + "\n");
    process.stdout.write("wrote " + entry.id + "\n");
  });
  return 0;
}

function buildReportPayload() {
  return loadCatalog().map(function (entry) {
    const content = inputText(entry);
    const parsed = runParser(content);
    const explained = explain(content);
    return {
      id: entry.id,
      title: entry.title,
      claim: entry.claim,
      parsed: { content: parsed.content, error: parsed.error },
      trace: compactTrace(explained),
    };
  });
}

function renderTracebook(payload) {
  const lines = [
    "# Replay tracebook",
    "",
    "Generated by `node studio/replay.js report`. Do not edit by hand.",
    "",
    "Each table is the first `[server_local]` capture plus surrounding lines, tagged with the reason codes from [handbook/04-keep-drop-reason-codes.md](../../handbook/04-keep-drop-reason-codes.md).",
    "",
  ];
  payload.forEach(function (entry) {
    lines.push("## `" + entry.id + "` — " + entry.title);
    lines.push("");
    lines.push(entry.claim);
    lines.push("");
    if (entry.parsed.error) {
      lines.push("**Parser error:** `" + entry.parsed.error + "`");
    } else {
      lines.push("**Kept " + entry.trace.kept.length + " line(s).**");
    }
    lines.push("");
    lines.push("| # | Code | Line |");
    lines.push("| ---: | --- | --- |");
    entry.trace.lines.forEach(function (row) {
      const preview = (row.trimmed || "(blank)").replace(/\|/g, "\\|");
      lines.push("| " + row.index + " | `" + row.code + "` | `" + preview.slice(0, 120) + "` |");
    });
    lines.push("");
  });
  return lines.join("\n");
}

function renderGallery(payload) {
  const cards = payload.map(function (entry) {
    const rows = entry.trace.lines.map(function (row) {
      const preview = (row.trimmed || "(blank)")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return "<tr class=\"" + row.code + "\"><td>" + row.index + "</td><td><code>" + row.code + "</code></td><td><code>" + preview + "</code></td></tr>";
    }).join("");
    const status = entry.parsed.error
      ? "<p class=\"err\">" + entry.parsed.error.replace(/</g, "&lt;") + "</p>"
      : "<p class=\"ok\">kept " + entry.trace.kept.length + "</p>";
    return (
      "<article id=\"" + entry.id + "\">" +
      "<h2>" + entry.id + "</h2>" +
      "<p>" + entry.title + " — " + entry.claim + "</p>" +
      status +
      "<table><thead><tr><th>#</th><th>code</th><th>line</th></tr></thead><tbody>" +
      rows +
      "</tbody></table></article>"
    );
  }).join("\n");

  return "<!DOCTYPE html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"/>" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>" +
    "<title>QuanX parser replay gallery</title>" +
    "<style>" +
    "body{font:16px/1.45 ui-sans-serif,system-ui,sans-serif;margin:0;background:#0f1419;color:#e7ecf1;}" +
    "main{max-width:980px;margin:0 auto;padding:24px;}" +
    "h1{font-size:1.6rem;}h2{font-size:1.15rem;margin-top:0;}" +
    "article{background:#1a222c;border:1px solid #2c3846;border-radius:12px;padding:16px 18px;margin:18px 0;}" +
    "table{width:100%;border-collapse:collapse;font-size:13px;}" +
    "td,th{text-align:left;padding:6px 8px;border-bottom:1px solid #2c3846;vertical-align:top;}" +
    "code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;word-break:break-all;}" +
    ".KEEP td:nth-child(2){color:#6ee7b7;} .DROP_EXCLUDED td:nth-child(2),.ERROR_NO_SECTION td:nth-child(2),.ERROR_NO_USABLE td:nth-child(2){color:#fca5a5;}" +
    ".DROP_COMMENT td:nth-child(2),.DROP_EMPTY td:nth-child(2),.OUTSIDE_SECTION td:nth-child(2),.SECTION_HEADER td:nth-child(2){color:#94a3b8;}" +
    ".DROP_UNSUPPORTED td:nth-child(2),.DROP_DUPLICATE td:nth-child(2){color:#fcd34d;}" +
    ".ok{color:#6ee7b7;} .err{color:#fca5a5;}" +
    "nav a{color:#93c5fd;margin-right:12px;display:inline-block;margin-bottom:6px;}" +
    "</style></head><body><main>" +
    "<h1>Personal QuanX replay gallery</h1>" +
    "<p>Sanitized fixtures only. Generated by <code>node studio/replay.js report</code>.</p>" +
    "<nav>" + payload.map(function (entry) { return "<a href=\"#" + entry.id + "\">" + entry.id + "</a>"; }).join(" ") + "</nav>" +
    cards +
    "</main></body></html>\n";
}

function writeReport() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const payload = buildReportPayload();
  fs.writeFileSync(path.join(REPORT_DIR, "traces.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.join(REPORT_DIR, "TRACEBOOK.md"), renderTracebook(payload));
  fs.writeFileSync(path.join(REPORT_DIR, "gallery.html"), renderGallery(payload));
  process.stdout.write("wrote studio/report/ (" + payload.length + " cases)\n");
  return 0;
}

function reportIsStale() {
  const files = ["traces.json", "TRACEBOOK.md", "gallery.html"];
  const missing = files.filter(function (name) {
    return !fs.existsSync(path.join(REPORT_DIR, name));
  });
  if (missing.length) return missing;
  const payload = buildReportPayload();
  const stale = [];
  const traces = fs.readFileSync(path.join(REPORT_DIR, "traces.json"), "utf8");
  if (traces !== JSON.stringify(payload, null, 2) + "\n") stale.push("traces.json");
  if (fs.readFileSync(path.join(REPORT_DIR, "TRACEBOOK.md"), "utf8") !== renderTracebook(payload)) stale.push("TRACEBOOK.md");
  if (fs.readFileSync(path.join(REPORT_DIR, "gallery.html"), "utf8") !== renderGallery(payload)) stale.push("gallery.html");
  return stale;
}

function main(argv) {
  const cmd = argv[0] || "check";
  if (cmd === "list") {
    loadCatalog().forEach(function (entry) {
      process.stdout.write(entry.id.padEnd(32, " ") + entry.title + "\n");
    });
    return 0;
  }
  if (cmd === "dump") return printDump(argv[1]);
  if (cmd === "explain") return printExplain(argv[1]);
  if (cmd === "why") {
    const result = explainOneLine(argv.slice(1).join(" "));
    process.stdout.write(formatTrace(result) + "\n");
    return result.error ? 1 : 0;
  }
  if (cmd === "check") return checkAll();
  if (cmd === "report") return writeReport();
  if (cmd === "scan") {
    const secrets = scanRepo();
    if (!secrets.hits.length) {
      process.stdout.write("ok    secrets scan (" + secrets.files + " files)\n");
      return 0;
    }
    secrets.hits.forEach(function (hit) {
      process.stdout.write(hit.file + "  " + hit.kind + "  " + hit.value + "\n");
    });
    return 1;
  }
  if (cmd === "write-expected") return writeExpected();
  if (cmd === "-h" || cmd === "--help") {
    process.stdout.write(usage() + "\n");
    return 0;
  }
  process.stderr.write(usage() + "\n");
  return 2;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(String(error && error.stack ? error.stack : error) + "\n");
    process.exit(1);
  }
}

module.exports = { compareCase, buildReportPayload };
