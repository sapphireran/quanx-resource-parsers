# Privacy rules for this public repository

This repo is public. Treat every commit as visible to strangers.

## Never commit

- The Nexitally **Configuration File → Download** URL, or any other subscription URL
- Account id, invite code, dashboard cookie, or receipt
- A live node host, port, password, UUID, Reality public key, or short id from a paid plan
- A full Quantumult X profile exported from a phone that still contains those values
- Screenshots of Quantumult X that show the remote resource URL
- Gists, issue comments, or CI logs that paste the same material

The parser file itself contains none of the above. Quantumult X fetches the private URL on-device and hands the **body** to the script as `$resource.content`. The script does not read `$resource.link`. The personal lab harness throws if a future edit tries to.

## What the fixtures use instead

| Kind | Stand-in |
| --- | --- |
| Hosts | `*.example.invalid`, `example.com`, documentation IPv6 `2001:db8::1`, RFC 1918 `192.168.1.1` from the official sample |
| Passwords | the word `placeholder`, `pwd`, or the public SS2022 / UUID strings published in [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) |
| Reality material | the public `reality-base64-pubkey` / `reality-hex-shortid` pair from that same official sample |
| Profile URL | `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` |

If a fixture starts looking like a real export, delete it and rewrite it with stand-ins.

## Device-side handling

Keep the real URL only in Quantumult X `[server_remote]` on the device (and a password manager, if you must store it at all). jsDelivr and GitHub raw may cache **this parser script**. They must never cache your subscription.

## Review checklist

Before opening or updating a pull request:

1. `rg -n "nexitally\\.(com|net)|token=|uuid=|ss://|vmess://" -S .` returns nothing unexpected.
2. No `http`/`https` URL in fixtures except `example.invalid`, Apple generate_204, GitHub/jsDelivr parser URLs, or official Quantumult X sample links.
3. `npm test` still passes on the sanitized catalog.
