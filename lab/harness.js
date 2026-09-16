"use strict";

/**
 * Local Quantumult X resource-parser sandbox for this personal repo.
 *
 * Quantumult X injects `$resource` and `$done` when it evaluates a parser.
 * HTTP, $notify, and persistent storage are not available in that sandbox
 * (see the official resource-parser.js comments). This harness mirrors that
 * surface so fixtures can be replayed with Node.js 18+.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PARSER_PATH = path.resolve(__dirname, "..", "nexitally-node-parser.js");
const REPO_ROOT = path.resolve(__dirname, "..");

const SUPPORTED = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
const EXCLUDED = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
const COMMENT = /^(?:;|#|\/\/)/;
const SECTION = /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i;

function loadParserSource() {
  return fs.readFileSync(PARSER_PATH, "utf8");
}

function normalizeInput(raw) {
  return String(raw || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
}

function classifyLine(rawLine) {
  const trimmed = String(rawLine).replace(/\r$/, "").trim();
  if (!trimmed) {
    return { decision: "drop", reason: "empty-or-whitespace", line: trimmed };
  }
  if (COMMENT.test(trimmed)) {
    return { decision: "drop", reason: "comment", line: trimmed };
  }
  if (!SUPPORTED.test(trimmed)) {
    return { decision: "drop", reason: "unsupported-prefix", line: trimmed };
  }
  if (EXCLUDED.test(trimmed)) {
    return { decision: "drop", reason: "info-or-premium", line: trimmed };
  }
  return { decision: "keep-candidate", reason: "supported-server", line: trimmed };
}

function explainText(raw) {
  const text = normalizeInput(raw);
  const match = text.match(SECTION);
  if (!match) {
    return {
      ok: false,
      error: "Nexitally parser: [server_local] section was not found.",
      sectionFound: false,
      lines: [],
      kept: [],
    };
  }

  const seen = Object.create(null);
  const lines = match[1].split("\n").map(function (rawLine, index) {
    const classified = classifyLine(rawLine);
    const record = {
      index: index + 1,
      raw: rawLine.replace(/\r$/, ""),
      line: classified.line,
      decision: classified.decision,
      reason: classified.reason,
    };
    if (classified.decision === "keep-candidate") {
      if (seen[classified.line]) {
        record.decision = "drop";
        record.reason = "duplicate";
      } else {
        seen[classified.line] = true;
        record.decision = "keep";
      }
    }
    return record;
  });

  const kept = lines.filter(function (row) { return row.decision === "keep"; }).map(function (row) {
    return row.line;
  });

  if (!kept.length) {
    return {
      ok: false,
      error: "Nexitally parser: no usable server entries were found.",
      sectionFound: true,
      lines: lines,
      kept: [],
    };
  }

  return {
    ok: true,
    content: kept.join("\n"),
    sectionFound: true,
    lines: lines,
    kept: kept,
  };
}

function runParser(raw, extras) {
  const source = loadParserSource();
  let settled = null;
  const resource = {
    content: raw == null ? "" : String(raw),
    tag: extras && extras.tag != null ? extras.tag : "Nexitally",
    info: extras && extras.info != null ? extras.info : "",
    user_agent: extras && extras.user_agent != null ? extras.user_agent : "",
  };

  Object.defineProperty(resource, "link", {
    enumerable: true,
    get: function () {
      throw new Error("parser must not read $resource.link (the private subscription URL stays on-device)");
    },
  });

  const sandbox = {
    $resource: resource,
    $done: function (result) {
      if (settled) {
        throw new Error("$done called more than once");
      }
      settled = result;
    },
  };

  vm.runInNewContext(source, sandbox, {
    filename: "nexitally-node-parser.js",
    timeout: 2000,
  });

  if (!settled) {
    throw new Error("parser did not call $done");
  }
  if (Object.prototype.hasOwnProperty.call(settled, "retry")) {
    throw new Error("parser must not request a User-Agent retry");
  }
  return settled;
}

function readRepoFile(relPath) {
  return fs.readFileSync(path.resolve(REPO_ROOT, relPath));
}

function loadCatalog() {
  const catalogPath = path.resolve(__dirname, "fixtures", "catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  return catalog.fixtures.map(function (entry) {
    const inputBuf = readRepoFile(entry.input);
    const raw = entry.binary ? inputBuf : inputBuf.toString("utf8");
    const expectPath = entry.expect;
    const expectKind = entry.kind;
    const expected = fs.readFileSync(path.resolve(REPO_ROOT, expectPath), "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "");
    return Object.assign({}, entry, {
      raw: raw,
      expected: expected,
      expectKind: expectKind,
    });
  });
}

function compareParserToExplain(raw) {
  const parsed = runParser(raw);
  const explained = explainText(raw);
  if (parsed.error) {
    if (explained.ok || explained.error !== parsed.error) {
      return {
        ok: false,
        message: "explainer error mismatch: parser=" + JSON.stringify(parsed.error) + " explain=" + JSON.stringify(explained.error),
      };
    }
    return { ok: true, parsed: parsed, explained: explained };
  }
  if (!explained.ok || explained.content !== parsed.content) {
    return {
      ok: false,
      message: "explainer content mismatch",
      parsed: parsed,
      explained: explained,
    };
  }
  return { ok: true, parsed: parsed, explained: explained };
}

module.exports = {
  PARSER_PATH: PARSER_PATH,
  REPO_ROOT: REPO_ROOT,
  SUPPORTED: SUPPORTED,
  EXCLUDED: EXCLUDED,
  classifyLine: classifyLine,
  explainText: explainText,
  runParser: runParser,
  loadCatalog: loadCatalog,
  compareParserToExplain: compareParserToExplain,
  normalizeInput: normalizeInput,
};
