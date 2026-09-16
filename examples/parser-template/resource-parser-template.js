/*
 * Example Quantumult X resource parser skeleton.
 *
 * This is not the Nexitally production parser. Copy and rename it before
 * adding a second personal parser. Keep ES5. Call $done once.
 *
 * Inputs:  $resource.content (UTF-8 body Quantumult X already downloaded)
 * Outputs: $done({ content: "..." }) or $done({ error: "..." })
 *
 * HTTP APIs and persistent storage are not available in this runtime.
 */

function extractServerLocal(content) {
  var text = String(content || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  var match = text.match(/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i);
  if (!match) {
    return { error: "template parser: [server_local] section was not found." };
  }

  var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
  var seen = {};
  var servers = match[1]
    .split("\n")
    .map(function (line) { return line.trim(); })
    .filter(function (line) {
      if (!line || /^(?:;|#|\/\/)/.test(line)) return false;
      if (!supported.test(line)) return false;
      if (seen[line]) return false;
      seen[line] = true;
      return true;
    });

  if (!servers.length) {
    return { error: "template parser: no usable server entries were found." };
  }

  return { content: servers.join("\n") };
}

if (typeof $resource !== "undefined" && typeof $done === "function") {
  $done(extractServerLocal($resource.content));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractServerLocal: extractServerLocal };
}
