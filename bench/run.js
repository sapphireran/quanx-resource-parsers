"use strict";

var fs = require("fs");
var path = require("path");
var classify = require("./classify");
var gallery = require("./gallery");
var rules = require("./rules");
var sandbox = require("./sandbox");
var secrets = require("./secrets");

var ROOT = path.join(__dirname, "..");
var MANIFEST_PATH = path.join(ROOT, "examples", "manifest.json");
var GALLERY_PATH = path.join(__dirname, "gallery.html");
var MATRIX_PATH = path.join(ROOT, "docs", "keep-drop-matrix.md");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function applyTransform(text, transform) {
  if (transform === "crlf") return String(text).replace(/\n/g, "\r\n");
  if (transform === "bom") return "\uFEFF" + text;
  if (transform === "crlf-bom") return "\uFEFF" + String(text).replace(/\n/g, "\r\n");
  throw new Error("unknown transform: " + transform);
}

function loadInput(item) {
  var text = item.inline != null ? String(item.inline) : read(item.file);
  if (item.transform) text = applyTransform(text, item.transform);
  return text;
}

function expectedFrom(item) {
  if (item.expect.error) {
    return { kind: "error", error: item.expect.error, servers: [] };
  }
  if (item.expect.keepFile) {
    var body = read(item.expect.keepFile).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    var servers = body.replace(/\n$/, "").length ? body.replace(/\n$/, "").split("\n") : [];
    return { kind: "servers", error: null, servers: servers };
  }
  if (Array.isArray(item.expect.servers)) {
    return { kind: "servers", error: null, servers: item.expect.servers };
  }
  throw new Error(item.id + " has no expect.keepFile, expect.servers, or expect.error");
}

