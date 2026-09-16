"use strict";

/**
 * Load nexitally-node-parser.js the way Quantumult X would: inject $resource
 * and $done, then evaluate the script once. The harness does not reimplement
 * the parser.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO_ROOT = path.resolve(__dirname, "..");
const PARSER_PATH = path.join(REPO_ROOT, "nexitally-node-parser.js");
const EXAMPLES_DIR = path.join(REPO_ROOT, "examples", "nexitally");

function readParserSource() {
  return fs.readFileSync(PARSER_PATH, "utf8");
}

function parseResource(content, extras) {
  extras = extras || {};
  let settled = false;
  let result;

  const sandbox = {
    $resource: {
      content: content,
      link: extras.link || "",
      info: extras.info || "",
      tag: extras.tag || "",
      user_agent: extras.user_agent || "",
    },
    $done: function $done(value) {
      if (settled) {
        throw new Error("$done was called more than once");
      }
      settled = true;
      result = value;
    },
    String: String,
  };

  vm.runInNewContext(readParserSource(), sandbox, {
    filename: "nexitally-node-parser.js",
    timeout: 1000,
  });

  if (!settled) {
    throw new Error("parser exited without calling $done");
  }
  return result;
}

function normalizeExpected(text) {
  return String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\n$/, "");
}

function discoverFixtures() {
  const names = fs.readdirSync(EXAMPLES_DIR).filter(function (name) {
    return name.endsWith(".conf");
  }).sort();

  return names.map(function (name) {
    const base = name.slice(0, -".conf".length);
    const confPath = path.join(EXAMPLES_DIR, name);
    const expectedPath = path.join(EXAMPLES_DIR, base + ".expected.txt");
    const errorPath = path.join(EXAMPLES_DIR, base + ".error.txt");
    const hasExpected = fs.existsSync(expectedPath);
    const hasError = fs.existsSync(errorPath);

    if (hasExpected === hasError) {
      throw new Error(
        base + " must have exactly one of .expected.txt or .error.txt"
      );
    }

    return {
      name: base,
      confPath: confPath,
      expectedPath: hasExpected ? expectedPath : null,
      errorPath: hasError ? errorPath : null,
      kind: hasExpected ? "content" : "error",
    };
  });
}

function runFixture(fixture) {
  const raw = fs.readFileSync(fixture.confPath);
  const content = raw.toString("utf8");
  const actual = parseResource(content, {
    link: "https://private.example.invalid/must-not-appear",
    tag: "Nexitally",
  });

  if (fixture.kind === "error") {
    const expected = normalizeExpected(fs.readFileSync(fixture.errorPath, "utf8"));
    if (!actual || typeof actual.error !== "string") {
      return {
        ok: false,
        message: fixture.name + ": expected an error, got " + inspectDone(actual),
      };
    }
    if (actual.content) {
      return {
        ok: false,
        message: fixture.name + ": error result also contained content",
      };
    }
    if (actual.error !== expected) {
      return {
        ok: false,
        message:
          fixture.name +
          ": error mismatch\n  expected: " +
          expected +
          "\n  actual:   " +
          actual.error,
      };
    }
    if (String(actual.error).indexOf("private.example.invalid") !== -1) {
      return { ok: false, message: fixture.name + ": error leaked $resource.link" };
    }
    return { ok: true, actual: actual };
  }

  const expected = normalizeExpected(fs.readFileSync(fixture.expectedPath, "utf8"));
  if (!actual || typeof actual.content !== "string") {
    return {
      ok: false,
      message: fixture.name + ": expected content, got " + inspectDone(actual),
    };
  }
  if (actual.error) {
    return {
      ok: false,
      message: fixture.name + ": content result also contained error: " + actual.error,
    };
  }
  if (actual.content !== expected) {
    return {
      ok: false,
      message:
        fixture.name +
        ": content mismatch\n--- expected ---\n" +
        expected +
        "\n--- actual ---\n" +
        actual.content,
    };
  }
  if (actual.content.indexOf("private.example.invalid") !== -1) {
    return { ok: false, message: fixture.name + ": content leaked $resource.link" };
  }
  return { ok: true, actual: actual };
}

function inspectDone(value) {
  try {
    return JSON.stringify(value);
  } catch (err) {
    return String(value);
  }
}

function parserSourceGuards() {
  const source = readParserSource();
  const forbidden = [
    { needle: "$resource.link", reason: "parser must not read the subscription URL" },
    { needle: "$resource.info", reason: "parser must not read subscription-userinfo" },
    { needle: "$notify", reason: "resource parsers should not notify with node text" },
    { needle: "$task", reason: "HTTP APIs are unavailable in a resource parser" },
    { needle: "$persistentStore", reason: "storage APIs are unavailable in a resource parser" },
  ];

  return forbidden.map(function (rule) {
    if (source.indexOf(rule.needle) !== -1) {
      return { ok: false, message: "source guard: " + rule.reason + " (" + rule.needle + ")" };
    }
    return { ok: true, message: "source guard passed for " + rule.needle };
  });
}

module.exports = {
  REPO_ROOT: REPO_ROOT,
  PARSER_PATH: PARSER_PATH,
  EXAMPLES_DIR: EXAMPLES_DIR,
  parseResource: parseResource,
  discoverFixtures: discoverFixtures,
  runFixture: runFixture,
  parserSourceGuards: parserSourceGuards,
  readParserSource: readParserSource,
};
