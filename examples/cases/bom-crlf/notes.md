The fixture file is LF. tools/check.js prefixes U+FEFF and maps newlines to CRLF before $resource.content. The parser strips both.