function sameList(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function assertParserSourceSync() {
  var source = fs.readFileSync(sandbox.PARSER_PATH, "utf8");
  var needles = [
    rules.SECTION_RE.source,
    rules.SUPPORTED_RE.source,
    rules.EXCLUDED_RE.source,
    rules.COMMENT_RE.source,
    rules.MISSING_SECTION,
    rules.NO_USABLE_SERVERS
  ];
  var missing = needles.filter(function (needle) {
    return source.indexOf(needle) === -1;
  });
  if (missing.length) {
    throw new Error("parser source no longer contains: " + missing.join(" | "));
  }
  var code = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  if (/\$resource\.link/.test(code)) {
    throw new Error("parser must not read $resource.link");
  }
}

function runCase(item) {
  var input = loadInput(item);
  var expected = expectedFrom(item);
  var result = sandbox.parseResult(input);
  var classified = classify.classifyText(input);

  var failures = [];
  if (result.kind !== expected.kind) {
    failures.push("kind " + result.kind + " != " + expected.kind);
  }
  if (expected.kind === "error" && result.error !== expected.error) {
    failures.push("error " + JSON.stringify(result.error) + " != " + JSON.stringify(expected.error));
  }
  if (expected.kind === "servers" && !sameList(result.servers, expected.servers)) {
    failures.push(
      "servers\n  got:\n    " +
        (result.servers.join("\n    ") || "(none)") +
        "\n  want:\n    " +
        (expected.servers.join("\n    ") || "(none)")
    );
  }
  if (!sameList(classified.kept, result.servers)) {
    failures.push("classifier kept lines drifted from parser $done content");
  }
  if (result.kind === "error" && classified.error !== result.error) {
    failures.push("classifier error drifted from parser");
  }

  return {
    id: item.id,
    title: item.title,
    group: item.group,
    notes: item.notes || "",
    file: item.file || null,
    result: result,
    classified: classified,
    expected: expected,
    ok: failures.length === 0,
    failures: failures
  };
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}

function checkLinkGuard() {
  var threw = false;
  try {
    var contextSource = fs.readFileSync(sandbox.PARSER_PATH, "utf8");
    var vm = require("vm");
    var resource = sandbox.makeResource("[server_local]\nanytls=example.com:443, password=pwd, tag=HK-01\n");
    Object.defineProperty(resource, "forceLinkRead", {
      get: function () { return resource.link; }
    });
    vm.runInContext(contextSource, vm.createContext({
      $resource: resource,
      $done: function () {},
      String: String
    }), { filename: rules.PARSER_RELATIVE_PATH });
  } catch (err) {
    if (String(err.message || err).indexOf("$resource.link") !== -1) threw = true;
  }
  // The committed parser must not read link. Accessing the proxy getter
  // from this helper is only to keep the guard itself honest.
  var probeThrew = false;
  try {
    void sandbox.makeResource("x").link;
  } catch (err) {
    probeThrew = /privacy contract/.test(String(err.message || err));
  }
  if (!probeThrew) {
    throw new Error("$resource.link proxy guard is not armed");
  }
  return { threw: threw, probeThrew: probeThrew };
}

function renderMatrix(report) {
  var lines = [
    "# Keep / drop matrix",
    "",
    "Generated by `node bench/run.js --gallery --write`. Do not edit by hand.",
    "",
    "Each row is one personal fixture. Hosts are invented (`*.example.invalid`, official Quantumult X samples).",
    "",
    "| Case | Group | Outcome | Kept | Notes |",
    "| --- | --- | --- | ---: | --- |"
  ];
  report.cases.forEach(function (entry) {
    var outcome = entry.result.kind === "error"
      ? "`" + entry.result.error + "`"
      : entry.result.servers.length + " server line(s)";
    lines.push(
      "| `" + entry.id + "` | " + entry.group + " | " + outcome + " | " +
        entry.result.servers.length + " | " + (entry.notes || "").replace(/\|/g, "/") + " |"
    );
  });
  lines.push("");
  return lines.join("\n");
}

function runAll() {
  assertParserSourceSync();
  checkLinkGuard();
  var manifest = loadManifest();
  var cases = manifest.cases.map(runCase);
  var failed = cases.filter(function (entry) { return !entry.ok; });
  var secretReport = secrets.scanTree();
  return {
    total: cases.length,
    passed: cases.length - failed.length,
    failed: failed,
    cases: cases,
    secrets: secretReport
  };
}

function printCheck(report) {
  report.cases.forEach(function (entry) {
    var mark = entry.ok ? "PASS" : "FAIL";
    var extra = entry.result.kind === "error"
      ? entry.result.error
      : entry.result.servers.length + " server(s)";
    console.log(mark + "  " + entry.id + "  (" + extra + ")");
    if (!entry.ok) {
      entry.failures.forEach(function (line) {
        console.log("      " + line.replace(/\n/g, "\n      "));
      });
    }
  });
  console.log("");
  console.log(report.passed + " passed, " + report.failed.length + " failed, " + report.total + " total");
  if (report.secrets.hits.length) {
    console.log("FAIL  secrets scan");
    report.secrets.hits.forEach(function (hit) {
      console.log("      " + hit.file + "  " + hit.reason + (hit.url ? "  " + hit.url : ""));
    });
  } else {
    console.log("PASS  secrets scan (" + report.secrets.files + " text files)");
  }
}

function writeGenerated(report) {
  gallery.writeGallery(report, GALLERY_PATH);
  fs.mkdirSync(path.dirname(MATRIX_PATH), { recursive: true });
  fs.writeFileSync(MATRIX_PATH, renderMatrix(report));
}

function assertGeneratedCurrent(report) {
  var html = gallery.render(report);
  var md = renderMatrix(report);
  var htmlOnDisk = fs.existsSync(GALLERY_PATH) ? fs.readFileSync(GALLERY_PATH, "utf8") : "";
  var mdOnDisk = fs.existsSync(MATRIX_PATH) ? fs.readFileSync(MATRIX_PATH, "utf8") : "";
  if (htmlOnDisk !== html || mdOnDisk !== md) {
    throw new Error("generated gallery/matrix is stale; run `npm run gallery`");
  }
  ["managed-full-profile", "reset-substring-trap", "html-interstitial"].forEach(function (id) {
    var dest = path.join(__dirname, "snapshots", id + ".html");
    var expected = gallery.renderOne(report, id);
    var onDisk = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : "";
    if (onDisk !== expected) {
      throw new Error("generated snapshot " + id + " is stale; run `npm run gallery`");
    }
  });
}

function dumpFile(relOrAbs) {
  var abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  var input = fs.readFileSync(abs, "utf8");
  var result = sandbox.parseResult(input);
  var classified = classify.classifyText(input);
  if (result.kind === "error") {
    console.log("$done.error");
    console.log(result.error);
  } else {
    console.log("$done.content");
    console.log(result.content);
  }
  console.log("");
  console.log("annotated body");
  classified.rows.forEach(function (row) {
    console.log(
      String(row.n).padStart(3, " ") + "  " +
        row.code.padEnd(12, " ") + "  " +
        (row.trimmed || "(blank)")
    );
  });
}

function why(line) {
  var row = classify.whyLine(line);
  var wrapped = "[server_local]\n" + line + "\n";
  var result = sandbox.parseResult(wrapped);
  console.log("line     " + row.trimmed);
  console.log("verdict  " + row.verdict);
  console.log("code     " + row.code);
  console.log("detail   " + row.detail);
  if (result.kind === "error") {
    console.log("parser   error: " + result.error);
  } else {
    console.log("parser   kept: " + (result.servers[0] || "(none)"));
  }
}

function usage() {
  console.log("Personal Nexitally parser bench");
  console.log("");
  console.log("  node bench/run.js --check");
  console.log("  node bench/run.js --dump <file>");
  console.log("  node bench/run.js --why \"<server line>\"");
  console.log("  node bench/run.js --gallery --write");
}

function main(argv) {
  if (argv.indexOf("--help") !== -1 || argv.length === 0) {
    usage();
    return 0;
  }
  if (argv.indexOf("--dump") !== -1) {
    var file = argv[argv.indexOf("--dump") + 1];
    if (!file) throw new Error("--dump needs a file");
    dumpFile(file);
    return 0;
  }
  if (argv.indexOf("--why") !== -1) {
    var line = argv[argv.indexOf("--why") + 1];
    if (!line) throw new Error("--why needs a server line");
    why(line);
    return 0;
  }

  var report = runAll();
  if (argv.indexOf("--gallery") !== -1 && argv.indexOf("--write") !== -1) {
    writeGenerated(report);
    console.log("wrote " + path.relative(ROOT, GALLERY_PATH));
    console.log("wrote " + path.relative(ROOT, MATRIX_PATH));
  }
  if (argv.indexOf("--check") !== -1) {
    printCheck(report);
    if (argv.indexOf("--write") === -1) {
      assertGeneratedCurrent(report);
      console.log("PASS  generated gallery/matrix current");
    }
    if (report.failed.length || report.secrets.hits.length) return 1;
  }
  return 0;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

exports.runAll = runAll;
exports.runCase = runCase;
exports.loadManifest = loadManifest;
