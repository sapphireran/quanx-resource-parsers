#!/usr/bin/env node
"use strict";

/**
 * Personal parser lab CLI.
 *
 *   node lab/run.js                 # fixture suite
 *   node lab/run.js --dump FILE     # print parser $done result
 *   node lab/run.js --explain FILE  # line-by-line keep/drop
 *   node lab/run.js --matrix        # write docs/keep-drop-matrix.md
 *   node lab/run.js --gallery       # write lab/gallery.html
 */

const fs = require("fs");
const path = require("path");
const harness = require("./harness");

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const YELLOW = "\x1b[33m";

function fail(message) {
  process.stderr.write(RED + message + RESET + "\n");
  process.exit(1);
}

function usage() {
  process.stdout.write(
    [
      "Personal Nexitally parser lab",
      "",
      "  node lab/run.js                 Run every catalog fixture against the real parser",
      "  node lab/run.js --dump FILE     Print $done({content|error}) for a .conf file",
      "  node lab/run.js --explain FILE  Classify each [server_local] line",
      "  node lab/run.js --matrix        Rewrite docs/keep-drop-matrix.md from the catalog",
      "  node lab/run.js --gallery       Rewrite lab/gallery.html from the catalog",
      "",
    ].join("\n")
  );
}

function resolveInput(fileArg) {
  if (!fileArg) fail("missing file argument");
  const candidates = [
    path.resolve(process.cwd(), fileArg),
    path.resolve(harness.REPO_ROOT, fileArg),
    path.resolve(harness.REPO_ROOT, "lab", "fixtures", fileArg),
  ];
  for (let i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i])) return candidates[i];
  }
  fail("file not found: " + fileArg);
}

function readMaybeBinary(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.toString("utf8");
  }
  return buf.toString("utf8");
}

function dumpFile(fileArg) {
  const filePath = resolveInput(fileArg);
  const raw = readMaybeBinary(filePath);
  const result = harness.runParser(raw);
  if (result.error) {
    process.stdout.write("error: " + result.error + "\n");
    return;
  }
  process.stdout.write(result.content + "\n");
}

function explainFile(fileArg) {
  const filePath = resolveInput(fileArg);
  const raw = readMaybeBinary(filePath);
  const compared = harness.compareParserToExplain(raw);
  if (!compared.ok) fail(compared.message);
  const explained = compared.explained;
  if (!explained.sectionFound) {
    process.stdout.write("section: missing\nerror: " + explained.error + "\n");
    return;
  }
  process.stdout.write("section: [server_local]\n");
  explained.lines.forEach(function (row) {
    const mark = row.decision === "keep" ? GREEN + "KEEP" : YELLOW + "DROP";
    const preview = (row.line || row.raw || "").slice(0, 96);
    process.stdout.write(
      mark + RESET + "  " + String(row.index).padStart(3, " ") + "  " +
      row.reason.padEnd(20, " ") + "  " + preview + "\n"
    );
  });
  if (!explained.ok) {
    process.stdout.write("\nerror: " + explained.error + "\n");
    return;
  }
  process.stdout.write("\nkept " + explained.kept.length + " server line(s)\n");
}

function runSuite() {
  const fixtures = harness.loadCatalog();
  let passed = 0;
  const failures = [];

  fixtures.forEach(function (fixture) {
    try {
      const compared = harness.compareParserToExplain(fixture.raw);
      if (!compared.ok) {
        throw new Error(compared.message);
      }
      const parsed = compared.parsed;
      if (fixture.expectKind === "error") {
        if (!parsed.error) {
          throw new Error("expected error, got content:\n" + parsed.content);
        }
        if (parsed.error !== fixture.expected) {
          throw new Error("error mismatch\n  expected: " + fixture.expected + "\n  actual:   " + parsed.error);
        }
      } else if (fixture.expectKind === "content") {
        if (parsed.error) {
          throw new Error("expected content, got error: " + parsed.error);
        }
        if (parsed.content !== fixture.expected) {
          throw new Error(
            "content mismatch\n--- expected ---\n" + fixture.expected +
            "\n--- actual ---\n" + parsed.content
          );
        }
      } else {
        throw new Error("unknown fixture kind: " + fixture.expectKind);
      }
      passed += 1;
      process.stdout.write(GREEN + "ok   " + RESET + fixture.id + DIM + "  " + fixture.title + RESET + "\n");
    } catch (err) {
      failures.push({ id: fixture.id, error: err });
      process.stdout.write(RED + "fail " + RESET + fixture.id + "  " + err.message.split("\n")[0] + "\n");
    }
  });

  process.stdout.write("\n" + passed + " passed, " + failures.length + " failed, " + fixtures.length + " fixtures\n");
  if (failures.length) {
    failures.forEach(function (item) {
      process.stderr.write("\n" + RED + item.id + RESET + "\n" + item.error.stack + "\n");
    });
    process.exit(1);
  }
}

