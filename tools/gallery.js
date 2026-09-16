"use strict";

const fs = require("fs");
const path = require("path");

const COLORS = {
  KEEP: "#137333",
  DROP_INFO: "#b06000",
  DROP_SCHEME: "#8e4b10",
  DROP_DUPLICATE: "#5f6368",
  COMMENT: "#5f6368",
  BLANK: "#9aa0a6",
  HEADER: "#1a73e8",
  SECTION_CUT: "#c5221f",
  OUTSIDE_BEFORE: "#80868b",
  OUTSIDE_AFTER: "#80868b",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderGallery(root, catalog) {
  const cards = catalog.cases.map(function (entry) {
    const receipt = JSON.parse(
      fs.readFileSync(path.join(root, entry.receipt), "utf8")
    );
    const notes = fs.readFileSync(path.join(root, entry.notes), "utf8").trim();
    const rows = (receipt.lines || [])
      .filter(function (row) {
        return row.decision !== "BLANK" || (row.text && row.text.length);
      })
      .map(function (row) {
        const color = COLORS[row.decision] || "#202124";
        const extra = row.needle
          ? ' <span class="needle">' + esc(row.needle) + "</span>"
          : "";
        const text = row.text || "(blank)";
        return (
          '<tr><td class="dec" style="color:' +
          color +
          '">' +
          esc(row.decision) +
          extra +
          '</td><td class="txt"><code>' +
          esc(text) +
          "</code></td></tr>"
        );
      })
      .join("");

    const outcome =
      receipt.parser.kind === "error"
        ? '<p class="err">' + esc(receipt.parser.error) + "</p>"
        : '<p class="ok">' +
          receipt.parser.lineCount +
          " server line(s) kept</p>";

    return (
      '<article class="card" id="' +
      esc(entry.id) +
      '">' +
      "<header><h2>" +
      esc(entry.id) +
      "</h2>" +
      '<p class="meta">' +
      esc(entry.group) +
      " · " +
      esc(entry.title) +
      "</p></header>" +
      "<p class=\"notes\">" +
      esc(notes) +
      "</p>" +
      outcome +
      '<table><thead><tr><th>decision</th><th>line</th></tr></thead><tbody>' +
      rows +
      "</tbody></table></article>"
    );
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nexitally parser ledger gallery</title>
  <style>
    :root { color-scheme: light dark; }
    body { font: 15px/1.45 ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 24px; }
    h1 { font-size: 1.4rem; margin: 0 0 8px; }
    .lede { max-width: 72ch; color: #3c4043; margin-bottom: 24px; }
    .card { border: 1px solid #dadce0; border-radius: 12px; padding: 16px 18px; margin: 0 0 18px; }
    h2 { font-size: 1.05rem; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .meta { margin: 4px 0 8px; color: #5f6368; }
    .notes { max-width: 80ch; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-weight: 600; border-bottom: 1px solid #dadce0; padding: 6px 8px; }
    td { vertical-align: top; padding: 5px 8px; border-bottom: 1px solid #f1f3f4; }
    .dec { white-space: nowrap; font-weight: 600; width: 11rem; }
    .txt code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
    .needle { margin-left: 6px; font-weight: 500; opacity: 0.8; }
    .ok { color: #137333; font-weight: 600; }
    .err { color: #c5221f; font-weight: 600; }
    nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 24px; }
    nav a { font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: inherit; }
  </style>
</head>
<body>
  <h1>Personal Nexitally parser ledger</h1>
  <p class="lede">Synthetic Quantumult X fixtures replayed with <code>nexitally-node-parser.js</code> in a Node <code>$resource</code> / <code>$done</code> sandbox. Nothing here is fetched from a provider. Hosts are <code>*.example.test</code>.</p>
  <nav>
    ${catalog.cases
      .map(function (c) {
        return '<a href="#' + esc(c.id) + '">' + esc(c.id) + "</a>";
      })
      .join("\n    ")}
  </nav>
  ${cards.join("\n")}
</body>
</html>
`;
}

function main() {
  const root = path.join(__dirname, "..");
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, "examples", "catalog.json"), "utf8")
  );
  const html = renderGallery(root, catalog);
  const out = path.join(root, "examples", "gallery.html");
  fs.writeFileSync(out, html, "utf8");
  console.log("wrote examples/gallery.html");
}

if (require.main === module) {
  main();
}

module.exports = { renderGallery };
