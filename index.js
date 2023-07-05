const fs = require("fs");
var Module = require("module");
const getCallerFile = require("get-caller-file");
const path = require("path");

var oldRequire = Module.prototype.require,
  resolve = require.resolve,
  _cache = Module._cache;

var requireFiles = {};

const _resolve = function (callerFile, id) {
  var tmp = path.dirname(callerFile);
  tmp = path.join(tmp, id);
  return resolve(tmp);
};

const newRequire = function (id) {
  let isResolved = id.indexOf('\\') == -1 && id.indexOf('/') == -1;
  isResolved ||= id.indexOf('/') === 0; // Unix
  isResolved ||= id.indexOf(':') === 1; // Windows

  let mod;
  try {
    mod = resolve(id);
    isResolved ||= mod.indexOf('node_modules') > -1;
  } catch (e) {
    debugger;
  }

  if (isResolved) {
    return oldRequire(mod); // Native Module
  }
  const callerFile = getCallerFile();
  var path = _resolve(callerFile, id);
  var cached = requireFiles[path];
  if (cached) {
    return cached;
  }

  try {
    let contents = oldRequire(path);
  } catch(e) {
    console.log({e});
  }
  try {
    let contents = oldRequire(path);
    if (
      contents &&
      contents.constructor &&
      (contents.constructor.name === "Object" || typeof contents === "function")
    ) {
      var o = {};
      if (typeof contents === "function") {
        o = () => { };
      }
      addToWatch(path, contents);
      contents = new Proxy(o, {
        get: function (target, key) {
          return requireFiles[path][key];
        },
        apply: function (target, thisArg, argArray) {
          return requireFiles[path].apply(thisArg, argArray);
        },
      });
    }

    return contents;
  } catch (e) {
    console.log({e})
  }

};

Object.assign(newRequire, require);

newRequire.globalise = function () {
  Module.prototype.require = newRequire;
  return newRequire;
};

function addToWatch(path, contents) {
  requireFiles[path] = contents;
  fs.watchFile(path, (curr, prev) => {
    delete _cache[path];
    contents = oldRequire(path);
    requireFiles[path] = contents;
    console.log(`=== Reloaded ${path} ===`);
  });
}

module.exports = newRequire;
