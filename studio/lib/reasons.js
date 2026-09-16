"use strict";

/**
 * Reason codes documented in handbook/04-keep-drop-reason-codes.md.
 * Regular expressions are copied from nexitally-node-parser.js so the
 * studio cannot invent a second keep/drop language.
 */

const SECTION = /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i;
const SUPPORTED = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
const EXCLUDED = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
const COMMENT = /^(?:;|#|\/\/)/;

const ERROR_NO_SECTION = "Nexitally parser: [server_local] section was not found.";
const ERROR_NO_USABLE = "Nexitally parser: no usable server entries were found.";

const CODES = Object.freeze({
  KEEP: "KEEP",
  DROP_EMPTY: "DROP_EMPTY",
  DROP_COMMENT: "DROP_COMMENT",
  DROP_UNSUPPORTED: "DROP_UNSUPPORTED",
  DROP_EXCLUDED: "DROP_EXCLUDED",
  DROP_DUPLICATE: "DROP_DUPLICATE",
  OUTSIDE_SECTION: "OUTSIDE_SECTION",
  SECTION_HEADER: "SECTION_HEADER",
  ERROR_NO_SECTION: "ERROR_NO_SECTION",
  ERROR_NO_USABLE: "ERROR_NO_USABLE",
});

function normalize(content) {
  return String(content || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
}

function exclusionToken(line) {
  const found = String(line).match(EXCLUDED);
  return found ? found[0] : null;
}

module.exports = {
  SECTION,
  SUPPORTED,
  EXCLUDED,
  COMMENT,
  ERROR_NO_SECTION,
  ERROR_NO_USABLE,
  CODES,
  normalize,
  exclusionToken,
};
