"use strict";

const fs = require("fs");
const path = require("path");

const SKIP_DIR = new Set([
  ".git",
  "node_modules",
  ".cursor",
]);

const URI = /\b(?:vmess|vless|ss|ssr|trojan|hysteria2?):\/\//i;
const NEXITALLY_HOST = /\bnexitally\.[a-z0-9.-]+/i;
const TOKENISH =
  /(?:[?&]|[^\w])(?:token|auth|access_token|apikey|api_key)=[A-Za-z0-9._-]{12,}/i;
const LONG_HEX_UUID =
  /(?:uuid|password)\s*=\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const ALLOWED_UUID = "23ad6b10-8d1a-40f7-8ad0-e3e35cd32291";
const ALLOWED_REALITY = "k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk";

const ALLOWED_HOST_RE =
  /(?:example\.test|example\.com|apple\.com|icloud\.com|www\.apple\.com|raw\.githubusercontent\.com\/(?:sapphireran|crossutility|KOP-XIAO)\b|cdn\.jsdelivr\.net\/gh\/(?:sapphireran|pang990801)\b|github\.com\/(?:sapphireran|crossutility|KOP-XIAO)\b|shadowsocks\.org)/i;

function walk(dir, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const ent = entries[i];
    if (SKIP_DIR.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function isProbablyText(file) {
  return /\.(md|js|json|conf|txt|yml|yaml|html|gitignore|gitattributes)$/i.test(
    file
  ) || path.basename(file) === "LICENSE";
}

function hostAllowed(url) {
  return ALLOWED_HOST_RE.test(url);
}

function scanText(rel, text, findings) {
  if (NEXITALLY_HOST.test(text)) {
    findings.push({ file: rel, rule: "nexitally-host" });
  }
  if (URI.test(text) && !/URI schemes/.test(text)) {
    // Allow the word in docs; forbid actual URI payloads except the fixture
    // that documents DROP_SCHEME for vmess://example.test
    const lines = text.split(/\n/);
    lines.forEach(function (line, idx) {
      if (!URI.test(line)) return;
    if (/vmess:\/\/example\.test/.test(line)) return;
      if (/`(?:vmess|vless|ss|trojan):\/\//.test(line)) return;
      if (/vmess:\/\/ \/ vless:\/\/ \/ ss:\/\/ \/ trojan:\/\//.test(line)) return;
      findings.push({
        file: rel,
        rule: "proxy-uri",
        line: idx + 1,
        excerpt: line.trim().slice(0, 120),
      });
    });
  }
  if (TOKENISH.test(text)) {
    findings.push({ file: rel, rule: "token-query" });
  }

  const uuidLines = text.split(/\n/);
  uuidLines.forEach(function (line, idx) {
    if (!LONG_HEX_UUID.test(line)) return;
    if (line.indexOf(ALLOWED_UUID) !== -1) return;
    findings.push({
      file: rel,
      rule: "non-sample-uuid",
      line: idx + 1,
      excerpt: line.trim().slice(0, 120),
    });
  });

  const urlRe = /https?:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:\/[^\s,)'"`<>]*)?/gi;
  let m;
  while ((m = urlRe.exec(text))) {
    const full = m[0].replace(/[.,;:]+$/, "");
    if (hostAllowed(full)) continue;
    const host = full.replace(/^https?:\/\//i, "").split("/")[0];
    if (host === "localhost" || host === "127.0.0.1") continue;
    if (
      /^(dns\.alidns\.com|dns\.adguard\.com|doh\.pub)$/i.test(host) &&
      (rel.indexOf("docs/") === 0 || rel.indexOf("examples/") === 0)
    ) {
      continue;
    }
    findings.push({
      file: rel,
      rule: "url-host",
      excerpt: full.slice(0, 160),
    });
  }

  const realityRe = /reality-base64-pubkey=([A-Za-z0-9_-]+)/g;
  let rm;
  while ((rm = realityRe.exec(text))) {
    if (rm[1] !== ALLOWED_REALITY) {
      findings.push({
        file: rel,
        rule: "non-sample-reality",
        excerpt: rm[0],
      });
    }
  }
}

function scanRepo(root) {
  const files = walk(root, []);
  const findings = [];
  files.forEach(function (full) {
    if (!isProbablyText(full)) return;
    const rel = path.relative(root, full).split(path.sep).join("/");
    if (rel === "tools/_seed_cases.js" || rel === "tools/seed-cases.js") {
      // seed may mention the same placeholders; still scan it
    }
    const text = fs.readFileSync(full, "utf8");
    scanText(rel, text, findings);
  });
  return findings;
}

module.exports = {
  scanRepo,
};
