(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Drawchim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* jshint node: true */

var $$ = require('domquery');
var ExtendDefault = require('./src/extend_default');
var TemplateEngine = require('./src/template-engine');
var Touchy = require('touchy');
var Modalblanc = require('modalblanc');
Touchy.enableOn(document);

var drawChim = function(options) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    var defaults = {
        selector: null,
        stains: ['255, 0, 0', '0, 255, 0', '0, 0, 255', '0, 0, 0']
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

    this.canvas = this.options.selector;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.bgColor = '#ffffff';
    this.isDown = false;
    this.blankCanvas = true;
    this.addColor = false;
    this.ctx = this.canvas.getContext('2d');
    this.canvasX;
    this.canvasY;
    this.appId = 'app-canvas';

    this._init();
};

drawChim.prototype.resizeCanvas = function() {
    this.canvas.setAttribute('width', window.innerWidth);
    this.canvas.setAttribute('height', window.innerHeight);
    this.storeCanvasAsImage();
    this.createCanvas();
};

drawChim.prototype._init = function() {
    this.buildScene();
    this.createCanvas();
    this.createStain();
    this.setEvents();
    this.resizeCanvas()
    this.storeCanvasAsImage();
};

drawChim.prototype.createCanvas = function() {
    this.ctx.fillStyle = this.canvas.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = 'rgba(58, 56, 68, 0.5)';
    // this.ctx.globalCompositeOperation = 'difference';
};

drawChim.prototype.buildScene = function() {
    buildElement({
        elm: 'span',
        buttonId: 'clear',
        buttonText: 'Clear canvas',
        parentId: this.appId
    });

    buildElement({
        elm: 'div',
        buttonId: 'stain-pallet',
        buttonText: null,
        parentId: this.appId
    });
}

drawChim.prototype.addStain = function() {
    var template =
        "<div>" +
            "<h1>Kies een kleur</h1>" +
            "<input type='color' value='#ff4499'/>" +
        "</div>",
        stains = TemplateEngine(template, {
            colors: ''
        });

    var modal = new Modalblanc({
        content: stains,
        animation: 'slide-in-right'
    });
    modal.open();
    // var colour = "255,105,180",
    //     newStain = this.options.stains;
    //
    // // push new stains + set addColor
    // newStain.push(colour);
    // this.addColor = true;
    //
    // // create stains
    // this.createStain();
    // // set event
    // this.setEvents();
}

drawChim.prototype.createStain = function() {
    var stainHolder = document.getElementById('stain-pallet');

    // If add color, firt clear stainHolder
    if (this.addColor) {
        stainHolder.innerHTML = "";
    }

    var template =
        '<ul class="stains">' +
            '<%for(var index in this.colors) {%>' +
                '<li class="<%this.colors[index] === "0, 0, 0" ? "is-active" : null %>" data-color="<%this.colors[index]%>" style="background:rgb(<%this.colors[index]%>)"></li>' +
            '<%}%>' +
            '<li class="add-stain">+</li>' +
        '</ul>',
        stains = TemplateEngine(template, {
            colors: this.options.stains
        });

    stainHolder.innerHTML = stains;
};

drawChim.prototype.setEvents = function() {
    var _this = this;

    this.canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        _this.drawStart(e);
    }, false);

    this.canvas.addEventListener('touchmove', function(e) {
        _this.drawMove(e);
    }, false);

    this.canvas.addEventListener('touchend', function(e) {
        _this.drawEnd();
    }, false);

    $$('#clear').on('touchstart', function(){
        _this.clearCanvas();
    });

    // this.options.clearBtn.addEventListener('touchstart', function() {
    //     _this.clearCanvas();
    // }, false);

    $$('.stains li').on('touchstart', function(e) {
        _this.swapColor(e);
    });

    $$(window).on('resize', function(){
        _this.resizeCanvas();
    });

    // this.canvas.addEventListener('tap:hold', function (e) {
    //     _this.colorPickerCircle(e);
    // });

    $$('#pallets').on('swipe:down', function(){
        _this.closeOpenPallet(true);
    });

    $$('#header').on('swipe:up', function(){
        _this.closeOpenPallet(false);
    });

    $$('.add-stain').on('tap', function(){
        _this.addStain();
    });
};

drawChim.prototype.closeOpenPallet = function(state) {
    if (state === true) {
        $$('#header').addClass('is-active');
    } else {
        $$('#header').removeClass('is-active');
    }
}

drawChim.prototype.swapColor = function(event) {
    var elm = event.srcElement,
        newColor = elm.dataset.color;

    $$('.stains li').removeClass('is-active');
    $$(elm).addClass('is-active');
    this.ctx.strokeStyle = 'rgba(' + newColor + ', ' +  0.5 + ')';
    // this.closeOpenPallet(false);
};

drawChim.prototype.colorPickerCircle = function(e) {
    var touchObj = e.detail;
    var stainCircle = document.getElementById('stain-circle');

    this.canvasX = touchObj.pageX - 100;
    this.canvasY = touchObj.pageY - 100;

    stainCircle.style.top = this.canvasY + 'px';
    stainCircle.style.left = this.canvasX + 'px';

    setTimeout(function() {
        $$(stainCircle).addClass('is-active');
    }, 300)

    // setTimeout(function() {
    //     $$(stainCircle).removeClass('is-active')
    // }, 1000)
}

drawChim.prototype.drawStart = function(e) {
    var touchObj = e.changedTouches[0];

    if (this.blankCanvas) {
        this.storeHistory();
    }

    this.isDown = true;
    this.ctx.beginPath();

    this.canvasX = touchObj.pageX - this.canvas.offsetLeft;
    this.canvasY = touchObj.pageY - this.canvas.offsetTop;

    this.ctx.moveTo(this.canvasX, this.canvasY);
};

drawChim.prototype.drawMove = function(e) {
    var touchObj = e.changedTouches[0];

    if (this.isDown !== false) {
        this.canvasX = touchObj.pageX - this.canvas.offsetLeft;
        this.canvasY = touchObj.pageY - this.canvas.offsetTop;
        this.ctx.lineTo(this.canvasX, this.canvasY);
        this.ctx.stroke();
    }
};

drawChim.prototype.drawEnd = function() {
    this.isDown = false;
    this.ctx.closePath();
    this.storeHistory();
};

drawChim.prototype.storeHistory = function() {
    var img = this.canvas.toDataURL('image/png');
    history.pushState({imageData: img}, '', window.location.href);

    if (window.localStorage) {
        localStorage.curImg = img;
    }
};

drawChim.prototype.storeCanvasAsImage = function() {
    var _this = this;
    if (window.localStorage) {
        var img = new Image();

        img.onload = function() {
            _this.ctx.drawImage(img, 0, 0);
        };

        if (localStorage.curImg) {
            img.src = localStorage.curImg;
            this.blankCanvas = false;
        }
    }
};

drawChim.prototype.clearCanvas = function() {
    this.ctx.fillStyle = this.canvas.bgColor;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.storeHistory();
};

function buildElement(buildOptions) {
    var createElm,
        parentElm;

    createElm = document.createElement(buildOptions.elm);
    createElm.id = buildOptions.buttonId;
    createElm.innerHTML = buildOptions.buttonText;
    parentElm = document.getElementById(buildOptions.parentId);

    parentElm.appendChild(createElm);
}

module.exports = drawChim;

},{"./src/extend_default":70,"./src/template-engine":71,"domquery":34,"modalblanc":50,"touchy":64}],2:[function(require,module,exports){
// for compression
var win = require('global/window');
var doc = require('global/document');
var root = doc.documentElement || {};

// detect if we need to use firefox KeyEvents vs KeyboardEvents
var use_key_event = true;
try {
    doc.createEvent('KeyEvents');
}
catch (err) {
    use_key_event = false;
}

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
function check_kb(ev, opts) {
    if (ev.ctrlKey != (opts.ctrlKey || false) ||
        ev.altKey != (opts.altKey || false) ||
        ev.shiftKey != (opts.shiftKey || false) ||
        ev.metaKey != (opts.metaKey || false) ||
        ev.keyCode != (opts.keyCode || 0) ||
        ev.charCode != (opts.charCode || 0)) {

        ev = doc.createEvent('Event');
        ev.initEvent(opts.type, opts.bubbles, opts.cancelable);
        ev.ctrlKey  = opts.ctrlKey || false;
        ev.altKey   = opts.altKey || false;
        ev.shiftKey = opts.shiftKey || false;
        ev.metaKey  = opts.metaKey || false;
        ev.keyCode  = opts.keyCode || 0;
        ev.charCode = opts.charCode || 0;
    }

    return ev;
}

// modern browsers, do a proper dispatchEvent()
var modern = function(type, opts) {
    opts = opts || {};

    // which init fn do we use
    var family = typeOf(type);
    var init_fam = family;
    if (family === 'KeyboardEvent' && use_key_event) {
        family = 'KeyEvents';
        init_fam = 'KeyEvent';
    }

    var ev = doc.createEvent(family);
    var init_fn = 'init' + init_fam;
    var init = typeof ev[init_fn] === 'function' ? init_fn : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = type;
    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        used[key] = true;
        args.push(val);
    }
    ev[init].apply(ev, args);

    // webkit key event issue workaround
    if (family === 'KeyboardEvent') {
        ev = check_kb(ev, opts);
    }

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

var legacy = function (type, opts) {
    opts = opts || {};
    var ev = doc.createEventObject();

    ev.type = type;
    for (var key in opts) {
        if (opts[key] !== undefined) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

// expose either the modern version of event generation or legacy
// depending on what we support
// avoids if statements in the code later
module.exports = doc.createEvent ? modern : legacy;

var initSignatures = require('./init.json');
var types = require('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":3,"./types.json":4,"global/document":43,"global/window":44}],3:[function(require,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyboardEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],4:[function(require,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyboardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvents" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],5:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":69}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
/**
 * Module Dependencies
 */

try {
  var matches = require('matches-selector')
} catch (err) {
  var matches = require('component-matches-selector')
}

/**
 * Export `closest`
 */

module.exports = closest

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Element} scope (optional)
 */

function closest (el, selector, scope) {
  scope = scope || document.documentElement;

  // walk up the dom
  while (el && el !== scope) {
    if (matches(el, selector)) return el;
    el = el.parentNode;
  }

  // check scope for match
  return matches(el, selector) ? el : null;
}

},{"component-matches-selector":10,"matches-selector":10}],8:[function(require,module,exports){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

},{"closest":13,"event":9}],9:[function(require,module,exports){
var bind, unbind, prefix;

function detect () {
  bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
  unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
  prefix = bind !== 'addEventListener' ? 'on' : '';
}

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (!bind) detect();
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (!unbind) detect();
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};

},{}],10:[function(require,module,exports){
/**
 * Module dependencies.
 */

try {
  var query = require('query');
} catch (err) {
  var query = require('component-query');
}

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

},{"component-query":11,"query":11}],11:[function(require,module,exports){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

},{}],12:[function(require,module,exports){

var now = function () {
  return Date.now();
};

/**
 * returns a new function than will be called after "ms" number of milliseconds
 * after the last call to it
 *
 * This is useful to execute a function that might occur too often
 *
 * @method debounce
 * @static
 * @param f {Function} the function to debounce
 * @param ms {Number} the number of milliseconds to wait. If any other call
 * is made before that threshold the waiting will be restarted
 * @param [ctx=undefined] {Object} the context on which this function will be executed
 * (the 'this' object inside the function wil be set to context)
 * @param [immediate=undefined] {Boolean} if the function should be executed in the leading edge or the trailing edge
 * ```
 */
module.exports = function debounce( f, ms, ctx, immediate ) {
  var ts, fn;
  var timeout = null;
  var args;

  fn = function () {
    ctx = ctx || this;
    args = arguments;
    ts = now();

    var later = function () {
      var diff = now() - ts;

      if ( diff < ms ) {
        timeout = setTimeout( later, ms - diff );
        return;
      }
      timeout = null;

      if ( !immediate ) {
        f.apply( ctx, args );
      }
    };

    if ( timeout === null ) {
      if ( immediate ) {
        f.apply( ctx, args );
      }
      timeout = setTimeout( later, ms );
    }
  };

  fn.cancel = function () {
    clearTimeout( timeout );
  };

  return fn;
};

},{}],13:[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
},{"matches-selector":10}],14:[function(require,module,exports){
'use strict'

var DOMEvent = require('@bendrucker/synthetic-dom-events')
var assert = require('assert')

module.exports = function dispatchEvent (element, event, options) {
  assert(element, 'A DOM element is required')
  if (typeof event === 'string') {
    event = DOMEvent(event, options)
  }
  element.dispatchEvent(event)
  return event
}

},{"@bendrucker/synthetic-dom-events":2,"assert":5}],15:[function(require,module,exports){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var whitespaceRe = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

module.exports = classes;
module.exports.add = add;
module.exports.contains = has;
module.exports.has = has;
module.exports.toggle = toggle;
module.exports.remove = remove;
module.exports.removeMatching = removeMatching;

function classes (el) {
  if (el.classList) {
    return el.classList;
  }

  var str = el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(whitespaceRe);
  if ('' === arr[0]) arr.shift();
  return arr;
}

function add (el, name) {
  // classList
  if (el.classList) {
    el.classList.add(name);
    return;
  }

  // fallback
  var arr = classes(el);
  var i = index(arr, name);
  if (!~i) arr.push(name);
  el.className = arr.join(' ');
}

function has (el, name) {
  return el.classList
    ? el.classList.contains(name)
    : !! ~index(classes(el), name);
}

function remove (el, name) {
  if ('[object RegExp]' == toString.call(name)) {
    return removeMatching(el, name);
  }

  // classList
  if (el.classList) {
    el.classList.remove(name);
    return;
  }

  // fallback
  var arr = classes(el);
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  el.className = arr.join(' ');
}

function removeMatching (el, re, ref) {
  var arr = Array.prototype.slice.call(classes(el));
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      remove(el, arr[i]);
    }
  }
}

