/*
 * Quantumult X resource parser for Nexitally managed full configurations.
 *
 * Content-only contract: Quantumult X fetches the private Nexitally URL on
 * the device. This script reads $resource.content, extracts [server_local],
 * and returns server lines through $done. It must not read $resource.link
 * and it contains no subscription URL, account identifier, or node secret.
 *
 * Personal notes and sanitized fixtures: docs/ and examples/.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

var match = text.match(/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i);

if (!match) {
  $done({ error: "Nexitally parser: [server_local] section was not found." });
} else {
  var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
  var excluded = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
  var seen = {};
  var servers = match[1]
    .split("\n")
    .map(function (line) { return line.trim(); })
    .filter(function (line) {
      if (!line || /^(?:;|#|\/\/)/.test(line)) return false;
      if (!supported.test(line) || excluded.test(line)) return false;
      if (seen[line]) return false;
      seen[line] = true;
      return true;
    });

  if (!servers.length) {
    $done({ error: "Nexitally parser: no usable server entries were found." });
  } else {
    $done({ content: servers.join("\n") });
  }
}
