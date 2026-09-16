/*
 * Quantumult X resource parser for Nexitally managed full configurations.
 *
 * Quantumult X downloads the Nexitally URL itself and passes the response
 * into this script. The parser extracts [server_local], drops traffic /
 * expiry / [Premium] placeholders, de-duplicates entries, and returns only
 * Quantumult X server lines for [server_remote].
 *
 * This file contains no subscription URL, account identifier, node
 * password, or other private information.
 *
 * Dual-mode:
 *   - Quantumult X: reads $resource and calls $done(...)
 *   - Node.js: module.exports the same helpers so docs/examples/tests can
 *     run the parser without the app.
 *
 * Optional hash parameters on the resource URL (after "#"):
 *   in, out, regex, regout, keep-info, keep-premium
 * See docs/hash-parameters.md.
 */

var SUPPORTED = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
var EXCLUDED_INFO = /(?:Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
var EXCLUDED_PREMIUM = /\[Premium\]/i;
var COMMENT = /^(?:;|#|\/\/)/;
var SECTION_LINE = /^\s*\[[^\]]+\]\s*$/;

var ERRORS = {
  empty: "Nexitally parser: the resource body was empty.",
  missingSection:
    "Nexitally parser: [server_local] was not found and the body does not look like a server list.",
  noServers: "Nexitally parser: no usable server entries were found.",
  badRegex: "Nexitally parser: a hash regex parameter was not valid."
};

function normalizeText(text) {
  return String(text == null ? "" : text)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function extractSection(text, name) {
  var escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var re = new RegExp(
    "(?:^|\\n)\\s*\\[" +
      escaped +
      "\\]\\s*\\n([\\s\\S]*?)(?=\\n\\s*\\[[^\\]]+\\]\\s*(?:\\n|$)|$)",
    "i"
  );
  var match = text.match(re);
  return match ? match[1] : null;
}

function looksLikeServerList(text) {
  var lines = String(text).split("\n");
  var i;
  var line;
  for (i = 0; i < lines.length; i++) {
    line = lines[i].trim();
    if (!line || COMMENT.test(line) || SECTION_LINE.test(line)) continue;
    if (SUPPORTED.test(line)) return true;
  }
  return false;
}

function extractServerBody(text) {
  var section = extractSection(text, "server_local");
  if (section !== null) return section;
  if (looksLikeServerList(text)) return text;
  return null;
}

function decodeComponent(part) {
  try {
    return decodeURIComponent(part);
  } catch (err) {
    return part;
  }
}

/*
 * Quantumult X passes the original resource URL in $resource.link, including
 * the "#in=HK+SG" fragment. Comma-separated [server_remote] options such as
 * tag= and opt-parser= are not part of this string.
 */
function parseHashParams(link) {
  var raw = String(link == null ? "" : link);
  var hashIndex = raw.indexOf("#");
  var params = {};
  var hash;
  var pairs;
  var i;
  var pair;
  var eq;
  var key;
  var value;

  if (hashIndex < 0) return params;

  hash = raw.slice(hashIndex + 1);
  hash = hash.split(/[?\s]/)[0];
  if (!hash) return params;

  pairs = hash.split("&");
  for (i = 0; i < pairs.length; i++) {
    pair = pairs[i];
    if (!pair) continue;
    eq = pair.indexOf("=");
    if (eq < 0) {
      key = decodeComponent(pair);
      value = "1";
    } else {
      key = decodeComponent(pair.slice(0, eq));
      /* Keep "+" — in/out use it as OR, not as a space. */
      value = decodeComponent(pair.slice(eq + 1));
    }
    if (key) params[key] = value;
  }
  return params;
}

function flagEnabled(params, name) {
  var value = params && params[name];
  return value === "1" || value === "true" || value === "yes";
}

function nodeTag(line) {
  var match = String(line).match(/(?:^|,)\s*tag\s*=\s*(.*)$/i);
  return match ? match[1].trim() : String(line);
}

function containsAny(haystack, spec) {
  var parts;
  var i;
  var part;
  var lower;

  if (!spec) return false;
  lower = String(haystack).toLowerCase();
  parts = String(spec).split("+");
  for (i = 0; i < parts.length; i++) {
    part = parts[i].replace(/^\s+|\s+$/g, "");
    if (part && lower.indexOf(part.toLowerCase()) !== -1) return true;
  }
  return false;
}

function compileRegex(pattern, label) {
  if (!pattern) return null;
  try {
    return new RegExp(pattern, "i");
  } catch (err) {
    var error = new Error(ERRORS.badRegex + " (" + label + ")");
    error.code = "bad-regex";
    throw error;
  }
}

function applyHashFilters(line, params) {
  var tag;
  var keepRe;
  var dropRe;

  params = params || {};
  tag = nodeTag(line);

  if (params.in && !containsAny(tag, params.in)) return false;
  if (params.out && containsAny(tag, params.out)) return false;

  keepRe = compileRegex(params.regex, "regex");
  dropRe = compileRegex(params.regout, "regout");
  if (keepRe && !keepRe.test(line)) return false;
  if (dropRe && dropRe.test(line)) return false;
  return true;
}

function isUsableServer(line, params) {
  params = params || {};
  if (!line) return false;
  if (COMMENT.test(line)) return false;
  if (!SUPPORTED.test(line)) return false;
  if (!flagEnabled(params, "keep-info") && EXCLUDED_INFO.test(line)) return false;
  if (!flagEnabled(params, "keep-premium") && EXCLUDED_PREMIUM.test(line)) {
    return false;
  }
  return applyHashFilters(line, params);
}

function collectServers(body, params) {
  var lines = String(body).split("\n");
  var seen = {};
  var servers = [];
  var i;
  var line;

  for (i = 0; i < lines.length; i++) {
    line = lines[i].replace(/^\s+|\s+$/g, "");
    if (!isUsableServer(line, params)) continue;
    if (seen[line]) continue;
    seen[line] = true;
    servers.push(line);
  }
  return servers;
}

function parseContent(content, params) {
  var text = normalizeText(content);
  var body;
  var servers;

  params = params || {};

  if (!text.replace(/^\s+|\s+$/g, "")) {
    return { error: ERRORS.empty };
  }

  try {
    body = extractServerBody(text);
    if (body === null) {
      return { error: ERRORS.missingSection };
    }
    servers = collectServers(body, params);
  } catch (err) {
    if (err && err.code === "bad-regex") {
      return { error: err.message };
    }
    return { error: "Nexitally parser: " + (err && err.message ? err.message : String(err)) };
  }

  if (!servers.length) {
    return { error: ERRORS.noServers };
  }

  return { content: servers.join("\n") };
}

function parseResource(resource) {
  resource = resource || {};
  return parseContent(resource.content, parseHashParams(resource.link));
}

var NexitallyParser = {
  SUPPORTED: SUPPORTED,
  EXCLUDED_INFO: EXCLUDED_INFO,
  EXCLUDED_PREMIUM: EXCLUDED_PREMIUM,
  ERRORS: ERRORS,
  normalizeText: normalizeText,
  extractSection: extractSection,
  looksLikeServerList: looksLikeServerList,
  extractServerBody: extractServerBody,
  parseHashParams: parseHashParams,
  nodeTag: nodeTag,
  isUsableServer: isUsableServer,
  collectServers: collectServers,
  parseContent: parseContent,
  parseResource: parseResource
};

if (typeof $resource !== "undefined" && typeof $done === "function") {
  $done(parseResource($resource));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = NexitallyParser;
}
