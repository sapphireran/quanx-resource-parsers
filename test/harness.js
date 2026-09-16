'use strict';

/**
 * Local runner for Quantumult X resource parsers in this repository.
 *
 * Quantumult X injects `$resource` and `$done` when it evaluates a parser.
 * This harness reproduces that contract in Node so examples and fixtures
 * can be checked without the iOS/macOS app.
 *
 * Usage:
 *   node test/harness.js examples/nexitally/full-config.sample.conf
 *   node test/harness.js --json test/fixtures/empty-server-local.conf
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PARSER_PATH = path.resolve(__dirname, '..', 'nexitally-node-parser.js');
const PARSER_SOURCE = fs.readFileSync(PARSER_PATH, 'utf8');

function parseResource(content, extraResource) {
  const resource = Object.assign(
    {
      content: content == null ? '' : String(content),
      link: '',
      info: '',
      tag: '',
      user_agent: ''
    },
    extraResource || {}
  );

  let doneCalled = false;
  let result;

  const sandbox = {
    $resource: resource,
    $done: function $done(value) {
      if (doneCalled) {
        throw new Error('$done was called more than once');
      }
      doneCalled = true;
      result = value;
    }
  };

  vm.runInNewContext(PARSER_SOURCE, sandbox, {
    filename: 'nexitally-node-parser.js',
    timeout: 5000
  });

  if (!doneCalled) {
    throw new Error('parser did not call $done');
  }

  return result;
}

function parseFile(filePath, extraResource) {
  return parseResource(fs.readFileSync(filePath, 'utf8'), extraResource);
}

function printResult(result, asJson) {
  if (asJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  if (result && result.error) {
    process.stderr.write(result.error + '\n');
    process.exitCode = 1;
    return;
  }

  const content = result && result.content != null ? String(result.content) : '';
  process.stdout.write(content.endsWith('\n') ? content : content + '\n');
}

module.exports = {
  PARSER_PATH,
  parseResource,
  parseFile
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const positional = args.filter(function (arg) {
    return arg !== '--json';
  });

  if (positional.length !== 1) {
    process.stderr.write(
      'usage: node test/harness.js [--json] <quantumult-x-config-file>\n'
    );
    process.exit(2);
  }

  printResult(parseFile(path.resolve(positional[0])), asJson);
}
