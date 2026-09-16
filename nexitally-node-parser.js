/*
 * Quantumult X resource parser for Nexitally managed full configurations.
 *
 * Quantumult X downloads the private Nexitally URL and injects the body as
 * $resource.content. This script never fetches, stores, or embeds that URL.
 * It also contains no account identifier, node password, or other private
 * data.
 *
 * Contract (see docs/parser-behavior.md and docs/examples/):
 *   - Strip a UTF-8 BOM and normalize CRLF.
 *   - Read the first [server_local] section only.
 *   - Keep anytls, shadowsocks, vmess, vless, trojan, http, and socks5 lines.
 *   - Drop comments, [Premium] stubs, traffic/expiry/plan placeholders, and
 *     exact duplicate lines.
 *   - $done({ content }) with those server lines, or $done({ error }).
 *
 * Not a generic Clash/Surge converter. Enable opt-parser only on the
 * Nexitally [server_remote] resource while this file is resource_parser_url.
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
