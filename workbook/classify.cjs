"use strict";

const SUPPORTED = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
const EXCLUDED = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
const COMMENT = /^(?:;|#|\/\/)/;
const SECTION = /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i;

function normalize(content) {
  return String(content || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
}

function sliceServerLocal(content) {
  const text = normalize(content);
  const match = text.match(SECTION);
  if (!match) {
    return { found: false, body: "", text: text };
  }
  return { found: true, body: match[1], text: text };
}

function classifyLine(line, seen) {
  const trimmed = String(line).trim();
  if (!trimmed) {
    return { action: "drop", reason: "empty", line: trimmed };
  }
  if (COMMENT.test(trimmed)) {
    return { action: "drop", reason: "comment", line: trimmed };
  }
  if (!SUPPORTED.test(trimmed)) {
    return { action: "drop", reason: "unsupported-prefix", line: trimmed };
  }
  if (EXCLUDED.test(trimmed)) {
    return { action: "drop", reason: "info-or-premium", line: trimmed };
  }
  if (seen[trimmed]) {
    return { action: "drop", reason: "duplicate", line: trimmed };
  }
  seen[trimmed] = true;
  return { action: "keep", reason: "server", line: trimmed };
}

function traceBody(body) {
  const seen = {};
  return String(body).split("\n").map(function (raw) {
    return classifyLine(raw, seen);
  });
}

module.exports = {
  SUPPORTED: SUPPORTED,
  EXCLUDED: EXCLUDED,
  normalize: normalize,
  sliceServerLocal: sliceServerLocal,
  classifyLine: classifyLine,
  traceBody: traceBody
};
