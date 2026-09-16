`[server_local]` sits between `[policy]` and `[filter_local]`. A greedy
section match would pull filter/rewrite lines into the server resource. The
parser must stop at the next `[section]` header.