function toggle (el, name) {
  // classList
  if (el.classList) {
    return el.classList.toggle(name);
  }

  // fallback
  if (has(el, name)) {
    remove(el, name);
  } else {
    add(el, name);
  }
}

},{"indexof":45}],16:[function(require,module,exports){
var evtLifeCycle = { };
var extend = require( 'extend' );
var cache = require( './lib/event-cache' );
var getEventCache = cache.getCache.bind( cache );
var dispatchEvent = require( './lib/dispatch-event' );

var domEvent = require( './lib/dom-event' );
var wrapCallback = require( './lib/wrap-callback' );

module.exports = {
  register: function ( evt, lifecycle ) {
    evtLifeCycle[ evt ] = lifecycle;
  },
  trigger: function ( ele, event ) {
    if ( !event ) {
      throw new Error( 'event is required' );
    }
    var eventCache = getEventCache( ele );
    eventCache = eventCache[ event ];

    if ( !eventCache ) {
      // nothing to trigger
      return;
    }

    Object.keys( eventCache ).forEach( function ( fnId ) {
      var fn = eventCache[ fnId ];
      fn && fn.apply( ele, [
        {
          type: event
        }
      ] );
    } );
  },
  fire: function ( ele, evt, opts ) {
    dispatchEvent( ele, evt, opts );
  },
  on: function ( ele, event, selector, callback, capture ) {
    var me = this;
    if ( !ele ) {
      throw new Error( 'missing argument element' );
    }
    if ( !event ) {
      throw new Error( 'missing argument event' );
    }

    event.split( /\s+/ ).forEach( function ( type ) {
      var parts = type.split( '.' );
      var eventName = parts.shift();

      var descriptor = {
        event: eventName,
        selector: selector,
        callback: callback,
        capture: capture,
        ns: parts.reduce( function ( seq, ns ) {
          seq[ ns ] = true;
          return seq;
        }, { } )
      };

      me._on( ele, descriptor );
    } );

  },
  _on: function ( ele, descriptor ) {
    descriptor = descriptor || { };

    var event = descriptor.event;
    var selector = descriptor.selector;
    var capture = descriptor.capture;
    var ns = descriptor.ns;

    if ( typeof selector === 'function' ) {
      descriptor.callback = selector;
      selector = '';
    }

    var callbackId = require( './lib/get-callback-id' )( descriptor.callback );

    var eventLifeCycleEvent = evtLifeCycle[ event ];
    var eventCache = getEventCache( ele, event );

    if ( eventLifeCycleEvent ) {
      if ( Object.keys( eventCache ).length === 0 ) {
        eventLifeCycleEvent.setup && eventLifeCycleEvent.setup.apply( ele, [
          descriptor
        ] );
      }
      eventLifeCycleEvent.add && eventLifeCycleEvent.add.apply( ele, [
        descriptor
      ] );
    }

    // could have been changed inside the event life cycle
    // so we just ensure here the same id for the function is set
    // this is to be able to remove the listener if the function is given
    // to the off method
    var callback = descriptor.callback;
    callback.xFId = callbackId;

    var wrappedFn = wrapCallback( ele, callback, ns, selector );

    eventCache[ wrappedFn.xFId ] = wrappedFn;

    return domEvent.on( ele, event, wrappedFn, capture );
  },
  off: function ( ele, event, callback, capture ) {
    var me = this;
    event.split( /\s+/ ).forEach( function ( type ) {
      var parts = type.split( '.' );
      var eventName = parts.shift();

      var descriptor = {
        event: eventName,
        callback: callback,
        capture: capture,
        ns: parts.reduce( function ( seq, ns ) {
          seq[ ns ] = true;
          return seq;
        }, { } )
      };

      me._off( ele, descriptor );
    } );
  },

  _doRemoveEvent: function ( ele, event, callback, capture ) {
    var eventCache = getEventCache( ele );
    var currentEventCache = eventCache[ event ];

    if ( !currentEventCache ) {
      // nothing to remove
      return;
    }

    var xFId = callback.xFId;

    if ( xFId ) {
      delete currentEventCache[ xFId ];

      var eventLifeCycleEvent = evtLifeCycle[ event ];

      if ( eventLifeCycleEvent ) {
        eventLifeCycleEvent.remove && eventLifeCycleEvent.remove.apply( ele, {
          event: event,
          callback: callback,
          capture: capture
        } );
      }

      if ( Object.keys( eventCache ).length === 0 ) {
        delete eventCache[ event ];
        if ( eventLifeCycleEvent ) {
          eventLifeCycleEvent.teardown && eventLifeCycleEvent.teardown.apply( ele, {
            event: event,
            callback: callback,
            capture: capture
          } );
        }
      }
    }

    domEvent.off( ele, event, callback, capture );
  },

  _off: function ( ele, descriptor ) {
    var me = this;
    var eventCache = getEventCache( ele );
    var events = Object.keys( eventCache );

    if ( events.length === 0 ) {
      // no events to remove
      return;
    }

    if ( !descriptor.event ) {
      events.forEach( function ( event ) {
        me._off( ele, extend( { }, descriptor, { event: event } ) );
      } );
    }

    eventCache = eventCache[ descriptor.event ];

    if ( !eventCache || Object.keys( eventCache ).length === 0 ) {
      // no events to remove or already removed
      return;
    }

    var callback = descriptor.callback;

    if ( callback ) {
      var id = callback.xFId;
      if ( id ) {
        Object.keys( eventCache ).forEach( function ( key ) {
          var fn = eventCache[ key ];
          if ( fn.callbackId === id ) {
            me._doRemoveEvent( ele, descriptor.event, fn, descriptor.capture );
          }
        } );
      }
      return;
    }

    var namespaces = Object.keys( descriptor.ns );
    var hasNamespaces = namespaces.length > 0;

    Object.keys( eventCache ).forEach( function ( fnId ) {
      var fn = eventCache[ fnId ];
      if ( hasNamespaces ) {
        // only remove the functions that match the ns
        namespaces.forEach( function ( namespace ) {
          if ( fn.xNS[ namespace ] ) {
            me._doRemoveEvent( ele, descriptor.event, fn, descriptor.capture );
          }
        } );
      } else {
        // remove all
        me._doRemoveEvent( ele, descriptor.event, fn, descriptor.capture );
      }
    } );
  }
};

},{"./lib/dispatch-event":17,"./lib/dom-event":18,"./lib/event-cache":19,"./lib/get-callback-id":20,"./lib/wrap-callback":22,"extend":41}],17:[function(require,module,exports){
(function (global){
module.exports = function ( ele, event, options ) {
  var extend = require( 'extend' );
  var opts = extend( { bubbles: true }, options );
  var setEvent = false;
  var CustomEvent = global.CustomEvent;

  if ( CustomEvent ) {
    var evt;
    try {
      evt = new CustomEvent( event, opts );
      ele.dispatchEvent( evt );
      setEvent = true;
    } catch (ex) {
      setEvent = false;
    }
  }
  if ( !setEvent ) {
    var dispatchEvent = require( 'dispatch-event' );
    dispatchEvent( ele, event, opts );
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"dispatch-event":14,"extend":41}],18:[function(require,module,exports){
function on( element, event, callback, capture ) {
  !element.addEventListener && (event = 'on' + event);
  (element.addEventListener || element.attachEvent).call( element, event, callback, capture );
  return callback;
}

function off( element, event, callback, capture ) {
  !element.removeEventListener && (event = 'on' + event);
  (element.removeEventListener || element.detachEvent).call( element, event, callback, capture );
  return callback;
}

module.exports = on;
module.exports.on = on;
module.exports.off = off;

},{}],19:[function(require,module,exports){
var cache = { };
var idGen = require( './id-gen' );
var getId = idGen.create( 'dom-ele' );

function getCache( ele, event, _cache ) {

  var eleId;

  if ( ele === document ) {
    eleId = 'document';
  }

  if ( ele === window ) {
    eleId = 'window';
  }

  if ( !eleId ) {
    eleId = ele.getAttribute( 'x-des-id' );

    if ( !eleId ) {
      eleId = getId();
      ele.setAttribute( 'x-des-id', eleId );
    }
  }

  _cache[ eleId ] = _cache[ eleId ] || { };

  if ( !event ) {
    return _cache[ eleId ];
  }

  _cache[ eleId ][ event ] = _cache[ eleId ][ event ] || { };

  return _cache[ eleId ][ event ];
}

module.exports = {
  getCache: function ( ele, event ) {
    return getCache( ele, event, cache );
  }
};

},{"./id-gen":21}],20:[function(require,module,exports){
var idGen = require( './id-gen' );
var getFnId = idGen.create( 'fn' );

module.exports = function getIdOfCallback( callback ) {
  var eleId = callback.xFId;
  if ( !eleId ) {
    eleId = getFnId();
    callback.xFId = eleId;
  }
  return eleId;
};

},{"./id-gen":21}],21:[function(require,module,exports){
module.exports = {
  create: function ( prefix ) {
    var counter = 0;
    return function getId() {
      return prefix + '-' + Date.now() + '-' + (counter++);
    };
  }
};

},{}],22:[function(require,module,exports){
var closest = require( 'component-closest' );

var getIdOfCallback = require( './get-callback-id' );

module.exports = function wrapCallback( ele, callback, ns, selector ) {
  var fn = function ( e ) {
    var args = arguments;

    if ( !selector ) {
      return callback.apply( ele, args );
    }

    var closestEle = closest( e.target || e.srcElement, selector, ele );

    if ( closestEle ) {
      return callback.apply( closestEle, args );
    }
  };

  getIdOfCallback( fn );

  fn.xNS = ns;

  fn.callbackId = getIdOfCallback( callback );

  return fn;
};

},{"./get-callback-id":20,"component-closest":7}],23:[function(require,module,exports){
module.exports = on;
module.exports.on = on;
module.exports.off = off;

function on (element, event, callback, capture) {
  !element.addEventListener && (event = 'on' + event);
  (element.addEventListener || element.attachEvent).call(element, event, callback, capture);
  return callback;
}

function off (element, event, callback, capture) {
  !element.removeEventListener && (event = 'on' + event);
  (element.removeEventListener || element.detachEvent).call(element, event, callback, capture);
  return callback;
}

},{}],24:[function(require,module,exports){
module.exports = one;
module.exports.all = all;

function one (selector, parent) {
  parent || (parent = document);
  return parent.querySelector(selector);
}

function all (selector, parent) {
  parent || (parent = document);
  var selection = parent.querySelectorAll(selector);
  return  Array.prototype.slice.call(selection);
}

},{}],25:[function(require,module,exports){
var toCamelCase = require('to-camel-case');

module.exports = style;

function all(element, css) {
  var name;
  for ( name in css ) {
    one(element, name, css[name]);
  }
}

function one(element, name, value) {
  element.style[toCamelCase((name == 'float') ? 'cssFloat' : name)] = value;
}

function style(element) {
  if (arguments.length == 3) {
    return one(element, arguments[1], arguments[2]);
  }

  return all(element, arguments[1]);
}

},{"to-camel-case":61}],26:[function(require,module,exports){
var newElement = require("./new-element");
var select = require('./select');

module.exports = {
  add: withChildren(add),
  addAfter: withChildren(addAfter),
  addBefore: withChildren(addBefore),
  insert: insert,
  replace: replace,
  remove: remove
};

function add (parent, child, vars) {
  select(parent).appendChild(newElement(child, vars));
}

function addAfter (parent, child/*[, vars], reference */) {
  var ref = select(arguments[arguments.length - 1], parent).nextSibling;
  var vars = arguments.length > 3 ? arguments[2] : undefined;

  if (ref == null) {
    return add(parent, child, vars);
  }

  addBefore(parent, child, vars, ref);
}

function addBefore (parent, child/*[, vars], reference */) {
  var ref = arguments[arguments.length - 1];
  var vars = arguments.length > 3 ? arguments[2] : undefined;
  select(parent).insertBefore(newElement(child, vars), select(ref, parent));
}

function insert (element /*[,vars], parent */) {
  var parent = arguments[arguments.length - 1];
  var vars = arguments.length > 2 ? arguments[1] : undefined;

  add(select(parent), element, vars);
}

function replace (parent, target, repl, vars) {
  select(parent).replaceChild(select(newElement(repl, vars)), select(target, parent));
}

function remove (element, child) {
  var i, all;

  if (arguments.length == 1 && typeof element != 'string') {
    return element.parentNode.removeChild(element);
  }

  all = arguments.length > 1 ? select.all(child, element) : select.all(element);
  i = all.length;

  while (i--) {
    all[i].parentNode.removeChild(all[i]);
  }

}

function withChildren (fn) {
  return function (_, children) {
    if (!Array.isArray(children)) children = [children];

    var i = -1;
    var len = children.length;
    var params = Array.prototype.slice.call(arguments);

    while (++i < len) {
      params[1] = children[i];
      fn.apply(undefined, params);
    }
  };
}

},{"./new-element":27,"./select":31}],27:[function(require,module,exports){
var newElement = require("new-element");

module.exports = ifNecessary;

function ifNecessary (html, vars) {
  if (!isHTML(html)) return html;
  return newElement(html, vars);
}

function isHTML(text){
  return typeof text == 'string' && text.charAt(0) == '<';
}

},{"new-element":30}],28:[function(require,module,exports){
var qwery = require("qwery");

module.exports = {
  one: one,
  all: all
};

function all (selector, parent) {
  return qwery(selector, parent);
}

function one (selector, parent) {
  return all(selector, parent)[0];
}

},{"qwery":59}],29:[function(require,module,exports){
var fallback = require('./fallback');

module.exports = one;
module.exports.all = all;

function one (selector, parent) {
  parent || (parent = document);

  if (parent.querySelector) {
    return parent.querySelector(selector);
  }

  return fallback.one(selector, parent);
}

function all (selector, parent) {
  parent || (parent = document);

  if (parent.querySelectorAll) {
    return parent.querySelectorAll(selector);
  }

  return fallback.all(selector, parent);
}

},{"./fallback":28}],30:[function(require,module,exports){
var domify = require("domify");
var format = require("format-text");

module.exports = newElement;

function newElement (html, vars) {
  if (arguments.length == 1) return domify(html);
  return domify(format(html, vars));
}

},{"domify":33,"format-text":42}],31:[function(require,module,exports){
var select = require('dom-select');

module.exports = ifNecessary;
module.exports.all = ifNecessaryAll;

function ifNecessary (child, parent) {
  if (Array.isArray(child)) {
    child = child[0];
  }

  if ( typeof child != 'string') {
    return child;
  }

  if (typeof parent == 'string') {
    parent = select(parent, document);
  }

  return select(child, parent);
}

function ifNecessaryAll (child, parent) {
  if (Array.isArray(child)) {
    child = child[0];
  }

  if ( typeof child != 'string') {
    return [child];
  }

  if (typeof parent == 'string') {
    parent = select(parent, document);
  }

  return select.all(child, parent);
}

},{"dom-select":29}],32:[function(require,module,exports){

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

function typeOf(val) {
  switch (Object.prototype.toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
}

},{}],33:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

},{}],34:[function(require,module,exports){
var newElement = require("new-element");
var select = require("./lib/select");

module.exports = select;
module.exports.create = create;

function create (tag) {
  if (tag.charAt(0) == '<') { // html
    return select(newElement(tag));
  }

  return select(document.createElement(tag));
}

},{"./lib/select":38,"new-element":56}],35:[function(require,module,exports){
module.exports = attr;

function attr (chain) {
  return function attr (element, name, value) {
    if (arguments.length == 2) {
      return element.getAttribute(name);
    }

    element.setAttribute(name, value);

    return chain;
  };
}

},{}],36:[function(require,module,exports){
var events = require("dom-event");
var delegate = require("component-delegate");
var keyEvent = require("key-event");
var trim = require("trim");

module.exports = {
  change: shortcut('change'),
  click: shortcut('click'),
  keydown: shortcut('keydown'),
  keyup: shortcut('keyup'),
  keypress: shortcut('keypress'),
  mousedown: shortcut('mousedown'),
  mouseover: shortcut('mouseover'),
  mouseup: shortcut('mouseup'),
  resize: shortcut('resize'),
  on: on,
  off: off,
  onKey: onKey,
  offKey: offKey
};

function shortcut (type){
  return function(element, callback){
    return on(element, type, callback);
  };
}

function off (element, event, selector, callback){
  if (arguments.length == 4) {
    return delegate.unbind(element, selector, event, callback);
  }

  callback = selector;

  events.off(element, event, callback);
}

function on (element, event, selector, callback){
  if (arguments.length == 3) {
    callback = selector;
  }

  if (arguments.length == 4) {
    return delegate.bind(element, selector, event, callback);
  }

  events.on(element, event, callback);
}

function onKey (element, key, callback) {
  keyEvent.on(element, key, callback);
}

function offKey (element, key, callback) {
  keyEvent.off(element, key, callback);
}

},{"component-delegate":8,"dom-event":23,"key-event":46,"trim":66}],37:[function(require,module,exports){
var format = require('format-text');

module.exports = html;

function html (chain) {
  return function (element, newValue, vars){
    if (arguments.length > 1) {
      element.innerHTML = arguments.length > 2 ? format(newValue, vars) : newValue;
      return chain;
    }

    return element.innerHTML;
  };
}

},{"format-text":42}],38:[function(require,module,exports){
var newChain = require("new-chain");
var format = require('format-text');
var classes = require('dom-classes');
var tree = require('dom-tree');
var newElement = require('new-element');
var selectDOM = require('dom-select').all;
var style = require('dom-style');
var closest = require("discore-closest");
var siblings = require("siblings");

var attr = require('./attr');
var events = require('./events');
var html = require('./html');
var text = require('./text');
var value = require('./value');

module.exports = select;

function show(e) {
  style(e, 'display', '')
}

function hide(e) {
  style(e, 'display', 'none')
}

function select (query) {
  var key, chain, methods, elements;
  var task;

  if (typeof query == 'string' && query.charAt(0) == '<') {
    // Create new element from `query`
    elements = [newElement(query, arguments[1])];
  } else if (typeof query == 'string') {
    // Select given CSS query
    elements = Array.prototype.slice.call(selectDOM(query, arguments[1]));
  } else if (query == document) {
    elements = [document.documentElement];
  } else if (arguments.length == 1 && Array.isArray(arguments[0])) {
    elements = arguments[0];
  } else {
    elements = Array.prototype.slice.call(arguments);
  }

  methods = {
    addClass: applyEachElement(classes.add, elements),
    removeClass: applyEachElement(classes.remove, elements),
    toggleClass: applyEachElement(classes.toggle, elements),
    show: applyEachElement(show, elements),
    hide: applyEachElement(hide, elements),
    style: applyEachElement(style, elements)
  };

  for (key in events) {
    methods[key] = applyEachElement(events[key], elements);
  }

  for (key in tree) {
    methods[key] = applyEachElement(tree[key], elements);
  }

  chain = newChain.from(elements)(methods);

  chain.attr = applyEachElement(attr(chain), elements);
  chain.classes = applyEachElement(classes, elements);
  chain.hasClass = applyEachElement(classes.has, elements),
  chain.html = applyEachElement(html(chain), elements);
  chain.text = applyEachElement(text(chain), elements);
  chain.val = applyEachElement(value(chain), elements);
  chain.value = applyEachElement(value(chain), elements);
  chain.parent = selectEachElement(parent, elements);
  chain.select = selectEachElement(selectChild, elements);
  chain.siblings = selectEachElement(siblings, elements);

  return chain;
}

function parent (element, selector) {
  if (!selector) return element.parentNode;
  return closest(element, selector);
};

function selectChild (element, query) {
  return select(query, element);
}

function applyEachElement (fn, elements) {
  if (!fn) throw new Error('Undefined function.');

  return function () {
    var i, len, ret, params, ret;

    len = elements.length;
    i = -1;
    params = [undefined].concat(Array.prototype.slice.call(arguments));

    while (++i < len) {
      params[0] = elements[i];
      ret = fn.apply(undefined, params);
    }

    return ret;
  };
}

function selectEachElement (fn, els) {
  return function () {
    var result = [];
    var params = [undefined].concat(Array.prototype.slice.call(arguments));

    var len = els.length;
    var i = -1;
    var ret;
    var t;
    var tlen;

    while (++i < len) {
      params[0] = els[i];
      ret = fn.apply(undefined, params);

      if (Array.isArray(ret)) {
        tlen = ret.length;
        t = -1;

        while (++t < tlen) {
          if (result.indexOf(ret[t]) != -1) continue;
          result.push(ret[t]);
        }

        continue;
      }

      if (!ret) continue;
      if (result.indexOf(ret) != -1) continue;

      result.push(ret);
    }


    return select(result);
  };
}

},{"./attr":35,"./events":36,"./html":37,"./text":39,"./value":40,"discore-closest":13,"dom-classes":15,"dom-select":24,"dom-style":25,"dom-tree":26,"format-text":42,"new-chain":55,"new-element":56,"siblings":60}],39:[function(require,module,exports){
var format = require('format-text');

module.exports = text;

function text (chain){
  return function (element, newValue, vars) {
    if (arguments.length > 1) {
      element.textContent = arguments.length > 2 ? format(newValue, vars) : newValue;
      return chain;
    }

    return element.textContent;
  };
}

},{"format-text":42}],40:[function(require,module,exports){
var value = require("dom-value");

module.exports = withChain;

function withChain (chain) {
  return function (el, update) {
    if (arguments.length == 2) {
      value(el, update);
      return chain;
    }

    return value(el);
  };
}

},{"dom-value":32}],41:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],42:[function(require,module,exports){
module.exports = format;

function format(text) {
  var context;

  if (typeof arguments[1] == 'object' && arguments[1]) {
    context = arguments[1];
  } else {
    context = Array.prototype.slice.call(arguments, 1);
  }

  return String(text).replace(/\{?\{([^{}]+)}}?/g, replace(context));
};

function replace (context, nil){
  return function (tag, name) {
    if (tag.substring(0, 2) == '{{' && tag.substring(tag.length - 2) == '}}') {
      return '{' + name + '}';
    }

    if (!context.hasOwnProperty(name)) {
      return tag;
    }

    if (typeof context[name] == 'function') {
      return context[name]();
    }

    return context[name];
  }
}

},{}],43:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":6}],44:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],45:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],46:[function(require,module,exports){
var keynameOf = require("keyname-of");
var events = require("dom-event");

module.exports = on;
module.exports.on = on;
module.exports.off = off;

function on (element, keys, callback) {
  var expected = parse(keys);

  var fn = events.on(element, 'keyup', function(event){

    if ((event.ctrlKey || undefined) == expected.ctrl &&
       (event.altKey || undefined) == expected.alt &&
       (event.shiftKey || undefined) == expected.shift &&
       keynameOf(event.keyCode) == expected.key){

      callback(event);
    }

  });


  callback['cb-' + keys] = fn;

  return callback;
}

function off (element, keys, callback) {
  events.off(element, 'keyup', callback['cb-' + keys]);
}

function parse (keys){
  var result = {};
  keys = keys.split(/[^\w]+/);

  var i = keys.length, name;
  while ( i -- ){
    name = keys[i].trim();

    if(name == 'ctrl') {
      result.ctrl = true;
      continue;
    }

    if(name == 'alt') {
      result.alt = true;
      continue;
    }

    if(name == 'shift') {
      result.shift = true;
      continue;
    }

    result.key = name.trim();
  }

  return result;
}

},{"dom-event":23,"keyname-of":47}],47:[function(require,module,exports){
var map = require("keynames");

module.exports = keynameOf;

function keynameOf (n) {
   return map[n] || String.fromCharCode(n).toLowerCase();
}

},{"keynames":48}],48:[function(require,module,exports){
module.exports = {
  8   : 'backspace',
  9   : 'tab',
  13  : 'enter',
  16  : 'shift',
  17  : 'ctrl',
  18  : 'alt',
  20  : 'capslock',
  27  : 'esc',
  32  : 'space',
  33  : 'pageup',
  34  : 'pagedown',
  35  : 'end',
  36  : 'home',
  37  : 'left',
  38  : 'up',
  39  : 'right',
  40  : 'down',
  45  : 'ins',
  46  : 'del',
  91  : 'meta',
  93  : 'meta',
  224 : 'meta'
};

},{}],49:[function(require,module,exports){
'use strict';

var proto = Element.prototype;
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],50:[function(require,module,exports){
'use strict';
/* jshint node: true */

var ExtendDefault = require('./lib/extend_default');
var ImageSlider = require('./lib/image_slider');
var StringAsNode = require('./lib/string_as_node');
var Template = require('./lib/template-engine');


var Modalblanc = function () {
    if (!(this instanceof Modalblanc)) {
      return new Modalblanc();
    }

    this.closeButton = null;
    this.overlay = null;

    var defaults = {
        animation: 'fade-in-out',
        closeButton: true,
        content: '',
        slider: null,
        sideTwo: {
            content: null,
            animation: null,
            button: null,
            buttonBack: null
        },
      };

    this.settings = {};

    this.hasSlider = this.hasSlider ? true : false;
    this.sliderIsOpen = false;

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

};

Modalblanc.prototype.open = function() {
    if (this.settings.modalOpen) return;

    build.call(this);
    setEvents.call(this);
};

Modalblanc.prototype.close = function() {
    if (!this.settings.modalOpen) return;

    var overlay = document.getElementById('overlay-modal-blanc'),
        _this = this;

    overlay.classList.remove('is-active');
    overlay.classList.add('is-inactive');

    var transPrefix = transitionPrefix(overlay);

    overlay.addEventListener(transPrefix.end, function() {
        this.remove();
        _this.settings.modalOpen = false;
    }, false);

    document.onkeyup = null;
    document.onkeydown = null;
};

Modalblanc.prototype.sliderInit = function(side) {
    if (this.options.slider !== null) {
        this.hasSlider = true;
    }

    if (this.hasSlider) {
        this.open();
        this.sliderIsOpen = true;

        this.slider = new ImageSlider({
            parent: side,
            selector: this.options.slider
        });
    }
};

Modalblanc.prototype._contentNext = function() {
    if (this.hasSlider) {
        this.sliderIsOpen = false;
        if (this.slider.playing) this.slider.pause();
        removeClass(this.modalContainer, 'slider-modal');
        addClass(this.modalContainer, 'big-modal');
    }

    var card = document.getElementById('card'),
        customClass = this.options.sideTwo.animation;

    card.classList.remove(typeOfAnimation(customClass, 2));
    card.classList.add(typeOfAnimation(customClass));
};

Modalblanc.prototype._contentPrevious = function() {
    if (this.hasSlider) {
        // if (!this.slider.playing) this.slider.play();
        removeClass(this.modalContainer, 'big-modal');
        addClass(this.modalContainer, 'slider-modal');
    }

    var card = document.getElementById('card'),
        customClass = this.options.sideTwo.animation;

    card.classList.remove(typeOfAnimation(customClass));
    card.classList.add(typeOfAnimation(customClass, 2));
};

Modalblanc.prototype.classEventListener = function(elm, callback) {
    var _this = this;

    for (var i = 0; i < elm.length; i++) {
        elm[i].addEventListener('click', function() {
            callback();
        });
    }
};

function typeOfAnimation(type, typeClass) {
    var animationTypes = {
            'slide': ['slide-next', 'slide-back'],
            'scale': ['scale-next', 'scale-back']
        },
        animationClass = animationTypes[type];

        if (type === undefined) {
            if (typeClass === 2) {
                return animationTypes.slide[1];
            } else {
                return animationTypes.slide[0];
            }
        } else if (typeClass === 2) {
            return animationClass[1];
        } else {
            return animationClass[0];
        }
}

function transitionPrefix(elm) {
    var transEndEventNames = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd otransitionend',
        'transition'       : 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (elm.style[name] !== undefined) {
        return {
            end: transEndEventNames[name]
        };
      }
    }
}

function setEvents() {
    var nextButton = document.getElementById('modal-button-next'),
        prevButton = document.getElementById('modal-button-prev'),
        closed = document.getElementsByClassName('modal-fullscreen-close'),
        _this = this;

    this.classEventListener(closed, function() {
        _this.close();
    });

    keyboardActions.call(this);

    if (this.options.sideTwo.content === null) return;

    nextButton.addEventListener('click', this._contentNext.bind(this));
    prevButton.addEventListener('click', this._contentPrevious.bind(this));

}

function build() {
    this.modalContainer = document.getElementsByClassName('modal-fullscreen-container');
    if (this.options.closeButton) this.closeButton = '<span class="modal-fullscreen-close">X</span>';

    var contentSideOne = !this.options.slider ? contentType(this.options.content) : contentType('<div id="modal-slider"></div>');

    var typeModal = this.options.slider ? 'slider-modal' : 'big-modal';
    var modal = '<div id="overlay-modal-blanc" class="modal-fullscreen-background <%this.animation%> <%this.state%>">' +
                    '<div id="modal-fullscreen-container"class="modal-fullscreen-container <%this.type%> ">' +
                        '<div id="card">'+
                            '<div class="front">' +
                                '<div id="front-card" class="modal-fullscreen-item">'+
                                    '<%this.closeButton%>' +
                                    '<%this.contentTypeSideOne%>' +
                                '</div>'+
                            '</div>' +
                            '<div class="back">' +
                                '<div  id="back-card" class="modal-fullscreen-item">' +
                                    '<%this.closeButton%>' +
                                    '<%this.contentTypeSideTwo%>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

    var modalTemplate = Template(modal, {
        animation: this.options.animation,
        state: 'is-active',
        type: typeModal,
        closeButton: this.closeButton,
        contentTypeSideOne: contentSideOne,
        contentTypeSideTwo: contentType(this.options.sideTwo.content)
    });

    var body = document.getElementsByTagName('body'),
        modalId;

    if (body[0].id) {
        modalId = body[0].id;
    } else {
        modalId = 'go-modal';
        body[0].id = modalId;
    }

    StringAsNode(document.getElementById(modalId), modalTemplate);
    this.settings.modalOpen = true;

    if (this.options.slider) this.sliderInit('#modal-slider');

    if (this.options.sideTwo.content === null) return;

    buildButton(this.options.sideTwo.button);
    buildButton(this.options.sideTwo.buttonBack, 'back');
}

function buildElement(buildOptions) {
    var createElm,
        parentElm;

    createElm = document.createElement(buildOptions.elm);
    createElm.id = buildOptions.buttonId;
    createElm.innerHTML = buildOptions.buttonText;
    parentElm = document.getElementById(buildOptions.parentId);

    parentElm.appendChild(createElm);
}


function buildButton(elm) {
    var button,
        computedButton,
        computedButtonBack,
        frontCard,
        backCard;

    if (elm === null || elm === undefined) {
        if (document.getElementById('modal-button-next') || document.getElementById('modal-button-prev')) {
            return;
        } else {
            buildElement({
                elm: 'a',
                buttonId: 'modal-button-next',
                buttonText: 'Next step',
                parentId: 'front-card'
            });

            buildElement({
                elm: 'a',
                buttonId: 'modal-button-prev',
                buttonText: 'Previous step',
                parentId: 'back-card'
            });
        }
    } else {
        buildElement({
            elm: elm.element,
            buttonId: elm.id,
            buttonText: elm.text,
            parentId: elm.parent,
        });
    }
}

function contentType(contentValue) {
    if (typeof contentValue === 'string') {
        return contentValue;
    } else if (contentValue === null) {
        return '';
    } else {
        return contentValue.innerHTML;
    }
}

function addClass(selector, className) {
    selector[0].classList.add(className)
}

function removeClass(selector, className) {
    selector[0].classList.remove(className)
}

function keyboardActions() {
    var _this = this;

    document.onkeyup = function(e) {
        e.preventDefault();
        if (_this.settings.modalOpen && e.keyCode == 27) {
            _this.close();
        }
    }
}
module.exports = Modalblanc;

},{"./lib/extend_default":51,"./lib/image_slider":52,"./lib/string_as_node":53,"./lib/template-engine":54}],51:[function(require,module,exports){
'use strict';
/* jshint node: true */

module.exports = function(source, properties) {
    var property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
};
},{}],52:[function(require,module,exports){
'use strict';
/* jshint node: true */

var ExtendDefault = require('./extend_default');

var ImageSlider = function() {
    if (!(this instanceof ImageSlider)) {
        return new ImageSlider();
    }

    var defaults = {
        selector: '.slides',
        transition: 'fade-slide',
        autoPlay: false
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

    var _this = this;

    this.currentSlide = 0;
    this.playing;
    this._init();
    this.slider = document.querySelectorAll('.image-slider-holder .image-slider');
    this.setSlide();

    if (this.options.autoPlay) {
        this.play();
    }
};

ImageSlider.prototype._init = function() {
    this.createSlides();
    setEvents.call(this);
};

ImageSlider.prototype.createSlides = function() {
    this.slides = [];
    var slides,
        images = this.options.selector;

    if (images instanceof Array) {
        slides = images;
    } else {
        slides = document.querySelectorAll(this.options.selector + ' img');
    }


    var parentEl = document.querySelector(this.options.parent),
        container = document.createElement('div'),
        slider = document.createElement('ul'),
        slideImg,
        sliderElm,
        imgElm;

    container.className = 'image-slider-container';
    slider.className = 'image-slider-holder';

    for (var i = 0; i < slides.length; i++) {
        if (slides[i].src) {
            slideImg = slides[i].src;
        } else {
            slideImg = slides[i];
        }

        this.slides.push({
            index: i,
            el: slides[i],
            images: slideImg
        });

        sliderElm = document.createElement('li');
        sliderElm.className = 'image-slider';

        imgElm = document.createElement('img');
        imgElm.src = slideImg;

        sliderElm.appendChild(imgElm);
        slider.appendChild(sliderElm);
        container.appendChild(slider);
        parentEl.appendChild(container);
    }

    this.playBtn = document.createElement('span');
    this.playBtn.id = 'play-btn';
    slider.appendChild(this.playBtn);

    this.previousBtn = document.createElement('span');
    this.previousBtn.id = 'previous-btn';
    slider.appendChild(this.previousBtn);

    this.nextBtn = document.createElement('span');
    this.nextBtn.id = 'next-btn';
    slider.appendChild(this.nextBtn);
};

ImageSlider.prototype.setSlide = function() {
    // set the slider with image slider elements.
    var first = this.slider[0];
    first.classList.add('is-showing');
}

function setEvents() {
    var playButton = document.getElementById('play-btn'),
        previousButton = document.getElementById('previous-btn'),
        nextButton = document.getElementById('next-btn'),
        _this = this;

    playButton.onclick = function() {
        if (_this.playing) {
            _this.pause();
        } else {
            _this.play();
        }
    }

    previousButton.onclick = function() {
        _this.pause();
        _this.previousSlide();
    }

    nextButton.onclick = function() {
        _this.pause();
        _this.nextSlide();
    }

    keyboardActions.call(this);
}

ImageSlider.prototype.nextSlide = function() {
    this.goToSlide(this.currentSlide + 1, 'next');
}

ImageSlider.prototype.previousSlide = function() {
    this.goToSlide(this.currentSlide - 1, 'previous');
}

ImageSlider.prototype.goToSlide = function(n, side) {
    var slides = this.slider;

    slides[this.currentSlide].className = side + ' image-slider';
    this.currentSlide = (n + slides.length) % slides.length;
    slides[this.currentSlide].className = side + ' image-slider is-showing';

    if (side === 'previous') {
        this.prevSlide = (this.currentSlide + 1) % slides.length;
    } else {
        this.prevSlide = (this.currentSlide - 1) % slides.length;
    }

    if (side === 'previous') {
        if (this.currentSlide === slides.length) {
            slides[slides.length +   1].className = side + ' image-slider is-hiding';
        } else {
            slides[this.prevSlide].className = side + ' image-slider is-hiding';
        }
    } else {
        if (this.currentSlide === 0) {
            slides[slides.length - 1].className = side + ' image-slider is-hiding';
        } else {
            slides[this.prevSlide].className = side + ' image-slider is-hiding';
        }
    }
}

ImageSlider.prototype.pause = function() {
    this.playBtn.classList.remove('is-pause');
    this.playing = false;
    clearInterval(this.slideInterval);
}

ImageSlider.prototype.play = function() {
    var _this = this;

    this.playBtn.classList.add('is-pause');
    this.playing = true;
    this.slideInterval = setInterval(function() {
        _this.nextSlide();
    }, 2000);
}

function keyboardActions() {
    var _this = this;
    document.onkeydown = function(e) {
        e.preventDefault();
        if (e.keyCode == 37) {
            _this.previousSlide();
        } else if (e.keyCode == 39) {
            _this.nextSlide();
        }
    }
}
module.exports = ImageSlider;

},{"./extend_default":51}],53:[function(require,module,exports){
'use strict';
/* jshint node: true */

module.exports = function(element, html) {
    if (html === null) return;

    var frag = document.createDocumentFragment(),
        tmp = document.createElement('body'),
        child;

    tmp.innerHTML = html;

    while (child = tmp.firstChild) {
        frag.appendChild(child);
    }

    element.appendChild(frag);
    frag = tmp = null;
};
},{}],54:[function(require,module,exports){
'use strict';
/* jshint node: true */

/*
    var template = '<p>Hello, ik ben <%this.name%>. Ik ben <%this.profile.age%> jaar oud en ben erg <%this.state%></p>';
    console.log(TemplateEngine(template, {
        name: 'Jhon Majoor',
        profile: {age: 34},
        state: 'lief'
    }));

    var skillTemplate = 
        'My Skills:' +
        '<%for(var index in this.skills) {%>' +
        '<a href="#"><%this.skills[index]%></a>' +
        '<%}%>';

    console.log(TemplateEngine(skillTemplate, {
        skills: ['js', 'html', 'css']
    }));
*/

module.exports = function(html, options) {
    var re = /<%(.+?)%>/g,
        reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
        code = 'with(obj) { var r=[];\n',
        cursor = 0,
        match,
        result;

    var add = function(line, js) {
        js ? code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n' :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }

    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }

    add(html.substr(cursor, html.length - cursor));
    code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, '');

    try {
        result = new Function('obj', code).apply(options, [options]);
    } catch(err) {
        console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
    }

    return result;
}
},{}],55:[function(require,module,exports){
module.exports = newChain;
module.exports.from = from;

function from(chain){

  return function(){
    var m, i;

    m = methods.apply(undefined, arguments);
    i   = m.length;

    while ( i -- ) {
      chain[ m[i].name ] = m[i].fn;
    }

    m.forEach(function(method){
      chain[ method.name ] = function(){
        method.fn.apply(this, arguments);
        return chain;
      };
    });

    return chain;
  };

}

function methods(){
  var all, el, i, len, result, key;

  all    = Array.prototype.slice.call(arguments);
  result = [];
  i      = all.length;

  while ( i -- ) {
    el = all[i];

    if ( typeof el == 'function' ) {
      result.push({ name: el.name, fn: el });
      continue;
    }

    if ( typeof el != 'object' ) continue;

    for ( key in el ) {
      result.push({ name: key, fn: el[key] });
    }
  }

  return result;
}

function newChain(){
  return from({}).apply(undefined, arguments);
}

},{}],56:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"domify":33,"dup":30,"format-text":57}],57:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],58:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],59:[function(require,module,exports){
/*!
  * @preserve Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz 2012
  * MIT License
  */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('qwery', this, function () {
  var doc = document
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , qSA = 'querySelectorAll'
    , useNativeQSA = 'useNativeQSA'
    , tagName = 'tagName'
    , nodeType = 'nodeType'
    , select // main select() method, assign later

    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+)$/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
    , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
    , splitters = /[\s\>\+\~]/
    , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
    , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
    , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
    , tokenizr = new RegExp(splitters.source + splittersMore.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')

  var walker = {
      ' ': function (node) {
        return node && node !== html && node.parentNode
      }
    , '>': function (node, contestant) {
        return node && node.parentNode == contestant.parentNode && node.parentNode
      }
    , '~': function (node) {
        return node && node.previousSibling
      }
    , '+': function (node, contestant, p1, p2) {
        if (!node) return false
        return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
      }
    }

  function cache() {
    this.c = {}
  }
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined
    }
  , s: function (k, v, r) {
      v = r ? new RegExp(v) : v
      return (this.c[k] = v)
    }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function classRegex(c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
  }

  // not quite as fast as inline loops in older browsers so don't use liberally
  function each(a, fn) {
    var i = 0, l = a.length
    for (; i < l; i++) fn(a[i])
  }

  function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function arrayify(ar) {
    var i = 0, l = ar.length, r = []
    for (; i < l; i++) r[i] = ar[i]
    return r
  }

  function previous(n) {
    while (n = n.previousSibling) if (n[nodeType] == 1) break;
    return n
  }

  function q(query) {
    return query.match(chunker)
  }

  // called using `this` as element and arguments from regex group results.
  // given => div.hello[title="world"]:foo('bar')
  // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
    var i, m, k, o, classes
    if (this[nodeType] !== 1) return false
    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
    if (wholeAttribute && !value) { // select is just for existance of attrib
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      // select is for attrib equality
      return false
    }
    return this
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
    }
    return 0
  }

  // given a selector, first check for simple cases then collect all base candidate matches and filter
  function _qwery(selector, _root) {
    var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)

    if (!tokens.length) return r

    token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
    if (!root) return r

    intr = q(token)
    // collect base candidates to filter
    els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    // filter elements according to the right-most part of the selector
    for (i = 0, l = els.length; i < l; i++) {
      if (item = interpret.apply(els[i], intr)) r[r.length] = item
    }
    if (!tokens.length) return r

    // filter further according to the rest of the selector (the left side)
    each(r, function (e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
    return ret
  }

  // compare element to a selector
  function is(el, selector, root) {
    if (isNode(selector)) return el == selector
    if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

    var selectors = selector.split(','), tokens, dividedTokens
    while (selector = selectors.pop()) {
      tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      dividedTokens = selector.match(dividers)
      tokens = tokens.slice(0) // copy array
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }
    return false
  }

  // given elements matching the right-most part of a selector, filter out any that don't match the rest
  function ancestorMatch(el, tokens, dividedTokens, root) {
    var cand
    // recursively work backwards through the tokens and up the dom, covering all options
    function crawl(e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
          if (i) {
            if (cand = crawl(p, i - 1, p)) return cand
          } else return p
        }
      }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
  }

  function isNode(el, t) {
    return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq(ar) {
    var a = [], i, j;
    o:
    for (i = 0; i < ar.length; ++i) {
      for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  function byId(root, id, el) {
    // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
    return root[nodeType] === 9 ? root.getElementById(id) :
      root.ownerDocument &&
        (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
          (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
  }

  function qwery(selector, _root) {
    var m, el, root = normalizeRoot(_root)

    // easy, fast cases that we can dispatch with simple DOM calls
    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(easy)) {
      if (m[1]) return (el = byId(root, m[1])) ? [el] : []
      if (m[2]) return arrayify(root[byTag](m[2]))
      if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
    }

    return select(selector, root)
  }

  // where the root is not document and a relationship selector is first we have to
  // do some awkward adjustments to get it to work, even with qSA
  function collectSelector(root, collector) {
    return function (s) {
      var oid, nid
      if (splittable.test(s)) {
        if (root[nodeType] !== 9) {
          // make sure the el has an id, rewrite the query, set root to doc and run it
          if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
          s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
          collector(root.parentNode || root, s, true)
          oid || root.removeAttribute('id')
        }
        return;
      }
      s.length && collector(root, s, false)
    }
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container[nodeType] === 9 || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    }
  , getAttr = function () {
      // detect buggy IE src/href getAttribute() call
      var e = doc.createElement('p')
      return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
        function (e, a) {
          return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
            e.getAttribute(a, 2) : e.getAttribute(a)
        } :
        function (e, a) { return e.getAttribute(a) }
    }()
  , hasByClass = !!doc[byClass]
    // has native qSA support
  , hasQSA = doc.querySelector && doc[qSA]
    // use native qSA
  , selectQSA = function (selector, root) {
      var result = [], ss, e
      try {
        if (root[nodeType] === 9 || !splittable.test(selector)) {
          // most work is done right here, defer to qSA
          return arrayify(root[qSA](selector))
        }
        // special case where we need the services of `collectSelector()`
        each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
          e = ctx[qSA](s)
          if (e.length == 1) result[result.length] = e.item(0)
          else if (e.length) result = result.concat(arrayify(e))
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      } catch (ex) { }
      return selectNonNative(selector, root)
    }
    // no native selector support
  , selectNonNative = function (selector, root) {
      var result = [], items, m, i, l, r, ss
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        r = classRegex(m[2])
        items = root[byTag](m[1] || '*')
        for (i = 0, l = items.length; i < l; i++) {
          if (r.test(items[i].className)) result[result.length] = items[i]
        }
        return result
      }
      // more complex selector, get `_qwery()` to do the work for us
      each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
        r = _qwery(s, ctx)
        for (i = 0, l = r.length; i < l; i++) {
          if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
        }
      }))
      return ss.length > 1 && result.length > 1 ? uniq(result) : result
    }
  , configure = function (options) {
      // configNativeQSA: use fully-internal selector or native qSA where present
      if (typeof options[useNativeQSA] !== 'undefined')
        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
    }

  configure({ useNativeQSA: true })

  qwery.configure = configure
  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  return qwery
});

},{}],60:[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function(el, selector) {
  var node = el.parentNode.firstChild
  var siblings = []
  
  for ( ; node; node = node.nextSibling ) {
    if ( node.nodeType === 1 && node !== el ) {
      if (!selector) siblings.push(node)
      else if (matches(node, selector)) siblings.push(node)
    }
  }
  
  return siblings
}

},{"matches-selector":49}],61:[function(require,module,exports){

var space = require('to-space-case')

/**
 * Export.
 */

module.exports = toCamelCase

/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */

function toCamelCase(string) {
  return space(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase()
  })
}

},{"to-space-case":63}],62:[function(require,module,exports){

/**
 * Export.
 */

module.exports = toNoCase

/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/
var hasSeparator = /(_|-|\.|:)/
var hasCamel = /([a-z][A-Z]|[A-Z][a-z])/

/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase(string) {
  if (hasSpace.test(string)) return string.toLowerCase()
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase()
  if (hasCamel.test(string)) return uncamelize(string).toLowerCase()
  return string.toLowerCase()
}

/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g

/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate(string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : ''
  })
}

/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g

/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize(string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ')
  })
}

},{}],63:[function(require,module,exports){

var clean = require('to-no-case')

/**
 * Export.
 */

module.exports = toSpaceCase

/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */

function toSpaceCase(string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : ''
  }).trim()
}

},{"to-no-case":62}],64:[function(require,module,exports){
module.exports = {
  enableOn: function ( el, opts ) {
    var Tap = require( './touchy' );
    var ins = new Tap( el, opts );
    return ins;
  }
};

},{"./touchy":65}],65:[function(require,module,exports){
var debounce = require( 'debouncy' );
var extend = require( 'extend' );
var eventHelper = require( 'dom-event-special' );

function Touchy( el, opts ) {
  var me = this;

  me._opts = {
    minSwipeDeltaX: 25,
    minSwipeDeltaY: 25,
    tap: true,
    taphold: true,
    swipe: true,
    minTapDisplacementTolerance: 10,
    tapHoldMinThreshold: 500,
    swipeThreshold: 1000,
    mousedownThreshold: 500,
    discardTapholdIfMove: true
  };

  extend( me._opts, opts );

  var ele = me.el = (typeof el === 'object' && el !== null) ? el : document.getElementById( el );
  me.moved = false;
  me.startX = 0;
  me.startY = 0;

  me._mouseEventsAllowed = true;

  me.setMouseEventsAllowed = debounce( function () {
    me._mouseEventsAllowed = true;
  }, me._opts.mousedownThreshold );

  ele.addEventListener( 'touchstart', me, false );
  ele.addEventListener( 'mousedown', me, false );
}

var tapProto = Touchy.prototype;

tapProto.blockMouseEvents = function () {
  var me = this;
  me._mouseEventsAllowed = false;
  me.setMouseEventsAllowed();
};

tapProto._getClientX = function ( e ) {
  if ( e.touches && e.touches.length > 0 ) {
    return e.touches[ 0 ].clientX;
  }
  return e.clientX;
};

tapProto._getClientY = function ( e ) {
  if ( e.touches && e.touches.length > 0 ) {
    return e.touches[ 0 ].clientY;
  }
  return e.clientY;
};

tapProto._getPageX = function ( e ) {
  if ( e.touches && e.touches.length > 0 ) {
    return e.touches[ 0 ].pageX;
  }
  return e.pageX;
};

tapProto._getPageY = function ( e ) {
  if ( e.touches && e.touches.length > 0 ) {
    return e.touches[ 0 ].pageY;
  }
  return e.pageY;
};


tapProto.start = function ( e ) {
  var me = this;

  var ele = me.el;

  me.startTime = Date.now();

  if ( e.type === 'touchstart' ) {
    ele.addEventListener( 'touchmove', me, false );
    ele.addEventListener( 'touchend', me, false );
    ele.addEventListener( 'touchcancel', me, false );
    me.checkForTaphold( e );
    me.blockMouseEvents();
  }

  if ( e.type === 'mousedown' && me._mouseEventsAllowed && (e.which === 1 || e.button === 0) ) {
    ele.addEventListener( 'mousemove', me, false );
    ele.addEventListener( 'mouseup', me, false );
    me.checkForTaphold( e );
  }

  me.startTarget = e.target;

  me.handlingStart = true;

  me.moved = false;
  me.startX = me._getClientX( e ); //e.type === 'touchstart' ? e.touches[ 0 ].clientX : e.clientX;
  me.startY = me._getClientY( e ); //e.type === 'touchstart' ? e.touches[ 0 ].clientY : e.clientY;

};

tapProto.checkForTaphold = function ( e ) {
  var me = this;

  if ( !me._opts.taphold ) {
    return;
  }

  clearTimeout( me.tapHoldInterval );

  me.tapHoldInterval = setTimeout( function () {

    if ( (me.moved && me._opts.discardTapholdIfMove) || !me.handlingStart || !me._opts.taphold ) {
      return;
    }

    eventHelper.fire( me.startTarget, 'tap:hold', {
      bubbles: true,
      cancelable: true,
      detail: {
        pageX: me._getPageX( e ),
        pageY: me._getPageY( e )
      }
    } );
  }, me._opts.tapHoldMinThreshold );
};

tapProto.move = function ( e ) {
  var me = this;

  me._moveX = me._getClientX( e );
  me._moveY = me._getClientY( e );

  var tolerance = me._opts.minTapDisplacementTolerance;
  //if finger moves more than 10px flag to cancel
  if ( Math.abs( me._moveX - this.startX ) > tolerance || Math.abs( me._moveY - this.startY ) > tolerance ) {
    this.moved = true;
  }
};

tapProto.end = function ( e ) {
  var me = this;
  var ele = me.el;

  ele.removeEventListener( 'mousemove', me, false );
  ele.removeEventListener( 'touchmove', me, false );
  ele.removeEventListener( 'touchend', me, false );
  ele.removeEventListener( 'touchcancel', me, false );
  ele.removeEventListener( 'mouseup', me, false );

  var target = e.target;
  var endTime = Date.now();
  var timeDelta = endTime - me.startTime;

  me.handlingStart = false;
  clearTimeout( me.tapHoldInterval );

  if ( !me.moved ) {

    if ( target !== me.startTarget || timeDelta > me._opts.tapHoldMinThreshold ) {
      me.startTarget = null;
      return;
    }

    if ( me._opts.tap ) {
      eventHelper.fire( target, 'tap', {
        bubbles: true,
        cancelable: true,
        detail: {
          pageX: me._getPageX( e ),
          pageY: me._getPageY( e )
        }
      } );
    }

    return;
  }

  if ( !me._opts.swipe || timeDelta > me._opts.swipeThreshold ) {
    return;
  }

  var deltaX = me._moveX - me.startX;
  var deltaY = me._moveY - me.startY;

  var absDeltaX = Math.abs( deltaX );
  var absDeltaY = Math.abs( deltaY );

  var swipeInX = absDeltaX > me._opts.minSwipeDeltaX;
  var swipeInY = absDeltaY > me._opts.minSwipeDeltaY;

  var swipeHappen = swipeInX || swipeInY;

  if ( !swipeHappen ) {
    return;
  }

  var direction = '';

  if ( absDeltaX >= absDeltaY ) {
    direction += (deltaX > 0 ? 'right' : 'left');
  } else {
    direction += (deltaY > 0 ? 'down' : 'up');
  }

  eventHelper.fire( target, 'swipe', {
    bubbles: true,
    cancelable: true,
    detail: {
      direction: direction,
      deltaX: deltaX,
      deltaY: deltaY
    }
  } );

  eventHelper.fire( target, 'swipe:' + direction, {
    bubbles: true,
    cancelable: true,
    detail: {
      direction: direction,
      deltaX: deltaX,
      deltaY: deltaY
    }
  } );
};

tapProto.cancel = function () {
  var me = this;
  clearTimeout( me.tapHoldInterval );

  me.handlingStart = false;
  me.moved = false;
  me.startX = 0;
  me.startY = 0;
};

tapProto.destroy = function () {
  var me = this;
  var ele = me.el;

  me.handlingStart = false;
  clearTimeout( me.tapHoldInterval );

  ele.removeEventListener( 'touchstart', me, false );
  ele.removeEventListener( 'touchmove', me, false );
  ele.removeEventListener( 'touchend', me, false );
  ele.removeEventListener( 'touchcancel', me, false );
  ele.removeEventListener( 'mousedown', me, false );
  ele.removeEventListener( 'mouseup', me, false );
  me.el = null;
};

tapProto.handleEvent = function ( e ) {
  var me = this;
  switch (e.type) {
    case 'touchstart': me.start( e );
      break;
    case 'mousemove': me.move( e );
      break;
    case 'touchmove': me.move( e );
      break;
    case 'touchend': me.end( e );
      break;
    case 'touchcancel': me.cancel( e );
      break;
    case 'mousedown': me.start( e );
      break;
    case 'mouseup': me.end( e );
      break;
  }
};

module.exports = Touchy;

},{"debouncy":12,"dom-event-special":16,"extend":41}],66:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],67:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],68:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],69:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":68,"_process":58,"inherits":67}],70:[function(require,module,exports){
'use strict';
/* jshint node:true */

