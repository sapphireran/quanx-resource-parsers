"use strict";

var fs = require("fs");
var path = require("path");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function codeClass(code) {
  if (code === "keep") return "keep";
  if (code === "excluded") return "excluded";
  if (code === "duplicate") return "duplicate";
  if (code === "unsupported") return "unsupported";
  if (code === "comment" || code === "empty") return "quiet";
  return "other";
}

function renderRows(rows) {
  if (!rows.length) {
    return "<p class=\"empty\">No [server_local] body to annotate.</p>";
  }
  return (
    "<table class=\"lines\"><thead><tr><th>#</th><th>verdict</th><th>line</th><th>why</th></tr></thead><tbody>" +
    rows.map(function (row) {
      var shown = row.trimmed || "(blank)";
      return (
        "<tr class=\"" + codeClass(row.code) + "\">" +
        "<td>" + row.n + "</td>" +
        "<td><code>" + escapeHtml(row.code) + "</code></td>" +
        "<td><code>" + escapeHtml(shown) + "</code></td>" +
        "<td>" + escapeHtml(row.detail) + "</td>" +
        "</tr>"
      );
    }).join("") +
    "</tbody></table>"
  );
}

function renderCase(entry) {
  var result = entry.result;
  var classified = entry.classified;
  var outcome = result.kind === "error"
    ? "<p class=\"error\">$done({ error: \"" + escapeHtml(result.error) + "\" })</p>"
    : "<pre class=\"kept\">" + escapeHtml(result.servers.join("\n") || "(empty)") + "</pre>";

  var counts = {};
  classified.rows.forEach(function (row) {
    counts[row.code] = (counts[row.code] || 0) + 1;
  });
  var tally = Object.keys(counts).sort().map(function (code) {
    return "<li><code>" + escapeHtml(code) + "</code> × " + counts[code] + "</li>";
  }).join("");

  return (
    "<article class=\"case\" id=\"" + escapeHtml(entry.id) + "\" data-group=\"" + escapeHtml(entry.group) + "\">" +
    "<h2>" + escapeHtml(entry.title) + "</h2>" +
    "<p class=\"meta\"><code>" + escapeHtml(entry.id) + "</code> · " + escapeHtml(entry.group) +
    (classified.terminator ? " · terminator <code>" + escapeHtml(classified.terminator) + "</code>" : "") +
    "</p>" +
    "<p>" + escapeHtml(entry.notes) + "</p>" +
    "<h3>Annotated [server_local]</h3>" +
    renderRows(classified.rows) +
    "<h3>Parser $done</h3>" +
    outcome +
    (tally ? "<h3>Reason tally</h3><ul class=\"tally\">" + tally + "</ul>" : "") +
    "</article>"
  );
}

