"use strict";

/**
 * Keep/drop rules copied from nexitally-node-parser.js.
 * bench/run.js asserts these literals still appear in the parser file.
 */

exports.SECTION_RE =
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i;

exports.SUPPORTED_RE =
  /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;

exports.EXCLUDED_RE =
  /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;

exports.COMMENT_RE = /^(?:;|#|\/\/)/;

exports.EXCLUDED_TOKENS = [
  { token: "[Premium]", re: /\[Premium\]/i },
  { token: "Traffic", re: /Traffic/i },
  { token: "Expire", re: /Expire/i },
  { token: "Reset", re: /Reset/i },
  { token: "Days Left", re: /Days Left/i },
  { token: "流量", re: /流量/ },
  { token: "到期", re: /到期/ },
  { token: "剩余", re: /剩余/ },
  { token: "套餐", re: /套餐/ }
];

exports.SUPPORTED_PREFIXES = [
  "anytls",
  "shadowsocks",
  "vmess",
  "vless",
  "trojan",
  "http",
  "socks5"
];

exports.MISSING_SECTION =
  "Nexitally parser: [server_local] section was not found.";

exports.NO_USABLE_SERVERS =
  "Nexitally parser: no usable server entries were found.";

exports.PARSER_RELATIVE_PATH = "nexitally-node-parser.js";

exports.normalize = function normalize(raw) {
  return String(raw == null ? "" : raw)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
};

exports.excludedTokensIn = function excludedTokensIn(line) {
  return exports.EXCLUDED_TOKENS
    .filter(function (item) { return item.re.test(line); })
    .map(function (item) { return item.token; });
};
