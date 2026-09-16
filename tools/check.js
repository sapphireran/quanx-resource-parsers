"use strict";

const fs = require("fs");
const path = require("path");
const { loadParserSource, runResourceParser, applyWrap } = require("./qx-vm");
const { assertParserSource } = require("./classify");
const { replayFile } = require("./ledger");
const { scanRepo } = require("./secrets");

const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "examples", "catalog.json");

function rel(p) {
  return p.split(path.sep).join("/");
}

function readUtf8(file) {
  return fs.readFileSync(file, "utf8");
}

function normalizeExpected(text) {
  return String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
}

function fail(failures, id, message) {
  failures.push({ id: id, message: message });
  console.error("FAIL  %s\n      %s", id, message);
}

function pass(id, detail) {
  console.log("ok    %s%s", id, detail ? "  " + detail : "");
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function contentLines(text) {
  if (text === "") return [];
  return text.split("\n");
}

function runCatalog(options) {
  const catalog = JSON.parse(readUtf8(CATALOG));
  const parserRel = catalog.parser || "nexitally-node-parser.js";
  const parserPath = path.join(ROOT, parserRel);
  const { source } = loadParserSource(parserPath);
  assertParserSource(source);

  const writeExpected = options.writeExpected;
  const writeReceipts = options.writeReceipts;
  const failures = [];
  let ok = 0;

  catalog.cases.forEach(function (entry) {
    const id = entry.id;
    const inputPath = path.join(ROOT, entry.input);
    const wrap = entry.wrap || null;
    const result = replayFile(inputPath, {
      parserPath: parserPath,
      wrap: wrap,
    });

    const keeps = result.classified.keeps;
    if (result.parsed.kind === "content") {
      const fromParser = contentLines(result.parsed.content);
      const same =
        fromParser.length === keeps.length &&
        fromParser.every(function (line, i) {
          return line === keeps[i];
        });
      if (!same) {
        fail(
          failures,
          id,
          "classifier keeps !== parser content\nparser:\n" +
            result.parsed.content +
            "\nkeeps:\n" +
            keeps.join("\n")
        );
        return;
      }
    } else if (result.classified.outcome.error !== result.parsed.error) {
      fail(
        failures,
        id,
        "classifier error !== parser error: " +
          JSON.stringify({
            parser: result.parsed.error,
            classify: result.classified.outcome.error,
          })
      );
      return;
    }

    if (entry.expect.kind === "content") {
      if (result.parsed.kind !== "content") {
        fail(failures, id, "expected content, got error: " + result.parsed.error);
        return;
      }
      const expectedPath = path.join(ROOT, entry.expect.file);
      if (writeExpected) {
        fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
        fs.writeFileSync(expectedPath, result.parsed.content + "\n", "utf8");
      }
      if (!fs.existsSync(expectedPath)) {
        fail(failures, id, "missing " + entry.expect.file + " (run with --write-expected)");
        return;
      }
      const expected = normalizeExpected(readUtf8(expectedPath)).replace(/\n$/, "");
      if (expected !== result.parsed.content) {
        fail(
          failures,
          id,
          "content mismatch\n--- expected ---\n" +
            expected +
            "\n--- actual ---\n" +
            result.parsed.content
        );
        return;
      }
    } else if (entry.expect.kind === "error") {
      if (result.parsed.kind !== "error") {
        fail(
          failures,
          id,
          "expected error, got content:\n" + result.parsed.content
        );
        return;
      }
      const expectedPath = path.join(ROOT, entry.expect.file);
      const expected = normalizeExpected(readUtf8(expectedPath)).replace(/\n$/, "");
      if (expected !== result.parsed.error) {
        fail(
          failures,
          id,
          "error mismatch: expected " +
            JSON.stringify(expected) +
            " got " +
            JSON.stringify(result.parsed.error)
        );
        return;
      }
    } else {
      fail(failures, id, "catalog expect.kind must be content or error");
      return;
    }

    const receiptPath = path.join(ROOT, entry.receipt);
    const receipt = result.receipt;
    receipt.id = id;
    receipt.title = entry.title;
    receipt.group = entry.group;
    if (writeReceipts) {
      fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
      fs.writeFileSync(receiptPath, stableStringify(receipt), "utf8");
    }
    if (!fs.existsSync(receiptPath)) {
      fail(failures, id, "missing receipt (run with --write-receipts)");
      return;
    }
    const onDisk = JSON.parse(readUtf8(receiptPath));
    if (JSON.stringify(onDisk) !== JSON.stringify(receipt)) {
      fail(failures, id, "receipt.json drifted; run with --write-receipts");
      return;
    }

    ok += 1;
    const detail =
      result.parsed.kind === "error"
        ? "error"
        : result.parsed.content.split("\n").filter(Boolean).length + " servers";
    pass(id, detail);
  });

  const findings = scanRepo(ROOT);
  if (findings.length) {
    findings.forEach(function (f) {
      fail(
        failures,
        "secrets",
        f.file +
          " [" +
          f.rule +
          "]" +
          (f.line ? ":" + f.line : "") +
          (f.excerpt ? " " + f.excerpt : "")
      );
    });
  } else {
    pass("secret-scan", findings.length + " findings");
  }

  const extra = runParserInvariants(parserPath);
  extra.forEach(function (item) {
    if (item.ok) {
      ok += 1;
      pass(item.id, item.detail);
    } else {
      fail(failures, item.id, item.message);
    }
  });

  return { ok: ok, fail: failures.length, failures: failures, catalog: catalog };
}

function runParserInvariants(parserPath) {
  const items = [];

  const missing = runResourceParser({
    parserPath: parserPath,
    content: undefined,
  });
  items.push(
    missing.kind === "error" && /server_local/.test(missing.error)
      ? { ok: true, id: "invariant-undefined-content", detail: "error" }
      : {
          ok: false,
          id: "invariant-undefined-content",
          message: JSON.stringify(missing),
        }
  );

  const bom = runResourceParser({
    parserPath: parserPath,
    content:
      "\uFEFF[server_local]\r\nanytls=tokyo-a.nodes.example.test:443, password=pwd, over-tls=true, tag=JP-A\r\n",
  });
  items.push(
    bom.kind === "content" && /tag=JP-A$/.test(bom.content)
      ? { ok: true, id: "invariant-inline-bom-crlf", detail: "1 server" }
      : {
          ok: false,
          id: "invariant-inline-bom-crlf",
          message: JSON.stringify(bom),
        }
  );

  const twice = applyWrap("[server_local]\nanytls=a.example.test:443, password=pwd, tag=A\n", {
    bom: true,
    crlf: true,
  });
  if (twice.charCodeAt(0) !== 0xfeff || twice.indexOf("\r\n") === -1) {
    items.push({
      ok: false,
      id: "invariant-apply-wrap",
      message: "wrap did not apply BOM/CRLF",
    });
  } else {
    items.push({ ok: true, id: "invariant-apply-wrap", detail: "bom+crlf" });
  }

  const src = loadParserSource(parserPath).source;
  items.push(
    /\$resource\.content/.test(src) && /\$done/.test(src)
      ? { ok: true, id: "invariant-parser-globals", detail: "$resource/$done" }
      : {
          ok: false,
          id: "invariant-parser-globals",
          message: "parser lost $resource.content or $done",
        }
  );

  items.push(
    /https?:\/\//i.test(src)
      ? {
          ok: false,
          id: "invariant-parser-has-no-url",
          message: "parser script contains a URL",
        }
      : { ok: true, id: "invariant-parser-has-no-url", detail: "no URL" }
  );

  return items;
}

function writeGallery(catalog) {
  const { renderGallery } = require("./gallery");
  const html = renderGallery(ROOT, catalog);
  const out = path.join(ROOT, "examples", "gallery.html");
  fs.writeFileSync(out, html, "utf8");
  return out;
}

function main(argv) {
  const options = {
    writeExpected: argv.indexOf("--write-expected") !== -1,
    writeReceipts: argv.indexOf("--write-receipts") !== -1,
    writeGallery: argv.indexOf("--write-gallery") !== -1,
  };
  const result = runCatalog(options);
  if (options.writeGallery || argv.indexOf("--write-gallery") !== -1) {
    const out = writeGallery(result.catalog);
    console.log("wrote %s", rel(path.relative(ROOT, out)));
  }
  console.log(
    "\n%d passed, %d failed, %d catalog cases",
    result.ok,
    result.fail,
    result.catalog.cases.length
  );
  if (result.fail) process.exit(1);
}

if (require.main === module) {
  main(process.argv);
}

module.exports = {
  runCatalog,
  writeGallery,
};
