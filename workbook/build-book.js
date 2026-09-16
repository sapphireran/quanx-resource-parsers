#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const cases = require("./cases.cjs");
const classify = require("./classify.cjs");
const sandbox = require("./sandbox.cjs");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function payload() {
  return cases.CASES.map(function (item) {
    const wired = cases.wireInput(item);
    const result = sandbox.runParser(item.parser || "nexitally-node-parser.js", wired);
    const sliced = classify.sliceServerLocal(wired);
    const rows = sliced.found ? classify.traceBody(sliced.body) : [];
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      notes: item.notes,
      expect: item.expect,
      expected: item.expect === "error" ? item.expected : item.expected.join("\n"),
      input: item.input,
      resultKind: result.ok ? result.kind : "harness-error",
      resultText: result.ok ? (result.kind === "error" ? result.error : result.content) : result.detail,
      sectionFound: sliced.found,
      rows: rows
    };
  });
}

function render(data) {
  const rows = data.map(function (item, index) {
    const keep = item.rows.filter(function (row) { return row.action === "keep"; }).length;
    const drop = item.rows.filter(function (row) { return row.action === "drop"; }).length;
    const badge = item.expect === "error" ? "error" : "content";
    return [
      "<article class=\"case\" id=\"" + escapeHtml(item.id) + "\" data-expect=\"" + badge + "\">",
      "  <header>",
      "    <p class=\"kicker\">" + String(index + 1).padStart(2, "0") + " · " + badge + "</p>",
      "    <h2>" + escapeHtml(item.title) + "</h2>",
      "    <p class=\"summary\">" + escapeHtml(item.summary) + "</p>",
      "    <p class=\"meta\"><code>" + escapeHtml(item.id) + "</code> · section " +
        (item.sectionFound ? "found" : "missing") + " · keep " + keep + " · drop " + drop + "</p>",
      "  </header>",
      "  <p class=\"notes\">" + escapeHtml(item.notes) + "</p>",
      "  <div class=\"split\">",
      "    <section><h3>Input</h3><pre>" + escapeHtml(item.input) + "</pre></section>",
      "    <section><h3>Parser result</h3><pre>" + escapeHtml(item.resultText) + "</pre></section>",
      "  </div>",
      item.rows.length ? (
        "  <table><thead><tr><th></th><th>Action</th><th>Reason</th><th>Line</th></tr></thead><tbody>" +
        item.rows.map(function (row, i) {
          return "<tr class=\"" + row.action + "\"><td>" + (i + 1) + "</td><td>" + row.action +
            "</td><td>" + escapeHtml(row.reason) + "</td><td><code>" + escapeHtml(row.line) +
            "</code></td></tr>";
        }).join("") +
        "</tbody></table>"
      ) : "  <p class=\"empty\">No section body to classify.</p>",
      "</article>"
    ].join("\n");
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Personal QuanX parser workbook</title>
  <style>
    :root {
      --ink: #1b1a17;
      --paper: #f6f1e7;
      --rule: #d7cbb6;
      --keep: #215c3a;
      --drop: #7a3b2e;
      --err: #6b2d5b;
      --muted: #6d6558;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font: 16px/1.5 "Iowan Old Style", "Palatino Linotype", Palatino, serif;
      color: var(--ink);
      background: var(--paper);
    }
    header.hero, nav, main { max-width: 980px; margin: 0 auto; padding: 0 1.25rem; }
    header.hero { padding-top: 2.5rem; }
    header.hero h1 { margin: 0 0 0.4rem; font-size: 2rem; }
    header.hero p { margin: 0 0 0.75rem; color: var(--muted); }
    .banner {
      border: 1px solid var(--rule);
      padding: 0.75rem 1rem;
      background: #efe6d4;
    }
    nav { padding: 1.25rem; }
    nav ol { columns: 2; padding-left: 1.2rem; }
    nav a { color: var(--ink); }
    article.case {
      border-top: 1px solid var(--rule);
      padding: 1.75rem 0 2rem;
    }
    .kicker { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--muted); margin-bottom: 0.2rem; }
    h2 { margin: 0 0 0.35rem; }
    .meta, .notes { color: var(--muted); }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    pre, table { width: 100%; font: 12px/1.45 ui-monospace, "SF Mono", Menlo, monospace; }
    pre {
      background: #fffdf8;
      border: 1px solid var(--rule);
      padding: 0.75rem;
      overflow: auto;
      white-space: pre-wrap;
    }
    table { border-collapse: collapse; margin-top: 1rem; }
    th, td { border-bottom: 1px solid var(--rule); text-align: left; padding: 0.35rem 0.4rem; vertical-align: top; }
    tr.keep td:nth-child(2), tr.keep td:nth-child(3) { color: var(--keep); }
    tr.drop td:nth-child(2), tr.drop td:nth-child(3) { color: var(--drop); }
    article.case[data-expect="error"] .kicker { color: var(--err); }
    .empty { color: var(--muted); font-style: italic; }
    @media (max-width: 800px) {
      nav ol { columns: 1; }
      .split { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="hero">
    <h1>Personal QuanX parser workbook</h1>
    <p>${data.length} sanitized cases for <code>nexitally-node-parser.js</code>. No live subscription URLs. No company profiles.</p>
    <p class="banner">Quantumult X downloads the managed file. The parser only slices <code>[server_local]</code> and returns server lines. Hosts here are <code>*.example.invalid</code>, <code>192.0.2.0/24</code>, and <code>2001:db8::/32</code>.</p>
  </header>
  <nav>
    <ol>
      ${data.map(function (item) {
        return "<li><a href=\"#" + escapeHtml(item.id) + "\">" + escapeHtml(item.title) + "</a></li>";
      }).join("\n      ")}
    </ol>
  </nav>
  <main>
${rows}
  </main>
</body>
</html>
`;
}

function main() {
  const data = payload();
  const html = render(data);
  const out = path.join(__dirname, "book.html");
  fs.writeFileSync(out, html, "utf8");
  fs.writeFileSync(path.join(__dirname, "book.json"), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote workbook/book.html and workbook/book.json (" + data.length + " cases)");
}

main();
