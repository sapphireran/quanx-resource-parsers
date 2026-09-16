"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var PARSER_PATH = path.resolve(__dirname, "..", "..", "nexitally-node-parser.js");

function parseResource(content, extraResource) {
  var result = null;
  var resource = {
    content: content,
    link: "",
    info: "",
    tag: "",
    user_agent: ""
  };

  if (extraResource) {
    Object.keys(extraResource).forEach(function (key) {
      resource[key] = extraResource[key];
    });
  }

  var sandbox = {
    $resource: resource,
    $done: function (payload) {
      if (result !== null) {
        throw new Error("nexitally-node-parser.js called $done more than once");
      }
      result = payload;
    },
    $notify: function () {}
  };

  vm.runInNewContext(fs.readFileSync(PARSER_PATH, "utf8"), sandbox, {
    filename: "nexitally-node-parser.js"
  });

  if (result === null) {
    throw new Error("nexitally-node-parser.js did not call $done");
  }

  return result;
}

module.exports = {
  PARSER_PATH: PARSER_PATH,
  parseResource: parseResource
};
