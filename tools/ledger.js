"use strict";

const fs = require("fs");
const path = require("path");
const { runResourceParser } = require("./qx-vm");
const { classify } = require("./classify");

function readInput(file, wrap) {
  const content = fs.readFileSync(file);
  // Preserve bytes then decode as utf8 so an empty file stays empty.
  const text = content.length === 0 ? "" : content.toString("utf8");
  return { text: text, wrap: wrap || null };
}

function buildReceipt(inputPath, wrap, parserResult, classified) {
  return {
    input: inputPath.split(path.sep).join("/"),
    wrap: wrap || null,
    section: {
      found: classified.found,
      endReason: classified.endReason,
      nextHeader: classified.nextHeader,
    },
    parser: parserResult.kind === "error"
      ? { kind: "error", error: parserResult.error }
      : {
          kind: "content",
          lineCount: parserResult.content
            ? parserResult.content.split("\n").filter(Boolean).length
            : 0,
        },
    classifier: classified.outcome,
    lines: classified.lines.map(function (row) {
      const out = {
        where: row.where,
        decision: row.decision,
        text: row.text,
      };
      if (row.needle) out.needle = row.needle;
      if (row.firstIndex) out.firstIndex = row.firstIndex;
      return out;
    }),
  };
}

function replayFile(inputPath, options) {
  options = options || {};
  const wrap = options.wrap || null;
  const parsed = runResourceParser({
    parserPath: options.parserPath,
    content: fs.existsSync(inputPath)
      ? fs.readFileSync(inputPath, "utf8")
      : "",
    wrap: wrap,
    tag: options.tag,
    link: "file://" + inputPath.split(path.sep).join("/"),
  });
  const wrapped = require("./qx-vm").applyWrap(
    fs.existsSync(inputPath) ? fs.readFileSync(inputPath, "utf8") : "",
    wrap
  );
  const classified = classify(wrapped);
  const receipt = buildReceipt(inputPath, wrap, parsed, classified);
  return { parsed: parsed, classified: classified, receipt: receipt };
}

function main(argv) {
  const file = argv[2];
  if (!file) {
    console.error("usage: node tools/ledger.js <file.conf> [--bom] [--crlf]");
    process.exit(2);
  }
  const wrap = {
    bom: argv.indexOf("--bom") !== -1,
    crlf: argv.indexOf("--crlf") !== -1,
  };
  if (!wrap.bom && !wrap.crlf) {
    wrap.bom = false;
    wrap.crlf = false;
  }
  const result = replayFile(file, {
    wrap: wrap.bom || wrap.crlf ? wrap : null,
  });

  const keeps = result.classified.keeps;
  if (result.parsed.kind === "content") {
    const fromParser = result.parsed.content.split("\n");
    const same =
      fromParser.length === keeps.length &&
      fromParser.every(function (line, i) {
        return line === keeps[i];
      });
    if (!same) {
      console.error("classifier KEEP lines drifted from parser output");
      process.exit(1);
    }
  } else if (result.classified.outcome.error !== result.parsed.error) {
    console.error("classifier error drifted from parser error");
    console.error(" parser:", result.parsed.error);
    console.error(" classify:", result.classified.outcome.error);
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(result.receipt, null, 2) + "\n");
}

if (require.main === module) {
  main(process.argv);
}

module.exports = {
  replayFile,
  buildReceipt,
  readInput,
};
