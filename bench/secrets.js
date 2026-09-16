"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");

var SKIP_DIRS = {
  ".git": true,
  node_modules: true,
  tmp: true,
  scratch: true,
  secrets: true
};

var TEXT_EXT = {
  ".js": true,
  ".md": true,
  ".json": true,
  ".conf": true,
  ".keep": true,
  ".yml": true,
  ".yaml": true,
  ".html": true,
  ".txt": true,
  ".gitignore": true
};

var ALLOWED_HOST = new RegExp(
  [
    "example\\.com",
    "example\\.net",
    "example\\.org",
    "example\\.invalid",
    "apple\\.com",
    "bing\\.com",
    "www\\.google\\.com",
    "raw\\.githubusercontent\\.com/(?:crossutility|sapphireran)/",
    "github\\.com/(?:crossutility|sapphireran)/",
    "cdn\\.jsdelivr\\.net/gh/sapphireran/",
    "cursor\\.com"
  ].join("|"),
  "i"
);

var URL_RE = /https?:\/\/[^\s"'`<>]+/gi;
var LIVE_HINT_RE =
  /nexitally\.(?:com|net|cc|app)|subscription[\w-]*\.(?:com|net)|\/api\/v\d+\/client\/subscribe/i;

function walk(dir, files) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (entry.name.startsWith(".") && entry.name !== ".gitignore" && entry.name !== ".gitattributes") {
      if (entry.name !== ".github") return;
    }
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS[entry.name]) return;
      walk(full, files);
      return;
    }
    var ext = path.extname(entry.name);
    if (!TEXT_EXT[ext] && entry.name !== ".gitignore") return;
    files.push(full);
  });
}

function scanTree() {
  var files = [];
  walk(ROOT, files);
  var hits = [];

  files.forEach(function (file) {
    var rel = path.relative(ROOT, file);
    var text = fs.readFileSync(file, "utf8");
    if (LIVE_HINT_RE.test(text)) {
      hits.push({ file: rel, reason: "live-subscription-hint" });
    }
    var urls = text.match(URL_RE) || [];
    urls.forEach(function (url) {
      var cleaned = url.replace(/[.,);]+$/, "");
      if (cleaned.indexOf("YOUR_PRIVATE_NEXITALLY") !== -1) return;
      if (ALLOWED_HOST.test(cleaned)) return;
      hits.push({ file: rel, reason: "disallowed-url", url: cleaned });
    });
  });

  return { files: files.length, hits: hits };
}

exports.scanTree = scanTree;