function writeMatrix() {
  const fixtures = harness.loadCatalog();
  const rows = [];
  fixtures.forEach(function (fixture) {
    const explained = harness.explainText(fixture.raw);
    const counts = {
      keep: 0,
      "empty-or-whitespace": 0,
      comment: 0,
      "unsupported-prefix": 0,
      "info-or-premium": 0,
      duplicate: 0,
    };
    explained.lines.forEach(function (row) {
      if (row.decision === "keep") counts.keep += 1;
      else if (counts[row.reason] != null) counts[row.reason] += 1;
    });
    rows.push({
      id: fixture.id,
      title: fixture.title,
      section: explained.sectionFound ? "yes" : "no",
      result: explained.ok ? explained.kept.length + " kept" : explained.error.replace("Nexitally parser: ", ""),
      counts: counts,
    });
  });

  const lines = [
    "# Keep / drop matrix",
    "",
    "Generated from `lab/fixtures/catalog.json` by `node lab/run.js --matrix`.",
    "Counts are **inside** the first `[server_local]` section after BOM/CRLF normalization.",
    "The explainer uses the same keep/drop rules as `nexitally-node-parser.js` and is checked against the real parser on every `npm test`.",
    "",
    "| Fixture | Section | Result | Keep | Empty | Comment | Unsupported | Info/Premium | Duplicate |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  rows.forEach(function (row) {
    lines.push(
      "| [`" + row.id + "`](../lab/fixtures/" + row.id + ".conf) | " +
      row.section + " | " + row.result + " | " +
      row.counts.keep + " | " +
      row.counts["empty-or-whitespace"] + " | " +
      row.counts.comment + " | " +
      row.counts["unsupported-prefix"] + " | " +
      row.counts["info-or-premium"] + " | " +
      row.counts.duplicate + " |"
    );
  });

  lines.push("");
  lines.push("## Rule order");
  lines.push("");
  lines.push("1. Strip a leading UTF-8 BOM and rewrite CRLF to LF.");
  lines.push("2. Take the first `[server_local]` block that is followed by a newline. The next `[section]` header ends the block.");
  lines.push("3. Trim each line.");
  lines.push("4. Drop empty lines and `;` / `#` / `//` comments.");
  lines.push("5. Keep only `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5` prefixes (case-insensitive, spaces before `=` allowed).");
  lines.push("6. Drop lines matching `[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, or `套餐`.");
  lines.push("7. Drop an exact duplicate of an earlier kept line.");
  lines.push("8. If nothing remains, return the documented error instead of an empty resource.");
  lines.push("");

  const outPath = path.resolve(harness.REPO_ROOT, "docs", "keep-drop-matrix.md");
  fs.writeFileSync(outPath, lines.join("\n"));
  process.stdout.write("wrote " + path.relative(harness.REPO_ROOT, outPath) + "\n");
}

