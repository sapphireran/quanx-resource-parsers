"use strict";

/*
 * Line-level trace that must stay identical to nexitally-node-parser.js.
 * The atlas verifier treats a disagreement as a failed test.
 */

var SECTION_RE = /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i;
var SUPPORTED = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
var EXCLUDED = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
var COMMENT = /^(?:;|#|\/\/)/;

var ERROR_MISSING = "Nexitally parser: [server_local] section was not found.";
var ERROR_EMPTY = "Nexitally parser: no usable server entries were found.";

function normalize(raw) {
  return String(raw || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
}

function trace(raw) {
  var text = normalize(raw);
  var match = text.match(SECTION_RE);
  if (!match) {
    return {
      ok: false,
      error: ERROR_MISSING,
      sectionFound: false,
      traces: [],
      servers: []
    };
  }

  var seen = {};
  var traces = [];
  var servers = [];

  match[1].split("\n").forEach(function (rawLine, index) {
    var line = rawLine.trim();
    var rec = {
      index: index + 1,
      raw: rawLine,
      line: line,
      decision: "keep",
      reason: "usable-server"
    };

    if (!line) {
      rec.decision = "drop";
      rec.reason = "empty";
    } else if (COMMENT.test(line)) {
      rec.decision = "drop";
      rec.reason = "comment";
    } else if (!SUPPORTED.test(line)) {
      rec.decision = "drop";
      rec.reason = "unsupported";
    } else if (EXCLUDED.test(line)) {
      rec.decision = "drop";
      rec.reason = "excluded-metadata";
    } else if (seen[line]) {
      rec.decision = "drop";
      rec.reason = "duplicate";
    } else {
      seen[line] = true;
      servers.push(line);
    }

    traces.push(rec);
  });

  if (!servers.length) {
    return {
      ok: false,
      error: ERROR_EMPTY,
      sectionFound: true,
      traces: traces,
      servers: []
    };
  }

  return {
    ok: true,
    content: servers.join("\n"),
    sectionFound: true,
    traces: traces,
    servers: servers
  };
}

function toDone(traced) {
  if (!traced.ok) {
    return { error: traced.error };
  }
  return { content: traced.content };
}

module.exports = {
  ERROR_EMPTY: ERROR_EMPTY,
  ERROR_MISSING: ERROR_MISSING,
  toDone: toDone,
  trace: trace
};