function render(report) {
  var nav = report.cases.map(function (entry) {
    return "<a href=\"#" + escapeHtml(entry.id) + "\">" + escapeHtml(entry.title) + "</a>";
  }).join("");

  var groups = [];
  report.cases.forEach(function (entry) {
    if (groups.indexOf(entry.group) === -1) groups.push(entry.group);
  });

  var filters = ["all"].concat(groups).map(function (group) {
    return "<button type=\"button\" data-group=\"" + escapeHtml(group) + "\">" + escapeHtml(group) + "</button>";
  }).join("");

  var articles = report.cases.map(renderCase).join("\n");

  return [
    "<!DOCTYPE html>",
    "<html lang=\"en\">",
    "<head>",
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<title>Nexitally parser folio bench</title>",
    "<style>",
    "  :root { color-scheme: light; --ink:#241b14; --paper:#f6efe4; --card:#fffaf1; --rule:#d7c7b0; --keep:#1f6b3a; --excluded:#9a3412; --dup:#7c4a12; --unsupported:#3730a3; --quiet:#6b6258; }",
    "  html, body { margin:0; background:var(--paper); color:var(--ink); font-family: system-ui, -apple-system, sans-serif; font-size:16px; line-height:1.5; }",
    "  body { display:grid; grid-template-columns: 240px 1fr; min-height:100vh; }",
    "  nav { position:sticky; top:0; height:100vh; overflow:auto; border-right:1px solid var(--rule); padding:1.2rem 1rem; background:#efe6d6; }",
    "  nav h1 { font-size:1rem; margin:0 0 .75rem; }",
    "  nav a { display:block; color:inherit; text-decoration:none; padding:.25rem 0; font-size:.92rem; }",
    "  nav a:hover { text-decoration:underline; }",
    "  main { padding:1.5rem 1.75rem 4rem; max-width:980px; }",
    "  .lede { background:var(--card); border:1px solid var(--rule); padding:1rem 1.1rem; margin-bottom:1.25rem; }",
    "  .filters { display:flex; flex-wrap:wrap; gap:.4rem; margin:.75rem 0 0; }",
    "  .filters button { background:#fff; border:1px solid var(--rule); padding:.2rem .55rem; cursor:pointer; }",
    "  .filters button[aria-pressed=\"true\"] { background:var(--ink); color:var(--paper); }",
    "  .case { background:var(--card); border:1px solid var(--rule); padding:1rem 1.1rem 1.2rem; margin:0 0 1rem; }",
    "  .case.hidden { display:none; }",
    "  h2 { margin:.15rem 0 .35rem; font-size:1.15rem; }",
    "  h3 { margin:1rem 0 .4rem; font-size:.95rem; }",
    "  .meta { color:var(--quiet); font-size:.9rem; }",
    "  table.lines { width:100%; border-collapse:collapse; font-size:.86rem; }",
    "  table.lines th, table.lines td { border-top:1px solid var(--rule); padding:.28rem .35rem; vertical-align:top; text-align:left; }",
    "  table.lines td:nth-child(2) { white-space:nowrap; }",
    "  table.lines code { white-space:pre-wrap; overflow-wrap:anywhere; }",
    "  tr.keep td:nth-child(2) { color:var(--keep); font-weight:600; }",
    "  tr.excluded td:nth-child(2) { color:var(--excluded); font-weight:600; }",
    "  tr.duplicate td:nth-child(2) { color:var(--dup); font-weight:600; }",
    "  tr.unsupported td:nth-child(2) { color:var(--unsupported); font-weight:600; }",
    "  tr.quiet { color:var(--quiet); }",
    "  pre.kept { background:#f3fff6; border:1px solid #b7d7c0; padding:.7rem; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; }",
    "  .error { background:#fff1eb; border:1px solid #e8b4a0; padding:.7rem; }",
    "  .tally { display:flex; flex-wrap:wrap; gap:.4rem 1rem; padding:0; list-style:none; }",
    "  @media (max-width: 720px) { body { grid-template-columns: 1fr; } nav { position:relative; height:auto; } }",
    "</style>",
    "</head>",
    "<body>",
    "<nav>",
    "<h1>Folio bench</h1>",
    "<p>Personal Nexitally parser. Invented hosts only.</p>",
    nav,
    "</nav>",
    "<main>",
    "<section class=\"lede\">",
    "<p><strong>" + report.passed + "/" + report.total + " cases passed</strong> against <code>nexitally-node-parser.js</code>. The bench injects Quantumult X <code>$resource</code> / <code>$done</code> and never fetches a URL.</p>",
    "<p>Keep/drop reason codes come from the same section, prefix, exclusion, and exact-line-dedupe rules as the committed parser.</p>",
    "<div class=\"filters\" id=\"filters\">" + filters + "</div>",
    "</section>",
    articles,
    "</main>",
    "<script>",
    "(function () {",
    "  var buttons = document.querySelectorAll('#filters button');",
    "  var cases = document.querySelectorAll('article.case');",
    "  function apply(group) {",
    "    buttons.forEach(function (btn) { btn.setAttribute('aria-pressed', String(btn.getAttribute('data-group') === group)); });",
    "    cases.forEach(function (el) {",
    "      el.classList.toggle('hidden', group !== 'all' && el.getAttribute('data-group') !== group);",
    "    });",
    "  }",
    "  buttons.forEach(function (btn) {",
    "    btn.addEventListener('click', function () { apply(btn.getAttribute('data-group')); });",
    "  });",
    "  apply('all');",
    "})();",
    "</script>",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

function renderOne(report, id) {
  var entry = report.cases.filter(function (item) { return item.id === id; })[0];
  if (!entry) throw new Error("unknown case: " + id);
  var slim = {
    passed: report.passed,
    total: report.total,
    cases: [entry]
  };
  return render(slim);
}

function writeGallery(report, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, render(report));
  var shotDir = path.join(path.dirname(dest), "snapshots");
  fs.mkdirSync(shotDir, { recursive: true });
  ["managed-full-profile", "reset-substring-trap", "html-interstitial"].forEach(function (id) {
    fs.writeFileSync(path.join(shotDir, id + ".html"), renderOne(report, id));
  });
}

exports.render = render;
exports.renderOne = renderOne;
exports.writeGallery = writeGallery;
