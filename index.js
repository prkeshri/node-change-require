const fs = require('fs');
var Module = require('module');

var oldRequire =  Module.prototype.require,
    resolve = require.resolve,
    _cache = Module._cache;

var requireFiles = {};

const newRequire = function(id) {
    var path = resolve(id);
    if(path.indexOf('\\') == -1 && path.indexOf('/') == -1) {
        return oldRequire(path); // Native Module
    }
    var cached = requireFiles[path];
    if(cached) {
        return cached;
    }
    var contents = oldRequire(path);
    if(contents && contents.constructor && ( contents.constructor.name === 'Object' || typeof contents === 'function' )) {
        var o = {};
        if(typeof contents === 'function') {
            o = () => {};
        }
        addToWatch(path, contents);
        contents = new Proxy(o, {
            get: function(target, key) {
                return requireFiles[path][key];
            },
            apply: function(target, thisArg, argArray) {
                return requireFiles[path].apply(thisArg, argArray);
            }
        });
    }

    return contents;
}

Object.assign(newRequire, require);

newRequire.globalise = function() {
    Module.prototype.require = newRequire;
    return newRequire;
}

function addToWatch(path, contents) {
    requireFiles[path] = contents;
    fs.watchFile(path, (curr, prev) => {
        delete _cache[path];
        contents = oldRequire(path);
        requireFiles[path] = contents;
    });
}

module.exports = newRequire;


