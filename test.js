var gObj = {
    a: {
        b: function() {
            return a+1;
        },
        c: {
            d: 'Wow',
            e: 1
        }
    }
}

function returnApt(keys) {
    var obj = valueAt(gObj,keys);
    return new Proxy(obj, {
        get: function(t, key) {
            var obj = valueAt(gObj, keys);
            var v = obj[key];
            if(isApplicable(v)) {
                var nKeys = keys.slice();
                nKeys.push(key);
                return returnApt(nKeys);
            } else {
                return v;
            }
        },
        apply: function(t, thisArg, argArray) {
            var obj = valueAt(gObj, keys);
            return obj.apply(thisArg, argArray);
        }
    });
}

function isApplicable(contents) {
    return (contents && contents.constructor && ( contents.constructor.name === 'Object' || typeof contents === 'function' ))
}
function valueAt(o, kr) {
    var v = o;
    for (let i = 0; i < kr.length; i++) {
        const e = kr[i];
        v = v[e];
    }
    return v;
}

var go = returnApt([]);