/*
 * Educational Quantumult X resource parser.
 *
 * This is the generic cousin of nexitally-node-parser.js: it copies every
 * non-comment line out of [server_local] and does not apply Nexitally-specific
 * exclusions. Use it to compare "raw extract" with the Nexitally filter set.
 *
 * It contains no subscription URL, account identifier, or other private data.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

var match = text.match(/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i);

if (!match) {
  $done({ error: "Generic extractor: [server_local] section was not found." });
} else {
  var seen = {};
  var servers = match[1]
    .split("\n")
    .map(function (line) { return line.trim(); })
    .filter(function (line) {
      if (!line || /^(?:;|#|\/\/)/.test(line)) return false;
      if (seen[line]) return false;
      seen[line] = true;
      return true;
    });

  if (!servers.length) {
    $done({ error: "Generic extractor: [server_local] did not contain any lines." });
  } else {
    $done({ content: servers.join("\n") });
  }
}
