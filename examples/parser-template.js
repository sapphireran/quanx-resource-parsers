/*
 * Example Quantumult X resource-parser skeleton.
 *
 * This file is documentation, not a production parser. The Nexitally parser
 * lives at ../nexitally-node-parser.js. Official API notes:
 * https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js
 *
 * Available input:
 *   $resource.link       original URL or local path
 *   $resource.content    UTF-8 body Quantumult X downloaded
 *   $resource.info       subscription-userinfo response header (v1.0.10+)
 *   $resource.tag        resource tag from the profile line (v1.0.10+)
 *   $resource.user_agent current download UA (v1.5.6+)
 *
 * Allowed output:
 *   $done({ content: "..." })
 *   $done({ error: "..." })
 *   $done({ retry: { user_agent: "..." } })  // v1.5.6+, once per resource
 *
 * HTTP request and persistent storage APIs are not available here.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n")
  .replace(/\r/g, "\n");

if (!text.trim()) {
  $done({ error: "example parser: empty resource body" });
} else {
  // Replace this branch with the transformation you actually need.
  // Returning content unchanged is only useful as a smoke test.
  $done({ content: text });
}
