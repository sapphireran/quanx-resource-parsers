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

const ALLOWED_HOST_RE = /(?:example\.invalid|example\.com|example\.org|githubusercontent\.com|jsdelivr\.net|github\.com|quantumult\.app)/i;

const CHECKS = [
  {
    id: "live-nexitally-url",
    re: /https?:\/\/[^\s'"]*nexitally[^\s'"]+/i,
    allow: function (match, text) {
      return /do not|never|must not|placeholder|fictional|YOUR_PRIVATE/i.test(text);
    },
    message: "looks like a live Nexitally URL"
  },
  {
    id: "tokenized-query",
    re: /https?:\/\/[^\s'"]+[?&](?:token|auth|key|secret|sid|uid)=[A-Za-z0-9_\-]{8,}/i,
    allow: function () { return false; },
    message: "URL query looks like a live token"
  },
  {
    id: "non-doc-ipv4",
    re: /\b(?!192\.0\.2\.)(?!198\.51\.100\.)(?!203\.0\.113\.)(?!127\.)(?!0\.)(?!1\.)(?!8\.8\.8\.)(?!1\.1\.1\.)(?:\d{1,3}\.){3}\d{1,3}\b/g,
    allow: function (match) {
      return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(match) === false
        && ALLOWED_HOST_RE.test(match) === false
        ? false
        : /^(10\.|192\.168\.|172\.)/.test(match);
    },
    message: "IPv4 is outside documentation ranges"
  },
  {
    id: "non-doc-uuid",
    re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    allow: function (match) {
      return /^00000000-0000-4000-8000-000000000000$/i.test(match);
    },
    message: "UUID is not the documentation UUID"
  }
];

function walk(dir, files) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (SKIP_DIR.has(entry.name)) return;
    if (entry.name.startsWith(".") && entry.name !== ".gitignore" && entry.name !== ".gitattributes") return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      return;
    }
    if (!/\.(md|js|cjs|json|conf|txt|yml|yaml|html|snippet\.conf)$/i.test(entry.name)
      && !/^\.(gitignore|gitattributes)$/.test(entry.name)
      && path.basename(full) !== "LICENSE") {
      if (/\.(png|jpg|jpeg|gif|webp|mp4)$/i.test(entry.name)) return;
    }
    files.push(full);
  });
}

function isTextFile(file) {
  return /\.(md|js|cjs|json|conf|txt|yml|yaml|html|gitignore|gitattributes)$/i.test(file)
    || path.basename(file) === "LICENSE";
}

function main() {
  const files = [];
  walk(ROOT, files);
  const findings = [];

  files.filter(isTextFile).forEach(function (file) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, "utf8");
    CHECKS.forEach(function (check) {
      const re = new RegExp(check.re.source, check.re.flags);
      let match;
      while ((match = re.exec(text))) {
        if (check.allow(match[0], text, rel)) continue;
        if (check.id === "non-doc-ipv4") {
          const m = match[0];
          if (/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|127\.|0\.|1\.1\.1\.|8\.8\.8\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(m)) {
            continue;
          }
          // Also allow 1.1.1.1 and 8.8.8.8 already handled. Skip tiny version-like 1.0.0 if any.
          if (/^(\d+\.){3}\d+$/.test(m) === false) continue;
        }
        findings.push({
          file: rel,
          id: check.id,
          match: match[0],
          message: check.message
        });
      }
    });
  });

  if (findings.length) {
    findings.forEach(function (item) {
      console.log("FAIL  " + item.file + "  " + item.id + "  " + item.message + "  " + item.match);
    });
    console.log("");
    console.log(findings.length + " secret-scan finding(s)");
    process.exit(1);
  }

  console.log("PASS  secrets scan (" + files.filter(isTextFile).length + " text files)");
}

main();