function writeGallery() {
  const fixtures = harness.loadCatalog();
  const payload = fixtures.map(function (fixture) {
    const compared = harness.compareParserToExplain(fixture.raw);
    if (!compared.ok) {
      throw new Error(fixture.id + ": " + compared.message);
    }
    const explained = compared.explained;
    const parsed = compared.parsed;
    return {
      id: fixture.id,
      title: fixture.title,
      titleZh: fixture.title_zh || "",
      notes: fixture.notes || "",
      notesZh: fixture.notes_zh || "",
      kind: fixture.kind,
      input: fixture.raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"),
      output: parsed.content || "",
      error: parsed.error || "",
      lines: explained.lines,
      kept: explained.kept.length,
    };
  });

  const html = [
    "<!DOCTYPE html>",
    "<html lang=\"en\">",
    "<head>",
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<title>Personal QuanX parser lab</title>",
    "<style>",
    ":root { color-scheme: light dark; --bg: #0f1419; --panel: #1a2332; --ink: #e7ecf3; --muted: #93a0b3; --keep: #3dd68c; --drop: #f0b429; --err: #ff6b6b; --line: #243044; }",
    "html, body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }",
    "header { padding: 20px 24px 8px; }",
    "h1 { font-size: 22px; margin: 0 0 6px; }",
    "p.lead { color: var(--muted); margin: 0 0 12px; max-width: 70ch; }",
    ".layout { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 88px); }",
    "nav { border-right: 1px solid var(--line); overflow: auto; padding: 8px; }",
    "nav button { display: block; width: 100%; text-align: left; background: transparent; color: var(--ink); border: 0; border-radius: 8px; padding: 8px 10px; cursor: pointer; }",
    "nav button.active, nav button:hover { background: var(--panel); }",
    "nav .id { display: block; font-size: 12px; color: var(--muted); }",
    "main { padding: 16px 20px 48px; overflow: auto; }",
    "h2 { margin: 0 0 8px; font-size: 20px; }",
    ".notes { color: var(--muted); margin: 0 0 16px; }",
    "pre { background: var(--panel); padding: 12px; border-radius: 10px; overflow: auto; white-space: pre-wrap; word-break: break-word; }",
    "table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }",
    "th, td { border-bottom: 1px solid var(--line); padding: 6px 8px; vertical-align: top; text-align: left; }",
    ".keep { color: var(--keep); font-weight: 700; }",
    ".drop { color: var(--drop); font-weight: 700; }",
    ".error { color: var(--err); }",
    "code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }",
    "@media (max-width: 880px) { .layout { grid-template-columns: 1fr; } nav { border-right: 0; border-bottom: 1px solid var(--line); max-height: 220px; } }",
    "</style>",
    "</head>",
    "<body>",
    "<header>",
    "<h1>Personal QuanX parser lab</h1>",
    "<p class=\"lead\">Sanitized Nexitally-style fixtures for <code>nexitally-node-parser.js</code>. Hosts are <code>.example.invalid</code>. No live subscription URL is stored in this repository.</p>",
    "</header>",
    "<div class=\"layout\">",
    "<nav id=\"nav\"></nav>",
    "<main id=\"main\"></main>",
    "</div>",
    "<script>",
    "const FIXTURES = " + JSON.stringify(payload) + ";",
    "const nav = document.getElementById('nav');",
    "const main = document.getElementById('main');",
    "function esc(value) { return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }",
    "function render(id) {",
    "  const fixture = FIXTURES.find((item) => item.id === id) || FIXTURES[0];",
    "  document.querySelectorAll('nav button').forEach((btn) => btn.classList.toggle('active', btn.dataset.id === fixture.id));",
    "  const rows = (fixture.lines || []).map((row) => {",
    "    const klass = row.decision === 'keep' ? 'keep' : 'drop';",
    "    return '<tr><td class=\"' + klass + '\">' + row.decision.toUpperCase() + '</td><td>' + esc(row.reason) + '</td><td><code>' + esc(row.line || row.raw || '') + '</code></td></tr>';",
    "  }).join('');",
    "  const result = fixture.error ? '<p class=\"error\">' + esc(fixture.error) + '</p>' : '<pre><code>' + esc(fixture.output) + '</code></pre>';",
    "  main.innerHTML = '<h2>' + esc(fixture.title) + '</h2>' +",
    "    '<p class=\"notes\">' + esc(fixture.notes) + (fixture.notesZh ? '<br>' + esc(fixture.notesZh) : '') + '</p>' +",
    "    '<p>Kept <strong>' + fixture.kept + '</strong> server line(s).</p>' +",
    "    '<h3>Line decisions inside [server_local]</h3><table><thead><tr><th>Decision</th><th>Reason</th><th>Line</th></tr></thead><tbody>' + rows + '</tbody></table>' +",
    "    '<h3>Parser output</h3>' + result +",
    "    '<h3>Input fixture</h3><pre><code>' + esc(fixture.input) + '</code></pre>';",
    "  history.replaceState(null, '', '#' + fixture.id);",
    "}",
    "FIXTURES.forEach((fixture) => {",
    "  const btn = document.createElement('button');",
    "  btn.dataset.id = fixture.id;",
    "  btn.innerHTML = '<span>' + esc(fixture.title) + '</span><span class=\"id\">' + esc(fixture.id) + '</span>';",
    "  btn.addEventListener('click', () => render(fixture.id));",
    "  nav.appendChild(btn);",
    "});",
    "render((location.hash || '').replace(/^#/, '') || FIXTURES[0].id);",
    "</script>",
    "</body>",
    "</html>",
    "",
  ].join("\n");

  const outPath = path.resolve(harness.REPO_ROOT, "lab", "gallery.html");
  fs.writeFileSync(outPath, html);
  process.stdout.write("wrote " + path.relative(harness.REPO_ROOT, outPath) + " (" + payload.length + " fixtures)\n");
}

function main(argv) {
  const args = argv.slice(2);
  if (args[0] === "-h" || args[0] === "--help") {
    usage();
    return;
  }
  if (args[0] === "--dump") {
    dumpFile(args[1]);
    return;
  }
  if (args[0] === "--explain") {
    explainFile(args[1]);
    return;
  }
  if (args[0] === "--matrix") {
    writeMatrix();
    return;
  }
  if (args[0] === "--gallery") {
    writeGallery();
    return;
  }
  if (args.length) {
    usage();
    fail("unknown argument: " + args[0]);
  }
  runSuite();
}

main(process.argv);
