/*
 * Quantumult X resource parser for Nexitally managed full configurations.
 *
 * Quantumult X fetches the private URL on the device. This script reads
 * $resource.content only, extracts the first [server_local] section, and
 * returns server lines for [server_remote]. It contains no subscription URL,
 * account identifier, node password, or other private information.
 *
 * Keep/drop reason codes used by the personal replay studio are documented in
 * handbook/04-keep-drop-reason-codes.md. The regular expressions below are the
 * contract; do not change them without a matching fixture and handbook update.
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
