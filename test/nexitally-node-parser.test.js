'use strict';

/**
 * Golden-file and contract tests for nexitally-node-parser.js.
 *
 * Run from the repository root:
 *   node test/nexitally-node-parser.test.js
 */

const fs = require('fs');
const path = require('path');
const { parseResource, parseFile } = require('./harness');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLES = path.join(ROOT, 'examples', 'nexitally');
const FIXTURES = path.join(__dirname, 'fixtures');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
    return;
  }
  failed += 1;
  console.error('FAIL  ' + message);
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed += 1;
    return;
  }
  failed += 1;
  console.error('FAIL  ' + message);
  console.error('      expected: ' + JSON.stringify(expected));
  console.error('      actual:   ' + JSON.stringify(actual));
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function normalizeServerList(text) {
  return String(text)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/, '');
}

function assertServers(result, expectedText, label) {
  assert(!result.error, label + ' should not error: ' + (result.error || ''));
  assertEqual(
    normalizeServerList(result.content || ''),
    normalizeServerList(expectedText),
    label + ' server list'
  );
}

function assertError(result, snippet, label) {
  assert(!!result.error, label + ' should set error');
  if (snippet) {
    assert(
      String(result.error).indexOf(snippet) !== -1,
      label + ' error should contain ' + JSON.stringify(snippet) +
        ' (got ' + JSON.stringify(result.error) + ')'
    );
  }
  assert(
    result.content == null || result.content === '',
    label + ' should not return content alongside error'
  );
}

// --- documented examples ---------------------------------------------------

assertServers(
  parseFile(path.join(EXAMPLES, 'full-config.sample.conf')),
  read(path.join(EXAMPLES, 'full-config.expected.txt')),
  'full-config.sample.conf'
);

assertServers(
  parseFile(path.join(EXAMPLES, 'mixed-protocols.sample.conf')),
  read(path.join(EXAMPLES, 'mixed-protocols.expected.txt')),
  'mixed-protocols.sample.conf'
);

// --- extra fixtures ----------------------------------------------------------

assertError(
  parseFile(path.join(FIXTURES, 'missing-server-local.conf')),
  '[server_local]',
  'missing-server-local.conf'
);

assertError(
  parseFile(path.join(FIXTURES, 'empty-server-local.conf')),
  'no usable server',
  'empty-server-local.conf'
);

assertServers(
  parseFile(path.join(FIXTURES, 'surrounding-sections.conf')),
  read(path.join(FIXTURES, 'surrounding-sections.expected.txt')),
  'surrounding-sections.conf'
);

// --- encoding and whitespace -----------------------------------------------

const anytls =
  'anytls=hk.example.com:443, password=example-password-not-real, over-tls=true, tag=HK-01';

(function bomAndCrlf() {
  const body =
    '\uFEFF[server_local]\r\n' +
    anytls +
    '\r\n\r\n[filter_local]\r\nfinal, proxy\r\n';
  const result = parseResource(body);
  assertServers(result, anytls, 'BOM + CRLF');
})();

(function indentedSectionHeader() {
  const body = '  [SERVER_LOCAL]\n' + anytls + '\n[filter_local]\nfinal, proxy\n';
  const result = parseResource(body);
  assertServers(result, anytls, 'indented / case-insensitive [server_local]');
})();

(function emptyInput() {
  assertError(parseResource(''), '[server_local]', 'empty string');
  assertError(parseResource(null), '[server_local]', 'null content');
})();

(function headerWithoutBodyNewline() {
  assertError(
    parseResource('[server_local]'),
    '[server_local]',
    'header without trailing newline'
  );
})();

(function sectionStopsAtNextHeader() {
  const body = [
    '[server_local]',
    anytls,
    '[filter_local]',
    'anytls=leaked.example.com:443, password=example-password-not-real, over-tls=true, tag=LEAK'
  ].join('\n');
  const result = parseResource(body);
  assertServers(result, anytls, 'does not read past the next section');
})();

(function preservesFirstDuplicate() {
  const first =
    'anytls=a.example.com:443, password=example-password-not-real, over-tls=true, tag=A';
  const second =
    'anytls=b.example.com:443, password=example-password-not-real, over-tls=true, tag=B';
  const body = ['[server_local]', first, second, first].join('\n');
  assertServers(
    parseResource(body),
    first + '\n' + second,
    'duplicate lines keep first occurrence'
  );
})();

(function trimsSurroundingWhitespace() {
  const body = '[server_local]\n  ' + anytls + '  \n';
  assertServers(parseResource(body), anytls, 'trims per-line whitespace');
})();

(function commentPrefixes() {
  const body = [
    '[server_local]',
    ';' + anytls,
    '#' + anytls,
    '//' + anytls,
    anytls
  ].join('\n');
  assertServers(parseResource(body), anytls, 'comment prefixes');
})();

(function exclusionPatterns() {
  const keep =
    'anytls=ok.example.com:443, password=example-password-not-real, over-tls=true, tag=OK';
  const dropped = [
    'anytls=x.example.com:443, password=x, over-tls=true, tag=Traffic 1GB',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=Expire tomorrow',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=Reset soon',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=Days Left 3',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=流量',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=到期',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=剩余',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=套餐',
    'anytls=x.example.com:443, password=x, over-tls=true, tag=VIP [Premium]'
  ];
  const body = ['[server_local]', keep].concat(dropped).join('\n');
  assertServers(parseResource(body), keep, 'quota / premium exclusion');
})();

(function unsupportedScheme() {
  const body = [
    '[server_local]',
    'wireguard=wg.example.com:51820, private-key=not-a-real-key, tag=wg-01',
    'hysteria=hy.example.com:443, password=example-password-not-real, tag=hy-01'
  ].join('\n');
  assertError(parseResource(body), 'no usable server', 'unsupported schemes');
})();

(function extraResourceFieldsAreIgnored() {
  const body = '[server_local]\n' + anytls + '\n';
  const result = parseResource(body, {
    link: 'https://example.invalid/private-subscription',
    tag: 'Nexitally',
    info: 'upload=1; download=2; total=3; expire=1893456000',
    user_agent: 'Quantumult%20X/1.5.6'
  });
  assertServers(result, anytls, 'ignores $resource.link / info / tag');
})();

if (failed > 0) {
  console.error('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(1);
}

console.log(passed + ' passed');
