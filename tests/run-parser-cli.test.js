"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var os = require("os");
var path = require("path");
var { spawnSync } = require("child_process");

var ROOT = path.join(__dirname, "..");
var CLI = path.join(ROOT, "tools", "run-parser.js");

function run(args, extra) {
  return spawnSync(process.execPath, [CLI].concat(args), {
    encoding: "utf8",
    cwd: ROOT,
    timeout: 10000,
    env: extra && extra.env ? extra.env : process.env
  });
}

test("CLI prints server lines for the full-config example", function () {
  var result = run(["examples/nexitally-full-config.example.conf"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^anytls=hk-01\.example\.test:443/m);
  assert.equal(result.stdout.indexOf("Traffic:"), -1);
  assert.equal(result.stdout.indexOf("[Premium]"), -1);
});

test("CLI --json wraps content", function () {
  var result = run(["examples/already-server-list.example.txt", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  var body = JSON.parse(result.stdout);
  assert.ok(body.content.indexOf("tag=HK-01") !== -1);
  assert.equal(body.error, undefined);
});

test("CLI --link applies hash filters", function () {
  var result = run([
    "examples/nexitally-full-config.example.conf",
    "--link",
    "https://subscription.example.test/qx#in=SG"
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /tag=SG-01/);
  assert.equal(result.stdout.indexOf("tag=HK-01"), -1);
});

test("CLI exits 1 when the file is not a config", function () {
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), "qx-parser-"));
  var file = path.join(dir, "empty.conf");
  fs.writeFileSync(file, "[general]\nserver_check_url = http://example.test/\n");
  var result = run([file]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\[server_local\] was not found/);
});

test("CLI --help exits 0", function () {
  var result = run(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});

test("CLI missing file argument exits 1", function () {
  var result = run([]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});
