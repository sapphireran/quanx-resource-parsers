/*
 * Template for a personal Quantumult X resource parser.
 *
 * Copy this file, rename it, and replace the helpers. Quantumult X
 * downloads the resource first. The parser only transforms
 * $resource.content. Do not put a subscription URL or account id here.
 *
 * Desktop check (after you add fixtures):
 *   node scripts/run-nexitally-parser.js
 *
 * Official runtime notes:
 *   https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

if (!looksLikeExpectedInput(text)) {
  $done({ error: "template parser: unexpected resource shape." });
} else {
  var lines = extractLines(text);
  if (!lines.length) {
    $done({ error: "template parser: no usable entries were found." });
  } else {
    $done({ content: lines.join("\n") });
  }
}

function looksLikeExpectedInput(body) {
  return /(?:^|\n)\s*\[[^\]]+\]\s*(?:\n|$)/.test(body);
}

function extractLines(body) {
  var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
  var seen = {};
  return body.split("\n").map(function (line) {
    return line.trim();
  }).filter(function (line) {
    if (!line || /^(?:;|#|\/\/)/.test(line)) return false;
    if (!supported.test(line)) return false;
    if (seen[line]) return false;
    seen[line] = true;
    return true;
  });
}
