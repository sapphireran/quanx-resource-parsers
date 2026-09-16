#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SKIP_DIR = new Set([
  ".git",
  "node_modules",
  "tmp",
  "scratch",
  "local"
]);

const DOC_IPV4 = /^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|1\.1\.1\.1$|8\.8\.8\.8$|0\.)/;
const DOC_UUID = /^00000000-0000-4000-8000-000000000000$/i;
const DOC_URL_HOST = /(?:example\.invalid|example\.com|example\.org|githubusercontent\.com|jsdelivr\.net|github\.com)(?:[:/]|$)/i;

function walk(dir, files) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (SKIP_DIR.has(entry.name)) return;
    if (entry.name.startsWith(".") && entry.name !== ".gitignore" && entry.name !== ".gitattributes") {
      if (entry.isDirectory() && entry.name === ".github") {
        walk(path.join(dir, entry.name), files);
      }
      return;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      return;
    }
    files.push(full);
  });
}

function isTextFile(file) {
  return /\.(md|js|cjs|json|conf|txt|yml|yaml|html|gitignore|gitattributes)$/i.test(file)
    || path.basename(file) === "LICENSE";
}

function allMatches(text, source) {
  const re = new RegExp(source, "gi");
  const out = [];
  let match;
  while ((match = re.exec(text))) {
    out.push(match[0]);
    if (match[0].length === 0) re.lastIndex += 1;
  }
  return out;
}

function scanText(rel, text) {
  const findings = [];

  allMatches(text, "https?:\\/\\/[^\\s'\"<>]+").forEach(function (url) {
    if (DOC_URL_HOST.test(url)) return;
    if (/nexitally/i.test(url)) {
      findings.push({ file: rel, id: "live-nexitally-url", match: url, message: "looks like a live Nexitally URL" });
      return;
    }
    if (/[?&](?:token|auth|key|secret|sid|uid)=[A-Za-z0-9_\-]{8,}/i.test(url)) {
      findings.push({ file: rel, id: "tokenized-query", match: url, message: "URL query looks like a live token" });
    }
  });

  allMatches(text, "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b").forEach(function (ip) {
    if (DOC_IPV4.test(ip)) return;
    findings.push({ file: rel, id: "non-doc-ipv4", match: ip, message: "IPv4 is outside documentation ranges" });
  });

  allMatches(text, "\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b").forEach(function (uuid) {
    if (DOC_UUID.test(uuid)) return;
    findings.push({ file: rel, id: "non-doc-uuid", match: uuid, message: "UUID is not the documentation UUID" });
  });

  return findings;
}

function main() {
  const files = [];
  walk(ROOT, files);
  const textFiles = files.filter(isTextFile);
  const findings = [];

  textFiles.forEach(function (file) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, "utf8");
    Array.prototype.push.apply(findings, scanText(rel, text));
  });

  if (findings.length) {
    findings.forEach(function (item) {
      console.log("FAIL  " + item.file + "  " + item.id + "  " + item.message + "  " + item.match);
    });
    console.log("");
    console.log(findings.length + " secret-scan finding(s)");
    process.exit(1);
  }

  console.log("PASS  secrets scan (" + textFiles.length + " text files)");
}

main();
