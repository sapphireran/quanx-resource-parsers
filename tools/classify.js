"use strict";

/**
 * Keep/drop classifier that mirrors nexitally-node-parser.js.
 *
 * Regexes are duplicated on purpose so a receipt can name a needle.
 * tools/check.js asserts they still appear in the parser source and that
 * KEEP lines equal $done({content}).
 */

const SECTION =
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i;
const SUPPORTED =
  /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
const EXCLUDED =
  /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
const COMMENT = /^(?:;|#|\/\/)/;

const PARSER_MUST_CONTAIN = [
  String.raw`(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)`,
  String.raw`(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)`,
  String.raw`(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)`,
];

function normalize(content) {
  return String(content == null ? "" : content)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
}

function infoNeedle(line) {
  const m = line.match(EXCLUDED);
  return m ? m[0] : null;
}

function classifyInsideLine(raw, seen) {
  const text = raw.trim();
  if (!text) {
    return { decision: "BLANK", text: "" };
  }
  if (COMMENT.test(text)) {
    return { decision: "COMMENT", text: text };
  }
  if (!SUPPORTED.test(text)) {
    return { decision: "DROP_SCHEME", text: text };
  }
  const needle = infoNeedle(text);
  if (needle) {
    return { decision: "DROP_INFO", text: text, needle: needle };
  }
  if (seen[text]) {
    return {
      decision: "DROP_DUPLICATE",
      text: text,
      firstIndex: seen[text],
    };
  }
  seen[text] = Object.keys(seen).length + 1;
  return { decision: "KEEP", text: text };
}

function splitLines(block) {
  if (block === "") return [];
  return block.split("\n");
}

function classify(content) {
  const text = normalize(content);
  const match = text.match(SECTION);

  if (!match) {
    const lines = splitLines(text).map(function (raw) {
      return {
        where: "outside",
        decision: "OUTSIDE_BEFORE",
        text: raw.trim(),
        raw: raw,
      };
    });
    return {
      found: false,
      endReason: "no-section",
      nextHeader: null,
      keeps: [],
      outcome: {
        kind: "error",
        error: "Nexitally parser: [server_local] section was not found.",
      },
      lines: lines,
    };
  }

  const full = match[0];
  const body = match[1];
  const start = match.index;
  const end = start + full.length;
  const before = text.slice(0, start);
  const after = text.slice(end);

  const lines = [];
  splitLines(before.replace(/\n$/, "")).forEach(function (raw) {
    if (start === 0 && before === "") return;
    lines.push({
      where: "before",
      decision: "OUTSIDE_BEFORE",
      text: raw.trim(),
      raw: raw,
    });
  });

  const headerMatch = full.match(/^\s*\[server_local\]\s*$/im);
  lines.push({
    where: "header",
    decision: "HEADER",
    text: headerMatch ? headerMatch[0].trim() : "[server_local]",
    raw: headerMatch ? headerMatch[0] : "[server_local]",
  });

  const seen = {};
  const keeps = [];
  splitLines(body).forEach(function (raw) {
    const row = classifyInsideLine(raw, seen);
    row.where = "inside";
    row.raw = raw;
    if (row.decision === "KEEP") keeps.push(row.text);
    lines.push(row);
  });

  let endReason = "eof";
  let nextHeader = null;
  const afterTrim = after.replace(/^\n/, "");
  const next = afterTrim.match(/^\s*(\[[^\]]+\])/);
  if (next) {
    endReason = "next-section";
    nextHeader = next[1];
    lines.push({
      where: "cut",
      decision: "SECTION_CUT",
      text: nextHeader,
      raw: next[0],
    });
    splitLines(afterTrim.replace(/^[^\n]*\n?/, "")).forEach(function (raw) {
      lines.push({
        where: "after",
        decision: "OUTSIDE_AFTER",
        text: raw.trim(),
        raw: raw,
      });
    });
  } else if (afterTrim) {
    splitLines(afterTrim).forEach(function (raw) {
      lines.push({
        where: "after",
        decision: "OUTSIDE_AFTER",
        text: raw.trim(),
        raw: raw,
      });
    });
  }

  const outcome =
    keeps.length === 0
      ? {
          kind: "error",
          error: "Nexitally parser: no usable server entries were found.",
        }
      : { kind: "content", content: keeps.join("\n"), lineCount: keeps.length };

  return {
    found: true,
    endReason: endReason,
    nextHeader: nextHeader,
    keeps: keeps,
    outcome: outcome,
    lines: lines,
  };
}

function assertParserSource(source) {
  const missing = PARSER_MUST_CONTAIN.filter(function (needle) {
    return source.indexOf(needle) === -1;
  });
  if (missing.length) {
    throw new Error(
      "parser source drifted from classify.js regexes:\n" + missing.join("\n")
    );
  }
}

module.exports = {
  SECTION,
  SUPPORTED,
  EXCLUDED,
  COMMENT,
  PARSER_MUST_CONTAIN,
  normalize,
  classify,
  assertParserSource,
};
