# Safety

This repository is public. Treat every commit as if a stranger will clone it today.

The parser scripts contain **no** Nexitally URL, account id, node password, or cookie. Keep it that way.

## Never commit

- The Nexitally Configuration File → Download URL.
- Any other subscription URL, token, or invoice link.
- A downloaded live Quantumult X profile, even "temporarily".
- Screenshots of Quantumult X that show the URL, traffic remaining, or email.
- Real hostnames, passwords, UUIDs, Reality public keys, or short ids from a paid plan.

If it came from a dashboard or from a refresh on your phone, it does not belong in git.

## Allowed examples

The files under `examples/` use only:

- `example.com` / `example.invalid` hosts
- `example-password`, `example-user`
- reserved example UUIDs (`00000000-0000-4000-8000-…`)
- placeholder text `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`

Copy that style. If you need a more realistic fixture, invent more `example.com` nodes. Do not anonymize a live export in place and hope you caught every secret.

## Public parser URL vs private subscription URL

| Item | Public | Reason |
| --- | --- | --- |
| `nexitally-node-parser.js` | yes | it is the product of this repo |
| GitHub raw / jsDelivr URL of that file | yes | Quantumult X has to download it |
| Nexitally full-configuration URL | **no** | it is an account capability |

Putting the parser on jsDelivr does not publish your nodes. Putting the Nexitally URL in a Gist does.

## Redacting a local copy for debugging

If a refresh fails and you want to inspect the body:

1. Save the download **outside** this clone (`/tmp` or a private notes folder).
2. Delete `[server_remote]` URLs, tokens, and any line that is not needed to reproduce the parse.
3. Replace every host and password with `example.com` / `example-password` before you even consider pasting a snippet into an issue.
4. Delete the file when you are done.
5. Do not `git add` it. Do not attach it to a pull request.

The local runner accepts an absolute path, so you never need to store that file here:

```bash
node scripts/run-parser.js --json nexitally-node-parser.js /tmp/redacted.conf
```

## Comments and commit messages

Do not put a live URL in a comment, a commit message, or a PR description. The snippets in this repo already show the placeholder form.

## If a secret lands in git

1. Remove it in a new commit.
2. Rotate the Nexitally subscription URL or password at the provider if the commit was pushed.
3. Assume force-pushing does not erase a public clone.

Prevention is cheaper: run `git diff` and look for `http` URLs that are not GitHub, jsDelivr, or `example.com` before you commit.
