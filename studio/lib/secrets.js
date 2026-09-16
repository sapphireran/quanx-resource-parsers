"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "scratch",
  "secrets",
  "tmp",
]);

const ALLOWED_HOST_RE = new RegExp(
  [
    "example\\.com",
    "example\\.invalid",
    "apple\\.com",
    "www\\.apple\\.com",
    "www\\.google\\.com",
    "www\\.example\\.com",
    "bing\\.com",
    "github\\.com/sapphireran",
    "github\\.com/crossutility/Quantumult-X",
    "raw\\.githubusercontent\\.com/sapphireran",
    "raw\\.githubusercontent\\.com/crossutility/Quantumult-X",
    "cdn\\.jsdelivr\\.net/gh/sapphireran",
    "cursor\\.com",
    "json-schema\\.org",
  ].join("|"),
  "i"
);

const SAMPLE_SECRETS = new Set([
  "pwd",
  "name",
  "23ad6b10-8d1a-40f7-8ad0-e3e35cd32291",
  "BJDBGeLKx/JbEACCSN5rRg==",
  "RBUjIfGi9eThH+rkxXI0j1EdSGAZEf1jN9x1vn+Tf04=",
  "k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk",
  "0123456789abcdef",
  "eb5ec6684564fd0d04975903ed75342d1b9fdc2096ea54b4cf8caf4740f4ae25",
  "b0088370d6c8e02d6e38c443abf81be2aaf1e18f00435aaf0b39852c338f7aaa",
  "YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL",
  "example-password",
]);

const FORBIDDEN_HOST_RE = /(?:nexitally\.com|nexilab\.net|instagram\.com|twitter\.com|x\.com|linkedin\.com)\b/i;

const URL_RE = /https?:\/\/[^\s"'`<>]+/gi;
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const PASSWORD_RE = /\bpassword\s*=\s*([^,\s]+)/gi;

function walk(dir, files) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (SKIP_DIRS.has(entry.name)) return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      return;
    }
    if (!/\.(md|js|json|conf|txt|html|yml|yaml|snippet)$/i.test(entry.name)) return;
    files.push(full);
  });
}

function scanFile(file) {
  const rel = path.relative(ROOT, file);
  const text = fs.readFileSync(file, "utf8");
  const hits = [];

  let match;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text))) {
    const url = match[0].replace(/[.,);]+$/, "");
    if (url.indexOf("YOUR_PRIVATE") !== -1) continue;
    if (ALLOWED_HOST_RE.test(url)) continue;
    if (/^https?:\/\/(127\.0\.0\.1|localhost)\b/i.test(url)) continue;
    hits.push({ file: rel, kind: "url", value: url });
  }

  if (FORBIDDEN_HOST_RE.test(text)) {
    hits.push({ file: rel, kind: "forbidden-host", value: text.match(FORBIDDEN_HOST_RE)[0] });
  }

  UUID_RE.lastIndex = 0;
  while ((match = UUID_RE.exec(text))) {
    if (SAMPLE_SECRETS.has(match[0].toLowerCase()) || SAMPLE_SECRETS.has(match[0])) continue;
    hits.push({ file: rel, kind: "uuid", value: match[0] });
  }

  PASSWORD_RE.lastIndex = 0;
  while ((match = PASSWORD_RE.exec(text))) {
    const value = match[1];
    if (SAMPLE_SECRETS.has(value)) continue;
    if (/^pwd$/i.test(value)) continue;
    hits.push({ file: rel, kind: "password", value: value });
  }

  return hits;
}

function scanRepo() {
  const files = [];
  walk(ROOT, files);
  const hits = [];
  files.forEach(function (file) {
    Array.prototype.push.apply(hits, scanFile(file));
  });
  return { files: files.length, hits };
}

module.exports = { scanRepo, scanFile, ROOT };
