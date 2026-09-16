"use strict";

const {
  SECTION,
  SUPPORTED,
  EXCLUDED,
  COMMENT,
  ERROR_NO_SECTION,
  ERROR_NO_USABLE,
  CODES,
  normalize,
  exclusionToken,
} = require("./reasons");

function classifyLine(trimmed, seen) {
  if (!trimmed) {
    return { code: CODES.DROP_EMPTY, detail: "blank after trim" };
  }
  if (COMMENT.test(trimmed)) {
    return { code: CODES.DROP_COMMENT, detail: "comment prefix ; # or //" };
  }
  if (!SUPPORTED.test(trimmed)) {
    return { code: CODES.DROP_UNSUPPORTED, detail: "prefix is not a supported Quantumult X server scheme" };
  }
  if (EXCLUDED.test(trimmed)) {
    return {
      code: CODES.DROP_EXCLUDED,
      detail: "exclusion substring " + JSON.stringify(exclusionToken(trimmed)),
    };
  }
  if (seen[trimmed]) {
    return { code: CODES.DROP_DUPLICATE, detail: "exact trimmed line already kept" };
  }
  seen[trimmed] = true;
  return { code: CODES.KEEP, detail: "supported server line" };
}

function sectionBounds(normalized) {
  const match = normalized.match(SECTION);
  if (!match) return null;
  const captured = match[1];
  const capturedStart = match.index + match[0].length - captured.length;
  const capturedEnd = capturedStart + captured.length;
  return { captured, capturedStart, capturedEnd, match };
}

function explain(content) {
  const normalized = normalize(content);
  const bounds = sectionBounds(normalized);
  const lines = [];
  const kept = [];

  if (!bounds) {
    const rawLines = normalized.length ? normalized.split("\n") : [""];
    rawLines.forEach(function (raw, index) {
      lines.push({
        index,
        raw,
        trimmed: raw.trim(),
        region: "file",
        code: CODES.ERROR_NO_SECTION,
        detail: "no [server_local] header followed by a newline",
      });
    });
    return {
      error: ERROR_NO_SECTION,
      kept,
      lines,
      codes: { [CODES.ERROR_NO_SECTION]: rawLines.length },
    };
  }

  const normalizedLines = normalized.split("\n");
  let offset = 0;
  const seen = {};

  normalizedLines.forEach(function (raw, index) {
    const lineStart = offset;
    const lineEnd = offset + raw.length;
    offset += raw.length + 1;

    const inSection = lineStart >= bounds.capturedStart && lineStart < bounds.capturedEnd;
    const trimmed = raw.trim();

    if (!inSection) {
      const isHeader = /^\s*\[server_local\]\s*$/i.test(raw) && lineEnd <= bounds.capturedStart;
      lines.push({
        index,
        raw,
        trimmed,
        region: isHeader ? "header" : (lineEnd <= bounds.capturedStart ? "preamble" : "after"),
        code: isHeader ? CODES.SECTION_HEADER : CODES.OUTSIDE_SECTION,
        detail: isHeader
          ? "section header; capture starts on the following line"
          : "outside the first [server_local] capture",
      });
      return;
    }

    const decision = classifyLine(trimmed, seen);
    if (decision.code === CODES.KEEP) kept.push(trimmed);
    lines.push({
      index,
      raw,
      trimmed,
      region: "section",
      code: decision.code,
      detail: decision.detail,
    });
  });

  const error = kept.length ? null : ERROR_NO_USABLE;
  if (error) {
    lines.push({
      index: normalizedLines.length,
      raw: "",
      trimmed: "",
      region: "result",
      code: CODES.ERROR_NO_USABLE,
      detail: "section matched but no KEEP lines remain",
    });
  }

  const codes = {};
  lines.forEach(function (row) {
    codes[row.code] = (codes[row.code] || 0) + 1;
  });

  return { error, kept, lines, codes };
}

function explainOneLine(line) {
  const wrapped =
    "[server_local]\n" + String(line == null ? "" : line).replace(/\r\n/g, "\n") + "\n";
  return explain(wrapped);
}

function compactTrace(result) {
  return {
    error: result.error,
    kept: result.kept,
    lines: result.lines.map(function (row) {
      return {
        index: row.index,
        trimmed: row.trimmed,
        region: row.region,
        code: row.code,
        detail: row.detail,
      };
    }),
  };
}

module.exports = { explain, explainOneLine, compactTrace, classifyLine };
