# Privacy

This repository is public. Treat every commit as world-readable.

## Never commit

- Nexitally (or any provider) subscription URLs
- Account ids, tokens, invoice ids
- Real hostnames, ports, passwords, UUIDs, Reality public keys, short ids
- Traffic totals or expiry dates from a live account
- Quantumult X MitM `passphrase` / `p12` material
- Device ids from `require-devices=`
- Screenshots of the Quantumult X resource page that still show the URL

The official Quantumult X sample configuration says the same thing about MitM material: keep CA passphrases and p12 files private. Subscription URLs belong in that category.

## Safe substitutions for examples

Use only documentation names:

| Live value | Replacement |
| --- | --- |
| Real subscription URL | `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` |
| Real hostname | `node-hk.example.com`, `example.com` |
| Real password / UUID | `example-password`, `00000000-0000-4000-8000-000000000000` |
| Real Reality key | The official Quantumult X sample values, or omit Reality lines |
| Live traffic comment | `# Traffic: 12.3 GB / 500 GB` with invented numbers |
| Personal policy names | `Proxy`, `Final`, or the names already in `sample.conf` |

RFC 2606 / RFC 6761 names (`example.com`, `example.invalid`) are the default.

## How the parser is designed around that

`nexitally-node-parser.js` is a pure function of `$resource.content`. It does not:

- embed a default URL
- write `$resource.link` into `$done({ content })`
- call `$notify` with the body
- persist anything

Quantumult X fetches the private URL on-device. The public script only sees the body **after** that fetch, inside the app.

## Sharing a profile

When publishing a Quantumult X snippet:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

If you already leaked a URL, rotate it in the provider dashboard. Editing git history is not enough if the commit was pushed.

## Local debugging

`--input` on the example runner is for **redacted** files in `/tmp` or a private directory outside this clone. The runner will happily parse a live dump; git will also happily commit it if the file is under the repo. Keep live dumps outside `examples/`.
