#!/usr/bin/env node
"use strict";

/**
 * Local stand-in for Quantumult X's resource-parser runtime.
 *
 * Loads a parser script, injects $resource / $done / $notify, and compares
 * the result to sanitized fixtures. This is not Quantumult X; it only checks
 * the transform. See docs/resource-parser-api.md.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var EXAMPLES_DIR = __dirname;
var REPO_ROOT = path.resolve(EXAMPLES_DIR, "..");
var DEFAULT_MANIFEST = path.join(EXAMPLES_DIR, "fixtures-manifest.json");

function usage() {
  return [
    "Usage:",
    "  node examples/run-parser.js [options]",
    "",
    "Options:",
    "  --manifest <path>   Fixture catalog (default: examples/fixtures-manifest.json)",
    "  --parser <path>     Parser script, relative to repo root or absolute",
    "  --only <id>         Run a single fixture id (repeatable)",
    "  --list              Print fixture ids and exit",
    "  --verbose           Print kept server tags / error strings",
    "  --input <path>      Parse one file instead of the catalog",
    "  --dump              Print the raw $done payload as JSON",
    "  --help              Show this help",
    "",
    "Privacy: --input is for redacted files outside this repository.",
  ].join("\n");
}

function parseArgs(argv) {
  var opts = {
    manifest: DEFAULT_MANIFEST,
    parser: null,
    only: [],
    list: false,
    verbose: false,
    input: null,
    dump: false,
    help: false,
  };

  for (var i = 0; i < argv.length; i++) {
    var arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--list") {
      opts.list = true;
    } else if (arg === "--verbose" || arg === "-v") {
      opts.verbose = true;
    } else if (arg === "--dump") {
      opts.dump = true;
    } else if (arg === "--manifest" || arg === "--parser" || arg === "--only" || arg === "--input") {
      var value = argv[++i];
      if (!value || value.indexOf("--") === 0) {
        throw new Error(arg + " requires a value");
      }
      if (arg === "--only") {
        opts.only.push(value);
      } else if (arg === "--manifest") {
        opts.manifest = path.resolve(value);
      } else if (arg === "--parser") {
        opts.parser = value;
      } else {
        opts.input = path.resolve(value);
      }
    } else {
      throw new Error("unknown argument: " + arg);
    }
  }

  return opts;
}

function resolveRepoPath(filePath) {
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(REPO_ROOT, filePath);
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function applyTransform(content, transform) {
  if (!transform) return content;
  if (transform === "bom-crlf") {
    return "\uFEFF" + content.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
  }
  throw new Error("unknown transform: " + transform);
}

function normalizeExpectedText(text) {
  return String(text || "").replace(/\r\n/g, "\n").replace(/\s+$/, "");
}

function tagsFromContent(content) {
  return normalizeExpectedText(content)
    .split("\n")
    .filter(Boolean)
    .map(function (line) {
      var match = line.match(/(?:^|,)\s*tag\s*=\s*(.*)$/i);
      return match ? match[1].trim() : "(no tag)";
    });
}

function runParser(parserSource, resource) {
  var settled = false;
  var result;
  var notifies = [];

  var sandbox = {
    $resource: {
      content: "",
      link: "https://example.invalid/nexitally-full-config",
      info: "",
      tag: "Nexitally",
      user_agent: "",
    },
    $done: function (value) {
      if (settled) {
        throw new Error("$done called more than once");
      }
      settled = true;
      result = value;
    },
    $notify: function (title, subtitle, message) {
      notifies.push({ title: title, subtitle: subtitle, message: message });
    },
    console: console,
  };

  Object.keys(resource || {}).forEach(function (key) {
    sandbox.$resource[key] = resource[key];
  });

  vm.runInNewContext(parserSource, sandbox, {
    filename: "resource-parser.js",
    timeout: 2000,
  });

  if (!settled) {
    throw new Error("parser did not call $done");
  }

  return { result: result, notifies: notifies };
}

function loadExpected(kind, filePath) {
  var raw = readUtf8(filePath);
  if (kind === "content") {
    return { kind: "content", content: normalizeExpectedText(raw) };
  }
  if (kind === "error") {
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.error !== "string") {
      throw new Error("error fixture must be JSON with an error string: " + filePath);
    }
    return { kind: "error", error: parsed.error };
  }
  throw new Error("unknown expect.kind: " + kind);
}

function classifyResult(doneValue) {
  if (!doneValue || typeof doneValue !== "object") {
    return { kind: "invalid", detail: " $done value is not an object" };
  }
  if (typeof doneValue.error === "string") {
    return { kind: "error", error: doneValue.error };
  }
  if (typeof doneValue.content === "string") {
    return { kind: "content", content: normalizeExpectedText(doneValue.content) };
  }
  return { kind: "invalid", detail: " $done missing content or error" };
}

function compare(actual, expected) {
  if (actual.kind !== expected.kind) {
    return {
      ok: false,
      message:
        "kind mismatch: expected " +
        expected.kind +
        ", got " +
        actual.kind +
        (actual.error ? " (" + actual.error + ")" : "") +
        (actual.detail || ""),
    };
  }
  if (expected.kind === "error" && actual.error !== expected.error) {
    return {
      ok: false,
      message: "error mismatch:\n  expected: " + expected.error + "\n  actual:   " + actual.error,
    };
  }
  if (expected.kind === "content" && actual.content !== expected.content) {
    return {
      ok: false,
      message:
        "content mismatch:\n--- expected ---\n" +
        expected.content +
        "\n--- actual ---\n" +
        actual.content,
    };
  }
  return { ok: true, message: "ok" };
}

function printDump(doneValue) {
  process.stdout.write(JSON.stringify(doneValue, null, 2) + "\n");
}

function listFixtures(manifest) {
  manifest.fixtures.forEach(function (fixture) {
    process.stdout.write(fixture.id + "  " + fixture.description + "\n");
  });
}

function runCatalog(opts) {
  var manifest = JSON.parse(readUtf8(opts.manifest));
  var parserPath = resolveRepoPath(opts.parser || manifest.parser);
  var parserSource = readUtf8(parserPath);
  var selected = manifest.fixtures;

  if (opts.only.length) {
    var wanted = {};
    opts.only.forEach(function (id) {
      wanted[id] = true;
    });
    selected = manifest.fixtures.filter(function (fixture) {
      return wanted[fixture.id];
    });
    var found = {};
    selected.forEach(function (fixture) {
      found[fixture.id] = true;
    });
    opts.only.forEach(function (id) {
      if (!found[id]) {
        throw new Error("unknown fixture id: " + id);
      }
    });
  }

  if (opts.list) {
    listFixtures({ fixtures: selected });
    return 0;
  }

  var failed = 0;
  selected.forEach(function (fixture) {
    var inputPath = path.join(EXAMPLES_DIR, fixture.input);
    var content = applyTransform(readUtf8(inputPath), fixture.transform);
    var ran = runParser(parserSource, { content: content });
    var actual = classifyResult(ran.result);
    var expected = loadExpected(
      fixture.expect.kind,
      path.join(EXAMPLES_DIR, fixture.expect.file)
    );
    var verdict = compare(actual, expected);
    var mark = verdict.ok ? "pass" : "FAIL";
    process.stdout.write(mark + "  " + fixture.id + "\n");
    if (opts.verbose) {
      process.stdout.write("      " + fixture.description + "\n");
      if (actual.kind === "content") {
        process.stdout.write("      tags: " + tagsFromContent(actual.content).join(", ") + "\n");
      } else if (actual.kind === "error") {
        process.stdout.write("      error: " + actual.error + "\n");
      }
    }
    if (opts.dump) {
      printDump(ran.result);
    }
    if (!verdict.ok) {
      failed += 1;
      process.stdout.write(verdict.message.replace(/^/gm, "      ") + "\n");
    }
  });

  process.stdout.write(
    "\n" + (selected.length - failed) + " passed, " + failed + " failed, " + selected.length + " total\n"
  );
  return failed ? 1 : 0;
}

function runSingleInput(opts) {
  var parserPath = resolveRepoPath(opts.parser || "nexitally-node-parser.js");
  var parserSource = readUtf8(parserPath);
  var content = readUtf8(opts.input);
  var ran = runParser(parserSource, { content: content });
  var actual = classifyResult(ran.result);

  if (opts.dump) {
    printDump(ran.result);
  } else if (actual.kind === "content") {
    process.stdout.write(actual.content + "\n");
    if (opts.verbose) {
      process.stdout.write("\n# tags: " + tagsFromContent(actual.content).join(", ") + "\n");
    }
  } else if (actual.kind === "error") {
    process.stderr.write(actual.error + "\n");
    return 1;
  } else {
    process.stderr.write("invalid parser result" + (actual.detail || "") + "\n");
    return 1;
  }
  return actual.kind === "error" ? 1 : 0;
}

function main() {
  var opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(err.message + "\n\n" + usage() + "\n");
    process.exit(2);
  }

  if (opts.help) {
    process.stdout.write(usage() + "\n");
    return 0;
  }

  try {
    if (opts.input) {
      return runSingleInput(opts);
    }
    return runCatalog(opts);
  } catch (err) {
    process.stderr.write(err.stack || String(err));
    process.stderr.write("\n");
    return 1;
  }
}

process.exit(main());
