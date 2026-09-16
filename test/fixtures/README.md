# Extra parser fixtures (not the documented samples).

| File | Expectation |
| --- | --- |
| `missing-server-local.conf` | `$done({ error })` because `[server_local]` is absent |
| `empty-server-local.conf` | `$done({ error })` because every row is a comment or quota line |
| `surrounding-sections.conf` | Only the two `[server_local]` servers; later sections do not leak |
