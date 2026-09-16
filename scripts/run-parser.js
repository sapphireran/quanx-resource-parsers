#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parseNexitallyResource } = require("../nexitally-node-parser.js");

function usage() {
  process.stderr.write(
    "usage: node scripts/run-parser.js <managed-config-file> [--json]\n"
  );
}

function main(argv) {
  const args = argv.slice(2).filter(Boolean);
  const json = args.includes("--json");
  const files = args.filter((arg) => arg !== "--json");

  if (files.length !== 1) {
    usage();
    process.exitCode = 2;
    return;
  }

  const inputPath = path.resolve(files[0]);
  const raw = fs.readFileSync(inputPath, "utf8");
  const result = parseNexitallyResource(raw);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.error ? 1 : 0;
    return;
  }

  if (result.error) {
    process.stderr.write(`${result.error}\n`);
    process.exitCode = 1;
    return;
  }

  const body = result.content.endsWith("\n")
    ? result.content
    : `${result.content}\n`;
  process.stdout.write(body);
}

main(process.argv);
