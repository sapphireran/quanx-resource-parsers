"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");
var rules = require("./rules");

var PARSER_PATH = path.join(__dirname, "..", rules.PARSER_RELATIVE_PATH);

function makeResource(content) {
  var data = {
    content: String(content == null ? "" : content),
    info: "",
    tag: "Nexitally",
    user_agent: ""
  };

  return new Proxy(data, {
    get: function (target, prop) {
      if (prop === "link") {
        throw new Error(
          "privacy contract: parser must not read $resource.link"
        );
      }
      return target[prop];
    }
  });
}

function evaluateParser(rawContent) {
  var settled = null;
  var resource = makeResource(rawContent);

  function done(result) {
    if (settled) {
      throw new Error("$done was called more than once");
    }
    settled = result;
  }

  var context = vm.createContext({
    $resource: resource,
    $done: done,
    String: String,
    console: console
  });

  var source = fs.readFileSync(PARSER_PATH, "utf8");
  vm.runInContext(source, context, {
    filename: rules.PARSER_RELATIVE_PATH
  });

  if (!settled) {
    throw new Error("parser did not call $done");
  }

  return settled;
}

function parseResult(rawContent) {
  var result = evaluateParser(rawContent);
  if (result && typeof result.error === "string" && result.error) {
    return { kind: "error", error: result.error, servers: [] };
  }
  var content = result && result.content != null ? String(result.content) : "";
  var servers = content.length ? content.split("\n") : [];
  return { kind: "servers", error: null, servers: servers, content: content };
}

exports.PARSER_PATH = PARSER_PATH;
exports.evaluateParser = evaluateParser;
exports.parseResult = parseResult;
exports.makeResource = makeResource;
