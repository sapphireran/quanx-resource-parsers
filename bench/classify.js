"use strict";

var rules = require("./rules");

function classifyLine(line, seen) {
  var trimmed = String(line || "").trim();
  if (!trimmed) {
    return { verdict: "drop", code: "empty", detail: "blank after trim" };
  }
  if (rules.COMMENT_RE.test(trimmed)) {
    return { verdict: "drop", code: "comment", detail: "starts with ; # or //" };
  }
  if (!rules.SUPPORTED_RE.test(trimmed)) {
    return {
      verdict: "drop",
      code: "unsupported",
      detail: "prefix is not anytls|shadowsocks|vmess|vless|trojan|http|socks5"
    };
  }
  var tokens = rules.excludedTokensIn(trimmed);
  if (tokens.length) {
    return {
      verdict: "drop",
      code: "excluded",
      detail: "matched " + tokens.join(", "),
      tokens: tokens
    };
  }
  if (seen[trimmed]) {
    return { verdict: "drop", code: "duplicate", detail: "exact line already kept" };
  }
  seen[trimmed] = true;
  return { verdict: "keep", code: "keep", detail: "supported server line" };
}

function classifyText(raw) {
  var text = rules.normalize(raw);
  var match = text.match(rules.SECTION_RE);

  if (!match) {
    return {
      found: false,
      header: null,
      terminator: null,
      body: "",
      rows: [],
      kept: [],
      error: rules.MISSING_SECTION
    };
  }

  var body = match[1];
  var seen = {};
  var rows = body.split("\n").map(function (line, index) {
    var decision = classifyLine(line, seen);
    return {
      n: index + 1,
      raw: line,
      trimmed: line.trim(),
      verdict: decision.verdict,
      code: decision.code,
      detail: decision.detail,
      tokens: decision.tokens || []
    };
  });

  var kept = rows
    .filter(function (row) { return row.verdict === "keep"; })
    .map(function (row) { return row.trimmed; });

  var after = text.slice(match.index + match[0].length);
  var terminator = null;
  var term = after.match(/^\s*(\[[^\]]+\])/);
  if (term) terminator = term[1];

  var headerMatch = text
    .slice(0, match.index + match[0].length - body.length)
    .match(/\[server_local\]/i);

  return {
    found: true,
    header: headerMatch ? headerMatch[0] : "[server_local]",
    terminator: terminator,
    body: body,
    rows: rows,
    kept: kept,
    error: kept.length ? null : rules.NO_USABLE_SERVERS
  };
}

function whyLine(line) {
  var wrapped = "[server_local]\n" + String(line) + "\n";
  var classified = classifyText(wrapped);
  return classified.rows[0] || {
    n: 1,
    raw: line,
    trimmed: String(line).trim(),
    verdict: "drop",
    code: "empty",
    detail: "no line"
  };
}

exports.classifyLine = classifyLine;
exports.classifyText = classifyText;
exports.whyLine = whyLine;
