"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

/**
 * Load a Quantumult X resource-parser script and run it the way the app
 * would: inject $resource / $done, forbid leftover HTTP or storage APIs,
 * and return the object passed to $done.
 */
function runQuantumultXParser(parserSource, resource, options) {
  const filename = (options && options.filename) || "resource-parser.js";
  let doneValue;
  let doneCalls = 0;

  const sandbox = {
    $resource: {
      content: resource.content == null ? "" : String(resource.content),
      link: resource.link == null ? "" : String(resource.link),
      info: resource.info == null ? "" : String(resource.info),
      tag: resource.tag == null ? "" : String(resource.tag),
      user_agent: resource.user_agent == null ? "" : String(resource.user_agent),
    },
    $done: function $done(value) {
      doneCalls += 1;
      doneValue = value;
    },
    $notify: function $notify() {
      // Official parsers may notify. This harness records nothing.
    },
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Object: Object,
    RegExp: RegExp,
    Date: Date,
    Math: Math,
    JSON: JSON,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    console: console,
  };

  vm.runInNewContext(parserSource, sandbox, {
    filename: filename,
    timeout: (options && options.timeout) || 5000,
  });

  if (doneCalls === 0) {
    throw new Error("parser did not call $done");
  }
  if (doneCalls > 1) {
    throw new Error("parser called $done more than once");
  }
  if (!doneValue || typeof doneValue !== "object") {
    throw new Error("parser passed a non-object to $done");
  }
  return doneValue;
}

function runParserFile(parserPath, resource, options) {
  const absolute = path.resolve(parserPath);
  const source = fs.readFileSync(absolute, "utf8");
  return runQuantumultXParser(source, resource, Object.assign({
    filename: path.basename(absolute),
  }, options));
}

function normalizeExpectedContent(text) {
  return String(text)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/, "");
}

module.exports = {
  runQuantumultXParser,
  runParserFile,
  normalizeExpectedContent,
};
