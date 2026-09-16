Lines that are not in the supported protocol list (for example a made-up
`wireguard =` prefix) must not be forwarded. If nothing supported remains,
the parser errors the same way as an empty section.