module.exports = function(source, properties) {
    for (var property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
};
},{}],71:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AYmVuZHJ1Y2tlci9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AYmVuZHJ1Y2tlci9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbml0Lmpzb24iLCJub2RlX21vZHVsZXMvQGJlbmRydWNrZXIvc3ludGhldGljLWRvbS1ldmVudHMvdHlwZXMuanNvbiIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtY2xvc2VzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtZGVsZWdhdGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1tYXRjaGVzLXNlbGVjdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1xdWVyeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWJvdW5jeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kaXNjb3JlLWNsb3Nlc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGlzcGF0Y2gtZXZlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWNsYXNzZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvbGliL2Rpc3BhdGNoLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2RvbS1ldmVudC1zcGVjaWFsL2xpYi9kb20tZXZlbnQuanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvbGliL2V2ZW50LWNhY2hlLmpzIiwibm9kZV9tb2R1bGVzL2RvbS1ldmVudC1zcGVjaWFsL2xpYi9nZXQtY2FsbGJhY2staWQuanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvbGliL2lkLWdlbi5qcyIsIm5vZGVfbW9kdWxlcy9kb20tZXZlbnQtc3BlY2lhbC9saWIvd3JhcC1jYWxsYmFjay5qcyIsIm5vZGVfbW9kdWxlcy9kb20tZXZlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXNlbGVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kb20tc3R5bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbmV3LWVsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbm9kZV9tb2R1bGVzL2RvbS1zZWxlY3QvZmFsbGJhY2suanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbm9kZV9tb2R1bGVzL2RvbS1zZWxlY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbm9kZV9tb2R1bGVzL25ldy1lbGVtZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RvbS10cmVlL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9kb20tdmFsdWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9taWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RvbXF1ZXJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RvbXF1ZXJ5L2xpYi9hdHRyLmpzIiwibm9kZV9tb2R1bGVzL2RvbXF1ZXJ5L2xpYi9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvZG9tcXVlcnkvbGliL2h0bWwuanMiLCJub2RlX21vZHVsZXMvZG9tcXVlcnkvbGliL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9kb21xdWVyeS9saWIvdGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9kb21xdWVyeS9saWIvdmFsdWUuanMiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvcm1hdC10ZXh0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL2luZGV4b2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2V5LWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleW5hbWUtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2V5bmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hlcy1zZWxlY3Rvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tb2RhbGJsYW5jL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21vZGFsYmxhbmMvbGliL2V4dGVuZF9kZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL21vZGFsYmxhbmMvbGliL2ltYWdlX3NsaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9tb2RhbGJsYW5jL2xpYi9zdHJpbmdfYXNfbm9kZS5qcyIsIm5vZGVfbW9kdWxlcy9tb2RhbGJsYW5jL2xpYi90ZW1wbGF0ZS1lbmdpbmUuanMiLCJub2RlX21vZHVsZXMvbmV3LWNoYWluL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9xd2VyeS9xd2VyeS5qcyIsIm5vZGVfbW9kdWxlcy9zaWJsaW5ncy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90by1jYW1lbC1jYXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLW5vLWNhc2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG8tc3BhY2UtY2FzZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG91Y2h5L3RvdWNoeS5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJzcmMvZXh0ZW5kX2RlZmF1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2V0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxudmFyICQkID0gcmVxdWlyZSgnZG9tcXVlcnknKTtcbnZhciBFeHRlbmREZWZhdWx0ID0gcmVxdWlyZSgnLi9zcmMvZXh0ZW5kX2RlZmF1bHQnKTtcbnZhciBUZW1wbGF0ZUVuZ2luZSA9IHJlcXVpcmUoJy4vc3JjL3RlbXBsYXRlLWVuZ2luZScpO1xudmFyIFRvdWNoeSA9IHJlcXVpcmUoJ3RvdWNoeScpO1xudmFyIE1vZGFsYmxhbmMgPSByZXF1aXJlKCdtb2RhbGJsYW5jJyk7XG5Ub3VjaHkuZW5hYmxlT24oZG9jdW1lbnQpO1xuXG52YXIgZHJhd0NoaW0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRyYXdDaGltKSkge1xuICAgICAgcmV0dXJuIG5ldyBkcmF3Q2hpbSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgc2VsZWN0b3I6IG51bGwsXG4gICAgICAgIHN0YWluczogWycyNTUsIDAsIDAnLCAnMCwgMjU1LCAwJywgJzAsIDAsIDI1NScsICcwLCAwLCAwJ11cbiAgICB9O1xuXG4gICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBFeHRlbmREZWZhdWx0KGRlZmF1bHRzLCBhcmd1bWVudHNbMF0pO1xuICAgIH1cblxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMuY2FudmFzLmJnQ29sb3IgPSAnI2ZmZmZmZic7XG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJsYW5rQ2FudmFzID0gdHJ1ZTtcbiAgICB0aGlzLmFkZENvbG9yID0gZmFsc2U7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuY2FudmFzWDtcbiAgICB0aGlzLmNhbnZhc1k7XG4gICAgdGhpcy5hcHBJZCA9ICdhcHAtY2FudmFzJztcblxuICAgIHRoaXMuX2luaXQoKTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5yZXNpemVDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpO1xuICAgIHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0Jywgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB0aGlzLnN0b3JlQ2FudmFzQXNJbWFnZSgpO1xuICAgIHRoaXMuY3JlYXRlQ2FudmFzKCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJ1aWxkU2NlbmUoKTtcbiAgICB0aGlzLmNyZWF0ZUNhbnZhcygpO1xuICAgIHRoaXMuY3JlYXRlU3RhaW4oKTtcbiAgICB0aGlzLnNldEV2ZW50cygpO1xuICAgIHRoaXMucmVzaXplQ2FudmFzKClcbiAgICB0aGlzLnN0b3JlQ2FudmFzQXNJbWFnZSgpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmNyZWF0ZUNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY2FudmFzLmJnQ29sb3I7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gNjtcbiAgICB0aGlzLmN0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICB0aGlzLmN0eC5saW5lSm9pbiA9ICdyb3VuZCc7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAncmdiYSg1OCwgNTYsIDY4LCAwLjUpJztcbiAgICAvLyB0aGlzLmN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGlmZmVyZW5jZSc7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuYnVpbGRTY2VuZSA9IGZ1bmN0aW9uKCkge1xuICAgIGJ1aWxkRWxlbWVudCh7XG4gICAgICAgIGVsbTogJ3NwYW4nLFxuICAgICAgICBidXR0b25JZDogJ2NsZWFyJyxcbiAgICAgICAgYnV0dG9uVGV4dDogJ0NsZWFyIGNhbnZhcycsXG4gICAgICAgIHBhcmVudElkOiB0aGlzLmFwcElkXG4gICAgfSk7XG5cbiAgICBidWlsZEVsZW1lbnQoe1xuICAgICAgICBlbG06ICdkaXYnLFxuICAgICAgICBidXR0b25JZDogJ3N0YWluLXBhbGxldCcsXG4gICAgICAgIGJ1dHRvblRleHQ6IG51bGwsXG4gICAgICAgIHBhcmVudElkOiB0aGlzLmFwcElkXG4gICAgfSk7XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5hZGRTdGFpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9XG4gICAgICAgIFwiPGRpdj5cIiArXG4gICAgICAgICAgICBcIjxoMT5LaWVzIGVlbiBrbGV1cjwvaDE+XCIgK1xuICAgICAgICAgICAgXCI8aW5wdXQgdHlwZT0nY29sb3InIHZhbHVlPScjZmY0NDk5Jy8+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiLFxuICAgICAgICBzdGFpbnMgPSBUZW1wbGF0ZUVuZ2luZSh0ZW1wbGF0ZSwge1xuICAgICAgICAgICAgY29sb3JzOiAnJ1xuICAgICAgICB9KTtcblxuICAgIHZhciBtb2RhbCA9IG5ldyBNb2RhbGJsYW5jKHtcbiAgICAgICAgY29udGVudDogc3RhaW5zLFxuICAgICAgICBhbmltYXRpb246ICdzbGlkZS1pbi1yaWdodCdcbiAgICB9KTtcbiAgICBtb2RhbC5vcGVuKCk7XG4gICAgLy8gdmFyIGNvbG91ciA9IFwiMjU1LDEwNSwxODBcIixcbiAgICAvLyAgICAgbmV3U3RhaW4gPSB0aGlzLm9wdGlvbnMuc3RhaW5zO1xuICAgIC8vXG4gICAgLy8gLy8gcHVzaCBuZXcgc3RhaW5zICsgc2V0IGFkZENvbG9yXG4gICAgLy8gbmV3U3RhaW4ucHVzaChjb2xvdXIpO1xuICAgIC8vIHRoaXMuYWRkQ29sb3IgPSB0cnVlO1xuICAgIC8vXG4gICAgLy8gLy8gY3JlYXRlIHN0YWluc1xuICAgIC8vIHRoaXMuY3JlYXRlU3RhaW4oKTtcbiAgICAvLyAvLyBzZXQgZXZlbnRcbiAgICAvLyB0aGlzLnNldEV2ZW50cygpO1xufVxuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY3JlYXRlU3RhaW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhaW5Ib2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhaW4tcGFsbGV0Jyk7XG5cbiAgICAvLyBJZiBhZGQgY29sb3IsIGZpcnQgY2xlYXIgc3RhaW5Ib2xkZXJcbiAgICBpZiAodGhpcy5hZGRDb2xvcikge1xuICAgICAgICBzdGFpbkhvbGRlci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9XG4gICAgICAgICc8dWwgY2xhc3M9XCJzdGFpbnNcIj4nICtcbiAgICAgICAgICAgICc8JWZvcih2YXIgaW5kZXggaW4gdGhpcy5jb2xvcnMpIHslPicgK1xuICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCI8JXRoaXMuY29sb3JzW2luZGV4XSA9PT0gXCIwLCAwLCAwXCIgPyBcImlzLWFjdGl2ZVwiIDogbnVsbCAlPlwiIGRhdGEtY29sb3I9XCI8JXRoaXMuY29sb3JzW2luZGV4XSU+XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOnJnYig8JXRoaXMuY29sb3JzW2luZGV4XSU+KVwiPjwvbGk+JyArXG4gICAgICAgICAgICAnPCV9JT4nICtcbiAgICAgICAgICAgICc8bGkgY2xhc3M9XCJhZGQtc3RhaW5cIj4rPC9saT4nICtcbiAgICAgICAgJzwvdWw+JyxcbiAgICAgICAgc3RhaW5zID0gVGVtcGxhdGVFbmdpbmUodGVtcGxhdGUsIHtcbiAgICAgICAgICAgIGNvbG9yczogdGhpcy5vcHRpb25zLnN0YWluc1xuICAgICAgICB9KTtcblxuICAgIHN0YWluSG9sZGVyLmlubmVySFRNTCA9IHN0YWlucztcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zZXRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5kcmF3U3RhcnQoZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBfdGhpcy5kcmF3TW92ZShlKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZHJhd0VuZCgpO1xuICAgIH0sIGZhbHNlKTtcblxuICAgICQkKCcjY2xlYXInKS5vbigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIF90aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzLm9wdGlvbnMuY2xlYXJCdG4uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICBfdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIC8vIH0sIGZhbHNlKTtcblxuICAgICQkKCcuc3RhaW5zIGxpJykub24oJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLnN3YXBDb2xvcihlKTtcbiAgICB9KTtcblxuICAgICQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIF90aGlzLnJlc2l6ZUNhbnZhcygpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndGFwOmhvbGQnLCBmdW5jdGlvbiAoZSkge1xuICAgIC8vICAgICBfdGhpcy5jb2xvclBpY2tlckNpcmNsZShlKTtcbiAgICAvLyB9KTtcblxuICAgICQkKCcjcGFsbGV0cycpLm9uKCdzd2lwZTpkb3duJywgZnVuY3Rpb24oKXtcbiAgICAgICAgX3RoaXMuY2xvc2VPcGVuUGFsbGV0KHRydWUpO1xuICAgIH0pO1xuXG4gICAgJCQoJyNoZWFkZXInKS5vbignc3dpcGU6dXAnLCBmdW5jdGlvbigpe1xuICAgICAgICBfdGhpcy5jbG9zZU9wZW5QYWxsZXQoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgJCQoJy5hZGQtc3RhaW4nKS5vbigndGFwJywgZnVuY3Rpb24oKXtcbiAgICAgICAgX3RoaXMuYWRkU3RhaW4oKTtcbiAgICB9KTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5jbG9zZU9wZW5QYWxsZXQgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmIChzdGF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAkJCgnI2hlYWRlcicpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkJCgnI2hlYWRlcicpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB9XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zd2FwQ29sb3IgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBlbG0gPSBldmVudC5zcmNFbGVtZW50LFxuICAgICAgICBuZXdDb2xvciA9IGVsbS5kYXRhc2V0LmNvbG9yO1xuXG4gICAgJCQoJy5zdGFpbnMgbGknKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgJCQoZWxtKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgnICsgbmV3Q29sb3IgKyAnLCAnICsgIDAuNSArICcpJztcbiAgICAvLyB0aGlzLmNsb3NlT3BlblBhbGxldChmYWxzZSk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY29sb3JQaWNrZXJDaXJjbGUgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRvdWNoT2JqID0gZS5kZXRhaWw7XG4gICAgdmFyIHN0YWluQ2lyY2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YWluLWNpcmNsZScpO1xuXG4gICAgdGhpcy5jYW52YXNYID0gdG91Y2hPYmoucGFnZVggLSAxMDA7XG4gICAgdGhpcy5jYW52YXNZID0gdG91Y2hPYmoucGFnZVkgLSAxMDA7XG5cbiAgICBzdGFpbkNpcmNsZS5zdHlsZS50b3AgPSB0aGlzLmNhbnZhc1kgKyAncHgnO1xuICAgIHN0YWluQ2lyY2xlLnN0eWxlLmxlZnQgPSB0aGlzLmNhbnZhc1ggKyAncHgnO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJCQoc3RhaW5DaXJjbGUpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB9LCAzMDApXG5cbiAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAkJChzdGFpbkNpcmNsZSkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpXG4gICAgLy8gfSwgMTAwMClcbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLmRyYXdTdGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdG91Y2hPYmogPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuXG4gICAgaWYgKHRoaXMuYmxhbmtDYW52YXMpIHtcbiAgICAgICAgdGhpcy5zdG9yZUhpc3RvcnkoKTtcbiAgICB9XG5cbiAgICB0aGlzLmlzRG93biA9IHRydWU7XG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG5cbiAgICB0aGlzLmNhbnZhc1ggPSB0b3VjaE9iai5wYWdlWCAtIHRoaXMuY2FudmFzLm9mZnNldExlZnQ7XG4gICAgdGhpcy5jYW52YXNZID0gdG91Y2hPYmoucGFnZVkgLSB0aGlzLmNhbnZhcy5vZmZzZXRUb3A7XG5cbiAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jYW52YXNYLCB0aGlzLmNhbnZhc1kpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmRyYXdNb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciB0b3VjaE9iaiA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICBpZiAodGhpcy5pc0Rvd24gIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuY2FudmFzWCA9IHRvdWNoT2JqLnBhZ2VYIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICAgICAgdGhpcy5jYW52YXNZID0gdG91Y2hPYmoucGFnZVkgLSB0aGlzLmNhbnZhcy5vZmZzZXRUb3A7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNhbnZhc1gsIHRoaXMuY2FudmFzWSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH1cbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5kcmF3RW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLnN0b3JlSGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbWcgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtpbWFnZURhdGE6IGltZ30sICcnLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY3VySW1nID0gaW1nO1xuICAgIH1cbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zdG9yZUNhbnZhc0FzSW1hZ2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5jdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5jdXJJbWcpIHtcbiAgICAgICAgICAgIGltZy5zcmMgPSBsb2NhbFN0b3JhZ2UuY3VySW1nO1xuICAgICAgICAgICAgdGhpcy5ibGFua0NhbnZhcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmNsZWFyQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jYW52YXMuYmdDb2xvcjtcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5zdG9yZUhpc3RvcnkoKTtcbn07XG5cbmZ1bmN0aW9uIGJ1aWxkRWxlbWVudChidWlsZE9wdGlvbnMpIHtcbiAgICB2YXIgY3JlYXRlRWxtLFxuICAgICAgICBwYXJlbnRFbG07XG5cbiAgICBjcmVhdGVFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGJ1aWxkT3B0aW9ucy5lbG0pO1xuICAgIGNyZWF0ZUVsbS5pZCA9IGJ1aWxkT3B0aW9ucy5idXR0b25JZDtcbiAgICBjcmVhdGVFbG0uaW5uZXJIVE1MID0gYnVpbGRPcHRpb25zLmJ1dHRvblRleHQ7XG4gICAgcGFyZW50RWxtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnVpbGRPcHRpb25zLnBhcmVudElkKTtcblxuICAgIHBhcmVudEVsbS5hcHBlbmRDaGlsZChjcmVhdGVFbG0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRyYXdDaGltO1xuIiwiLy8gZm9yIGNvbXByZXNzaW9uXG52YXIgd2luID0gcmVxdWlyZSgnZ2xvYmFsL3dpbmRvdycpO1xudmFyIGRvYyA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpO1xudmFyIHJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50IHx8IHt9O1xuXG4vLyBkZXRlY3QgaWYgd2UgbmVlZCB0byB1c2UgZmlyZWZveCBLZXlFdmVudHMgdnMgS2V5Ym9hcmRFdmVudHNcbnZhciB1c2Vfa2V5X2V2ZW50ID0gdHJ1ZTtcbnRyeSB7XG4gICAgZG9jLmNyZWF0ZUV2ZW50KCdLZXlFdmVudHMnKTtcbn1cbmNhdGNoIChlcnIpIHtcbiAgICB1c2Vfa2V5X2V2ZW50ID0gZmFsc2U7XG59XG5cbi8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNjczNVxuZnVuY3Rpb24gY2hlY2tfa2IoZXYsIG9wdHMpIHtcbiAgICBpZiAoZXYuY3RybEtleSAhPSAob3B0cy5jdHJsS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5hbHRLZXkgIT0gKG9wdHMuYWx0S2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5zaGlmdEtleSAhPSAob3B0cy5zaGlmdEtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYubWV0YUtleSAhPSAob3B0cy5tZXRhS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5rZXlDb2RlICE9IChvcHRzLmtleUNvZGUgfHwgMCkgfHxcbiAgICAgICAgZXYuY2hhckNvZGUgIT0gKG9wdHMuY2hhckNvZGUgfHwgMCkpIHtcblxuICAgICAgICBldiA9IGRvYy5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZXYuaW5pdEV2ZW50KG9wdHMudHlwZSwgb3B0cy5idWJibGVzLCBvcHRzLmNhbmNlbGFibGUpO1xuICAgICAgICBldi5jdHJsS2V5ICA9IG9wdHMuY3RybEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYuYWx0S2V5ICAgPSBvcHRzLmFsdEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYuc2hpZnRLZXkgPSBvcHRzLnNoaWZ0S2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5tZXRhS2V5ICA9IG9wdHMubWV0YUtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYua2V5Q29kZSAgPSBvcHRzLmtleUNvZGUgfHwgMDtcbiAgICAgICAgZXYuY2hhckNvZGUgPSBvcHRzLmNoYXJDb2RlIHx8IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufVxuXG4vLyBtb2Rlcm4gYnJvd3NlcnMsIGRvIGEgcHJvcGVyIGRpc3BhdGNoRXZlbnQoKVxudmFyIG1vZGVybiA9IGZ1bmN0aW9uKHR5cGUsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgIC8vIHdoaWNoIGluaXQgZm4gZG8gd2UgdXNlXG4gICAgdmFyIGZhbWlseSA9IHR5cGVPZih0eXBlKTtcbiAgICB2YXIgaW5pdF9mYW0gPSBmYW1pbHk7XG4gICAgaWYgKGZhbWlseSA9PT0gJ0tleWJvYXJkRXZlbnQnICYmIHVzZV9rZXlfZXZlbnQpIHtcbiAgICAgICAgZmFtaWx5ID0gJ0tleUV2ZW50cyc7XG4gICAgICAgIGluaXRfZmFtID0gJ0tleUV2ZW50JztcbiAgICB9XG5cbiAgICB2YXIgZXYgPSBkb2MuY3JlYXRlRXZlbnQoZmFtaWx5KTtcbiAgICB2YXIgaW5pdF9mbiA9ICdpbml0JyArIGluaXRfZmFtO1xuICAgIHZhciBpbml0ID0gdHlwZW9mIGV2W2luaXRfZm5dID09PSAnZnVuY3Rpb24nID8gaW5pdF9mbiA6ICdpbml0RXZlbnQnO1xuXG4gICAgdmFyIHNpZyA9IGluaXRTaWduYXR1cmVzW2luaXRdO1xuICAgIHZhciBhcmdzID0gW107XG4gICAgdmFyIHVzZWQgPSB7fTtcblxuICAgIG9wdHMudHlwZSA9IHR5cGU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWcubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IHNpZ1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG9wdHNba2V5XTtcbiAgICAgICAgLy8gaWYgbm8gdXNlciBzcGVjaWZpZWQgdmFsdWUsIHRoZW4gdXNlIGV2ZW50IGRlZmF1bHRcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSBldltrZXldO1xuICAgICAgICB9XG4gICAgICAgIHVzZWRba2V5XSA9IHRydWU7XG4gICAgICAgIGFyZ3MucHVzaCh2YWwpO1xuICAgIH1cbiAgICBldltpbml0XS5hcHBseShldiwgYXJncyk7XG5cbiAgICAvLyB3ZWJraXQga2V5IGV2ZW50IGlzc3VlIHdvcmthcm91bmRcbiAgICBpZiAoZmFtaWx5ID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgZXYgPSBjaGVja19rYihldiwgb3B0cyk7XG4gICAgfVxuXG4gICAgLy8gYXR0YWNoIHJlbWFpbmluZyB1bnVzZWQgb3B0aW9ucyB0byB0aGUgb2JqZWN0XG4gICAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcbiAgICAgICAgaWYgKCF1c2VkW2tleV0pIHtcbiAgICAgICAgICAgIGV2W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59O1xuXG52YXIgbGVnYWN5ID0gZnVuY3Rpb24gKHR5cGUsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICB2YXIgZXYgPSBkb2MuY3JlYXRlRXZlbnRPYmplY3QoKTtcblxuICAgIGV2LnR5cGUgPSB0eXBlO1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRzKSB7XG4gICAgICAgIGlmIChvcHRzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXZba2V5XSA9IG9wdHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldjtcbn07XG5cbi8vIGV4cG9zZSBlaXRoZXIgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIGV2ZW50IGdlbmVyYXRpb24gb3IgbGVnYWN5XG4vLyBkZXBlbmRpbmcgb24gd2hhdCB3ZSBzdXBwb3J0XG4vLyBhdm9pZHMgaWYgc3RhdGVtZW50cyBpbiB0aGUgY29kZSBsYXRlclxubW9kdWxlLmV4cG9ydHMgPSBkb2MuY3JlYXRlRXZlbnQgPyBtb2Rlcm4gOiBsZWdhY3k7XG5cbnZhciBpbml0U2lnbmF0dXJlcyA9IHJlcXVpcmUoJy4vaW5pdC5qc29uJyk7XG52YXIgdHlwZXMgPSByZXF1aXJlKCcuL3R5cGVzLmpzb24nKTtcbnZhciB0eXBlT2YgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBzID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIHR5cGVzKSB7XG4gICAgICAgIHZhciB0cyA9IHR5cGVzW2tleV07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHR5cHNbdHNbaV1dID0ga2V5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0eXBzW25hbWVdIHx8ICdFdmVudCc7XG4gICAgfTtcbn0pKCk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaW5pdEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCJcbiAgXSxcbiAgXCJpbml0VUlFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiZGV0YWlsXCJcbiAgXSxcbiAgXCJpbml0TW91c2VFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiZGV0YWlsXCIsXG4gICAgXCJzY3JlZW5YXCIsXG4gICAgXCJzY3JlZW5ZXCIsXG4gICAgXCJjbGllbnRYXCIsXG4gICAgXCJjbGllbnRZXCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJidXR0b25cIixcbiAgICBcInJlbGF0ZWRUYXJnZXRcIlxuICBdLFxuICBcImluaXRNdXRhdGlvbkV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJyZWxhdGVkTm9kZVwiLFxuICAgIFwicHJldlZhbHVlXCIsXG4gICAgXCJuZXdWYWx1ZVwiLFxuICAgIFwiYXR0ck5hbWVcIixcbiAgICBcImF0dHJDaGFuZ2VcIlxuICBdLFxuICBcImluaXRLZXlib2FyZEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJrZXlDb2RlXCIsXG4gICAgXCJjaGFyQ29kZVwiXG4gIF0sXG4gIFwiaW5pdEtleUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJrZXlDb2RlXCIsXG4gICAgXCJjaGFyQ29kZVwiXG4gIF1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJNb3VzZUV2ZW50XCIgOiBbXG4gICAgXCJjbGlja1wiLFxuICAgIFwibW91c2Vkb3duXCIsXG4gICAgXCJtb3VzZXVwXCIsXG4gICAgXCJtb3VzZW92ZXJcIixcbiAgICBcIm1vdXNlbW92ZVwiLFxuICAgIFwibW91c2VvdXRcIlxuICBdLFxuICBcIktleWJvYXJkRXZlbnRcIiA6IFtcbiAgICBcImtleWRvd25cIixcbiAgICBcImtleXVwXCIsXG4gICAgXCJrZXlwcmVzc1wiXG4gIF0sXG4gIFwiTXV0YXRpb25FdmVudFwiIDogW1xuICAgIFwiRE9NU3VidHJlZU1vZGlmaWVkXCIsXG4gICAgXCJET01Ob2RlSW5zZXJ0ZWRcIixcbiAgICBcIkRPTU5vZGVSZW1vdmVkXCIsXG4gICAgXCJET01Ob2RlUmVtb3ZlZEZyb21Eb2N1bWVudFwiLFxuICAgIFwiRE9NTm9kZUluc2VydGVkSW50b0RvY3VtZW50XCIsXG4gICAgXCJET01BdHRyTW9kaWZpZWRcIixcbiAgICBcIkRPTUNoYXJhY3RlckRhdGFNb2RpZmllZFwiXG4gIF0sXG4gIFwiSFRNTEV2ZW50c1wiIDogW1xuICAgIFwibG9hZFwiLFxuICAgIFwidW5sb2FkXCIsXG4gICAgXCJhYm9ydFwiLFxuICAgIFwiZXJyb3JcIixcbiAgICBcInNlbGVjdFwiLFxuICAgIFwiY2hhbmdlXCIsXG4gICAgXCJzdWJtaXRcIixcbiAgICBcInJlc2V0XCIsXG4gICAgXCJmb2N1c1wiLFxuICAgIFwiYmx1clwiLFxuICAgIFwicmVzaXplXCIsXG4gICAgXCJzY3JvbGxcIlxuICBdLFxuICBcIlVJRXZlbnRcIiA6IFtcbiAgICBcIkRPTUZvY3VzSW5cIixcbiAgICBcIkRPTUZvY3VzT3V0XCIsXG4gICAgXCJET01BY3RpdmF0ZVwiXG4gIF1cbn1cbiIsIi8vIGh0dHA6Ly93aWtpLmNvbW1vbmpzLm9yZy93aWtpL1VuaXRfVGVzdGluZy8xLjBcbi8vXG4vLyBUSElTIElTIE5PVCBURVNURUQgTk9SIExJS0VMWSBUTyBXT1JLIE9VVFNJREUgVjghXG4vL1xuLy8gT3JpZ2luYWxseSBmcm9tIG5hcndoYWwuanMgKGh0dHA6Ly9uYXJ3aGFsanMub3JnKVxuLy8gQ29weXJpZ2h0IChjKSAyMDA5IFRob21hcyBSb2JpbnNvbiA8Mjgwbm9ydGguY29tPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0b1xuLy8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbi8vIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuLy8gc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU5cbi8vIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyB3aGVuIHVzZWQgaW4gbm9kZSwgdGhpcyB3aWxsIGFjdHVhbGx5IGxvYWQgdGhlIHV0aWwgbW9kdWxlIHdlIGRlcGVuZCBvblxuLy8gdmVyc3VzIGxvYWRpbmcgdGhlIGJ1aWx0aW4gdXRpbCBtb2R1bGUgYXMgaGFwcGVucyBvdGhlcndpc2Vcbi8vIHRoaXMgaXMgYSBidWcgaW4gbm9kZSBtb2R1bGUgbG9hZGluZyBhcyBmYXIgYXMgSSBhbSBjb25jZXJuZWRcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbC8nKTtcblxudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgaWYgKG9wdGlvbnMubWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBnZXRNZXNzYWdlKHRoaXMpO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH1cbiAgdmFyIHN0YWNrU3RhcnRGdW5jdGlvbiA9IG9wdGlvbnMuc3RhY2tTdGFydEZ1bmN0aW9uIHx8IGZhaWw7XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBub24gdjggYnJvd3NlcnMgc28gd2UgY2FuIGhhdmUgYSBzdGFja3RyYWNlXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuICAgIGlmIChlcnIuc3RhY2spIHtcbiAgICAgIHZhciBvdXQgPSBlcnIuc3RhY2s7XG5cbiAgICAgIC8vIHRyeSB0byBzdHJpcCB1c2VsZXNzIGZyYW1lc1xuICAgICAgdmFyIGZuX25hbWUgPSBzdGFja1N0YXJ0RnVuY3Rpb24ubmFtZTtcbiAgICAgIHZhciBpZHggPSBvdXQuaW5kZXhPZignXFxuJyArIGZuX25hbWUpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIC8vIG9uY2Ugd2UgaGF2ZSBsb2NhdGVkIHRoZSBmdW5jdGlvbiBmcmFtZVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHN0cmlwIG91dCBldmVyeXRoaW5nIGJlZm9yZSBpdCAoYW5kIGl0cyBsaW5lKVxuICAgICAgICB2YXIgbmV4dF9saW5lID0gb3V0LmluZGV4T2YoJ1xcbicsIGlkeCArIDEpO1xuICAgICAgICBvdXQgPSBvdXQuc3Vic3RyaW5nKG5leHRfbGluZSArIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YWNrID0gb3V0O1xuICAgIH1cbiAgfVxufTtcblxuLy8gYXNzZXJ0LkFzc2VydGlvbkVycm9yIGluc3RhbmNlb2YgRXJyb3JcbnV0aWwuaW5oZXJpdHMoYXNzZXJ0LkFzc2VydGlvbkVycm9yLCBFcnJvcik7XG5cbmZ1bmN0aW9uIHJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuICcnICsgdmFsdWU7XG4gIH1cbiAgaWYgKHV0aWwuaXNOdW1iZXIodmFsdWUpICYmICFpc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSB8fCB1dGlsLmlzUmVnRXhwKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdHJ1bmNhdGUocywgbikge1xuICBpZiAodXRpbC5pc1N0cmluZyhzKSkge1xuICAgIHJldHVybiBzLmxlbmd0aCA8IG4gPyBzIDogcy5zbGljZSgwLCBuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlKHNlbGYpIHtcbiAgcmV0dXJuIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuYWN0dWFsLCByZXBsYWNlciksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmV4cGVjdGVkLCByZXBsYWNlciksIDEyOCk7XG59XG5cbi8vIEF0IHByZXNlbnQgb25seSB0aGUgdGhyZWUga2V5cyBtZW50aW9uZWQgYWJvdmUgYXJlIHVzZWQgYW5kXG4vLyB1bmRlcnN0b29kIGJ5IHRoZSBzcGVjLiBJbXBsZW1lbnRhdGlvbnMgb3Igc3ViIG1vZHVsZXMgY2FuIHBhc3Ncbi8vIG90aGVyIGtleXMgdG8gdGhlIEFzc2VydGlvbkVycm9yJ3MgY29uc3RydWN0b3IgLSB0aGV5IHdpbGwgYmVcbi8vIGlnbm9yZWQuXG5cbi8vIDMuIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuICBBbGwgYXNzZXJ0aW9uIG1ldGhvZHMgcHJvdmlkZVxuLy8gYm90aCB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgdG8gdGhlIGFzc2VydGlvbiBlcnJvciBmb3Jcbi8vIGRpc3BsYXkgcHVycG9zZXMuXG5cbmZ1bmN0aW9uIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IsIHN0YWNrU3RhcnRGdW5jdGlvbikge1xuICB0aHJvdyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IsXG4gICAgc3RhY2tTdGFydEZ1bmN0aW9uOiBzdGFja1N0YXJ0RnVuY3Rpb25cbiAgfSk7XG59XG5cbi8vIEVYVEVOU0lPTiEgYWxsb3dzIGZvciB3ZWxsIGJlaGF2ZWQgZXJyb3JzIGRlZmluZWQgZWxzZXdoZXJlLlxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyA0LiBQdXJlIGFzc2VydGlvbiB0ZXN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdHJ1dGh5LCBhcyBkZXRlcm1pbmVkXG4vLyBieSAhIWd1YXJkLlxuLy8gYXNzZXJ0Lm9rKGd1YXJkLCBtZXNzYWdlX29wdCk7XG4vLyBUaGlzIHN0YXRlbWVudCBpcyBlcXVpdmFsZW50IHRvIGFzc2VydC5lcXVhbCh0cnVlLCAhIWd1YXJkLFxuLy8gbWVzc2FnZV9vcHQpOy4gVG8gdGVzdCBzdHJpY3RseSBmb3IgdGhlIHZhbHVlIHRydWUsIHVzZVxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKHRydWUsIGd1YXJkLCBtZXNzYWdlX29wdCk7LlxuXG5mdW5jdGlvbiBvayh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQub2spO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIDUuIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aFxuLy8gPT0uXG4vLyBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiBlcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09JywgYXNzZXJ0LmVxdWFsKTtcbn07XG5cbi8vIDYuIFRoZSBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciB3aGV0aGVyIHR3byBvYmplY3RzIGFyZSBub3QgZXF1YWxcbi8vIHdpdGggIT0gYXNzZXJ0Lm5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT0nLCBhc3NlcnQubm90RXF1YWwpO1xuICB9XG59O1xuXG4vLyA3LiBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbi8vIGFzc2VydC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZGVlcEVxdWFsID0gZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcEVxdWFsJywgYXNzZXJ0LmRlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNCdWZmZXIoYWN0dWFsKSAmJiB1dGlsLmlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIGlmIChhY3R1YWwubGVuZ3RoICE9IGV4cGVjdGVkLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCF1dGlsLmlzT2JqZWN0KGFjdHVhbCkgJiYgIXV0aWwuaXNPYmplY3QoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiKSB7XG4gIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy8gaWYgb25lIGlzIGEgcHJpbWl0aXZlLCB0aGUgb3RoZXIgbXVzdCBiZSBzYW1lXG4gIGlmICh1dGlsLmlzUHJpbWl0aXZlKGEpIHx8IHV0aWwuaXNQcmltaXRpdmUoYikpIHtcbiAgICByZXR1cm4gYSA9PT0gYjtcbiAgfVxuICB2YXIgYUlzQXJncyA9IGlzQXJndW1lbnRzKGEpLFxuICAgICAgYklzQXJncyA9IGlzQXJndW1lbnRzKGIpO1xuICBpZiAoKGFJc0FyZ3MgJiYgIWJJc0FyZ3MpIHx8ICghYUlzQXJncyAmJiBiSXNBcmdzKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIGlmIChhSXNBcmdzKSB7XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiKTtcbiAgfVxuICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAga2IgPSBvYmplY3RLZXlzKGIpLFxuICAgICAga2V5LCBpO1xuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwRXF1YWwnLCBhc3NlcnQubm90RGVlcEVxdWFsKTtcbiAgfVxufTtcblxuLy8gOS4gVGhlIHN0cmljdCBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc3RyaWN0IGVxdWFsaXR5LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbi8vIGFzc2VydC5zdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5zdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PT0nLCBhc3NlcnQuc3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG4vLyAxMC4gVGhlIHN0cmljdCBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciBzdHJpY3QgaW5lcXVhbGl0eSwgYXNcbi8vIGRldGVybWluZWQgYnkgIT09LiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9PScsIGFzc2VydC5ub3RTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpO1xuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dzKHNob3VsZFRocm93LCBibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGFjdHVhbDtcblxuICBpZiAodXRpbC5pc1N0cmluZyhleHBlY3RlZCkpIHtcbiAgICBtZXNzYWdlID0gZXhwZWN0ZWQ7XG4gICAgZXhwZWN0ZWQgPSBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYWN0dWFsID0gZTtcbiAgfVxuXG4gIG1lc3NhZ2UgPSAoZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubmFtZSA/ICcgKCcgKyBleHBlY3RlZC5uYW1lICsgJykuJyA6ICcuJykgK1xuICAgICAgICAgICAgKG1lc3NhZ2UgPyAnICcgKyBtZXNzYWdlIDogJy4nKTtcblxuICBpZiAoc2hvdWxkVGhyb3cgJiYgIWFjdHVhbCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKCFzaG91bGRUaHJvdyAmJiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ0dvdCB1bndhbnRlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoKHNob3VsZFRocm93ICYmIGFjdHVhbCAmJiBleHBlY3RlZCAmJlxuICAgICAgIWV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fCAoIXNob3VsZFRocm93ICYmIGFjdHVhbCkpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH1cbn1cblxuLy8gMTEuIEV4cGVjdGVkIHRvIHRocm93IGFuIGVycm9yOlxuLy8gYXNzZXJ0LnRocm93cyhibG9jaywgRXJyb3Jfb3B0LCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC50aHJvd3MgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbdHJ1ZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbi8vIEVYVEVOU0lPTiEgVGhpcyBpcyBhbm5veWluZyB0byB3cml0ZSBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW2ZhbHNlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuYXNzZXJ0LmlmRXJyb3IgPSBmdW5jdGlvbihlcnIpIHsgaWYgKGVycikge3Rocm93IGVycjt9fTtcblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn07XG4iLCIiLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG50cnkge1xuICB2YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKVxufSBjYXRjaCAoZXJyKSB7XG4gIHZhciBtYXRjaGVzID0gcmVxdWlyZSgnY29tcG9uZW50LW1hdGNoZXMtc2VsZWN0b3InKVxufVxuXG4vKipcbiAqIEV4cG9ydCBgY2xvc2VzdGBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb3Nlc3RcblxuLyoqXG4gKiBDbG9zZXN0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHNjb3BlIChvcHRpb25hbClcbiAqL1xuXG5mdW5jdGlvbiBjbG9zZXN0IChlbCwgc2VsZWN0b3IsIHNjb3BlKSB7XG4gIHNjb3BlID0gc2NvcGUgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gIC8vIHdhbGsgdXAgdGhlIGRvbVxuICB3aGlsZSAoZWwgJiYgZWwgIT09IHNjb3BlKSB7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0dXJuIGVsO1xuICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8vIGNoZWNrIHNjb3BlIGZvciBtYXRjaFxuICByZXR1cm4gbWF0Y2hlcyhlbCwgc2VsZWN0b3IpID8gZWwgOiBudWxsO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBjbG9zZXN0ID0gcmVxdWlyZSgnY2xvc2VzdCcpXG4gICwgZXZlbnQgPSByZXF1aXJlKCdldmVudCcpO1xuXG4vKipcbiAqIERlbGVnYXRlIGV2ZW50IGB0eXBlYCB0byBgc2VsZWN0b3JgXG4gKiBhbmQgaW52b2tlIGBmbihlKWAuIEEgY2FsbGJhY2sgZnVuY3Rpb25cbiAqIGlzIHJldHVybmVkIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gYC51bmJpbmQoKWAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCBzZWxlY3RvciwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICByZXR1cm4gZXZlbnQuYmluZChlbCwgdHlwZSwgZnVuY3Rpb24oZSl7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBlLmRlbGVnYXRlVGFyZ2V0ID0gY2xvc2VzdCh0YXJnZXQsIHNlbGVjdG9yLCB0cnVlLCBlbCk7XG4gICAgaWYgKGUuZGVsZWdhdGVUYXJnZXQpIGZuLmNhbGwoZWwsIGUpO1xuICB9LCBjYXB0dXJlKTtcbn07XG5cbi8qKlxuICogVW5iaW5kIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBldmVudC51bmJpbmQoZWwsIHR5cGUsIGZuLCBjYXB0dXJlKTtcbn07XG4iLCJ2YXIgYmluZCwgdW5iaW5kLCBwcmVmaXg7XG5cbmZ1bmN0aW9uIGRldGVjdCAoKSB7XG4gIGJpbmQgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdhdHRhY2hFdmVudCc7XG4gIHVuYmluZCA9IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2RldGFjaEV2ZW50JztcbiAgcHJlZml4ID0gYmluZCAhPT0gJ2FkZEV2ZW50TGlzdGVuZXInID8gJ29uJyA6ICcnO1xufVxuXG4vKipcbiAqIEJpbmQgYGVsYCBldmVudCBgdHlwZWAgdG8gYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGlmICghYmluZCkgZGV0ZWN0KCk7XG4gIGVsW2JpbmRdKHByZWZpeCArIHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgcmV0dXJuIGZuO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgYGVsYCBldmVudCBgdHlwZWAncyBjYWxsYmFjayBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBpZiAoIXVuYmluZCkgZGV0ZWN0KCk7XG4gIGVsW3VuYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuICByZXR1cm4gZm47XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnRyeSB7XG4gIHZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5Jyk7XG59IGNhdGNoIChlcnIpIHtcbiAgdmFyIHF1ZXJ5ID0gcmVxdWlyZSgnY29tcG9uZW50LXF1ZXJ5Jyk7XG59XG5cbi8qKlxuICogRWxlbWVudCBwcm90b3R5cGUuXG4gKi9cblxudmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbi8qKlxuICogVmVuZG9yIGZ1bmN0aW9uLlxuICovXG5cbnZhciB2ZW5kb3IgPSBwcm90by5tYXRjaGVzXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxuLyoqXG4gKiBFeHBvc2UgYG1hdGNoKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbWF0Y2g7XG5cbi8qKlxuICogTWF0Y2ggYGVsYCB0byBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbWF0Y2goZWwsIHNlbGVjdG9yKSB7XG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgIT09IDEpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZlbmRvcikgcmV0dXJuIHZlbmRvci5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gIHZhciBub2RlcyA9IHF1ZXJ5LmFsbChzZWxlY3RvciwgZWwucGFyZW50Tm9kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZXNbaV0gPT0gZWwpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xuICByZXR1cm4gZXhwb3J0cztcbn07XG4iLCJcbnZhciBub3cgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBEYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYW4gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgXCJtc1wiIG51bWJlciBvZiBtaWxsaXNlY29uZHNcbiAqIGFmdGVyIHRoZSBsYXN0IGNhbGwgdG8gaXRcbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCB0byBleGVjdXRlIGEgZnVuY3Rpb24gdGhhdCBtaWdodCBvY2N1ciB0b28gb2Z0ZW5cbiAqXG4gKiBAbWV0aG9kIGRlYm91bmNlXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gZiB7RnVuY3Rpb259IHRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZVxuICogQHBhcmFtIG1zIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQuIElmIGFueSBvdGhlciBjYWxsXG4gKiBpcyBtYWRlIGJlZm9yZSB0aGF0IHRocmVzaG9sZCB0aGUgd2FpdGluZyB3aWxsIGJlIHJlc3RhcnRlZFxuICogQHBhcmFtIFtjdHg9dW5kZWZpbmVkXSB7T2JqZWN0fSB0aGUgY29udGV4dCBvbiB3aGljaCB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgZXhlY3V0ZWRcbiAqICh0aGUgJ3RoaXMnIG9iamVjdCBpbnNpZGUgdGhlIGZ1bmN0aW9uIHdpbCBiZSBzZXQgdG8gY29udGV4dClcbiAqIEBwYXJhbSBbaW1tZWRpYXRlPXVuZGVmaW5lZF0ge0Jvb2xlYW59IGlmIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQgaW4gdGhlIGxlYWRpbmcgZWRnZSBvciB0aGUgdHJhaWxpbmcgZWRnZVxuICogYGBgXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVib3VuY2UoIGYsIG1zLCBjdHgsIGltbWVkaWF0ZSApIHtcbiAgdmFyIHRzLCBmbjtcbiAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICB2YXIgYXJncztcblxuICBmbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBjdHggPSBjdHggfHwgdGhpcztcbiAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHRzID0gbm93KCk7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZGlmZiA9IG5vdygpIC0gdHM7XG5cbiAgICAgIGlmICggZGlmZiA8IG1zICkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCggbGF0ZXIsIG1zIC0gZGlmZiApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcblxuICAgICAgaWYgKCAhaW1tZWRpYXRlICkge1xuICAgICAgICBmLmFwcGx5KCBjdHgsIGFyZ3MgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCB0aW1lb3V0ID09PSBudWxsICkge1xuICAgICAgaWYgKCBpbW1lZGlhdGUgKSB7XG4gICAgICAgIGYuYXBwbHkoIGN0eCwgYXJncyApO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoIGxhdGVyLCBtcyApO1xuICAgIH1cbiAgfTtcblxuICBmbi5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0ICk7XG4gIH07XG5cbiAgcmV0dXJuIGZuO1xufTtcbiIsInZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yLCBjaGVja1lvU2VsZiwgcm9vdCkge1xuICBlbGVtZW50ID0gY2hlY2tZb1NlbGYgPyB7cGFyZW50Tm9kZTogZWxlbWVudH0gOiBlbGVtZW50XG5cbiAgcm9vdCA9IHJvb3QgfHwgZG9jdW1lbnRcblxuICAvLyBNYWtlIHN1cmUgYGVsZW1lbnQgIT09IGRvY3VtZW50YCBhbmQgYGVsZW1lbnQgIT0gbnVsbGBcbiAgLy8gb3RoZXJ3aXNlIHdlIGdldCBhbiBpbGxlZ2FsIGludm9jYXRpb25cbiAgd2hpbGUgKChlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlKSAmJiBlbGVtZW50ICE9PSBkb2N1bWVudCkge1xuICAgIGlmIChtYXRjaGVzKGVsZW1lbnQsIHNlbGVjdG9yKSlcbiAgICAgIHJldHVybiBlbGVtZW50XG4gICAgLy8gQWZ0ZXIgYG1hdGNoZXNgIG9uIHRoZSBlZGdlIGNhc2UgdGhhdFxuICAgIC8vIHRoZSBzZWxlY3RvciBtYXRjaGVzIHRoZSByb290XG4gICAgLy8gKHdoZW4gdGhlIHJvb3QgaXMgbm90IHRoZSBkb2N1bWVudClcbiAgICBpZiAoZWxlbWVudCA9PT0gcm9vdClcbiAgICAgIHJldHVybiAgXG4gIH1cbn0iLCIndXNlIHN0cmljdCdcblxudmFyIERPTUV2ZW50ID0gcmVxdWlyZSgnQGJlbmRydWNrZXIvc3ludGhldGljLWRvbS1ldmVudHMnKVxudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hFdmVudCAoZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMpIHtcbiAgYXNzZXJ0KGVsZW1lbnQsICdBIERPTSBlbGVtZW50IGlzIHJlcXVpcmVkJylcbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICBldmVudCA9IERPTUV2ZW50KGV2ZW50LCBvcHRpb25zKVxuICB9XG4gIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcbiAgcmV0dXJuIGV2ZW50XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluZGV4ID0gcmVxdWlyZSgnaW5kZXhvZicpO1xuXG4vKipcbiAqIFdoaXRlc3BhY2UgcmVnZXhwLlxuICovXG5cbnZhciB3aGl0ZXNwYWNlUmUgPSAvXFxzKy87XG5cbi8qKlxuICogdG9TdHJpbmcgcmVmZXJlbmNlLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3Nlcztcbm1vZHVsZS5leHBvcnRzLmFkZCA9IGFkZDtcbm1vZHVsZS5leHBvcnRzLmNvbnRhaW5zID0gaGFzO1xubW9kdWxlLmV4cG9ydHMuaGFzID0gaGFzO1xubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gdG9nZ2xlO1xubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gcmVtb3ZlO1xubW9kdWxlLmV4cG9ydHMucmVtb3ZlTWF0Y2hpbmcgPSByZW1vdmVNYXRjaGluZztcblxuZnVuY3Rpb24gY2xhc3NlcyAoZWwpIHtcbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIHJldHVybiBlbC5jbGFzc0xpc3Q7XG4gIH1cblxuICB2YXIgc3RyID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgdmFyIGFyciA9IHN0ci5zcGxpdCh3aGl0ZXNwYWNlUmUpO1xuICBpZiAoJycgPT09IGFyclswXSkgYXJyLnNoaWZ0KCk7XG4gIHJldHVybiBhcnI7XG59XG5cbmZ1bmN0aW9uIGFkZCAoZWwsIG5hbWUpIHtcbiAgLy8gY2xhc3NMaXN0XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSBjbGFzc2VzKGVsKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAoIX5pKSBhcnIucHVzaChuYW1lKTtcbiAgZWwuY2xhc3NOYW1lID0gYXJyLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gaGFzIChlbCwgbmFtZSkge1xuICByZXR1cm4gZWwuY2xhc3NMaXN0XG4gICAgPyBlbC5jbGFzc0xpc3QuY29udGFpbnMobmFtZSlcbiAgICA6ICEhIH5pbmRleChjbGFzc2VzKGVsKSwgbmFtZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoZWwsIG5hbWUpIHtcbiAgaWYgKCdbb2JqZWN0IFJlZ0V4cF0nID09IHRvU3RyaW5nLmNhbGwobmFtZSkpIHtcbiAgICByZXR1cm4gcmVtb3ZlTWF0Y2hpbmcoZWwsIG5hbWUpO1xuICB9XG5cbiAgLy8gY2xhc3NMaXN0XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSBjbGFzc2VzKGVsKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAofmkpIGFyci5zcGxpY2UoaSwgMSk7XG4gIGVsLmNsYXNzTmFtZSA9IGFyci5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU1hdGNoaW5nIChlbCwgcmUsIHJlZikge1xuICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2xhc3NlcyhlbCkpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChyZS50ZXN0KGFycltpXSkpIHtcbiAgICAgIHJlbW92ZShlbCwgYXJyW2ldKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlIChlbCwgbmFtZSkge1xuICAvLyBjbGFzc0xpc3RcbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIHJldHVybiBlbC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgaWYgKGhhcyhlbCwgbmFtZSkpIHtcbiAgICByZW1vdmUoZWwsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGFkZChlbCwgbmFtZSk7XG4gIH1cbn1cbiIsInZhciBldnRMaWZlQ3ljbGUgPSB7IH07XG52YXIgZXh0ZW5kID0gcmVxdWlyZSggJ2V4dGVuZCcgKTtcbnZhciBjYWNoZSA9IHJlcXVpcmUoICcuL2xpYi9ldmVudC1jYWNoZScgKTtcbnZhciBnZXRFdmVudENhY2hlID0gY2FjaGUuZ2V0Q2FjaGUuYmluZCggY2FjaGUgKTtcbnZhciBkaXNwYXRjaEV2ZW50ID0gcmVxdWlyZSggJy4vbGliL2Rpc3BhdGNoLWV2ZW50JyApO1xuXG52YXIgZG9tRXZlbnQgPSByZXF1aXJlKCAnLi9saWIvZG9tLWV2ZW50JyApO1xudmFyIHdyYXBDYWxsYmFjayA9IHJlcXVpcmUoICcuL2xpYi93cmFwLWNhbGxiYWNrJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uICggZXZ0LCBsaWZlY3ljbGUgKSB7XG4gICAgZXZ0TGlmZUN5Y2xlWyBldnQgXSA9IGxpZmVjeWNsZTtcbiAgfSxcbiAgdHJpZ2dlcjogZnVuY3Rpb24gKCBlbGUsIGV2ZW50ICkge1xuICAgIGlmICggIWV2ZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnZXZlbnQgaXMgcmVxdWlyZWQnICk7XG4gICAgfVxuICAgIHZhciBldmVudENhY2hlID0gZ2V0RXZlbnRDYWNoZSggZWxlICk7XG4gICAgZXZlbnRDYWNoZSA9IGV2ZW50Q2FjaGVbIGV2ZW50IF07XG5cbiAgICBpZiAoICFldmVudENhY2hlICkge1xuICAgICAgLy8gbm90aGluZyB0byB0cmlnZ2VyXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoIGV2ZW50Q2FjaGUgKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGZuSWQgKSB7XG4gICAgICB2YXIgZm4gPSBldmVudENhY2hlWyBmbklkIF07XG4gICAgICBmbiAmJiBmbi5hcHBseSggZWxlLCBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiBldmVudFxuICAgICAgICB9XG4gICAgICBdICk7XG4gICAgfSApO1xuICB9LFxuICBmaXJlOiBmdW5jdGlvbiAoIGVsZSwgZXZ0LCBvcHRzICkge1xuICAgIGRpc3BhdGNoRXZlbnQoIGVsZSwgZXZ0LCBvcHRzICk7XG4gIH0sXG4gIG9uOiBmdW5jdGlvbiAoIGVsZSwgZXZlbnQsIHNlbGVjdG9yLCBjYWxsYmFjaywgY2FwdHVyZSApIHtcbiAgICB2YXIgbWUgPSB0aGlzO1xuICAgIGlmICggIWVsZSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ21pc3NpbmcgYXJndW1lbnQgZWxlbWVudCcgKTtcbiAgICB9XG4gICAgaWYgKCAhZXZlbnQgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdtaXNzaW5nIGFyZ3VtZW50IGV2ZW50JyApO1xuICAgIH1cblxuICAgIGV2ZW50LnNwbGl0KCAvXFxzKy8gKS5mb3JFYWNoKCBmdW5jdGlvbiAoIHR5cGUgKSB7XG4gICAgICB2YXIgcGFydHMgPSB0eXBlLnNwbGl0KCAnLicgKTtcbiAgICAgIHZhciBldmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50TmFtZSxcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIGNhcHR1cmU6IGNhcHR1cmUsXG4gICAgICAgIG5zOiBwYXJ0cy5yZWR1Y2UoIGZ1bmN0aW9uICggc2VxLCBucyApIHtcbiAgICAgICAgICBzZXFbIG5zIF0gPSB0cnVlO1xuICAgICAgICAgIHJldHVybiBzZXE7XG4gICAgICAgIH0sIHsgfSApXG4gICAgICB9O1xuXG4gICAgICBtZS5fb24oIGVsZSwgZGVzY3JpcHRvciApO1xuICAgIH0gKTtcblxuICB9LFxuICBfb246IGZ1bmN0aW9uICggZWxlLCBkZXNjcmlwdG9yICkge1xuICAgIGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yIHx8IHsgfTtcblxuICAgIHZhciBldmVudCA9IGRlc2NyaXB0b3IuZXZlbnQ7XG4gICAgdmFyIHNlbGVjdG9yID0gZGVzY3JpcHRvci5zZWxlY3RvcjtcbiAgICB2YXIgY2FwdHVyZSA9IGRlc2NyaXB0b3IuY2FwdHVyZTtcbiAgICB2YXIgbnMgPSBkZXNjcmlwdG9yLm5zO1xuXG4gICAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICBkZXNjcmlwdG9yLmNhbGxiYWNrID0gc2VsZWN0b3I7XG4gICAgICBzZWxlY3RvciA9ICcnO1xuICAgIH1cblxuICAgIHZhciBjYWxsYmFja0lkID0gcmVxdWlyZSggJy4vbGliL2dldC1jYWxsYmFjay1pZCcgKSggZGVzY3JpcHRvci5jYWxsYmFjayApO1xuXG4gICAgdmFyIGV2ZW50TGlmZUN5Y2xlRXZlbnQgPSBldnRMaWZlQ3ljbGVbIGV2ZW50IF07XG4gICAgdmFyIGV2ZW50Q2FjaGUgPSBnZXRFdmVudENhY2hlKCBlbGUsIGV2ZW50ICk7XG5cbiAgICBpZiAoIGV2ZW50TGlmZUN5Y2xlRXZlbnQgKSB7XG4gICAgICBpZiAoIE9iamVjdC5rZXlzKCBldmVudENhY2hlICkubGVuZ3RoID09PSAwICkge1xuICAgICAgICBldmVudExpZmVDeWNsZUV2ZW50LnNldHVwICYmIGV2ZW50TGlmZUN5Y2xlRXZlbnQuc2V0dXAuYXBwbHkoIGVsZSwgW1xuICAgICAgICAgIGRlc2NyaXB0b3JcbiAgICAgICAgXSApO1xuICAgICAgfVxuICAgICAgZXZlbnRMaWZlQ3ljbGVFdmVudC5hZGQgJiYgZXZlbnRMaWZlQ3ljbGVFdmVudC5hZGQuYXBwbHkoIGVsZSwgW1xuICAgICAgICBkZXNjcmlwdG9yXG4gICAgICBdICk7XG4gICAgfVxuXG4gICAgLy8gY291bGQgaGF2ZSBiZWVuIGNoYW5nZWQgaW5zaWRlIHRoZSBldmVudCBsaWZlIGN5Y2xlXG4gICAgLy8gc28gd2UganVzdCBlbnN1cmUgaGVyZSB0aGUgc2FtZSBpZCBmb3IgdGhlIGZ1bmN0aW9uIGlzIHNldFxuICAgIC8vIHRoaXMgaXMgdG8gYmUgYWJsZSB0byByZW1vdmUgdGhlIGxpc3RlbmVyIGlmIHRoZSBmdW5jdGlvbiBpcyBnaXZlblxuICAgIC8vIHRvIHRoZSBvZmYgbWV0aG9kXG4gICAgdmFyIGNhbGxiYWNrID0gZGVzY3JpcHRvci5jYWxsYmFjaztcbiAgICBjYWxsYmFjay54RklkID0gY2FsbGJhY2tJZDtcblxuICAgIHZhciB3cmFwcGVkRm4gPSB3cmFwQ2FsbGJhY2soIGVsZSwgY2FsbGJhY2ssIG5zLCBzZWxlY3RvciApO1xuXG4gICAgZXZlbnRDYWNoZVsgd3JhcHBlZEZuLnhGSWQgXSA9IHdyYXBwZWRGbjtcblxuICAgIHJldHVybiBkb21FdmVudC5vbiggZWxlLCBldmVudCwgd3JhcHBlZEZuLCBjYXB0dXJlICk7XG4gIH0sXG4gIG9mZjogZnVuY3Rpb24gKCBlbGUsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSApIHtcbiAgICB2YXIgbWUgPSB0aGlzO1xuICAgIGV2ZW50LnNwbGl0KCAvXFxzKy8gKS5mb3JFYWNoKCBmdW5jdGlvbiAoIHR5cGUgKSB7XG4gICAgICB2YXIgcGFydHMgPSB0eXBlLnNwbGl0KCAnLicgKTtcbiAgICAgIHZhciBldmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50TmFtZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICBjYXB0dXJlOiBjYXB0dXJlLFxuICAgICAgICBuczogcGFydHMucmVkdWNlKCBmdW5jdGlvbiAoIHNlcSwgbnMgKSB7XG4gICAgICAgICAgc2VxWyBucyBdID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gc2VxO1xuICAgICAgICB9LCB7IH0gKVxuICAgICAgfTtcblxuICAgICAgbWUuX29mZiggZWxlLCBkZXNjcmlwdG9yICk7XG4gICAgfSApO1xuICB9LFxuXG4gIF9kb1JlbW92ZUV2ZW50OiBmdW5jdGlvbiAoIGVsZSwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlICkge1xuICAgIHZhciBldmVudENhY2hlID0gZ2V0RXZlbnRDYWNoZSggZWxlICk7XG4gICAgdmFyIGN1cnJlbnRFdmVudENhY2hlID0gZXZlbnRDYWNoZVsgZXZlbnQgXTtcblxuICAgIGlmICggIWN1cnJlbnRFdmVudENhY2hlICkge1xuICAgICAgLy8gbm90aGluZyB0byByZW1vdmVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgeEZJZCA9IGNhbGxiYWNrLnhGSWQ7XG5cbiAgICBpZiAoIHhGSWQgKSB7XG4gICAgICBkZWxldGUgY3VycmVudEV2ZW50Q2FjaGVbIHhGSWQgXTtcblxuICAgICAgdmFyIGV2ZW50TGlmZUN5Y2xlRXZlbnQgPSBldnRMaWZlQ3ljbGVbIGV2ZW50IF07XG5cbiAgICAgIGlmICggZXZlbnRMaWZlQ3ljbGVFdmVudCApIHtcbiAgICAgICAgZXZlbnRMaWZlQ3ljbGVFdmVudC5yZW1vdmUgJiYgZXZlbnRMaWZlQ3ljbGVFdmVudC5yZW1vdmUuYXBwbHkoIGVsZSwge1xuICAgICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgICAgY2FwdHVyZTogY2FwdHVyZVxuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggT2JqZWN0LmtleXMoIGV2ZW50Q2FjaGUgKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgIGRlbGV0ZSBldmVudENhY2hlWyBldmVudCBdO1xuICAgICAgICBpZiAoIGV2ZW50TGlmZUN5Y2xlRXZlbnQgKSB7XG4gICAgICAgICAgZXZlbnRMaWZlQ3ljbGVFdmVudC50ZWFyZG93biAmJiBldmVudExpZmVDeWNsZUV2ZW50LnRlYXJkb3duLmFwcGx5KCBlbGUsIHtcbiAgICAgICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgICAgIGNhcHR1cmU6IGNhcHR1cmVcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBkb21FdmVudC5vZmYoIGVsZSwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlICk7XG4gIH0sXG5cbiAgX29mZjogZnVuY3Rpb24gKCBlbGUsIGRlc2NyaXB0b3IgKSB7XG4gICAgdmFyIG1lID0gdGhpcztcbiAgICB2YXIgZXZlbnRDYWNoZSA9IGdldEV2ZW50Q2FjaGUoIGVsZSApO1xuICAgIHZhciBldmVudHMgPSBPYmplY3Qua2V5cyggZXZlbnRDYWNoZSApO1xuXG4gICAgaWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuICAgICAgLy8gbm8gZXZlbnRzIHRvIHJlbW92ZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggIWRlc2NyaXB0b3IuZXZlbnQgKSB7XG4gICAgICBldmVudHMuZm9yRWFjaCggZnVuY3Rpb24gKCBldmVudCApIHtcbiAgICAgICAgbWUuX29mZiggZWxlLCBleHRlbmQoIHsgfSwgZGVzY3JpcHRvciwgeyBldmVudDogZXZlbnQgfSApICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgZXZlbnRDYWNoZSA9IGV2ZW50Q2FjaGVbIGRlc2NyaXB0b3IuZXZlbnQgXTtcblxuICAgIGlmICggIWV2ZW50Q2FjaGUgfHwgT2JqZWN0LmtleXMoIGV2ZW50Q2FjaGUgKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICAvLyBubyBldmVudHMgdG8gcmVtb3ZlIG9yIGFscmVhZHkgcmVtb3ZlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjYWxsYmFjayA9IGRlc2NyaXB0b3IuY2FsbGJhY2s7XG5cbiAgICBpZiAoIGNhbGxiYWNrICkge1xuICAgICAgdmFyIGlkID0gY2FsbGJhY2sueEZJZDtcbiAgICAgIGlmICggaWQgKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKCBldmVudENhY2hlICkuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG4gICAgICAgICAgdmFyIGZuID0gZXZlbnRDYWNoZVsga2V5IF07XG4gICAgICAgICAgaWYgKCBmbi5jYWxsYmFja0lkID09PSBpZCApIHtcbiAgICAgICAgICAgIG1lLl9kb1JlbW92ZUV2ZW50KCBlbGUsIGRlc2NyaXB0b3IuZXZlbnQsIGZuLCBkZXNjcmlwdG9yLmNhcHR1cmUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbmFtZXNwYWNlcyA9IE9iamVjdC5rZXlzKCBkZXNjcmlwdG9yLm5zICk7XG4gICAgdmFyIGhhc05hbWVzcGFjZXMgPSBuYW1lc3BhY2VzLmxlbmd0aCA+IDA7XG5cbiAgICBPYmplY3Qua2V5cyggZXZlbnRDYWNoZSApLmZvckVhY2goIGZ1bmN0aW9uICggZm5JZCApIHtcbiAgICAgIHZhciBmbiA9IGV2ZW50Q2FjaGVbIGZuSWQgXTtcbiAgICAgIGlmICggaGFzTmFtZXNwYWNlcyApIHtcbiAgICAgICAgLy8gb25seSByZW1vdmUgdGhlIGZ1bmN0aW9ucyB0aGF0IG1hdGNoIHRoZSBuc1xuICAgICAgICBuYW1lc3BhY2VzLmZvckVhY2goIGZ1bmN0aW9uICggbmFtZXNwYWNlICkge1xuICAgICAgICAgIGlmICggZm4ueE5TWyBuYW1lc3BhY2UgXSApIHtcbiAgICAgICAgICAgIG1lLl9kb1JlbW92ZUV2ZW50KCBlbGUsIGRlc2NyaXB0b3IuZXZlbnQsIGZuLCBkZXNjcmlwdG9yLmNhcHR1cmUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlbW92ZSBhbGxcbiAgICAgICAgbWUuX2RvUmVtb3ZlRXZlbnQoIGVsZSwgZGVzY3JpcHRvci5ldmVudCwgZm4sIGRlc2NyaXB0b3IuY2FwdHVyZSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCBlbGUsIGV2ZW50LCBvcHRpb25zICkge1xuICB2YXIgZXh0ZW5kID0gcmVxdWlyZSggJ2V4dGVuZCcgKTtcbiAgdmFyIG9wdHMgPSBleHRlbmQoIHsgYnViYmxlczogdHJ1ZSB9LCBvcHRpb25zICk7XG4gIHZhciBzZXRFdmVudCA9IGZhbHNlO1xuICB2YXIgQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbiAgaWYgKCBDdXN0b21FdmVudCApIHtcbiAgICB2YXIgZXZ0O1xuICAgIHRyeSB7XG4gICAgICBldnQgPSBuZXcgQ3VzdG9tRXZlbnQoIGV2ZW50LCBvcHRzICk7XG4gICAgICBlbGUuZGlzcGF0Y2hFdmVudCggZXZ0ICk7XG4gICAgICBzZXRFdmVudCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIHNldEV2ZW50ID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmICggIXNldEV2ZW50ICkge1xuICAgIHZhciBkaXNwYXRjaEV2ZW50ID0gcmVxdWlyZSggJ2Rpc3BhdGNoLWV2ZW50JyApO1xuICAgIGRpc3BhdGNoRXZlbnQoIGVsZSwgZXZlbnQsIG9wdHMgKTtcbiAgfVxufTtcbiIsImZ1bmN0aW9uIG9uKCBlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIGNhcHR1cmUgKSB7XG4gICFlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgKGV2ZW50ID0gJ29uJyArIGV2ZW50KTtcbiAgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciB8fCBlbGVtZW50LmF0dGFjaEV2ZW50KS5jYWxsKCBlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIGNhcHR1cmUgKTtcbiAgcmV0dXJuIGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBvZmYoIGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSApIHtcbiAgIWVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiAoZXZlbnQgPSAnb24nICsgZXZlbnQpO1xuICAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyIHx8IGVsZW1lbnQuZGV0YWNoRXZlbnQpLmNhbGwoIGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSApO1xuICByZXR1cm4gY2FsbGJhY2s7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb247XG5tb2R1bGUuZXhwb3J0cy5vbiA9IG9uO1xubW9kdWxlLmV4cG9ydHMub2ZmID0gb2ZmO1xuIiwidmFyIGNhY2hlID0geyB9O1xudmFyIGlkR2VuID0gcmVxdWlyZSggJy4vaWQtZ2VuJyApO1xudmFyIGdldElkID0gaWRHZW4uY3JlYXRlKCAnZG9tLWVsZScgKTtcblxuZnVuY3Rpb24gZ2V0Q2FjaGUoIGVsZSwgZXZlbnQsIF9jYWNoZSApIHtcblxuICB2YXIgZWxlSWQ7XG5cbiAgaWYgKCBlbGUgPT09IGRvY3VtZW50ICkge1xuICAgIGVsZUlkID0gJ2RvY3VtZW50JztcbiAgfVxuXG4gIGlmICggZWxlID09PSB3aW5kb3cgKSB7XG4gICAgZWxlSWQgPSAnd2luZG93JztcbiAgfVxuXG4gIGlmICggIWVsZUlkICkge1xuICAgIGVsZUlkID0gZWxlLmdldEF0dHJpYnV0ZSggJ3gtZGVzLWlkJyApO1xuXG4gICAgaWYgKCAhZWxlSWQgKSB7XG4gICAgICBlbGVJZCA9IGdldElkKCk7XG4gICAgICBlbGUuc2V0QXR0cmlidXRlKCAneC1kZXMtaWQnLCBlbGVJZCApO1xuICAgIH1cbiAgfVxuXG4gIF9jYWNoZVsgZWxlSWQgXSA9IF9jYWNoZVsgZWxlSWQgXSB8fCB7IH07XG5cbiAgaWYgKCAhZXZlbnQgKSB7XG4gICAgcmV0dXJuIF9jYWNoZVsgZWxlSWQgXTtcbiAgfVxuXG4gIF9jYWNoZVsgZWxlSWQgXVsgZXZlbnQgXSA9IF9jYWNoZVsgZWxlSWQgXVsgZXZlbnQgXSB8fCB7IH07XG5cbiAgcmV0dXJuIF9jYWNoZVsgZWxlSWQgXVsgZXZlbnQgXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENhY2hlOiBmdW5jdGlvbiAoIGVsZSwgZXZlbnQgKSB7XG4gICAgcmV0dXJuIGdldENhY2hlKCBlbGUsIGV2ZW50LCBjYWNoZSApO1xuICB9XG59O1xuIiwidmFyIGlkR2VuID0gcmVxdWlyZSggJy4vaWQtZ2VuJyApO1xudmFyIGdldEZuSWQgPSBpZEdlbi5jcmVhdGUoICdmbicgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRJZE9mQ2FsbGJhY2soIGNhbGxiYWNrICkge1xuICB2YXIgZWxlSWQgPSBjYWxsYmFjay54RklkO1xuICBpZiAoICFlbGVJZCApIHtcbiAgICBlbGVJZCA9IGdldEZuSWQoKTtcbiAgICBjYWxsYmFjay54RklkID0gZWxlSWQ7XG4gIH1cbiAgcmV0dXJuIGVsZUlkO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uICggcHJlZml4ICkge1xuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gZnVuY3Rpb24gZ2V0SWQoKSB7XG4gICAgICByZXR1cm4gcHJlZml4ICsgJy0nICsgRGF0ZS5ub3coKSArICctJyArIChjb3VudGVyKyspO1xuICAgIH07XG4gIH1cbn07XG4iLCJ2YXIgY2xvc2VzdCA9IHJlcXVpcmUoICdjb21wb25lbnQtY2xvc2VzdCcgKTtcblxudmFyIGdldElkT2ZDYWxsYmFjayA9IHJlcXVpcmUoICcuL2dldC1jYWxsYmFjay1pZCcgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3cmFwQ2FsbGJhY2soIGVsZSwgY2FsbGJhY2ssIG5zLCBzZWxlY3RvciApIHtcbiAgdmFyIGZuID0gZnVuY3Rpb24gKCBlICkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgaWYgKCAhc2VsZWN0b3IgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoIGVsZSwgYXJncyApO1xuICAgIH1cblxuICAgIHZhciBjbG9zZXN0RWxlID0gY2xvc2VzdCggZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LCBzZWxlY3RvciwgZWxlICk7XG5cbiAgICBpZiAoIGNsb3Nlc3RFbGUgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoIGNsb3Nlc3RFbGUsIGFyZ3MgKTtcbiAgICB9XG4gIH07XG5cbiAgZ2V0SWRPZkNhbGxiYWNrKCBmbiApO1xuXG4gIGZuLnhOUyA9IG5zO1xuXG4gIGZuLmNhbGxiYWNrSWQgPSBnZXRJZE9mQ2FsbGJhY2soIGNhbGxiYWNrICk7XG5cbiAgcmV0dXJuIGZuO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gb247XG5tb2R1bGUuZXhwb3J0cy5vbiA9IG9uO1xubW9kdWxlLmV4cG9ydHMub2ZmID0gb2ZmO1xuXG5mdW5jdGlvbiBvbiAoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG4gICFlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgKGV2ZW50ID0gJ29uJyArIGV2ZW50KTtcbiAgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciB8fCBlbGVtZW50LmF0dGFjaEV2ZW50KS5jYWxsKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSk7XG4gIHJldHVybiBjYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gb2ZmIChlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcbiAgIWVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiAoZXZlbnQgPSAnb24nICsgZXZlbnQpO1xuICAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyIHx8IGVsZW1lbnQuZGV0YWNoRXZlbnQpLmNhbGwoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlKTtcbiAgcmV0dXJuIGNhbGxiYWNrO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBvbmU7XG5tb2R1bGUuZXhwb3J0cy5hbGwgPSBhbGw7XG5cbmZ1bmN0aW9uIG9uZSAoc2VsZWN0b3IsIHBhcmVudCkge1xuICBwYXJlbnQgfHwgKHBhcmVudCA9IGRvY3VtZW50KTtcbiAgcmV0dXJuIHBhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gYWxsIChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHBhcmVudCB8fCAocGFyZW50ID0gZG9jdW1lbnQpO1xuICB2YXIgc2VsZWN0aW9uID0gcGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICByZXR1cm4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHNlbGVjdGlvbik7XG59XG4iLCJ2YXIgdG9DYW1lbENhc2UgPSByZXF1aXJlKCd0by1jYW1lbC1jYXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGU7XG5cbmZ1bmN0aW9uIGFsbChlbGVtZW50LCBjc3MpIHtcbiAgdmFyIG5hbWU7XG4gIGZvciAoIG5hbWUgaW4gY3NzICkge1xuICAgIG9uZShlbGVtZW50LCBuYW1lLCBjc3NbbmFtZV0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uZShlbGVtZW50LCBuYW1lLCB2YWx1ZSkge1xuICBlbGVtZW50LnN0eWxlW3RvQ2FtZWxDYXNlKChuYW1lID09ICdmbG9hdCcpID8gJ2Nzc0Zsb2F0JyA6IG5hbWUpXSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBzdHlsZShlbGVtZW50KSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDMpIHtcbiAgICByZXR1cm4gb25lKGVsZW1lbnQsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgfVxuXG4gIHJldHVybiBhbGwoZWxlbWVudCwgYXJndW1lbnRzWzFdKTtcbn1cbiIsInZhciBuZXdFbGVtZW50ID0gcmVxdWlyZShcIi4vbmV3LWVsZW1lbnRcIik7XG52YXIgc2VsZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogd2l0aENoaWxkcmVuKGFkZCksXG4gIGFkZEFmdGVyOiB3aXRoQ2hpbGRyZW4oYWRkQWZ0ZXIpLFxuICBhZGRCZWZvcmU6IHdpdGhDaGlsZHJlbihhZGRCZWZvcmUpLFxuICBpbnNlcnQ6IGluc2VydCxcbiAgcmVwbGFjZTogcmVwbGFjZSxcbiAgcmVtb3ZlOiByZW1vdmVcbn07XG5cbmZ1bmN0aW9uIGFkZCAocGFyZW50LCBjaGlsZCwgdmFycykge1xuICBzZWxlY3QocGFyZW50KS5hcHBlbmRDaGlsZChuZXdFbGVtZW50KGNoaWxkLCB2YXJzKSk7XG59XG5cbmZ1bmN0aW9uIGFkZEFmdGVyIChwYXJlbnQsIGNoaWxkLypbLCB2YXJzXSwgcmVmZXJlbmNlICovKSB7XG4gIHZhciByZWYgPSBzZWxlY3QoYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSwgcGFyZW50KS5uZXh0U2libGluZztcbiAgdmFyIHZhcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcblxuICBpZiAocmVmID09IG51bGwpIHtcbiAgICByZXR1cm4gYWRkKHBhcmVudCwgY2hpbGQsIHZhcnMpO1xuICB9XG5cbiAgYWRkQmVmb3JlKHBhcmVudCwgY2hpbGQsIHZhcnMsIHJlZik7XG59XG5cbmZ1bmN0aW9uIGFkZEJlZm9yZSAocGFyZW50LCBjaGlsZC8qWywgdmFyc10sIHJlZmVyZW5jZSAqLykge1xuICB2YXIgcmVmID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgdmFyIHZhcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcbiAgc2VsZWN0KHBhcmVudCkuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQoY2hpbGQsIHZhcnMpLCBzZWxlY3QocmVmLCBwYXJlbnQpKTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0IChlbGVtZW50IC8qWyx2YXJzXSwgcGFyZW50ICovKSB7XG4gIHZhciBwYXJlbnQgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICB2YXIgdmFycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuXG4gIGFkZChzZWxlY3QocGFyZW50KSwgZWxlbWVudCwgdmFycyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UgKHBhcmVudCwgdGFyZ2V0LCByZXBsLCB2YXJzKSB7XG4gIHNlbGVjdChwYXJlbnQpLnJlcGxhY2VDaGlsZChzZWxlY3QobmV3RWxlbWVudChyZXBsLCB2YXJzKSksIHNlbGVjdCh0YXJnZXQsIHBhcmVudCkpO1xufVxuXG5mdW5jdGlvbiByZW1vdmUgKGVsZW1lbnQsIGNoaWxkKSB7XG4gIHZhciBpLCBhbGw7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiB0eXBlb2YgZWxlbWVudCAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cblxuICBhbGwgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IHNlbGVjdC5hbGwoY2hpbGQsIGVsZW1lbnQpIDogc2VsZWN0LmFsbChlbGVtZW50KTtcbiAgaSA9IGFsbC5sZW5ndGg7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIGFsbFtpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGFsbFtpXSk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiB3aXRoQ2hpbGRyZW4gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoXywgY2hpbGRyZW4pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSBjaGlsZHJlbiA9IFtjaGlsZHJlbl07XG5cbiAgICB2YXIgaSA9IC0xO1xuICAgIHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGg7XG4gICAgdmFyIHBhcmFtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICBwYXJhbXNbMV0gPSBjaGlsZHJlbltpXTtcbiAgICAgIGZuLmFwcGx5KHVuZGVmaW5lZCwgcGFyYW1zKTtcbiAgICB9XG4gIH07XG59XG4iLCJ2YXIgbmV3RWxlbWVudCA9IHJlcXVpcmUoXCJuZXctZWxlbWVudFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpZk5lY2Vzc2FyeTtcblxuZnVuY3Rpb24gaWZOZWNlc3NhcnkgKGh0bWwsIHZhcnMpIHtcbiAgaWYgKCFpc0hUTUwoaHRtbCkpIHJldHVybiBodG1sO1xuICByZXR1cm4gbmV3RWxlbWVudChodG1sLCB2YXJzKTtcbn1cblxuZnVuY3Rpb24gaXNIVE1MKHRleHQpe1xuICByZXR1cm4gdHlwZW9mIHRleHQgPT0gJ3N0cmluZycgJiYgdGV4dC5jaGFyQXQoMCkgPT0gJzwnO1xufVxuIiwidmFyIHF3ZXJ5ID0gcmVxdWlyZShcInF3ZXJ5XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25lOiBvbmUsXG4gIGFsbDogYWxsXG59O1xuXG5mdW5jdGlvbiBhbGwgKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgcmV0dXJuIHF3ZXJ5KHNlbGVjdG9yLCBwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBvbmUgKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgcmV0dXJuIGFsbChzZWxlY3RvciwgcGFyZW50KVswXTtcbn1cbiIsInZhciBmYWxsYmFjayA9IHJlcXVpcmUoJy4vZmFsbGJhY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvbmU7XG5tb2R1bGUuZXhwb3J0cy5hbGwgPSBhbGw7XG5cbmZ1bmN0aW9uIG9uZSAoc2VsZWN0b3IsIHBhcmVudCkge1xuICBwYXJlbnQgfHwgKHBhcmVudCA9IGRvY3VtZW50KTtcblxuICBpZiAocGFyZW50LnF1ZXJ5U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIGZhbGxiYWNrLm9uZShzZWxlY3RvciwgcGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYWxsIChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHBhcmVudCB8fCAocGFyZW50ID0gZG9jdW1lbnQpO1xuXG4gIGlmIChwYXJlbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIHJldHVybiBwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH1cblxuICByZXR1cm4gZmFsbGJhY2suYWxsKHNlbGVjdG9yLCBwYXJlbnQpO1xufVxuIiwidmFyIGRvbWlmeSA9IHJlcXVpcmUoXCJkb21pZnlcIik7XG52YXIgZm9ybWF0ID0gcmVxdWlyZShcImZvcm1hdC10ZXh0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ld0VsZW1lbnQ7XG5cbmZ1bmN0aW9uIG5ld0VsZW1lbnQgKGh0bWwsIHZhcnMpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkgcmV0dXJuIGRvbWlmeShodG1sKTtcbiAgcmV0dXJuIGRvbWlmeShmb3JtYXQoaHRtbCwgdmFycykpO1xufVxuIiwidmFyIHNlbGVjdCA9IHJlcXVpcmUoJ2RvbS1zZWxlY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpZk5lY2Vzc2FyeTtcbm1vZHVsZS5leHBvcnRzLmFsbCA9IGlmTmVjZXNzYXJ5QWxsO1xuXG5mdW5jdGlvbiBpZk5lY2Vzc2FyeSAoY2hpbGQsIHBhcmVudCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHtcbiAgICBjaGlsZCA9IGNoaWxkWzBdO1xuICB9XG5cbiAgaWYgKCB0eXBlb2YgY2hpbGQgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY2hpbGQ7XG4gIH1cblxuICBpZiAodHlwZW9mIHBhcmVudCA9PSAnc3RyaW5nJykge1xuICAgIHBhcmVudCA9IHNlbGVjdChwYXJlbnQsIGRvY3VtZW50KTtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3QoY2hpbGQsIHBhcmVudCk7XG59XG5cbmZ1bmN0aW9uIGlmTmVjZXNzYXJ5QWxsIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkge1xuICAgIGNoaWxkID0gY2hpbGRbMF07XG4gIH1cblxuICBpZiAoIHR5cGVvZiBjaGlsZCAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiBbY2hpbGRdO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwYXJlbnQgPT0gJ3N0cmluZycpIHtcbiAgICBwYXJlbnQgPSBzZWxlY3QocGFyZW50LCBkb2N1bWVudCk7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0LmFsbChjaGlsZCwgcGFyZW50KTtcbn1cbiIsIlxuLyoqXG4gKiBTZXQgb3IgZ2V0IGBlbGAncycgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgdmFsKXtcbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNldChlbCwgdmFsKTtcbiAgcmV0dXJuIGdldChlbCk7XG59O1xuXG4vKipcbiAqIEdldCBgZWxgJ3MgdmFsdWUuXG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsKSB7XG4gIHN3aXRjaCAodHlwZShlbCkpIHtcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgY2FzZSAncmFkaW8nOlxuICAgICAgaWYgKGVsLmNoZWNrZWQpIHtcbiAgICAgICAgdmFyIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIHJldHVybiBudWxsID09IGF0dHIgPyB0cnVlIDogYXR0cjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIGlmIChyYWRpby5jaGVja2VkKSByZXR1cm4gcmFkaW8udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIG9wdGlvbjsgb3B0aW9uID0gZWwub3B0aW9uc1tpXTsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQpIHJldHVybiBvcHRpb24udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGVsLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGBlbGAncyB2YWx1ZS5cbiAqL1xuXG5mdW5jdGlvbiBzZXQoZWwsIHZhbCkge1xuICBzd2l0Y2ggKHR5cGUoZWwpKSB7XG4gICAgY2FzZSAnY2hlY2tib3gnOlxuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PT0gdmFsO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvcHRpb247IG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07IGkrKykge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBvcHRpb24udmFsdWUgPT09IHZhbDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBlbC52YWx1ZSA9IHZhbDtcbiAgfVxufVxuXG4vKipcbiAqIEVsZW1lbnQgdHlwZS5cbiAqL1xuXG5mdW5jdGlvbiB0eXBlKGVsKSB7XG4gIHZhciBncm91cCA9ICdhcnJheScgPT0gdHlwZU9mKGVsKSB8fCAnb2JqZWN0JyA9PSB0eXBlT2YoZWwpO1xuICBpZiAoZ3JvdXApIGVsID0gZWxbMF07XG4gIHZhciBuYW1lID0gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgdmFyIHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcblxuICBpZiAoZ3JvdXAgJiYgdHlwZSAmJiAncmFkaW8nID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdyYWRpb2dyb3VwJztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdjaGVja2JveCcgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ2NoZWNrYm94JztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdyYWRpbycgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ3JhZGlvJztcbiAgaWYgKCdzZWxlY3QnID09IG5hbWUpIHJldHVybiAnc2VsZWN0JztcbiAgcmV0dXJuIG5hbWU7XG59XG5cbmZ1bmN0aW9uIHR5cGVPZih2YWwpIHtcbiAgc3dpdGNoIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IEVycm9yXSc6IHJldHVybiAnZXJyb3InO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgIT09IHZhbCkgcmV0dXJuICduYW4nO1xuICBpZiAodmFsICYmIHZhbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuICdlbGVtZW50JztcblxuICB2YWwgPSB2YWwudmFsdWVPZlxuICAgID8gdmFsLnZhbHVlT2YoKVxuICAgIDogT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHZhbClcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHBhcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIG9wdGlvbjogWzEsICc8c2VsZWN0IG11bHRpcGxlPVwibXVsdGlwbGVcIj4nLCAnPC9zZWxlY3Q+J10sXG4gIG9wdGdyb3VwOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdGhlYWQ6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0Ym9keTogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRmb290OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgY29sZ3JvdXA6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjYXB0aW9uOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICB0ZDogWzMsICc8dGFibGU+PHRib2R5Pjx0cj4nLCAnPC90cj48L3Rib2R5PjwvdGFibGU+J10sXG4gIHRoOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgX2RlZmF1bHQ6IFswLCAnJywgJyddXG59O1xuXG4vKipcbiAqIFBhcnNlIGBodG1sYCBhbmQgcmV0dXJuIHRoZSBjaGlsZHJlbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sKSB7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgaHRtbCkgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RyaW5nIGV4cGVjdGVkJyk7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnRzIHdlcmUgZ2VuZXJhdGVkLicpO1xuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbC5pbm5lckhUTUwgPSBwcmVmaXggKyBodG1sICsgc3VmZml4O1xuICB3aGlsZSAoZGVwdGgtLSkgZWwgPSBlbC5sYXN0Q2hpbGQ7XG5cbiAgdmFyIGVscyA9IGVsLmNoaWxkcmVuO1xuICBpZiAoMSA9PSBlbHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsc1swXSk7XG4gIH1cblxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbHMubGVuZ3RoKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCJ2YXIgbmV3RWxlbWVudCA9IHJlcXVpcmUoXCJuZXctZWxlbWVudFwiKTtcbnZhciBzZWxlY3QgPSByZXF1aXJlKFwiLi9saWIvc2VsZWN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGVjdDtcbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcblxuZnVuY3Rpb24gY3JlYXRlICh0YWcpIHtcbiAgaWYgKHRhZy5jaGFyQXQoMCkgPT0gJzwnKSB7IC8vIGh0bWxcbiAgICByZXR1cm4gc2VsZWN0KG5ld0VsZW1lbnQodGFnKSk7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGF0dHI7XG5cbmZ1bmN0aW9uIGF0dHIgKGNoYWluKSB7XG4gIHJldHVybiBmdW5jdGlvbiBhdHRyIChlbGVtZW50LCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG5cbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gY2hhaW47XG4gIH07XG59XG4iLCJ2YXIgZXZlbnRzID0gcmVxdWlyZShcImRvbS1ldmVudFwiKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoXCJjb21wb25lbnQtZGVsZWdhdGVcIik7XG52YXIga2V5RXZlbnQgPSByZXF1aXJlKFwia2V5LWV2ZW50XCIpO1xudmFyIHRyaW0gPSByZXF1aXJlKFwidHJpbVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNoYW5nZTogc2hvcnRjdXQoJ2NoYW5nZScpLFxuICBjbGljazogc2hvcnRjdXQoJ2NsaWNrJyksXG4gIGtleWRvd246IHNob3J0Y3V0KCdrZXlkb3duJyksXG4gIGtleXVwOiBzaG9ydGN1dCgna2V5dXAnKSxcbiAga2V5cHJlc3M6IHNob3J0Y3V0KCdrZXlwcmVzcycpLFxuICBtb3VzZWRvd246IHNob3J0Y3V0KCdtb3VzZWRvd24nKSxcbiAgbW91c2VvdmVyOiBzaG9ydGN1dCgnbW91c2VvdmVyJyksXG4gIG1vdXNldXA6IHNob3J0Y3V0KCdtb3VzZXVwJyksXG4gIHJlc2l6ZTogc2hvcnRjdXQoJ3Jlc2l6ZScpLFxuICBvbjogb24sXG4gIG9mZjogb2ZmLFxuICBvbktleTogb25LZXksXG4gIG9mZktleTogb2ZmS2V5XG59O1xuXG5mdW5jdGlvbiBzaG9ydGN1dCAodHlwZSl7XG4gIHJldHVybiBmdW5jdGlvbihlbGVtZW50LCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIG9uKGVsZW1lbnQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb2ZmIChlbGVtZW50LCBldmVudCwgc2VsZWN0b3IsIGNhbGxiYWNrKXtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCkge1xuICAgIHJldHVybiBkZWxlZ2F0ZS51bmJpbmQoZWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50LCBjYWxsYmFjayk7XG4gIH1cblxuICBjYWxsYmFjayA9IHNlbGVjdG9yO1xuXG4gIGV2ZW50cy5vZmYoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gb24gKGVsZW1lbnQsIGV2ZW50LCBzZWxlY3RvciwgY2FsbGJhY2spe1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgY2FsbGJhY2sgPSBzZWxlY3RvcjtcbiAgfVxuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQpIHtcbiAgICByZXR1cm4gZGVsZWdhdGUuYmluZChlbGVtZW50LCBzZWxlY3RvciwgZXZlbnQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGV2ZW50cy5vbihlbGVtZW50LCBldmVudCwgY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBvbktleSAoZWxlbWVudCwga2V5LCBjYWxsYmFjaykge1xuICBrZXlFdmVudC5vbihlbGVtZW50LCBrZXksIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gb2ZmS2V5IChlbGVtZW50LCBrZXksIGNhbGxiYWNrKSB7XG4gIGtleUV2ZW50Lm9mZihlbGVtZW50LCBrZXksIGNhbGxiYWNrKTtcbn1cbiIsInZhciBmb3JtYXQgPSByZXF1aXJlKCdmb3JtYXQtdGV4dCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGh0bWw7XG5cbmZ1bmN0aW9uIGh0bWwgKGNoYWluKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgbmV3VmFsdWUsIHZhcnMpe1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IGZvcm1hdChuZXdWYWx1ZSwgdmFycykgOiBuZXdWYWx1ZTtcbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUw7XG4gIH07XG59XG4iLCJ2YXIgbmV3Q2hhaW4gPSByZXF1aXJlKFwibmV3LWNoYWluXCIpO1xudmFyIGZvcm1hdCA9IHJlcXVpcmUoJ2Zvcm1hdC10ZXh0Jyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJ2RvbS1jbGFzc2VzJyk7XG52YXIgdHJlZSA9IHJlcXVpcmUoJ2RvbS10cmVlJyk7XG52YXIgbmV3RWxlbWVudCA9IHJlcXVpcmUoJ25ldy1lbGVtZW50Jyk7XG52YXIgc2VsZWN0RE9NID0gcmVxdWlyZSgnZG9tLXNlbGVjdCcpLmFsbDtcbnZhciBzdHlsZSA9IHJlcXVpcmUoJ2RvbS1zdHlsZScpO1xudmFyIGNsb3Nlc3QgPSByZXF1aXJlKFwiZGlzY29yZS1jbG9zZXN0XCIpO1xudmFyIHNpYmxpbmdzID0gcmVxdWlyZShcInNpYmxpbmdzXCIpO1xuXG52YXIgYXR0ciA9IHJlcXVpcmUoJy4vYXR0cicpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpO1xudmFyIHRleHQgPSByZXF1aXJlKCcuL3RleHQnKTtcbnZhciB2YWx1ZSA9IHJlcXVpcmUoJy4vdmFsdWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxlY3Q7XG5cbmZ1bmN0aW9uIHNob3coZSkge1xuICBzdHlsZShlLCAnZGlzcGxheScsICcnKVxufVxuXG5mdW5jdGlvbiBoaWRlKGUpIHtcbiAgc3R5bGUoZSwgJ2Rpc3BsYXknLCAnbm9uZScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdCAocXVlcnkpIHtcbiAgdmFyIGtleSwgY2hhaW4sIG1ldGhvZHMsIGVsZW1lbnRzO1xuICB2YXIgdGFzaztcblxuICBpZiAodHlwZW9mIHF1ZXJ5ID09ICdzdHJpbmcnICYmIHF1ZXJ5LmNoYXJBdCgwKSA9PSAnPCcpIHtcbiAgICAvLyBDcmVhdGUgbmV3IGVsZW1lbnQgZnJvbSBgcXVlcnlgXG4gICAgZWxlbWVudHMgPSBbbmV3RWxlbWVudChxdWVyeSwgYXJndW1lbnRzWzFdKV07XG4gIH0gZWxzZSBpZiAodHlwZW9mIHF1ZXJ5ID09ICdzdHJpbmcnKSB7XG4gICAgLy8gU2VsZWN0IGdpdmVuIENTUyBxdWVyeVxuICAgIGVsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoc2VsZWN0RE9NKHF1ZXJ5LCBhcmd1bWVudHNbMV0pKTtcbiAgfSBlbHNlIGlmIChxdWVyeSA9PSBkb2N1bWVudCkge1xuICAgIGVsZW1lbnRzID0gW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF07XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxICYmIEFycmF5LmlzQXJyYXkoYXJndW1lbnRzWzBdKSkge1xuICAgIGVsZW1lbnRzID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGVsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgfVxuXG4gIG1ldGhvZHMgPSB7XG4gICAgYWRkQ2xhc3M6IGFwcGx5RWFjaEVsZW1lbnQoY2xhc3Nlcy5hZGQsIGVsZW1lbnRzKSxcbiAgICByZW1vdmVDbGFzczogYXBwbHlFYWNoRWxlbWVudChjbGFzc2VzLnJlbW92ZSwgZWxlbWVudHMpLFxuICAgIHRvZ2dsZUNsYXNzOiBhcHBseUVhY2hFbGVtZW50KGNsYXNzZXMudG9nZ2xlLCBlbGVtZW50cyksXG4gICAgc2hvdzogYXBwbHlFYWNoRWxlbWVudChzaG93LCBlbGVtZW50cyksXG4gICAgaGlkZTogYXBwbHlFYWNoRWxlbWVudChoaWRlLCBlbGVtZW50cyksXG4gICAgc3R5bGU6IGFwcGx5RWFjaEVsZW1lbnQoc3R5bGUsIGVsZW1lbnRzKVxuICB9O1xuXG4gIGZvciAoa2V5IGluIGV2ZW50cykge1xuICAgIG1ldGhvZHNba2V5XSA9IGFwcGx5RWFjaEVsZW1lbnQoZXZlbnRzW2tleV0sIGVsZW1lbnRzKTtcbiAgfVxuXG4gIGZvciAoa2V5IGluIHRyZWUpIHtcbiAgICBtZXRob2RzW2tleV0gPSBhcHBseUVhY2hFbGVtZW50KHRyZWVba2V5XSwgZWxlbWVudHMpO1xuICB9XG5cbiAgY2hhaW4gPSBuZXdDaGFpbi5mcm9tKGVsZW1lbnRzKShtZXRob2RzKTtcblxuICBjaGFpbi5hdHRyID0gYXBwbHlFYWNoRWxlbWVudChhdHRyKGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi5jbGFzc2VzID0gYXBwbHlFYWNoRWxlbWVudChjbGFzc2VzLCBlbGVtZW50cyk7XG4gIGNoYWluLmhhc0NsYXNzID0gYXBwbHlFYWNoRWxlbWVudChjbGFzc2VzLmhhcywgZWxlbWVudHMpLFxuICBjaGFpbi5odG1sID0gYXBwbHlFYWNoRWxlbWVudChodG1sKGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi50ZXh0ID0gYXBwbHlFYWNoRWxlbWVudCh0ZXh0KGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi52YWwgPSBhcHBseUVhY2hFbGVtZW50KHZhbHVlKGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi52YWx1ZSA9IGFwcGx5RWFjaEVsZW1lbnQodmFsdWUoY2hhaW4pLCBlbGVtZW50cyk7XG4gIGNoYWluLnBhcmVudCA9IHNlbGVjdEVhY2hFbGVtZW50KHBhcmVudCwgZWxlbWVudHMpO1xuICBjaGFpbi5zZWxlY3QgPSBzZWxlY3RFYWNoRWxlbWVudChzZWxlY3RDaGlsZCwgZWxlbWVudHMpO1xuICBjaGFpbi5zaWJsaW5ncyA9IHNlbGVjdEVhY2hFbGVtZW50KHNpYmxpbmdzLCBlbGVtZW50cyk7XG5cbiAgcmV0dXJuIGNoYWluO1xufVxuXG5mdW5jdGlvbiBwYXJlbnQgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gIGlmICghc2VsZWN0b3IpIHJldHVybiBlbGVtZW50LnBhcmVudE5vZGU7XG4gIHJldHVybiBjbG9zZXN0KGVsZW1lbnQsIHNlbGVjdG9yKTtcbn07XG5cbmZ1bmN0aW9uIHNlbGVjdENoaWxkIChlbGVtZW50LCBxdWVyeSkge1xuICByZXR1cm4gc2VsZWN0KHF1ZXJ5LCBlbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlFYWNoRWxlbWVudCAoZm4sIGVsZW1lbnRzKSB7XG4gIGlmICghZm4pIHRocm93IG5ldyBFcnJvcignVW5kZWZpbmVkIGZ1bmN0aW9uLicpO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGksIGxlbiwgcmV0LCBwYXJhbXMsIHJldDtcblxuICAgIGxlbiA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICBpID0gLTE7XG4gICAgcGFyYW1zID0gW3VuZGVmaW5lZF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXG4gICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgcGFyYW1zWzBdID0gZWxlbWVudHNbaV07XG4gICAgICByZXQgPSBmbi5hcHBseSh1bmRlZmluZWQsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0RWFjaEVsZW1lbnQgKGZuLCBlbHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIHBhcmFtcyA9IFt1bmRlZmluZWRdLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblxuICAgIHZhciBsZW4gPSBlbHMubGVuZ3RoO1xuICAgIHZhciBpID0gLTE7XG4gICAgdmFyIHJldDtcbiAgICB2YXIgdDtcbiAgICB2YXIgdGxlbjtcblxuICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgIHBhcmFtc1swXSA9IGVsc1tpXTtcbiAgICAgIHJldCA9IGZuLmFwcGx5KHVuZGVmaW5lZCwgcGFyYW1zKTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmV0KSkge1xuICAgICAgICB0bGVuID0gcmV0Lmxlbmd0aDtcbiAgICAgICAgdCA9IC0xO1xuXG4gICAgICAgIHdoaWxlICgrK3QgPCB0bGVuKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKHJldFt0XSkgIT0gLTEpIGNvbnRpbnVlO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHJldFt0XSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXQpIGNvbnRpbnVlO1xuICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKHJldCkgIT0gLTEpIGNvbnRpbnVlO1xuXG4gICAgICByZXN1bHQucHVzaChyZXQpO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHNlbGVjdChyZXN1bHQpO1xuICB9O1xufVxuIiwidmFyIGZvcm1hdCA9IHJlcXVpcmUoJ2Zvcm1hdC10ZXh0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGV4dDtcblxuZnVuY3Rpb24gdGV4dCAoY2hhaW4pe1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQsIG5ld1ZhbHVlLCB2YXJzKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBmb3JtYXQobmV3VmFsdWUsIHZhcnMpIDogbmV3VmFsdWU7XG4gICAgICByZXR1cm4gY2hhaW47XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gIH07XG59XG4iLCJ2YXIgdmFsdWUgPSByZXF1aXJlKFwiZG9tLXZhbHVlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpdGhDaGFpbjtcblxuZnVuY3Rpb24gd2l0aENoYWluIChjaGFpbikge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsLCB1cGRhdGUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICB2YWx1ZShlbCwgdXBkYXRlKTtcbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWUoZWwpO1xuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZvcm1hdDtcblxuZnVuY3Rpb24gZm9ybWF0KHRleHQpIHtcbiAgdmFyIGNvbnRleHQ7XG5cbiAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT0gJ29iamVjdCcgJiYgYXJndW1lbnRzWzFdKSB7XG4gICAgY29udGV4dCA9IGFyZ3VtZW50c1sxXTtcbiAgfSBlbHNlIHtcbiAgICBjb250ZXh0ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodGV4dCkucmVwbGFjZSgvXFx7P1xceyhbXnt9XSspfX0/L2csIHJlcGxhY2UoY29udGV4dCkpO1xufTtcblxuZnVuY3Rpb24gcmVwbGFjZSAoY29udGV4dCwgbmlsKXtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YWcsIG5hbWUpIHtcbiAgICBpZiAodGFnLnN1YnN0cmluZygwLCAyKSA9PSAne3snICYmIHRhZy5zdWJzdHJpbmcodGFnLmxlbmd0aCAtIDIpID09ICd9fScpIHtcbiAgICAgIHJldHVybiAneycgKyBuYW1lICsgJ30nO1xuICAgIH1cblxuICAgIGlmICghY29udGV4dC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRhZztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHRbbmFtZV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGNvbnRleHRbbmFtZV0oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGV4dFtuYW1lXTtcbiAgfVxufVxuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cbiIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cbiIsIlxudmFyIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCJ2YXIga2V5bmFtZU9mID0gcmVxdWlyZShcImtleW5hbWUtb2ZcIik7XG52YXIgZXZlbnRzID0gcmVxdWlyZShcImRvbS1ldmVudFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvbjtcbm1vZHVsZS5leHBvcnRzLm9uID0gb247XG5tb2R1bGUuZXhwb3J0cy5vZmYgPSBvZmY7XG5cbmZ1bmN0aW9uIG9uIChlbGVtZW50LCBrZXlzLCBjYWxsYmFjaykge1xuICB2YXIgZXhwZWN0ZWQgPSBwYXJzZShrZXlzKTtcblxuICB2YXIgZm4gPSBldmVudHMub24oZWxlbWVudCwgJ2tleXVwJywgZnVuY3Rpb24oZXZlbnQpe1xuXG4gICAgaWYgKChldmVudC5jdHJsS2V5IHx8IHVuZGVmaW5lZCkgPT0gZXhwZWN0ZWQuY3RybCAmJlxuICAgICAgIChldmVudC5hbHRLZXkgfHwgdW5kZWZpbmVkKSA9PSBleHBlY3RlZC5hbHQgJiZcbiAgICAgICAoZXZlbnQuc2hpZnRLZXkgfHwgdW5kZWZpbmVkKSA9PSBleHBlY3RlZC5zaGlmdCAmJlxuICAgICAgIGtleW5hbWVPZihldmVudC5rZXlDb2RlKSA9PSBleHBlY3RlZC5rZXkpe1xuXG4gICAgICBjYWxsYmFjayhldmVudCk7XG4gICAgfVxuXG4gIH0pO1xuXG5cbiAgY2FsbGJhY2tbJ2NiLScgKyBrZXlzXSA9IGZuO1xuXG4gIHJldHVybiBjYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gb2ZmIChlbGVtZW50LCBrZXlzLCBjYWxsYmFjaykge1xuICBldmVudHMub2ZmKGVsZW1lbnQsICdrZXl1cCcsIGNhbGxiYWNrWydjYi0nICsga2V5c10pO1xufVxuXG5mdW5jdGlvbiBwYXJzZSAoa2V5cyl7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAga2V5cyA9IGtleXMuc3BsaXQoL1teXFx3XSsvKTtcblxuICB2YXIgaSA9IGtleXMubGVuZ3RoLCBuYW1lO1xuICB3aGlsZSAoIGkgLS0gKXtcbiAgICBuYW1lID0ga2V5c1tpXS50cmltKCk7XG5cbiAgICBpZihuYW1lID09ICdjdHJsJykge1xuICAgICAgcmVzdWx0LmN0cmwgPSB0cnVlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYobmFtZSA9PSAnYWx0Jykge1xuICAgICAgcmVzdWx0LmFsdCA9IHRydWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZihuYW1lID09ICdzaGlmdCcpIHtcbiAgICAgIHJlc3VsdC5zaGlmdCA9IHRydWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXN1bHQua2V5ID0gbmFtZS50cmltKCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwidmFyIG1hcCA9IHJlcXVpcmUoXCJrZXluYW1lc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXluYW1lT2Y7XG5cbmZ1bmN0aW9uIGtleW5hbWVPZiAobikge1xuICAgcmV0dXJuIG1hcFtuXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKG4pLnRvTG93ZXJDYXNlKCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgOCAgIDogJ2JhY2tzcGFjZScsXG4gIDkgICA6ICd0YWInLFxuICAxMyAgOiAnZW50ZXInLFxuICAxNiAgOiAnc2hpZnQnLFxuICAxNyAgOiAnY3RybCcsXG4gIDE4ICA6ICdhbHQnLFxuICAyMCAgOiAnY2Fwc2xvY2snLFxuICAyNyAgOiAnZXNjJyxcbiAgMzIgIDogJ3NwYWNlJyxcbiAgMzMgIDogJ3BhZ2V1cCcsXG4gIDM0ICA6ICdwYWdlZG93bicsXG4gIDM1ICA6ICdlbmQnLFxuICAzNiAgOiAnaG9tZScsXG4gIDM3ICA6ICdsZWZ0JyxcbiAgMzggIDogJ3VwJyxcbiAgMzkgIDogJ3JpZ2h0JyxcbiAgNDAgIDogJ2Rvd24nLFxuICA0NSAgOiAnaW5zJyxcbiAgNDYgIDogJ2RlbCcsXG4gIDkxICA6ICdtZXRhJyxcbiAgOTMgIDogJ21ldGEnLFxuICAyMjQgOiAnbWV0YSdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xudmFyIHZlbmRvciA9IHByb3RvLm1hdGNoZXNcbiAgfHwgcHJvdG8ubWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaDtcblxuLyoqXG4gKiBNYXRjaCBgZWxgIHRvIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBtYXRjaChlbCwgc2VsZWN0b3IpIHtcbiAgaWYgKHZlbmRvcikgcmV0dXJuIHZlbmRvci5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gIHZhciBub2RlcyA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobm9kZXNbaV0gPT0gZWwpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0iLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG52YXIgRXh0ZW5kRGVmYXVsdCA9IHJlcXVpcmUoJy4vbGliL2V4dGVuZF9kZWZhdWx0Jyk7XG52YXIgSW1hZ2VTbGlkZXIgPSByZXF1aXJlKCcuL2xpYi9pbWFnZV9zbGlkZXInKTtcbnZhciBTdHJpbmdBc05vZGUgPSByZXF1aXJlKCcuL2xpYi9zdHJpbmdfYXNfbm9kZScpO1xudmFyIFRlbXBsYXRlID0gcmVxdWlyZSgnLi9saWIvdGVtcGxhdGUtZW5naW5lJyk7XG5cblxudmFyIE1vZGFsYmxhbmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE1vZGFsYmxhbmMpKSB7XG4gICAgICByZXR1cm4gbmV3IE1vZGFsYmxhbmMoKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsb3NlQnV0dG9uID0gbnVsbDtcbiAgICB0aGlzLm92ZXJsYXkgPSBudWxsO1xuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgICBhbmltYXRpb246ICdmYWRlLWluLW91dCcsXG4gICAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgICBjb250ZW50OiAnJyxcbiAgICAgICAgc2xpZGVyOiBudWxsLFxuICAgICAgICBzaWRlVHdvOiB7XG4gICAgICAgICAgICBjb250ZW50OiBudWxsLFxuICAgICAgICAgICAgYW5pbWF0aW9uOiBudWxsLFxuICAgICAgICAgICAgYnV0dG9uOiBudWxsLFxuICAgICAgICAgICAgYnV0dG9uQmFjazogbnVsbFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7fTtcblxuICAgIHRoaXMuaGFzU2xpZGVyID0gdGhpcy5oYXNTbGlkZXIgPyB0cnVlIDogZmFsc2U7XG4gICAgdGhpcy5zbGlkZXJJc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChhcmd1bWVudHNbMF0gJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gRXh0ZW5kRGVmYXVsdChkZWZhdWx0cywgYXJndW1lbnRzWzBdKTtcbiAgICB9XG5cbn07XG5cbk1vZGFsYmxhbmMucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5tb2RhbE9wZW4pIHJldHVybjtcblxuICAgIGJ1aWxkLmNhbGwodGhpcyk7XG4gICAgc2V0RXZlbnRzLmNhbGwodGhpcyk7XG59O1xuXG5Nb2RhbGJsYW5jLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5tb2RhbE9wZW4pIHJldHVybjtcblxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ292ZXJsYXktbW9kYWwtYmxhbmMnKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ2lzLWluYWN0aXZlJyk7XG5cbiAgICB2YXIgdHJhbnNQcmVmaXggPSB0cmFuc2l0aW9uUHJlZml4KG92ZXJsYXkpO1xuXG4gICAgb3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKHRyYW5zUHJlZml4LmVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIF90aGlzLnNldHRpbmdzLm1vZGFsT3BlbiA9IGZhbHNlO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIGRvY3VtZW50Lm9ua2V5dXAgPSBudWxsO1xuICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IG51bGw7XG59O1xuXG5Nb2RhbGJsYW5jLnByb3RvdHlwZS5zbGlkZXJJbml0ID0gZnVuY3Rpb24oc2lkZSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc2xpZGVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaGFzU2xpZGVyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5oYXNTbGlkZXIpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIHRoaXMuc2xpZGVySXNPcGVuID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnNsaWRlciA9IG5ldyBJbWFnZVNsaWRlcih7XG4gICAgICAgICAgICBwYXJlbnQ6IHNpZGUsXG4gICAgICAgICAgICBzZWxlY3RvcjogdGhpcy5vcHRpb25zLnNsaWRlclxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5Nb2RhbGJsYW5jLnByb3RvdHlwZS5fY29udGVudE5leHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5oYXNTbGlkZXIpIHtcbiAgICAgICAgdGhpcy5zbGlkZXJJc09wZW4gPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuc2xpZGVyLnBsYXlpbmcpIHRoaXMuc2xpZGVyLnBhdXNlKCk7XG4gICAgICAgIHJlbW92ZUNsYXNzKHRoaXMubW9kYWxDb250YWluZXIsICdzbGlkZXItbW9kYWwnKTtcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5tb2RhbENvbnRhaW5lciwgJ2JpZy1tb2RhbCcpO1xuICAgIH1cblxuICAgIHZhciBjYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhcmQnKSxcbiAgICAgICAgY3VzdG9tQ2xhc3MgPSB0aGlzLm9wdGlvbnMuc2lkZVR3by5hbmltYXRpb247XG5cbiAgICBjYXJkLmNsYXNzTGlzdC5yZW1vdmUodHlwZU9mQW5pbWF0aW9uKGN1c3RvbUNsYXNzLCAyKSk7XG4gICAgY2FyZC5jbGFzc0xpc3QuYWRkKHR5cGVPZkFuaW1hdGlvbihjdXN0b21DbGFzcykpO1xufTtcblxuTW9kYWxibGFuYy5wcm90b3R5cGUuX2NvbnRlbnRQcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmhhc1NsaWRlcikge1xuICAgICAgICAvLyBpZiAoIXRoaXMuc2xpZGVyLnBsYXlpbmcpIHRoaXMuc2xpZGVyLnBsYXkoKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5tb2RhbENvbnRhaW5lciwgJ2JpZy1tb2RhbCcpO1xuICAgICAgICBhZGRDbGFzcyh0aGlzLm1vZGFsQ29udGFpbmVyLCAnc2xpZGVyLW1vZGFsJyk7XG4gICAgfVxuXG4gICAgdmFyIGNhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZCcpLFxuICAgICAgICBjdXN0b21DbGFzcyA9IHRoaXMub3B0aW9ucy5zaWRlVHdvLmFuaW1hdGlvbjtcblxuICAgIGNhcmQuY2xhc3NMaXN0LnJlbW92ZSh0eXBlT2ZBbmltYXRpb24oY3VzdG9tQ2xhc3MpKTtcbiAgICBjYXJkLmNsYXNzTGlzdC5hZGQodHlwZU9mQW5pbWF0aW9uKGN1c3RvbUNsYXNzLCAyKSk7XG59O1xuXG5Nb2RhbGJsYW5jLnByb3RvdHlwZS5jbGFzc0V2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlbG0sIGNhbGxiYWNrKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxtLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsbVtpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gdHlwZU9mQW5pbWF0aW9uKHR5cGUsIHR5cGVDbGFzcykge1xuICAgIHZhciBhbmltYXRpb25UeXBlcyA9IHtcbiAgICAgICAgICAgICdzbGlkZSc6IFsnc2xpZGUtbmV4dCcsICdzbGlkZS1iYWNrJ10sXG4gICAgICAgICAgICAnc2NhbGUnOiBbJ3NjYWxlLW5leHQnLCAnc2NhbGUtYmFjayddXG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1hdGlvbkNsYXNzID0gYW5pbWF0aW9uVHlwZXNbdHlwZV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHR5cGVDbGFzcyA9PT0gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25UeXBlcy5zbGlkZVsxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvblR5cGVzLnNsaWRlWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVDbGFzcyA9PT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbkNsYXNzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbkNsYXNzWzBdO1xuICAgICAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zaXRpb25QcmVmaXgoZWxtKSB7XG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcbiAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgICAnTW96VHJhbnNpdGlvbicgICAgOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdPVHJhbnNpdGlvbicgICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICd0cmFuc2l0aW9uJyAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xuICAgICAgaWYgKGVsbS5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0RXZlbnRzKCkge1xuICAgIHZhciBuZXh0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWJ1dHRvbi1uZXh0JyksXG4gICAgICAgIHByZXZCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYnV0dG9uLXByZXYnKSxcbiAgICAgICAgY2xvc2VkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwtZnVsbHNjcmVlbi1jbG9zZScpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmNsYXNzRXZlbnRMaXN0ZW5lcihjbG9zZWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAga2V5Ym9hcmRBY3Rpb25zLmNhbGwodGhpcyk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnNpZGVUd28uY29udGVudCA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgbmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NvbnRlbnROZXh0LmJpbmQodGhpcykpO1xuICAgIHByZXZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jb250ZW50UHJldmlvdXMuYmluZCh0aGlzKSk7XG5cbn1cblxuZnVuY3Rpb24gYnVpbGQoKSB7XG4gICAgdGhpcy5tb2RhbENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsLWZ1bGxzY3JlZW4tY29udGFpbmVyJyk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZUJ1dHRvbikgdGhpcy5jbG9zZUJ1dHRvbiA9ICc8c3BhbiBjbGFzcz1cIm1vZGFsLWZ1bGxzY3JlZW4tY2xvc2VcIj5YPC9zcGFuPic7XG5cbiAgICB2YXIgY29udGVudFNpZGVPbmUgPSAhdGhpcy5vcHRpb25zLnNsaWRlciA/IGNvbnRlbnRUeXBlKHRoaXMub3B0aW9ucy5jb250ZW50KSA6IGNvbnRlbnRUeXBlKCc8ZGl2IGlkPVwibW9kYWwtc2xpZGVyXCI+PC9kaXY+Jyk7XG5cbiAgICB2YXIgdHlwZU1vZGFsID0gdGhpcy5vcHRpb25zLnNsaWRlciA/ICdzbGlkZXItbW9kYWwnIDogJ2JpZy1tb2RhbCc7XG4gICAgdmFyIG1vZGFsID0gJzxkaXYgaWQ9XCJvdmVybGF5LW1vZGFsLWJsYW5jXCIgY2xhc3M9XCJtb2RhbC1mdWxsc2NyZWVuLWJhY2tncm91bmQgPCV0aGlzLmFuaW1hdGlvbiU+IDwldGhpcy5zdGF0ZSU+XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwibW9kYWwtZnVsbHNjcmVlbi1jb250YWluZXJcImNsYXNzPVwibW9kYWwtZnVsbHNjcmVlbi1jb250YWluZXIgPCV0aGlzLnR5cGUlPiBcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwiY2FyZFwiPicrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmcm9udFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBpZD1cImZyb250LWNhcmRcIiBjbGFzcz1cIm1vZGFsLWZ1bGxzY3JlZW4taXRlbVwiPicrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPCV0aGlzLmNsb3NlQnV0dG9uJT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8JXRoaXMuY29udGVudFR5cGVTaWRlT25lJT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYmFja1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiAgaWQ9XCJiYWNrLWNhcmRcIiBjbGFzcz1cIm1vZGFsLWZ1bGxzY3JlZW4taXRlbVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwldGhpcy5jbG9zZUJ1dHRvbiU+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPCV0aGlzLmNvbnRlbnRUeXBlU2lkZVR3byU+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcblxuICAgIHZhciBtb2RhbFRlbXBsYXRlID0gVGVtcGxhdGUobW9kYWwsIHtcbiAgICAgICAgYW5pbWF0aW9uOiB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uLFxuICAgICAgICBzdGF0ZTogJ2lzLWFjdGl2ZScsXG4gICAgICAgIHR5cGU6IHR5cGVNb2RhbCxcbiAgICAgICAgY2xvc2VCdXR0b246IHRoaXMuY2xvc2VCdXR0b24sXG4gICAgICAgIGNvbnRlbnRUeXBlU2lkZU9uZTogY29udGVudFNpZGVPbmUsXG4gICAgICAgIGNvbnRlbnRUeXBlU2lkZVR3bzogY29udGVudFR5cGUodGhpcy5vcHRpb25zLnNpZGVUd28uY29udGVudClcbiAgICB9KTtcblxuICAgIHZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKSxcbiAgICAgICAgbW9kYWxJZDtcblxuICAgIGlmIChib2R5WzBdLmlkKSB7XG4gICAgICAgIG1vZGFsSWQgPSBib2R5WzBdLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZGFsSWQgPSAnZ28tbW9kYWwnO1xuICAgICAgICBib2R5WzBdLmlkID0gbW9kYWxJZDtcbiAgICB9XG5cbiAgICBTdHJpbmdBc05vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW9kYWxJZCksIG1vZGFsVGVtcGxhdGUpO1xuICAgIHRoaXMuc2V0dGluZ3MubW9kYWxPcGVuID0gdHJ1ZTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2xpZGVyKSB0aGlzLnNsaWRlckluaXQoJyNtb2RhbC1zbGlkZXInKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2lkZVR3by5jb250ZW50ID09PSBudWxsKSByZXR1cm47XG5cbiAgICBidWlsZEJ1dHRvbih0aGlzLm9wdGlvbnMuc2lkZVR3by5idXR0b24pO1xuICAgIGJ1aWxkQnV0dG9uKHRoaXMub3B0aW9ucy5zaWRlVHdvLmJ1dHRvbkJhY2ssICdiYWNrJyk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRWxlbWVudChidWlsZE9wdGlvbnMpIHtcbiAgICB2YXIgY3JlYXRlRWxtLFxuICAgICAgICBwYXJlbnRFbG07XG5cbiAgICBjcmVhdGVFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGJ1aWxkT3B0aW9ucy5lbG0pO1xuICAgIGNyZWF0ZUVsbS5pZCA9IGJ1aWxkT3B0aW9ucy5idXR0b25JZDtcbiAgICBjcmVhdGVFbG0uaW5uZXJIVE1MID0gYnVpbGRPcHRpb25zLmJ1dHRvblRleHQ7XG4gICAgcGFyZW50RWxtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnVpbGRPcHRpb25zLnBhcmVudElkKTtcblxuICAgIHBhcmVudEVsbS5hcHBlbmRDaGlsZChjcmVhdGVFbG0pO1xufVxuXG5cbmZ1bmN0aW9uIGJ1aWxkQnV0dG9uKGVsbSkge1xuICAgIHZhciBidXR0b24sXG4gICAgICAgIGNvbXB1dGVkQnV0dG9uLFxuICAgICAgICBjb21wdXRlZEJ1dHRvbkJhY2ssXG4gICAgICAgIGZyb250Q2FyZCxcbiAgICAgICAgYmFja0NhcmQ7XG5cbiAgICBpZiAoZWxtID09PSBudWxsIHx8IGVsbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYnV0dG9uLW5leHQnKSB8fCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYnV0dG9uLXByZXYnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnVpbGRFbGVtZW50KHtcbiAgICAgICAgICAgICAgICBlbG06ICdhJyxcbiAgICAgICAgICAgICAgICBidXR0b25JZDogJ21vZGFsLWJ1dHRvbi1uZXh0JyxcbiAgICAgICAgICAgICAgICBidXR0b25UZXh0OiAnTmV4dCBzdGVwJyxcbiAgICAgICAgICAgICAgICBwYXJlbnRJZDogJ2Zyb250LWNhcmQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnVpbGRFbGVtZW50KHtcbiAgICAgICAgICAgICAgICBlbG06ICdhJyxcbiAgICAgICAgICAgICAgICBidXR0b25JZDogJ21vZGFsLWJ1dHRvbi1wcmV2JyxcbiAgICAgICAgICAgICAgICBidXR0b25UZXh0OiAnUHJldmlvdXMgc3RlcCcsXG4gICAgICAgICAgICAgICAgcGFyZW50SWQ6ICdiYWNrLWNhcmQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1aWxkRWxlbWVudCh7XG4gICAgICAgICAgICBlbG06IGVsbS5lbGVtZW50LFxuICAgICAgICAgICAgYnV0dG9uSWQ6IGVsbS5pZCxcbiAgICAgICAgICAgIGJ1dHRvblRleHQ6IGVsbS50ZXh0LFxuICAgICAgICAgICAgcGFyZW50SWQ6IGVsbS5wYXJlbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY29udGVudFR5cGUoY29udGVudFZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiBjb250ZW50VmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50VmFsdWU7XG4gICAgfSBlbHNlIGlmIChjb250ZW50VmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb250ZW50VmFsdWUuaW5uZXJIVE1MO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3Moc2VsZWN0b3IsIGNsYXNzTmFtZSkge1xuICAgIHNlbGVjdG9yWzBdLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhzZWxlY3RvciwgY2xhc3NOYW1lKSB7XG4gICAgc2VsZWN0b3JbMF0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG59XG5cbmZ1bmN0aW9uIGtleWJvYXJkQWN0aW9ucygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZG9jdW1lbnQub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoX3RoaXMuc2V0dGluZ3MubW9kYWxPcGVuICYmIGUua2V5Q29kZSA9PSAyNykge1xuICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gTW9kYWxibGFuYztcbiIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc291cmNlLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIHByb3BlcnR5O1xuICAgIGZvciAocHJvcGVydHkgaW4gcHJvcGVydGllcykge1xuICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgIHNvdXJjZVtwcm9wZXJ0eV0gPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xufTsiLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG52YXIgRXh0ZW5kRGVmYXVsdCA9IHJlcXVpcmUoJy4vZXh0ZW5kX2RlZmF1bHQnKTtcblxudmFyIEltYWdlU2xpZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEltYWdlU2xpZGVyKSkge1xuICAgICAgICByZXR1cm4gbmV3IEltYWdlU2xpZGVyKCk7XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgICBzZWxlY3RvcjogJy5zbGlkZXMnLFxuICAgICAgICB0cmFuc2l0aW9uOiAnZmFkZS1zbGlkZScsXG4gICAgICAgIGF1dG9QbGF5OiBmYWxzZVxuICAgIH07XG5cbiAgICBpZiAoYXJndW1lbnRzWzBdICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IEV4dGVuZERlZmF1bHQoZGVmYXVsdHMsIGFyZ3VtZW50c1swXSk7XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuY3VycmVudFNsaWRlID0gMDtcbiAgICB0aGlzLnBsYXlpbmc7XG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuc2xpZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmltYWdlLXNsaWRlci1ob2xkZXIgLmltYWdlLXNsaWRlcicpO1xuICAgIHRoaXMuc2V0U2xpZGUoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BsYXkpIHtcbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxufTtcblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jcmVhdGVTbGlkZXMoKTtcbiAgICBzZXRFdmVudHMuY2FsbCh0aGlzKTtcbn07XG5cbkltYWdlU2xpZGVyLnByb3RvdHlwZS5jcmVhdGVTbGlkZXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNsaWRlcyA9IFtdO1xuICAgIHZhciBzbGlkZXMsXG4gICAgICAgIGltYWdlcyA9IHRoaXMub3B0aW9ucy5zZWxlY3RvcjtcblxuICAgIGlmIChpbWFnZXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBzbGlkZXMgPSBpbWFnZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2xpZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuc2VsZWN0b3IgKyAnIGltZycpO1xuICAgIH1cblxuXG4gICAgdmFyIHBhcmVudEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMucGFyZW50KSxcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIHNsaWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyksXG4gICAgICAgIHNsaWRlSW1nLFxuICAgICAgICBzbGlkZXJFbG0sXG4gICAgICAgIGltZ0VsbTtcblxuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAnaW1hZ2Utc2xpZGVyLWNvbnRhaW5lcic7XG4gICAgc2xpZGVyLmNsYXNzTmFtZSA9ICdpbWFnZS1zbGlkZXItaG9sZGVyJztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzbGlkZXNbaV0uc3JjKSB7XG4gICAgICAgICAgICBzbGlkZUltZyA9IHNsaWRlc1tpXS5zcmM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzbGlkZUltZyA9IHNsaWRlc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2xpZGVzLnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBlbDogc2xpZGVzW2ldLFxuICAgICAgICAgICAgaW1hZ2VzOiBzbGlkZUltZ1xuICAgICAgICB9KTtcblxuICAgICAgICBzbGlkZXJFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBzbGlkZXJFbG0uY2xhc3NOYW1lID0gJ2ltYWdlLXNsaWRlcic7XG5cbiAgICAgICAgaW1nRWxtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIGltZ0VsbS5zcmMgPSBzbGlkZUltZztcblxuICAgICAgICBzbGlkZXJFbG0uYXBwZW5kQ2hpbGQoaW1nRWxtKTtcbiAgICAgICAgc2xpZGVyLmFwcGVuZENoaWxkKHNsaWRlckVsbSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzbGlkZXIpO1xuICAgICAgICBwYXJlbnRFbC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIH1cblxuICAgIHRoaXMucGxheUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICB0aGlzLnBsYXlCdG4uaWQgPSAncGxheS1idG4nO1xuICAgIHNsaWRlci5hcHBlbmRDaGlsZCh0aGlzLnBsYXlCdG4pO1xuXG4gICAgdGhpcy5wcmV2aW91c0J0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICB0aGlzLnByZXZpb3VzQnRuLmlkID0gJ3ByZXZpb3VzLWJ0bic7XG4gICAgc2xpZGVyLmFwcGVuZENoaWxkKHRoaXMucHJldmlvdXNCdG4pO1xuXG4gICAgdGhpcy5uZXh0QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMubmV4dEJ0bi5pZCA9ICduZXh0LWJ0bic7XG4gICAgc2xpZGVyLmFwcGVuZENoaWxkKHRoaXMubmV4dEJ0bik7XG59O1xuXG5JbWFnZVNsaWRlci5wcm90b3R5cGUuc2V0U2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBzZXQgdGhlIHNsaWRlciB3aXRoIGltYWdlIHNsaWRlciBlbGVtZW50cy5cbiAgICB2YXIgZmlyc3QgPSB0aGlzLnNsaWRlclswXTtcbiAgICBmaXJzdC5jbGFzc0xpc3QuYWRkKCdpcy1zaG93aW5nJyk7XG59XG5cbmZ1bmN0aW9uIHNldEV2ZW50cygpIHtcbiAgICB2YXIgcGxheUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5LWJ0bicpLFxuICAgICAgICBwcmV2aW91c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmV2aW91cy1idG4nKSxcbiAgICAgICAgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXh0LWJ0bicpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBwbGF5QnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF90aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgICAgIF90aGlzLnBhdXNlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmV2aW91c0J1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLnBhdXNlKCk7XG4gICAgICAgIF90aGlzLnByZXZpb3VzU2xpZGUoKTtcbiAgICB9XG5cbiAgICBuZXh0QnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucGF1c2UoKTtcbiAgICAgICAgX3RoaXMubmV4dFNsaWRlKCk7XG4gICAgfVxuXG4gICAga2V5Ym9hcmRBY3Rpb25zLmNhbGwodGhpcyk7XG59XG5cbkltYWdlU2xpZGVyLnByb3RvdHlwZS5uZXh0U2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdvVG9TbGlkZSh0aGlzLmN1cnJlbnRTbGlkZSArIDEsICduZXh0Jyk7XG59XG5cbkltYWdlU2xpZGVyLnByb3RvdHlwZS5wcmV2aW91c1NsaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nb1RvU2xpZGUodGhpcy5jdXJyZW50U2xpZGUgLSAxLCAncHJldmlvdXMnKTtcbn1cblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLmdvVG9TbGlkZSA9IGZ1bmN0aW9uKG4sIHNpZGUpIHtcbiAgICB2YXIgc2xpZGVzID0gdGhpcy5zbGlkZXI7XG5cbiAgICBzbGlkZXNbdGhpcy5jdXJyZW50U2xpZGVdLmNsYXNzTmFtZSA9IHNpZGUgKyAnIGltYWdlLXNsaWRlcic7XG4gICAgdGhpcy5jdXJyZW50U2xpZGUgPSAobiArIHNsaWRlcy5sZW5ndGgpICUgc2xpZGVzLmxlbmd0aDtcbiAgICBzbGlkZXNbdGhpcy5jdXJyZW50U2xpZGVdLmNsYXNzTmFtZSA9IHNpZGUgKyAnIGltYWdlLXNsaWRlciBpcy1zaG93aW5nJztcblxuICAgIGlmIChzaWRlID09PSAncHJldmlvdXMnKSB7XG4gICAgICAgIHRoaXMucHJldlNsaWRlID0gKHRoaXMuY3VycmVudFNsaWRlICsgMSkgJSBzbGlkZXMubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJldlNsaWRlID0gKHRoaXMuY3VycmVudFNsaWRlIC0gMSkgJSBzbGlkZXMubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChzaWRlID09PSAncHJldmlvdXMnKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTbGlkZSA9PT0gc2xpZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc2xpZGVzW3NsaWRlcy5sZW5ndGggKyAgIDFdLmNsYXNzTmFtZSA9IHNpZGUgKyAnIGltYWdlLXNsaWRlciBpcy1oaWRpbmcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2xpZGVzW3RoaXMucHJldlNsaWRlXS5jbGFzc05hbWUgPSBzaWRlICsgJyBpbWFnZS1zbGlkZXIgaXMtaGlkaW5nJztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTbGlkZSA9PT0gMCkge1xuICAgICAgICAgICAgc2xpZGVzW3NsaWRlcy5sZW5ndGggLSAxXS5jbGFzc05hbWUgPSBzaWRlICsgJyBpbWFnZS1zbGlkZXIgaXMtaGlkaW5nJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNsaWRlc1t0aGlzLnByZXZTbGlkZV0uY2xhc3NOYW1lID0gc2lkZSArICcgaW1hZ2Utc2xpZGVyIGlzLWhpZGluZyc7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkltYWdlU2xpZGVyLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGxheUJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wYXVzZScpO1xuICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5zbGlkZUludGVydmFsKTtcbn1cblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5wbGF5QnRuLmNsYXNzTGlzdC5hZGQoJ2lzLXBhdXNlJyk7XG4gICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNsaWRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMubmV4dFNsaWRlKCk7XG4gICAgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIGtleWJvYXJkQWN0aW9ucygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09IDM3KSB7XG4gICAgICAgICAgICBfdGhpcy5wcmV2aW91c1NsaWRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09IDM5KSB7XG4gICAgICAgICAgICBfdGhpcy5uZXh0U2xpZGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VTbGlkZXI7XG4iLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGh0bWwpIHtcbiAgICBpZiAoaHRtbCA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgIHRtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JvZHknKSxcbiAgICAgICAgY2hpbGQ7XG5cbiAgICB0bXAuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIHdoaWxlIChjaGlsZCA9IHRtcC5maXJzdENoaWxkKSB7XG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIH1cblxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZnJhZyk7XG4gICAgZnJhZyA9IHRtcCA9IG51bGw7XG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbi8qXG4gICAgdmFyIHRlbXBsYXRlID0gJzxwPkhlbGxvLCBpayBiZW4gPCV0aGlzLm5hbWUlPi4gSWsgYmVuIDwldGhpcy5wcm9maWxlLmFnZSU+IGphYXIgb3VkIGVuIGJlbiBlcmcgPCV0aGlzLnN0YXRlJT48L3A+JztcbiAgICBjb25zb2xlLmxvZyhUZW1wbGF0ZUVuZ2luZSh0ZW1wbGF0ZSwge1xuICAgICAgICBuYW1lOiAnSmhvbiBNYWpvb3InLFxuICAgICAgICBwcm9maWxlOiB7YWdlOiAzNH0sXG4gICAgICAgIHN0YXRlOiAnbGllZidcbiAgICB9KSk7XG5cbiAgICB2YXIgc2tpbGxUZW1wbGF0ZSA9IFxuICAgICAgICAnTXkgU2tpbGxzOicgK1xuICAgICAgICAnPCVmb3IodmFyIGluZGV4IGluIHRoaXMuc2tpbGxzKSB7JT4nICtcbiAgICAgICAgJzxhIGhyZWY9XCIjXCI+PCV0aGlzLnNraWxsc1tpbmRleF0lPjwvYT4nICtcbiAgICAgICAgJzwlfSU+JztcblxuICAgIGNvbnNvbGUubG9nKFRlbXBsYXRlRW5naW5lKHNraWxsVGVtcGxhdGUsIHtcbiAgICAgICAgc2tpbGxzOiBbJ2pzJywgJ2h0bWwnLCAnY3NzJ11cbiAgICB9KSk7XG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGh0bWwsIG9wdGlvbnMpIHtcbiAgICB2YXIgcmUgPSAvPCUoLis/KSU+L2csXG4gICAgICAgIHJlRXhwID0gLyheKCApPyh2YXJ8aWZ8Zm9yfGVsc2V8c3dpdGNofGNhc2V8YnJlYWt8e3x9fDspKSguKik/L2csXG4gICAgICAgIGNvZGUgPSAnd2l0aChvYmopIHsgdmFyIHI9W107XFxuJyxcbiAgICAgICAgY3Vyc29yID0gMCxcbiAgICAgICAgbWF0Y2gsXG4gICAgICAgIHJlc3VsdDtcblxuICAgIHZhciBhZGQgPSBmdW5jdGlvbihsaW5lLCBqcykge1xuICAgICAgICBqcyA/IGNvZGUgKz0gbGluZS5tYXRjaChyZUV4cCkgPyBsaW5lICsgJ1xcbicgOiAnci5wdXNoKCcgKyBsaW5lICsgJyk7XFxuJyA6XG4gICAgICAgICAgICAoY29kZSArPSBsaW5lICE9ICcnID8gJ3IucHVzaChcIicgKyBsaW5lLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIik7XFxuJyA6ICcnKTtcbiAgICAgICAgcmV0dXJuIGFkZDtcbiAgICB9XG5cbiAgICB3aGlsZShtYXRjaCA9IHJlLmV4ZWMoaHRtbCkpIHtcbiAgICAgICAgYWRkKGh0bWwuc2xpY2UoY3Vyc29yLCBtYXRjaC5pbmRleCkpKG1hdGNoWzFdLCB0cnVlKTtcbiAgICAgICAgY3Vyc29yID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgfVxuXG4gICAgYWRkKGh0bWwuc3Vic3RyKGN1cnNvciwgaHRtbC5sZW5ndGggLSBjdXJzb3IpKTtcbiAgICBjb2RlID0gKGNvZGUgKyAncmV0dXJuIHIuam9pbihcIlwiKTsgfScpLnJlcGxhY2UoL1tcXHJcXHRcXG5dL2csICcnKTtcblxuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBGdW5jdGlvbignb2JqJywgY29kZSkuYXBwbHkob3B0aW9ucywgW29wdGlvbnNdKTtcbiAgICB9IGNhdGNoKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiJ1wiICsgZXJyLm1lc3NhZ2UgKyBcIidcIiwgXCIgaW4gXFxuXFxuQ29kZTpcXG5cIiwgY29kZSwgXCJcXG5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IG5ld0NoYWluO1xubW9kdWxlLmV4cG9ydHMuZnJvbSA9IGZyb207XG5cbmZ1bmN0aW9uIGZyb20oY2hhaW4pe1xuXG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHZhciBtLCBpO1xuXG4gICAgbSA9IG1ldGhvZHMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICAgIGkgICA9IG0ubGVuZ3RoO1xuXG4gICAgd2hpbGUgKCBpIC0tICkge1xuICAgICAgY2hhaW5bIG1baV0ubmFtZSBdID0gbVtpXS5mbjtcbiAgICB9XG5cbiAgICBtLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKXtcbiAgICAgIGNoYWluWyBtZXRob2QubmFtZSBdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgbWV0aG9kLmZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBjaGFpbjtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hhaW47XG4gIH07XG5cbn1cblxuZnVuY3Rpb24gbWV0aG9kcygpe1xuICB2YXIgYWxsLCBlbCwgaSwgbGVuLCByZXN1bHQsIGtleTtcblxuICBhbGwgICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICByZXN1bHQgPSBbXTtcbiAgaSAgICAgID0gYWxsLmxlbmd0aDtcblxuICB3aGlsZSAoIGkgLS0gKSB7XG4gICAgZWwgPSBhbGxbaV07XG5cbiAgICBpZiAoIHR5cGVvZiBlbCA9PSAnZnVuY3Rpb24nICkge1xuICAgICAgcmVzdWx0LnB1c2goeyBuYW1lOiBlbC5uYW1lLCBmbjogZWwgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoIHR5cGVvZiBlbCAhPSAnb2JqZWN0JyApIGNvbnRpbnVlO1xuXG4gICAgZm9yICgga2V5IGluIGVsICkge1xuICAgICAgcmVzdWx0LnB1c2goeyBuYW1lOiBrZXksIGZuOiBlbFtrZXldIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG5ld0NoYWluKCl7XG4gIHJldHVybiBmcm9tKHt9KS5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohXG4gICogQHByZXNlcnZlIFF3ZXJ5IC0gQSBCbGF6aW5nIEZhc3QgcXVlcnkgc2VsZWN0b3IgZW5naW5lXG4gICogaHR0cHM6Ly9naXRodWIuY29tL2RlZC9xd2VyeVxuICAqIGNvcHlyaWdodCBEdXN0aW4gRGlheiAyMDEyXG4gICogTUlUIExpY2Vuc2VcbiAgKi9cblxuKGZ1bmN0aW9uIChuYW1lLCBjb250ZXh0LCBkZWZpbml0aW9uKSB7XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGRlZmluaXRpb24pXG4gIGVsc2UgY29udGV4dFtuYW1lXSA9IGRlZmluaXRpb24oKVxufSkoJ3F3ZXJ5JywgdGhpcywgZnVuY3Rpb24gKCkge1xuICB2YXIgZG9jID0gZG9jdW1lbnRcbiAgICAsIGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50XG4gICAgLCBieUNsYXNzID0gJ2dldEVsZW1lbnRzQnlDbGFzc05hbWUnXG4gICAgLCBieVRhZyA9ICdnZXRFbGVtZW50c0J5VGFnTmFtZSdcbiAgICAsIHFTQSA9ICdxdWVyeVNlbGVjdG9yQWxsJ1xuICAgICwgdXNlTmF0aXZlUVNBID0gJ3VzZU5hdGl2ZVFTQSdcbiAgICAsIHRhZ05hbWUgPSAndGFnTmFtZSdcbiAgICAsIG5vZGVUeXBlID0gJ25vZGVUeXBlJ1xuICAgICwgc2VsZWN0IC8vIG1haW4gc2VsZWN0KCkgbWV0aG9kLCBhc3NpZ24gbGF0ZXJcblxuICAgICwgaWQgPSAvIyhbXFx3XFwtXSspL1xuICAgICwgY2xhcyA9IC9cXC5bXFx3XFwtXSsvZ1xuICAgICwgaWRPbmx5ID0gL14jKFtcXHdcXC1dKykkL1xuICAgICwgY2xhc3NPbmx5ID0gL15cXC4oW1xcd1xcLV0rKSQvXG4gICAgLCB0YWdPbmx5ID0gL14oW1xcd1xcLV0rKSQvXG4gICAgLCB0YWdBbmRPckNsYXNzID0gL14oW1xcd10rKT9cXC4oW1xcd1xcLV0rKSQvXG4gICAgLCBzcGxpdHRhYmxlID0gLyhefCwpXFxzKls+fitdL1xuICAgICwgbm9ybWFsaXpyID0gL15cXHMrfFxccyooWyxcXHNcXCtcXH4+XXwkKVxccyovZ1xuICAgICwgc3BsaXR0ZXJzID0gL1tcXHNcXD5cXCtcXH5dL1xuICAgICwgc3BsaXR0ZXJzTW9yZSA9IC8oPyFbXFxzXFx3XFwtXFwvXFw/XFwmXFw9XFw6XFwuXFwoXFwpXFwhLEAjJTw+XFx7XFx9XFwkXFwqXFxeJ1wiXSpcXF18W1xcc1xcd1xcK1xcLV0qXFwpKS9cbiAgICAsIHNwZWNpYWxDaGFycyA9IC8oWy4qKz9cXF49IToke30oKXxcXFtcXF1cXC9cXFxcXSkvZ1xuICAgICwgc2ltcGxlID0gL14oXFwqfFthLXowLTldKyk/KD86KFtcXC5cXCNdK1tcXHdcXC1cXC4jXSspPykvXG4gICAgLCBhdHRyID0gL1xcWyhbXFx3XFwtXSspKD86KFtcXHxcXF5cXCRcXCpcXH5dP1xcPSlbJ1wiXT8oWyBcXHdcXC1cXC9cXD9cXCZcXD1cXDpcXC5cXChcXClcXCEsQCMlPD5cXHtcXH1cXCRcXCpcXF5dKylbXCInXT8pP1xcXS9cbiAgICAsIHBzZXVkbyA9IC86KFtcXHdcXC1dKykoXFwoWydcIl0/KFteKCldKylbJ1wiXT9cXCkpPy9cbiAgICAsIGVhc3kgPSBuZXcgUmVnRXhwKGlkT25seS5zb3VyY2UgKyAnfCcgKyB0YWdPbmx5LnNvdXJjZSArICd8JyArIGNsYXNzT25seS5zb3VyY2UpXG4gICAgLCBkaXZpZGVycyA9IG5ldyBSZWdFeHAoJygnICsgc3BsaXR0ZXJzLnNvdXJjZSArICcpJyArIHNwbGl0dGVyc01vcmUuc291cmNlLCAnZycpXG4gICAgLCB0b2tlbml6ciA9IG5ldyBSZWdFeHAoc3BsaXR0ZXJzLnNvdXJjZSArIHNwbGl0dGVyc01vcmUuc291cmNlKVxuICAgICwgY2h1bmtlciA9IG5ldyBSZWdFeHAoc2ltcGxlLnNvdXJjZSArICcoJyArIGF0dHIuc291cmNlICsgJyk/JyArICcoJyArIHBzZXVkby5zb3VyY2UgKyAnKT8nKVxuXG4gIHZhciB3YWxrZXIgPSB7XG4gICAgICAnICc6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlICYmIG5vZGUgIT09IGh0bWwgJiYgbm9kZS5wYXJlbnROb2RlXG4gICAgICB9XG4gICAgLCAnPic6IGZ1bmN0aW9uIChub2RlLCBjb250ZXN0YW50KSB7XG4gICAgICAgIHJldHVybiBub2RlICYmIG5vZGUucGFyZW50Tm9kZSA9PSBjb250ZXN0YW50LnBhcmVudE5vZGUgJiYgbm9kZS5wYXJlbnROb2RlXG4gICAgICB9XG4gICAgLCAnfic6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlICYmIG5vZGUucHJldmlvdXNTaWJsaW5nXG4gICAgICB9XG4gICAgLCAnKyc6IGZ1bmN0aW9uIChub2RlLCBjb250ZXN0YW50LCBwMSwgcDIpIHtcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm4gZmFsc2VcbiAgICAgICAgcmV0dXJuIChwMSA9IHByZXZpb3VzKG5vZGUpKSAmJiAocDIgPSBwcmV2aW91cyhjb250ZXN0YW50KSkgJiYgcDEgPT0gcDIgJiYgcDFcbiAgICAgIH1cbiAgICB9XG5cbiAgZnVuY3Rpb24gY2FjaGUoKSB7XG4gICAgdGhpcy5jID0ge31cbiAgfVxuICBjYWNoZS5wcm90b3R5cGUgPSB7XG4gICAgZzogZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiB0aGlzLmNba10gfHwgdW5kZWZpbmVkXG4gICAgfVxuICAsIHM6IGZ1bmN0aW9uIChrLCB2LCByKSB7XG4gICAgICB2ID0gciA/IG5ldyBSZWdFeHAodikgOiB2XG4gICAgICByZXR1cm4gKHRoaXMuY1trXSA9IHYpXG4gICAgfVxuICB9XG5cbiAgdmFyIGNsYXNzQ2FjaGUgPSBuZXcgY2FjaGUoKVxuICAgICwgY2xlYW5DYWNoZSA9IG5ldyBjYWNoZSgpXG4gICAgLCBhdHRyQ2FjaGUgPSBuZXcgY2FjaGUoKVxuICAgICwgdG9rZW5DYWNoZSA9IG5ldyBjYWNoZSgpXG5cbiAgZnVuY3Rpb24gY2xhc3NSZWdleChjKSB7XG4gICAgcmV0dXJuIGNsYXNzQ2FjaGUuZyhjKSB8fCBjbGFzc0NhY2hlLnMoYywgJyhefFxcXFxzKyknICsgYyArICcoXFxcXHMrfCQpJywgMSlcbiAgfVxuXG4gIC8vIG5vdCBxdWl0ZSBhcyBmYXN0IGFzIGlubGluZSBsb29wcyBpbiBvbGRlciBicm93c2VycyBzbyBkb24ndCB1c2UgbGliZXJhbGx5XG4gIGZ1bmN0aW9uIGVhY2goYSwgZm4pIHtcbiAgICB2YXIgaSA9IDAsIGwgPSBhLmxlbmd0aFxuICAgIGZvciAoOyBpIDwgbDsgaSsrKSBmbihhW2ldKVxuICB9XG5cbiAgZnVuY3Rpb24gZmxhdHRlbihhcikge1xuICAgIGZvciAodmFyIHIgPSBbXSwgaSA9IDAsIGwgPSBhci5sZW5ndGg7IGkgPCBsOyArK2kpIGFycmF5TGlrZShhcltpXSkgPyAociA9IHIuY29uY2F0KGFyW2ldKSkgOiAocltyLmxlbmd0aF0gPSBhcltpXSlcbiAgICByZXR1cm4gclxuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlpZnkoYXIpIHtcbiAgICB2YXIgaSA9IDAsIGwgPSBhci5sZW5ndGgsIHIgPSBbXVxuICAgIGZvciAoOyBpIDwgbDsgaSsrKSByW2ldID0gYXJbaV1cbiAgICByZXR1cm4gclxuICB9XG5cbiAgZnVuY3Rpb24gcHJldmlvdXMobikge1xuICAgIHdoaWxlIChuID0gbi5wcmV2aW91c1NpYmxpbmcpIGlmIChuW25vZGVUeXBlXSA9PSAxKSBicmVhaztcbiAgICByZXR1cm4gblxuICB9XG5cbiAgZnVuY3Rpb24gcShxdWVyeSkge1xuICAgIHJldHVybiBxdWVyeS5tYXRjaChjaHVua2VyKVxuICB9XG5cbiAgLy8gY2FsbGVkIHVzaW5nIGB0aGlzYCBhcyBlbGVtZW50IGFuZCBhcmd1bWVudHMgZnJvbSByZWdleCBncm91cCByZXN1bHRzLlxuICAvLyBnaXZlbiA9PiBkaXYuaGVsbG9bdGl0bGU9XCJ3b3JsZFwiXTpmb28oJ2JhcicpXG4gIC8vIGRpdi5oZWxsb1t0aXRsZT1cIndvcmxkXCJdOmZvbygnYmFyJyksIGRpdiwgLmhlbGxvLCBbdGl0bGU9XCJ3b3JsZFwiXSwgdGl0bGUsID0sIHdvcmxkLCA6Zm9vKCdiYXInKSwgZm9vLCAoJ2JhcicpLCBiYXJdXG4gIGZ1bmN0aW9uIGludGVycHJldCh3aG9sZSwgdGFnLCBpZHNBbmRDbGFzc2VzLCB3aG9sZUF0dHJpYnV0ZSwgYXR0cmlidXRlLCBxdWFsaWZpZXIsIHZhbHVlLCB3aG9sZVBzZXVkbywgcHNldWRvLCB3aG9sZVBzZXVkb1ZhbCwgcHNldWRvVmFsKSB7XG4gICAgdmFyIGksIG0sIGssIG8sIGNsYXNzZXNcbiAgICBpZiAodGhpc1tub2RlVHlwZV0gIT09IDEpIHJldHVybiBmYWxzZVxuICAgIGlmICh0YWcgJiYgdGFnICE9PSAnKicgJiYgdGhpc1t0YWdOYW1lXSAmJiB0aGlzW3RhZ05hbWVdLnRvTG93ZXJDYXNlKCkgIT09IHRhZykgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGlkc0FuZENsYXNzZXMgJiYgKG0gPSBpZHNBbmRDbGFzc2VzLm1hdGNoKGlkKSkgJiYgbVsxXSAhPT0gdGhpcy5pZCkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGlkc0FuZENsYXNzZXMgJiYgKGNsYXNzZXMgPSBpZHNBbmRDbGFzc2VzLm1hdGNoKGNsYXMpKSkge1xuICAgICAgZm9yIChpID0gY2xhc3Nlcy5sZW5ndGg7IGktLTspIGlmICghY2xhc3NSZWdleChjbGFzc2VzW2ldLnNsaWNlKDEpKS50ZXN0KHRoaXMuY2xhc3NOYW1lKSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmIChwc2V1ZG8gJiYgcXdlcnkucHNldWRvc1twc2V1ZG9dICYmICFxd2VyeS5wc2V1ZG9zW3BzZXVkb10odGhpcywgcHNldWRvVmFsKSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKHdob2xlQXR0cmlidXRlICYmICF2YWx1ZSkgeyAvLyBzZWxlY3QgaXMganVzdCBmb3IgZXhpc3RhbmNlIG9mIGF0dHJpYlxuICAgICAgbyA9IHRoaXMuYXR0cmlidXRlc1xuICAgICAgZm9yIChrIGluIG8pIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSAmJiAob1trXS5uYW1lIHx8IGspID09IGF0dHJpYnV0ZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHdob2xlQXR0cmlidXRlICYmICFjaGVja0F0dHIocXVhbGlmaWVyLCBnZXRBdHRyKHRoaXMsIGF0dHJpYnV0ZSkgfHwgJycsIHZhbHVlKSkge1xuICAgICAgLy8gc2VsZWN0IGlzIGZvciBhdHRyaWIgZXF1YWxpdHlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW4ocykge1xuICAgIHJldHVybiBjbGVhbkNhY2hlLmcocykgfHwgY2xlYW5DYWNoZS5zKHMsIHMucmVwbGFjZShzcGVjaWFsQ2hhcnMsICdcXFxcJDEnKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrQXR0cihxdWFsaWZ5LCBhY3R1YWwsIHZhbCkge1xuICAgIHN3aXRjaCAocXVhbGlmeSkge1xuICAgIGNhc2UgJz0nOlxuICAgICAgcmV0dXJuIGFjdHVhbCA9PSB2YWxcbiAgICBjYXNlICdePSc6XG4gICAgICByZXR1cm4gYWN0dWFsLm1hdGNoKGF0dHJDYWNoZS5nKCdePScgKyB2YWwpIHx8IGF0dHJDYWNoZS5zKCdePScgKyB2YWwsICdeJyArIGNsZWFuKHZhbCksIDEpKVxuICAgIGNhc2UgJyQ9JzpcbiAgICAgIHJldHVybiBhY3R1YWwubWF0Y2goYXR0ckNhY2hlLmcoJyQ9JyArIHZhbCkgfHwgYXR0ckNhY2hlLnMoJyQ9JyArIHZhbCwgY2xlYW4odmFsKSArICckJywgMSkpXG4gICAgY2FzZSAnKj0nOlxuICAgICAgcmV0dXJuIGFjdHVhbC5tYXRjaChhdHRyQ2FjaGUuZyh2YWwpIHx8IGF0dHJDYWNoZS5zKHZhbCwgY2xlYW4odmFsKSwgMSkpXG4gICAgY2FzZSAnfj0nOlxuICAgICAgcmV0dXJuIGFjdHVhbC5tYXRjaChhdHRyQ2FjaGUuZygnfj0nICsgdmFsKSB8fCBhdHRyQ2FjaGUucygnfj0nICsgdmFsLCAnKD86XnxcXFxccyspJyArIGNsZWFuKHZhbCkgKyAnKD86XFxcXHMrfCQpJywgMSkpXG4gICAgY2FzZSAnfD0nOlxuICAgICAgcmV0dXJuIGFjdHVhbC5tYXRjaChhdHRyQ2FjaGUuZygnfD0nICsgdmFsKSB8fCBhdHRyQ2FjaGUucygnfD0nICsgdmFsLCAnXicgKyBjbGVhbih2YWwpICsgJygtfCQpJywgMSkpXG4gICAgfVxuICAgIHJldHVybiAwXG4gIH1cblxuICAvLyBnaXZlbiBhIHNlbGVjdG9yLCBmaXJzdCBjaGVjayBmb3Igc2ltcGxlIGNhc2VzIHRoZW4gY29sbGVjdCBhbGwgYmFzZSBjYW5kaWRhdGUgbWF0Y2hlcyBhbmQgZmlsdGVyXG4gIGZ1bmN0aW9uIF9xd2VyeShzZWxlY3RvciwgX3Jvb3QpIHtcbiAgICB2YXIgciA9IFtdLCByZXQgPSBbXSwgaSwgbCwgbSwgdG9rZW4sIHRhZywgZWxzLCBpbnRyLCBpdGVtLCByb290ID0gX3Jvb3RcbiAgICAgICwgdG9rZW5zID0gdG9rZW5DYWNoZS5nKHNlbGVjdG9yKSB8fCB0b2tlbkNhY2hlLnMoc2VsZWN0b3IsIHNlbGVjdG9yLnNwbGl0KHRva2VuaXpyKSlcbiAgICAgICwgZGl2aWRlZFRva2VucyA9IHNlbGVjdG9yLm1hdGNoKGRpdmlkZXJzKVxuXG4gICAgaWYgKCF0b2tlbnMubGVuZ3RoKSByZXR1cm4gclxuXG4gICAgdG9rZW4gPSAodG9rZW5zID0gdG9rZW5zLnNsaWNlKDApKS5wb3AoKSAvLyBjb3B5IGNhY2hlZCB0b2tlbnMsIHRha2UgdGhlIGxhc3Qgb25lXG4gICAgaWYgKHRva2Vucy5sZW5ndGggJiYgKG0gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLm1hdGNoKGlkT25seSkpKSByb290ID0gYnlJZChfcm9vdCwgbVsxXSlcbiAgICBpZiAoIXJvb3QpIHJldHVybiByXG5cbiAgICBpbnRyID0gcSh0b2tlbilcbiAgICAvLyBjb2xsZWN0IGJhc2UgY2FuZGlkYXRlcyB0byBmaWx0ZXJcbiAgICBlbHMgPSByb290ICE9PSBfcm9vdCAmJiByb290W25vZGVUeXBlXSAhPT0gOSAmJiBkaXZpZGVkVG9rZW5zICYmIC9eWyt+XSQvLnRlc3QoZGl2aWRlZFRva2Vuc1tkaXZpZGVkVG9rZW5zLmxlbmd0aCAtIDFdKSA/XG4gICAgICBmdW5jdGlvbiAocikge1xuICAgICAgICB3aGlsZSAocm9vdCA9IHJvb3QubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICByb290W25vZGVUeXBlXSA9PSAxICYmIChpbnRyWzFdID8gaW50clsxXSA9PSByb290W3RhZ05hbWVdLnRvTG93ZXJDYXNlKCkgOiAxKSAmJiAocltyLmxlbmd0aF0gPSByb290KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByXG4gICAgICB9KFtdKSA6XG4gICAgICByb290W2J5VGFnXShpbnRyWzFdIHx8ICcqJylcbiAgICAvLyBmaWx0ZXIgZWxlbWVudHMgYWNjb3JkaW5nIHRvIHRoZSByaWdodC1tb3N0IHBhcnQgb2YgdGhlIHNlbGVjdG9yXG4gICAgZm9yIChpID0gMCwgbCA9IGVscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChpdGVtID0gaW50ZXJwcmV0LmFwcGx5KGVsc1tpXSwgaW50cikpIHJbci5sZW5ndGhdID0gaXRlbVxuICAgIH1cbiAgICBpZiAoIXRva2Vucy5sZW5ndGgpIHJldHVybiByXG5cbiAgICAvLyBmaWx0ZXIgZnVydGhlciBhY2NvcmRpbmcgdG8gdGhlIHJlc3Qgb2YgdGhlIHNlbGVjdG9yICh0aGUgbGVmdCBzaWRlKVxuICAgIGVhY2gociwgZnVuY3Rpb24gKGUpIHsgaWYgKGFuY2VzdG9yTWF0Y2goZSwgdG9rZW5zLCBkaXZpZGVkVG9rZW5zKSkgcmV0W3JldC5sZW5ndGhdID0gZSB9KVxuICAgIHJldHVybiByZXRcbiAgfVxuXG4gIC8vIGNvbXBhcmUgZWxlbWVudCB0byBhIHNlbGVjdG9yXG4gIGZ1bmN0aW9uIGlzKGVsLCBzZWxlY3Rvciwgcm9vdCkge1xuICAgIGlmIChpc05vZGUoc2VsZWN0b3IpKSByZXR1cm4gZWwgPT0gc2VsZWN0b3JcbiAgICBpZiAoYXJyYXlMaWtlKHNlbGVjdG9yKSkgcmV0dXJuICEhfmZsYXR0ZW4oc2VsZWN0b3IpLmluZGV4T2YoZWwpIC8vIGlmIHNlbGVjdG9yIGlzIGFuIGFycmF5LCBpcyBlbCBhIG1lbWJlcj9cblxuICAgIHZhciBzZWxlY3RvcnMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpLCB0b2tlbnMsIGRpdmlkZWRUb2tlbnNcbiAgICB3aGlsZSAoc2VsZWN0b3IgPSBzZWxlY3RvcnMucG9wKCkpIHtcbiAgICAgIHRva2VucyA9IHRva2VuQ2FjaGUuZyhzZWxlY3RvcikgfHwgdG9rZW5DYWNoZS5zKHNlbGVjdG9yLCBzZWxlY3Rvci5zcGxpdCh0b2tlbml6cikpXG4gICAgICBkaXZpZGVkVG9rZW5zID0gc2VsZWN0b3IubWF0Y2goZGl2aWRlcnMpXG4gICAgICB0b2tlbnMgPSB0b2tlbnMuc2xpY2UoMCkgLy8gY29weSBhcnJheVxuICAgICAgaWYgKGludGVycHJldC5hcHBseShlbCwgcSh0b2tlbnMucG9wKCkpKSAmJiAoIXRva2Vucy5sZW5ndGggfHwgYW5jZXN0b3JNYXRjaChlbCwgdG9rZW5zLCBkaXZpZGVkVG9rZW5zLCByb290KSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBnaXZlbiBlbGVtZW50cyBtYXRjaGluZyB0aGUgcmlnaHQtbW9zdCBwYXJ0IG9mIGEgc2VsZWN0b3IsIGZpbHRlciBvdXQgYW55IHRoYXQgZG9uJ3QgbWF0Y2ggdGhlIHJlc3RcbiAgZnVuY3Rpb24gYW5jZXN0b3JNYXRjaChlbCwgdG9rZW5zLCBkaXZpZGVkVG9rZW5zLCByb290KSB7XG4gICAgdmFyIGNhbmRcbiAgICAvLyByZWN1cnNpdmVseSB3b3JrIGJhY2t3YXJkcyB0aHJvdWdoIHRoZSB0b2tlbnMgYW5kIHVwIHRoZSBkb20sIGNvdmVyaW5nIGFsbCBvcHRpb25zXG4gICAgZnVuY3Rpb24gY3Jhd2woZSwgaSwgcCkge1xuICAgICAgd2hpbGUgKHAgPSB3YWxrZXJbZGl2aWRlZFRva2Vuc1tpXV0ocCwgZSkpIHtcbiAgICAgICAgaWYgKGlzTm9kZShwKSAmJiAoaW50ZXJwcmV0LmFwcGx5KHAsIHEodG9rZW5zW2ldKSkpKSB7XG4gICAgICAgICAgaWYgKGkpIHtcbiAgICAgICAgICAgIGlmIChjYW5kID0gY3Jhd2wocCwgaSAtIDEsIHApKSByZXR1cm4gY2FuZFxuICAgICAgICAgIH0gZWxzZSByZXR1cm4gcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoY2FuZCA9IGNyYXdsKGVsLCB0b2tlbnMubGVuZ3RoIC0gMSwgZWwpKSAmJiAoIXJvb3QgfHwgaXNBbmNlc3RvcihjYW5kLCByb290KSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTm9kZShlbCwgdCkge1xuICAgIHJldHVybiBlbCAmJiB0eXBlb2YgZWwgPT09ICdvYmplY3QnICYmICh0ID0gZWxbbm9kZVR5cGVdKSAmJiAodCA9PSAxIHx8IHQgPT0gOSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuaXEoYXIpIHtcbiAgICB2YXIgYSA9IFtdLCBpLCBqO1xuICAgIG86XG4gICAgZm9yIChpID0gMDsgaSA8IGFyLmxlbmd0aDsgKytpKSB7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgYS5sZW5ndGg7ICsraikgaWYgKGFbal0gPT0gYXJbaV0pIGNvbnRpbnVlIG9cbiAgICAgIGFbYS5sZW5ndGhdID0gYXJbaV1cbiAgICB9XG4gICAgcmV0dXJuIGFcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5TGlrZShvKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiYgaXNGaW5pdGUoby5sZW5ndGgpKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUm9vdChyb290KSB7XG4gICAgaWYgKCFyb290KSByZXR1cm4gZG9jXG4gICAgaWYgKHR5cGVvZiByb290ID09ICdzdHJpbmcnKSByZXR1cm4gcXdlcnkocm9vdClbMF1cbiAgICBpZiAoIXJvb3Rbbm9kZVR5cGVdICYmIGFycmF5TGlrZShyb290KSkgcmV0dXJuIHJvb3RbMF1cbiAgICByZXR1cm4gcm9vdFxuICB9XG5cbiAgZnVuY3Rpb24gYnlJZChyb290LCBpZCwgZWwpIHtcbiAgICAvLyBpZiBkb2MsIHF1ZXJ5IG9uIGl0LCBlbHNlIHF1ZXJ5IHRoZSBwYXJlbnQgZG9jIG9yIGlmIGEgZGV0YWNoZWQgZnJhZ21lbnQgcmV3cml0ZSB0aGUgcXVlcnkgYW5kIHJ1biBvbiB0aGUgZnJhZ21lbnRcbiAgICByZXR1cm4gcm9vdFtub2RlVHlwZV0gPT09IDkgPyByb290LmdldEVsZW1lbnRCeUlkKGlkKSA6XG4gICAgICByb290Lm93bmVyRG9jdW1lbnQgJiZcbiAgICAgICAgKCgoZWwgPSByb290Lm93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKSAmJiBpc0FuY2VzdG9yKGVsLCByb290KSAmJiBlbCkgfHxcbiAgICAgICAgICAoIWlzQW5jZXN0b3Iocm9vdCwgcm9vdC5vd25lckRvY3VtZW50KSAmJiBzZWxlY3QoJ1tpZD1cIicgKyBpZCArICdcIl0nLCByb290KVswXSkpXG4gIH1cblxuICBmdW5jdGlvbiBxd2VyeShzZWxlY3RvciwgX3Jvb3QpIHtcbiAgICB2YXIgbSwgZWwsIHJvb3QgPSBub3JtYWxpemVSb290KF9yb290KVxuXG4gICAgLy8gZWFzeSwgZmFzdCBjYXNlcyB0aGF0IHdlIGNhbiBkaXNwYXRjaCB3aXRoIHNpbXBsZSBET00gY2FsbHNcbiAgICBpZiAoIXJvb3QgfHwgIXNlbGVjdG9yKSByZXR1cm4gW11cbiAgICBpZiAoc2VsZWN0b3IgPT09IHdpbmRvdyB8fCBpc05vZGUoc2VsZWN0b3IpKSB7XG4gICAgICByZXR1cm4gIV9yb290IHx8IChzZWxlY3RvciAhPT0gd2luZG93ICYmIGlzTm9kZShyb290KSAmJiBpc0FuY2VzdG9yKHNlbGVjdG9yLCByb290KSkgPyBbc2VsZWN0b3JdIDogW11cbiAgICB9XG4gICAgaWYgKHNlbGVjdG9yICYmIGFycmF5TGlrZShzZWxlY3RvcikpIHJldHVybiBmbGF0dGVuKHNlbGVjdG9yKVxuICAgIGlmIChtID0gc2VsZWN0b3IubWF0Y2goZWFzeSkpIHtcbiAgICAgIGlmIChtWzFdKSByZXR1cm4gKGVsID0gYnlJZChyb290LCBtWzFdKSkgPyBbZWxdIDogW11cbiAgICAgIGlmIChtWzJdKSByZXR1cm4gYXJyYXlpZnkocm9vdFtieVRhZ10obVsyXSkpXG4gICAgICBpZiAoaGFzQnlDbGFzcyAmJiBtWzNdKSByZXR1cm4gYXJyYXlpZnkocm9vdFtieUNsYXNzXShtWzNdKSlcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0KHNlbGVjdG9yLCByb290KVxuICB9XG5cbiAgLy8gd2hlcmUgdGhlIHJvb3QgaXMgbm90IGRvY3VtZW50IGFuZCBhIHJlbGF0aW9uc2hpcCBzZWxlY3RvciBpcyBmaXJzdCB3ZSBoYXZlIHRvXG4gIC8vIGRvIHNvbWUgYXdrd2FyZCBhZGp1c3RtZW50cyB0byBnZXQgaXQgdG8gd29yaywgZXZlbiB3aXRoIHFTQVxuICBmdW5jdGlvbiBjb2xsZWN0U2VsZWN0b3Iocm9vdCwgY29sbGVjdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzKSB7XG4gICAgICB2YXIgb2lkLCBuaWRcbiAgICAgIGlmIChzcGxpdHRhYmxlLnRlc3QocykpIHtcbiAgICAgICAgaWYgKHJvb3Rbbm9kZVR5cGVdICE9PSA5KSB7XG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBlbCBoYXMgYW4gaWQsIHJld3JpdGUgdGhlIHF1ZXJ5LCBzZXQgcm9vdCB0byBkb2MgYW5kIHJ1biBpdFxuICAgICAgICAgIGlmICghKG5pZCA9IG9pZCA9IHJvb3QuZ2V0QXR0cmlidXRlKCdpZCcpKSkgcm9vdC5zZXRBdHRyaWJ1dGUoJ2lkJywgbmlkID0gJ19fcXdlcnltZXVwc2NvdHR5JylcbiAgICAgICAgICBzID0gJ1tpZD1cIicgKyBuaWQgKyAnXCJdJyArIHMgLy8gYXZvaWQgYnlJZCBhbmQgYWxsb3cgdXMgdG8gbWF0Y2ggY29udGV4dCBlbGVtZW50XG4gICAgICAgICAgY29sbGVjdG9yKHJvb3QucGFyZW50Tm9kZSB8fCByb290LCBzLCB0cnVlKVxuICAgICAgICAgIG9pZCB8fCByb290LnJlbW92ZUF0dHJpYnV0ZSgnaWQnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHMubGVuZ3RoICYmIGNvbGxlY3Rvcihyb290LCBzLCBmYWxzZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaXNBbmNlc3RvciA9ICdjb21wYXJlRG9jdW1lbnRQb3NpdGlvbicgaW4gaHRtbCA/XG4gICAgZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lcikge1xuICAgICAgcmV0dXJuIChjb250YWluZXIuY29tcGFyZURvY3VtZW50UG9zaXRpb24oZWxlbWVudCkgJiAxNikgPT0gMTZcbiAgICB9IDogJ2NvbnRhaW5zJyBpbiBodG1sID9cbiAgICBmdW5jdGlvbiAoZWxlbWVudCwgY29udGFpbmVyKSB7XG4gICAgICBjb250YWluZXIgPSBjb250YWluZXJbbm9kZVR5cGVdID09PSA5IHx8IGNvbnRhaW5lciA9PSB3aW5kb3cgPyBodG1sIDogY29udGFpbmVyXG4gICAgICByZXR1cm4gY29udGFpbmVyICE9PSBlbGVtZW50ICYmIGNvbnRhaW5lci5jb250YWlucyhlbGVtZW50KVxuICAgIH0gOlxuICAgIGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIpIHtcbiAgICAgIHdoaWxlIChlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlKSBpZiAoZWxlbWVudCA9PT0gY29udGFpbmVyKSByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgICB9XG4gICwgZ2V0QXR0ciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGRldGVjdCBidWdneSBJRSBzcmMvaHJlZiBnZXRBdHRyaWJ1dGUoKSBjYWxsXG4gICAgICB2YXIgZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdwJylcbiAgICAgIHJldHVybiAoKGUuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCIjeFwiPng8L2E+JykgJiYgZS5maXJzdENoaWxkLmdldEF0dHJpYnV0ZSgnaHJlZicpICE9ICcjeCcpID9cbiAgICAgICAgZnVuY3Rpb24gKGUsIGEpIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gJ2NsYXNzJyA/IGUuY2xhc3NOYW1lIDogKGEgPT09ICdocmVmJyB8fCBhID09PSAnc3JjJykgP1xuICAgICAgICAgICAgZS5nZXRBdHRyaWJ1dGUoYSwgMikgOiBlLmdldEF0dHJpYnV0ZShhKVxuICAgICAgICB9IDpcbiAgICAgICAgZnVuY3Rpb24gKGUsIGEpIHsgcmV0dXJuIGUuZ2V0QXR0cmlidXRlKGEpIH1cbiAgICB9KClcbiAgLCBoYXNCeUNsYXNzID0gISFkb2NbYnlDbGFzc11cbiAgICAvLyBoYXMgbmF0aXZlIHFTQSBzdXBwb3J0XG4gICwgaGFzUVNBID0gZG9jLnF1ZXJ5U2VsZWN0b3IgJiYgZG9jW3FTQV1cbiAgICAvLyB1c2UgbmF0aXZlIHFTQVxuICAsIHNlbGVjdFFTQSA9IGZ1bmN0aW9uIChzZWxlY3Rvciwgcm9vdCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdLCBzcywgZVxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJvb3Rbbm9kZVR5cGVdID09PSA5IHx8ICFzcGxpdHRhYmxlLnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgLy8gbW9zdCB3b3JrIGlzIGRvbmUgcmlnaHQgaGVyZSwgZGVmZXIgdG8gcVNBXG4gICAgICAgICAgcmV0dXJuIGFycmF5aWZ5KHJvb3RbcVNBXShzZWxlY3RvcikpXG4gICAgICAgIH1cbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHdoZXJlIHdlIG5lZWQgdGhlIHNlcnZpY2VzIG9mIGBjb2xsZWN0U2VsZWN0b3IoKWBcbiAgICAgICAgZWFjaChzcyA9IHNlbGVjdG9yLnNwbGl0KCcsJyksIGNvbGxlY3RTZWxlY3Rvcihyb290LCBmdW5jdGlvbiAoY3R4LCBzKSB7XG4gICAgICAgICAgZSA9IGN0eFtxU0FdKHMpXG4gICAgICAgICAgaWYgKGUubGVuZ3RoID09IDEpIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IGUuaXRlbSgwKVxuICAgICAgICAgIGVsc2UgaWYgKGUubGVuZ3RoKSByZXN1bHQgPSByZXN1bHQuY29uY2F0KGFycmF5aWZ5KGUpKVxuICAgICAgICB9KSlcbiAgICAgICAgcmV0dXJuIHNzLmxlbmd0aCA+IDEgJiYgcmVzdWx0Lmxlbmd0aCA+IDEgPyB1bmlxKHJlc3VsdCkgOiByZXN1bHRcbiAgICAgIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgIHJldHVybiBzZWxlY3ROb25OYXRpdmUoc2VsZWN0b3IsIHJvb3QpXG4gICAgfVxuICAgIC8vIG5vIG5hdGl2ZSBzZWxlY3RvciBzdXBwb3J0XG4gICwgc2VsZWN0Tm9uTmF0aXZlID0gZnVuY3Rpb24gKHNlbGVjdG9yLCByb290KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW10sIGl0ZW1zLCBtLCBpLCBsLCByLCBzc1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG5vcm1hbGl6ciwgJyQxJylcbiAgICAgIGlmIChtID0gc2VsZWN0b3IubWF0Y2godGFnQW5kT3JDbGFzcykpIHtcbiAgICAgICAgciA9IGNsYXNzUmVnZXgobVsyXSlcbiAgICAgICAgaXRlbXMgPSByb290W2J5VGFnXShtWzFdIHx8ICcqJylcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IGl0ZW1zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmIChyLnRlc3QoaXRlbXNbaV0uY2xhc3NOYW1lKSkgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gaXRlbXNbaV1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9XG4gICAgICAvLyBtb3JlIGNvbXBsZXggc2VsZWN0b3IsIGdldCBgX3F3ZXJ5KClgIHRvIGRvIHRoZSB3b3JrIGZvciB1c1xuICAgICAgZWFjaChzcyA9IHNlbGVjdG9yLnNwbGl0KCcsJyksIGNvbGxlY3RTZWxlY3Rvcihyb290LCBmdW5jdGlvbiAoY3R4LCBzLCByZXdyaXRlKSB7XG4gICAgICAgIHIgPSBfcXdlcnkocywgY3R4KVxuICAgICAgICBmb3IgKGkgPSAwLCBsID0gci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoY3R4W25vZGVUeXBlXSA9PT0gOSB8fCByZXdyaXRlIHx8IGlzQW5jZXN0b3IocltpXSwgcm9vdCkpIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IHJbaV1cbiAgICAgICAgfVxuICAgICAgfSkpXG4gICAgICByZXR1cm4gc3MubGVuZ3RoID4gMSAmJiByZXN1bHQubGVuZ3RoID4gMSA/IHVuaXEocmVzdWx0KSA6IHJlc3VsdFxuICAgIH1cbiAgLCBjb25maWd1cmUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgLy8gY29uZmlnTmF0aXZlUVNBOiB1c2UgZnVsbHktaW50ZXJuYWwgc2VsZWN0b3Igb3IgbmF0aXZlIHFTQSB3aGVyZSBwcmVzZW50XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnNbdXNlTmF0aXZlUVNBXSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgIHNlbGVjdCA9ICFvcHRpb25zW3VzZU5hdGl2ZVFTQV0gPyBzZWxlY3ROb25OYXRpdmUgOiBoYXNRU0EgPyBzZWxlY3RRU0EgOiBzZWxlY3ROb25OYXRpdmVcbiAgICB9XG5cbiAgY29uZmlndXJlKHsgdXNlTmF0aXZlUVNBOiB0cnVlIH0pXG5cbiAgcXdlcnkuY29uZmlndXJlID0gY29uZmlndXJlXG4gIHF3ZXJ5LnVuaXEgPSB1bmlxXG4gIHF3ZXJ5LmlzID0gaXNcbiAgcXdlcnkucHNldWRvcyA9IHt9XG5cbiAgcmV0dXJuIHF3ZXJ5XG59KTtcbiIsInZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwsIHNlbGVjdG9yKSB7XG4gIHZhciBub2RlID0gZWwucGFyZW50Tm9kZS5maXJzdENoaWxkXG4gIHZhciBzaWJsaW5ncyA9IFtdXG4gIFxuICBmb3IgKCA7IG5vZGU7IG5vZGUgPSBub2RlLm5leHRTaWJsaW5nICkge1xuICAgIGlmICggbm9kZS5ub2RlVHlwZSA9PT0gMSAmJiBub2RlICE9PSBlbCApIHtcbiAgICAgIGlmICghc2VsZWN0b3IpIHNpYmxpbmdzLnB1c2gobm9kZSlcbiAgICAgIGVsc2UgaWYgKG1hdGNoZXMobm9kZSwgc2VsZWN0b3IpKSBzaWJsaW5ncy5wdXNoKG5vZGUpXG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gc2libGluZ3Ncbn1cbiIsIlxudmFyIHNwYWNlID0gcmVxdWlyZSgndG8tc3BhY2UtY2FzZScpXG5cbi8qKlxuICogRXhwb3J0LlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9DYW1lbENhc2VcblxuLyoqXG4gKiBDb252ZXJ0IGEgYHN0cmluZ2AgdG8gY2FtZWwgY2FzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdG9DYW1lbENhc2Uoc3RyaW5nKSB7XG4gIHJldHVybiBzcGFjZShzdHJpbmcpLnJlcGxhY2UoL1xccyhcXHcpL2csIGZ1bmN0aW9uIChtYXRjaGVzLCBsZXR0ZXIpIHtcbiAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKClcbiAgfSlcbn1cbiIsIlxuLyoqXG4gKiBFeHBvcnQuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b05vQ2FzZVxuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBhIHN0cmluZyBpcyBjYW1lbC1jYXNlLlxuICovXG5cbnZhciBoYXNTcGFjZSA9IC9cXHMvXG52YXIgaGFzU2VwYXJhdG9yID0gLyhffC18XFwufDopL1xudmFyIGhhc0NhbWVsID0gLyhbYS16XVtBLVpdfFtBLVpdW2Etel0pL1xuXG4vKipcbiAqIFJlbW92ZSBhbnkgc3RhcnRpbmcgY2FzZSBmcm9tIGEgYHN0cmluZ2AsIGxpa2UgY2FtZWwgb3Igc25ha2UsIGJ1dCBrZWVwXG4gKiBzcGFjZXMgYW5kIHB1bmN0dWF0aW9uIHRoYXQgbWF5IGJlIGltcG9ydGFudCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHRvTm9DYXNlKHN0cmluZykge1xuICBpZiAoaGFzU3BhY2UudGVzdChzdHJpbmcpKSByZXR1cm4gc3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgaWYgKGhhc1NlcGFyYXRvci50ZXN0KHN0cmluZykpIHJldHVybiAodW5zZXBhcmF0ZShzdHJpbmcpIHx8IHN0cmluZykudG9Mb3dlckNhc2UoKVxuICBpZiAoaGFzQ2FtZWwudGVzdChzdHJpbmcpKSByZXR1cm4gdW5jYW1lbGl6ZShzdHJpbmcpLnRvTG93ZXJDYXNlKClcbiAgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpXG59XG5cbi8qKlxuICogU2VwYXJhdG9yIHNwbGl0dGVyLlxuICovXG5cbnZhciBzZXBhcmF0b3JTcGxpdHRlciA9IC9bXFxXX10rKC58JCkvZ1xuXG4vKipcbiAqIFVuLXNlcGFyYXRlIGEgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHVuc2VwYXJhdGUoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShzZXBhcmF0b3JTcGxpdHRlciwgZnVuY3Rpb24gKG0sIG5leHQpIHtcbiAgICByZXR1cm4gbmV4dCA/ICcgJyArIG5leHQgOiAnJ1xuICB9KVxufVxuXG4vKipcbiAqIENhbWVsY2FzZSBzcGxpdHRlci5cbiAqL1xuXG52YXIgY2FtZWxTcGxpdHRlciA9IC8oLikoW0EtWl0rKS9nXG5cbi8qKlxuICogVW4tY2FtZWxjYXNlIGEgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHVuY2FtZWxpemUoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShjYW1lbFNwbGl0dGVyLCBmdW5jdGlvbiAobSwgcHJldmlvdXMsIHVwcGVycykge1xuICAgIHJldHVybiBwcmV2aW91cyArICcgJyArIHVwcGVycy50b0xvd2VyQ2FzZSgpLnNwbGl0KCcnKS5qb2luKCcgJylcbiAgfSlcbn1cbiIsIlxudmFyIGNsZWFuID0gcmVxdWlyZSgndG8tbm8tY2FzZScpXG5cbi8qKlxuICogRXhwb3J0LlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9TcGFjZUNhc2VcblxuLyoqXG4gKiBDb252ZXJ0IGEgYHN0cmluZ2AgdG8gc3BhY2UgY2FzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdG9TcGFjZUNhc2Uoc3RyaW5nKSB7XG4gIHJldHVybiBjbGVhbihzdHJpbmcpLnJlcGxhY2UoL1tcXFdfXSsoLnwkKS9nLCBmdW5jdGlvbiAobWF0Y2hlcywgbWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2ggPyAnICcgKyBtYXRjaCA6ICcnXG4gIH0pLnRyaW0oKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGVuYWJsZU9uOiBmdW5jdGlvbiAoIGVsLCBvcHRzICkge1xuICAgIHZhciBUYXAgPSByZXF1aXJlKCAnLi90b3VjaHknICk7XG4gICAgdmFyIGlucyA9IG5ldyBUYXAoIGVsLCBvcHRzICk7XG4gICAgcmV0dXJuIGlucztcbiAgfVxufTtcbiIsInZhciBkZWJvdW5jZSA9IHJlcXVpcmUoICdkZWJvdW5jeScgKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCAnZXh0ZW5kJyApO1xudmFyIGV2ZW50SGVscGVyID0gcmVxdWlyZSggJ2RvbS1ldmVudC1zcGVjaWFsJyApO1xuXG5mdW5jdGlvbiBUb3VjaHkoIGVsLCBvcHRzICkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIG1lLl9vcHRzID0ge1xuICAgIG1pblN3aXBlRGVsdGFYOiAyNSxcbiAgICBtaW5Td2lwZURlbHRhWTogMjUsXG4gICAgdGFwOiB0cnVlLFxuICAgIHRhcGhvbGQ6IHRydWUsXG4gICAgc3dpcGU6IHRydWUsXG4gICAgbWluVGFwRGlzcGxhY2VtZW50VG9sZXJhbmNlOiAxMCxcbiAgICB0YXBIb2xkTWluVGhyZXNob2xkOiA1MDAsXG4gICAgc3dpcGVUaHJlc2hvbGQ6IDEwMDAsXG4gICAgbW91c2Vkb3duVGhyZXNob2xkOiA1MDAsXG4gICAgZGlzY2FyZFRhcGhvbGRJZk1vdmU6IHRydWVcbiAgfTtcblxuICBleHRlbmQoIG1lLl9vcHRzLCBvcHRzICk7XG5cbiAgdmFyIGVsZSA9IG1lLmVsID0gKHR5cGVvZiBlbCA9PT0gJ29iamVjdCcgJiYgZWwgIT09IG51bGwpID8gZWwgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggZWwgKTtcbiAgbWUubW92ZWQgPSBmYWxzZTtcbiAgbWUuc3RhcnRYID0gMDtcbiAgbWUuc3RhcnRZID0gMDtcblxuICBtZS5fbW91c2VFdmVudHNBbGxvd2VkID0gdHJ1ZTtcblxuICBtZS5zZXRNb3VzZUV2ZW50c0FsbG93ZWQgPSBkZWJvdW5jZSggZnVuY3Rpb24gKCkge1xuICAgIG1lLl9tb3VzZUV2ZW50c0FsbG93ZWQgPSB0cnVlO1xuICB9LCBtZS5fb3B0cy5tb3VzZWRvd25UaHJlc2hvbGQgKTtcblxuICBlbGUuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBtZSwgZmFsc2UgKTtcbiAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBtZSwgZmFsc2UgKTtcbn1cblxudmFyIHRhcFByb3RvID0gVG91Y2h5LnByb3RvdHlwZTtcblxudGFwUHJvdG8uYmxvY2tNb3VzZUV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgbWUuX21vdXNlRXZlbnRzQWxsb3dlZCA9IGZhbHNlO1xuICBtZS5zZXRNb3VzZUV2ZW50c0FsbG93ZWQoKTtcbn07XG5cbnRhcFByb3RvLl9nZXRDbGllbnRYID0gZnVuY3Rpb24gKCBlICkge1xuICBpZiAoIGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMCApIHtcbiAgICByZXR1cm4gZS50b3VjaGVzWyAwIF0uY2xpZW50WDtcbiAgfVxuICByZXR1cm4gZS5jbGllbnRYO1xufTtcblxudGFwUHJvdG8uX2dldENsaWVudFkgPSBmdW5jdGlvbiAoIGUgKSB7XG4gIGlmICggZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAwICkge1xuICAgIHJldHVybiBlLnRvdWNoZXNbIDAgXS5jbGllbnRZO1xuICB9XG4gIHJldHVybiBlLmNsaWVudFk7XG59O1xuXG50YXBQcm90by5fZ2V0UGFnZVggPSBmdW5jdGlvbiAoIGUgKSB7XG4gIGlmICggZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAwICkge1xuICAgIHJldHVybiBlLnRvdWNoZXNbIDAgXS5wYWdlWDtcbiAgfVxuICByZXR1cm4gZS5wYWdlWDtcbn07XG5cbnRhcFByb3RvLl9nZXRQYWdlWSA9IGZ1bmN0aW9uICggZSApIHtcbiAgaWYgKCBlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDAgKSB7XG4gICAgcmV0dXJuIGUudG91Y2hlc1sgMCBdLnBhZ2VZO1xuICB9XG4gIHJldHVybiBlLnBhZ2VZO1xufTtcblxuXG50YXBQcm90by5zdGFydCA9IGZ1bmN0aW9uICggZSApIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICB2YXIgZWxlID0gbWUuZWw7XG5cbiAgbWUuc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICBpZiAoIGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnICkge1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgbWUsIGZhbHNlICk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIG1lLCBmYWxzZSApO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hjYW5jZWwnLCBtZSwgZmFsc2UgKTtcbiAgICBtZS5jaGVja0ZvclRhcGhvbGQoIGUgKTtcbiAgICBtZS5ibG9ja01vdXNlRXZlbnRzKCk7XG4gIH1cblxuICBpZiAoIGUudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgbWUuX21vdXNlRXZlbnRzQWxsb3dlZCAmJiAoZS53aGljaCA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMCkgKSB7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtZSwgZmFsc2UgKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtZSwgZmFsc2UgKTtcbiAgICBtZS5jaGVja0ZvclRhcGhvbGQoIGUgKTtcbiAgfVxuXG4gIG1lLnN0YXJ0VGFyZ2V0ID0gZS50YXJnZXQ7XG5cbiAgbWUuaGFuZGxpbmdTdGFydCA9IHRydWU7XG5cbiAgbWUubW92ZWQgPSBmYWxzZTtcbiAgbWUuc3RhcnRYID0gbWUuX2dldENsaWVudFgoIGUgKTsgLy9lLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyA/IGUudG91Y2hlc1sgMCBdLmNsaWVudFggOiBlLmNsaWVudFg7XG4gIG1lLnN0YXJ0WSA9IG1lLl9nZXRDbGllbnRZKCBlICk7IC8vZS50eXBlID09PSAndG91Y2hzdGFydCcgPyBlLnRvdWNoZXNbIDAgXS5jbGllbnRZIDogZS5jbGllbnRZO1xuXG59O1xuXG50YXBQcm90by5jaGVja0ZvclRhcGhvbGQgPSBmdW5jdGlvbiAoIGUgKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgaWYgKCAhbWUuX29wdHMudGFwaG9sZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjbGVhclRpbWVvdXQoIG1lLnRhcEhvbGRJbnRlcnZhbCApO1xuXG4gIG1lLnRhcEhvbGRJbnRlcnZhbCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICggKG1lLm1vdmVkICYmIG1lLl9vcHRzLmRpc2NhcmRUYXBob2xkSWZNb3ZlKSB8fCAhbWUuaGFuZGxpbmdTdGFydCB8fCAhbWUuX29wdHMudGFwaG9sZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBldmVudEhlbHBlci5maXJlKCBtZS5zdGFydFRhcmdldCwgJ3RhcDpob2xkJywge1xuICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBkZXRhaWw6IHtcbiAgICAgICAgcGFnZVg6IG1lLl9nZXRQYWdlWCggZSApLFxuICAgICAgICBwYWdlWTogbWUuX2dldFBhZ2VZKCBlIClcbiAgICAgIH1cbiAgICB9ICk7XG4gIH0sIG1lLl9vcHRzLnRhcEhvbGRNaW5UaHJlc2hvbGQgKTtcbn07XG5cbnRhcFByb3RvLm1vdmUgPSBmdW5jdGlvbiAoIGUgKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgbWUuX21vdmVYID0gbWUuX2dldENsaWVudFgoIGUgKTtcbiAgbWUuX21vdmVZID0gbWUuX2dldENsaWVudFkoIGUgKTtcblxuICB2YXIgdG9sZXJhbmNlID0gbWUuX29wdHMubWluVGFwRGlzcGxhY2VtZW50VG9sZXJhbmNlO1xuICAvL2lmIGZpbmdlciBtb3ZlcyBtb3JlIHRoYW4gMTBweCBmbGFnIHRvIGNhbmNlbFxuICBpZiAoIE1hdGguYWJzKCBtZS5fbW92ZVggLSB0aGlzLnN0YXJ0WCApID4gdG9sZXJhbmNlIHx8IE1hdGguYWJzKCBtZS5fbW92ZVkgLSB0aGlzLnN0YXJ0WSApID4gdG9sZXJhbmNlICkge1xuICAgIHRoaXMubW92ZWQgPSB0cnVlO1xuICB9XG59O1xuXG50YXBQcm90by5lbmQgPSBmdW5jdGlvbiAoIGUgKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIHZhciBlbGUgPSBtZS5lbDtcblxuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1lLCBmYWxzZSApO1xuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG1lLCBmYWxzZSApO1xuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgbWUsIGZhbHNlICk7XG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hjYW5jZWwnLCBtZSwgZmFsc2UgKTtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbWUsIGZhbHNlICk7XG5cbiAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICB2YXIgZW5kVGltZSA9IERhdGUubm93KCk7XG4gIHZhciB0aW1lRGVsdGEgPSBlbmRUaW1lIC0gbWUuc3RhcnRUaW1lO1xuXG4gIG1lLmhhbmRsaW5nU3RhcnQgPSBmYWxzZTtcbiAgY2xlYXJUaW1lb3V0KCBtZS50YXBIb2xkSW50ZXJ2YWwgKTtcblxuICBpZiAoICFtZS5tb3ZlZCApIHtcblxuICAgIGlmICggdGFyZ2V0ICE9PSBtZS5zdGFydFRhcmdldCB8fCB0aW1lRGVsdGEgPiBtZS5fb3B0cy50YXBIb2xkTWluVGhyZXNob2xkICkge1xuICAgICAgbWUuc3RhcnRUYXJnZXQgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggbWUuX29wdHMudGFwICkge1xuICAgICAgZXZlbnRIZWxwZXIuZmlyZSggdGFyZ2V0LCAndGFwJywge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBwYWdlWDogbWUuX2dldFBhZ2VYKCBlICksXG4gICAgICAgICAgcGFnZVk6IG1lLl9nZXRQYWdlWSggZSApXG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoICFtZS5fb3B0cy5zd2lwZSB8fCB0aW1lRGVsdGEgPiBtZS5fb3B0cy5zd2lwZVRocmVzaG9sZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZGVsdGFYID0gbWUuX21vdmVYIC0gbWUuc3RhcnRYO1xuICB2YXIgZGVsdGFZID0gbWUuX21vdmVZIC0gbWUuc3RhcnRZO1xuXG4gIHZhciBhYnNEZWx0YVggPSBNYXRoLmFicyggZGVsdGFYICk7XG4gIHZhciBhYnNEZWx0YVkgPSBNYXRoLmFicyggZGVsdGFZICk7XG5cbiAgdmFyIHN3aXBlSW5YID0gYWJzRGVsdGFYID4gbWUuX29wdHMubWluU3dpcGVEZWx0YVg7XG4gIHZhciBzd2lwZUluWSA9IGFic0RlbHRhWSA+IG1lLl9vcHRzLm1pblN3aXBlRGVsdGFZO1xuXG4gIHZhciBzd2lwZUhhcHBlbiA9IHN3aXBlSW5YIHx8IHN3aXBlSW5ZO1xuXG4gIGlmICggIXN3aXBlSGFwcGVuICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkaXJlY3Rpb24gPSAnJztcblxuICBpZiAoIGFic0RlbHRhWCA+PSBhYnNEZWx0YVkgKSB7XG4gICAgZGlyZWN0aW9uICs9IChkZWx0YVggPiAwID8gJ3JpZ2h0JyA6ICdsZWZ0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZGlyZWN0aW9uICs9IChkZWx0YVkgPiAwID8gJ2Rvd24nIDogJ3VwJyk7XG4gIH1cblxuICBldmVudEhlbHBlci5maXJlKCB0YXJnZXQsICdzd2lwZScsIHtcbiAgICBidWJibGVzOiB0cnVlLFxuICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgZGV0YWlsOiB7XG4gICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgIGRlbHRhWDogZGVsdGFYLFxuICAgICAgZGVsdGFZOiBkZWx0YVlcbiAgICB9XG4gIH0gKTtcblxuICBldmVudEhlbHBlci5maXJlKCB0YXJnZXQsICdzd2lwZTonICsgZGlyZWN0aW9uLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGRldGFpbDoge1xuICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb24sXG4gICAgICBkZWx0YVg6IGRlbHRhWCxcbiAgICAgIGRlbHRhWTogZGVsdGFZXG4gICAgfVxuICB9ICk7XG59O1xuXG50YXBQcm90by5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIGNsZWFyVGltZW91dCggbWUudGFwSG9sZEludGVydmFsICk7XG5cbiAgbWUuaGFuZGxpbmdTdGFydCA9IGZhbHNlO1xuICBtZS5tb3ZlZCA9IGZhbHNlO1xuICBtZS5zdGFydFggPSAwO1xuICBtZS5zdGFydFkgPSAwO1xufTtcblxudGFwUHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgdmFyIGVsZSA9IG1lLmVsO1xuXG4gIG1lLmhhbmRsaW5nU3RhcnQgPSBmYWxzZTtcbiAgY2xlYXJUaW1lb3V0KCBtZS50YXBIb2xkSW50ZXJ2YWwgKTtcblxuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBtZSwgZmFsc2UgKTtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBtZSwgZmFsc2UgKTtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIG1lLCBmYWxzZSApO1xuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoY2FuY2VsJywgbWUsIGZhbHNlICk7XG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgbWUsIGZhbHNlICk7XG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1lLCBmYWxzZSApO1xuICBtZS5lbCA9IG51bGw7XG59O1xuXG50YXBQcm90by5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uICggZSApIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgc3dpdGNoIChlLnR5cGUpIHtcbiAgICBjYXNlICd0b3VjaHN0YXJ0JzogbWUuc3RhcnQoIGUgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21vdXNlbW92ZSc6IG1lLm1vdmUoIGUgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RvdWNobW92ZSc6IG1lLm1vdmUoIGUgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RvdWNoZW5kJzogbWUuZW5kKCBlICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0b3VjaGNhbmNlbCc6IG1lLmNhbmNlbCggZSApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW91c2Vkb3duJzogbWUuc3RhcnQoIGUgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21vdXNldXAnOiBtZS5lbmQoIGUgKTtcbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoeTtcbiIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbn07XG5cbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOnRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb3VyY2UsIHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgc291cmNlW3Byb3BlcnR5XSA9IHByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG59OyJdfQ==
