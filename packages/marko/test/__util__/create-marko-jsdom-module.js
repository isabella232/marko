"use strict";

const createBrowser = require("jsdom-context-require");
const compiler = require("../../compiler");
const globals = [
  "console",
  "__coverage__",
  "Error",
  "describe",
  "before",
  "after",
  "beforeEach",
  "afterEach",
  "it"
];

const browserExtensions = {
  ".marko": compileMarkoModule,
  ".html": compileMarkoModule
};

module.exports = function (dir, html, options) {
  options = options || {};
  return createBrowser({
    dir: dir,
    html: html,
    extensions: browserExtensions,
    // runScripts: 'dangerously', // JSDOM 10+
    beforeParse(window, browser) {
      window.global = window;
      window.alert = () => {};
      window.onerror = error => {
        browser.error = browser.error || error;
      };
      browser.require("complain").log = (...args) =>
        require("complain").log(...args);
      globals.forEach(function (k) {
        window[k] = global[k];
      });
      if (options.beforeParse) {
        options.beforeParse(window, browser);
      }
    }
  });
};

function compileMarkoModule(module, filename) {
  return module._compile(
    compiler.compileFile(filename, {
      writeToDisk: false,
      output: "vdom",
      browser: true,
      meta: true
    }),
    filename
  );
}
