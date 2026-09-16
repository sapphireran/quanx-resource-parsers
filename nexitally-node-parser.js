/*
 * Quantumult X resource parser for Nexitally managed full configurations.
 *
 * Personal project (sapphireran/quanx-resource-parsers). Not company code.
 *
 * Quantumult X downloads the private Nexitally URL on-device and evaluates
 * this script in the resource-parser sandbox. The script reads only
 * $resource.content, extracts the first [server_local] section, and returns
 * supported server lines through $done({ content }). It never reads
 * $resource.link, so the subscription URL never enters this file.
 *
 * Keep: anytls / shadowsocks / vmess / vless / trojan / http / socks5
 * Drop: comments, exact duplicates, [Premium] placeholders, and traffic /
 * expiry / plan rows (Traffic, Expire, Reset, Days Left, 流量, 到期, 剩余, 套餐).
 *
 * Official sandbox notes (crossutility/Quantumult-X resource-parser.js):
 * HTTP request and persistent storage APIs are not available here.
 *
 * Contract and fixtures: docs/parser-spec.md and lab/fixtures/
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
