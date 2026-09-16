# Privacy

This repository is public. Treat every file as world-readable.

## The parser never needs your URL

Quantumult X fetches the Nexitally configuration **on the device** and
hands the body to the script. The GitHub-hosted parser does not see the
request, the cookie, or the response.

`nexitally-node-parser.js` therefore contains:

- no subscription URL;
- no account id;
- no node password from a live plan;
- no traffic totals.

Examples use `subscription.example.test` and
`placeholder-not-a-real-secret`.

## Keep the live URL on the device

The Nexitally Quantumult X download URL is an account credential. Put it
only in the on-device `[server_remote]` line.

Do not put it in:

- this repository;
- a public Gist;
- a screenshot of a pull request;
- a jsDelivr / CDN comment;
- `resource_parser_url` (that field is the **script**, not the
  subscription).

## Do not commit captured profiles

A saved Nexitally response is a full proxy inventory: hostnames,
passwords, tags, remaining traffic. If you dump a profile to debug the
parser, keep it outside the repo (`local/` is gitignored) or redact it
down to `.example.test` hosts first.

The tests in `tests/examples-fixtures.test.js` fail if an example file
looks like it contains a live provider hostname.

## What the parser still echoes

Returned server lines still include whatever host and password the
provider put in `[server_local]`. That is required for Quantumult X to
connect. Those strings stay inside the app after parsing; they are not
uploaded by this script. They *will* leak if you paste parser output
into a public issue.

When filing a bug, paste:

- the error string from `$done({ error })`;
- a redacted line shape (`anytls=redacted.example:443, …, tag=HK-01`);
- Quantumult X version.

Do not paste a full `[server_local]` dump.
