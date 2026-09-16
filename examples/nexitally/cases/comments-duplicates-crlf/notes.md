Noise that shows up in exported configs: a UTF-8 BOM, Windows CRLF line
endings, three comment styles, blank lines, and the same server line twice.
The parser should normalize line endings, skip comments, and emit each unique
server once.
