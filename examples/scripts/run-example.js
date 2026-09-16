#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { listCaseNames, loadCase } = require("./lib/cases");
const { runParser, normalizeExpected } = require("./lib/run-parser");

function printUsage() {
  console.log("Usage:");
  console.log("  node examples/scripts/run-example.js --list");
  console.log("  node examples/scripts/run-example.js <case>");
  console.log("  node examples/scripts/run-example.js <case> --write-expected");
  console.log("");
  console.log("Cases:");
  listCaseNames().forEach(function (name) {
    console.log("  " + name);
  });
}

function summarizeInput(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const sections = [];
  const sectionRe = /^\s*\[([^\]]+)\]\s*$/;
  lines.forEach(function (line) {
    const match = line.match(sectionRe);
    if (match) sections.push(match[1]);
  });
  return {
    bytes: Buffer.byteLength(raw, "utf8"),
    lines: lines.length,
    hasBom: /^\uFEFF/.test(raw),
    hasCrlf: /\r\n/.test(raw),
    sections: sections
  };
}

function main(argv) {
  const args = argv.slice(2).filter(function (arg) {
    return arg !== "";
  });

  if (args.length === 0 || args.indexOf("--help") !== -1 || args.indexOf("-h") !== -1) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args[0] === "--list") {
    listCaseNames().forEach(function (name) {
      const example = loadCase(name);
      const kind = example.expected.error != null ? "error" : "servers";
      console.log(name + "\t" + kind);
    });
    return;
  }

  const writeExpected = args.indexOf("--write-expected") !== -1;
  const name = args.filter(function (arg) {
    return arg !== "--write-expected";
  })[0];

  if (!name) {
    printUsage();
    process.exit(1);
  }

  const example = loadCase(name);
  const summary = summarizeInput(example.input);
  const ran = runParser(example.input);

  console.log("case:     " + example.name);
  console.log("input:    " + path.relative(process.cwd(), example.inputPath));
  console.log(
    "shape:    " +
      summary.bytes +
      " bytes, " +
      summary.lines +
      " lines, sections=[" +
      summary.sections.join(", ") +
      "]"
  );
  console.log(
    "flags:    BOM=" +
      (summary.hasBom ? "yes" : "no") +
      " CRLF=" +
      (summary.hasCrlf ? "yes" : "no")
  );
  if (example.notes) {
    console.log("");
    console.log(example.notes.replace(/\s+$/, ""));
  }

  console.log("");
  if (ran.error) {
    console.log("parser error:");
    console.log("  " + ran.error);
  } else {
    const lines = ran.content ? ran.content.split("\n") : [];
    console.log("parser servers (" + lines.length + "):");
    lines.forEach(function (line) {
      console.log("  " + line);
    });
  }

  if (writeExpected) {
    if (ran.error) {
      const file = path.join(example.dir, "expected-error.txt");
      fs.writeFileSync(file, normalizeExpected(ran.error) + "\n");
      const stale = path.join(example.dir, "expected.txt");
      if (fs.existsSync(stale)) fs.unlinkSync(stale);
      console.log("");
      console.log("wrote " + path.relative(process.cwd(), file));
    } else {
      const file = path.join(example.dir, "expected.txt");
      fs.writeFileSync(file, normalizeExpected(ran.content) + "\n");
      const stale = path.join(example.dir, "expected-error.txt");
      if (fs.existsSync(stale)) fs.unlinkSync(stale);
      console.log("");
      console.log("wrote " + path.relative(process.cwd(), file));
    }
  }
}

main(process.argv);
