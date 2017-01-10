(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Drawchim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* jshint node: true */

var $$ = require('domquery');
var ExtendDefault = require('./src/extend_default');
var StringAsNode = require('./src/string-as-node');
var TemplateEngine = require('./src/template-engine');
var CanvasBoard = require('./src/canvas-board');
var ls = require('./src/local-storage');
var Touchy = require('touchy');
var Modalblanc = require('modalblanc');
Touchy.enableOn(document);

var drawChim = function(options) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    var defaults = {
        stains: ['255, 0, 0', '0, 255, 0', '0, 0, 255', '0, 0, 0'],
        canvas: ['canvas-1']
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

    this.appId = null;
    this.canvasItems = [];
    this.canvasObject = {};
    this.num = 0;
    this.settingsActionSet = false;

    this._init();
};

drawChim.prototype.buildCanvas = function(canvasName, stopBuild) {
    var num = ++this.num;
    this.num = num;
    var canvasID = canvasName ? canvasName : 'canvas-' + num;

    if (!stopBuild) {
        // create canvas element
        buildElement({
            elm: 'canvas',
            buttonId: canvasID,
            buttonText: null,
            parentId: this.appId
        });

        this.canvas = document.getElementById(canvasID);
        this.canvasItems.push(this.canvas);

        if (this.canvasItems.length > 1) {
            // if there previous is-active classes remove them
            var list = this.canvasItems,
                currentCanvas = this.canvas;
            for (var i = 0, len = list.length; i < len; i++) {
                // list[i].style.zIndex = '0'
                list[i].classList.remove('is-active')
                ls.setItem('canvasItem' + '-' + list[i].id, list[i].id, 28425600); // keep in localstorage for 1 year
            }
        }
        this.setCurrentCanvas();
        this.selectCanvas();
    } else {
        this.canvas = document.getElementById(canvasID); //this.canvasItems[0].id

        // console.log(findElementOnID(this.canvasItems, canvasID))
        this.selectCanvas();
    }


    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.bgColor = '#ffffff';
    this.isDown = false;
    this.blankCanvas = true;
    this.addColor = false;
    this.ctx = this.canvas.getContext('2d');
    this.canvasX;
    this.canvasY;

    this.createCanvas();
    this.createStain();
    this.storeCanvasAsImage();
    this.setEvents();
}

drawChim.prototype.selectCanvas = function() {
    var list = this.canvasItems,
        currentCanvas = this.canvas;
    for (var i = 0, len = list.length; i < len; i++) {
        list[i].style.zIndex = '1'
        list[i].classList.remove('is-active')
    }

    currentCanvas.style.zIndex = '2'
    currentCanvas.classList.add('is-active');
}

drawChim.prototype.resizeCanvas = function() {
    this.canvas.setAttribute('width', window.innerWidth);
    this.canvas.setAttribute('height', window.innerHeight);
    this.storeCanvasAsImage();
    this.createCanvas();
};

drawChim.prototype._init = function() {
    var DefaultCanvas =  ls.getItem('canvasItem-' + this.options.canvas[0]);
    var newKey, newCanvas;

    this.buildScene();

    if (DefaultCanvas) {
        for (var key in localStorage){
            if (key.match(/canvasItem-/)) {
                newKey = key.replace('canvasItem-', '')
                this.buildCanvas(newKey);
            }
        }
    } else {
        for (var index in this.options.canvas){
            newCanvas = this.options.canvas[index];
            this.buildCanvas(newCanvas);
        }
    }

    this.resizeCanvas();
    this.storeCanvasAsImage();
};

drawChim.prototype.createCanvas = function() {
    this.ctx.fillStyle = this.canvas.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = 'rgba('+ this.options.stains[0] +', 0.5)';
    // this.ctx.globalCompositeOperation = 'difference';
};

drawChim.prototype.setCurrentCanvas = function () {
    // select last item in array
    var lastItemArray = this.canvasItems.slice(-1)[0];
    // add class to last item
    lastItemArray.classList.add('is-active');
};

drawChim.prototype.buildScene = function() {
    var body = document.getElementsByTagName('body'),
        drawchimId;

    if (body[0].id) {
        drawchimId = body[0].id;
    } else {
        drawchimId = 'go-drawchim';
        body[0].id = drawchimId;
    }
    buildElement({
        elm: 'div',
        buttonId: 'app-canvas',
        buttonText: null,
        parentId: drawchimId
    });

    this.appId = 'app-canvas'

    // buildElement({
    //     elm: 'span',
    //     buttonId: 'clear',
    //     buttonText: null,
    //     parentId: this.appId
    // });

    buildElement({
        elm: 'div',
        buttonId: 'stain-pallet',
        buttonText: null,
        parentId: this.appId
    });

    buildElement({
        elm: 'span',
        buttonId: 'overview-canvases',
        buttonText: 'overview',
        parentId: this.appId
    });

    buildElement({
        elm: 'span',
        buttonId: 'app-settings',
        buttonText: 'Settings',
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
                '<li class="<%this.colors[index] === "'+ this.options.stains[0] +'" ? "is-active" : null %>" data-color="<%this.colors[index]%>" style="background:rgb(<%this.colors[index]%>)"></li>' +
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

    $$('#clear').on('touchstart', function() {
        _this.clearCanvas();
    });

    $$('#overview-canvases').on('touchstart', function(e) {
        e.preventDefault();
        _this.overview();
    });

    // this.options.clearBtn.addEventListener('touchstart', function() {
    //     _this.clearCanvas();
    // }, false);

    $$('.stains li').on('touchstart', function(e) {
        _this.swapColor(e);
    });

    $$('#app-settings').on('touchstart', function(e) {
        // debugger
        if (this.classList.value === 'is-active') {
            return
            e.preventDefault();
        } else {
            this.classList.add('is-active');
            _this.filters();
        }
        // if (!_this.settingsActionSet) {
        //     _this.filters();
        // } else {
        //     _this.settingsActionSet = false;
        // }
    });

    $$(window).on('resize', function(){
        _this.resizeCanvas();
    });

    // this.canvas.addEventListener('tap:hold', function (e) {
    //     _this.colorPickerCircle(e);
    // });

    $$('#pallets').on('swipe:down', function() {
        _this.closeOpenPallet(true);
    });

    $$('#header').on('swipe:up', function() {
        _this.closeOpenPallet(false);
    });

    $$('.add-stain').on('tap', function() {
        _this.addStain();
    });

    $$('.canvas-overview-item').on('touchstart', function(e) {
        var app = document.getElementById(_this.appId);
        var canvasID = e.currentTarget.dataset.canvasId;
        var overviewHolder = document.getElementsByClassName('canvas-overview-list');
        _this.buildCanvas(canvasID, true);

        // remove is-active class + canvas-overview-list
        app.classList.remove('is-active');
        app.removeChild(overviewHolder[0]);
    });
};

drawChim.prototype.overview = function() {
    var app = document.getElementById(this.appId);
    if (!app.classList.length) {
        app.classList.add('is-active');

        var canvasOverviewTmp =
            '<ul class="canvas-overview-list">' +
                '<%for(var index in this.items) {%>' +
                    '<li class="canvas-overview-item" data-canvas-id="<%this.items[index].id%>">' +
                        '<img src="<%this.imagesURL[index]%>" />' +
                    '</li>' +
                '<%}%>' +
            '</ul>';

        var getBase64 = [];

        for (var i = 0, len = this.canvasItems.length; i < len; i++) {
            var base64URL = ls.getItem('canvasImage' + '-' + this.canvasItems[i].id)
            getBase64.push(base64URL);
        }

        var canvasOverview = TemplateEngine(canvasOverviewTmp, {
            items: this.canvasItems,
            imagesURL: getBase64
        });

        StringAsNode(app, canvasOverview);
        this.setEvents();
    }
}

drawChim.prototype.filters = function() {
    return 'jhon'
        // var template =
        //     "<div>" +
        //         "<h1>Kies filter</h1>" +
        //     "</div>",
        //     filters = TemplateEngine(template, {
        //         colors: ''
        //     });
        //
        // var modal = new Modalblanc({
        //     content: filters
        // });
        // modal.open();
        // this.settingsActionSet = true;
}

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
    // debugger
    var img = this.canvas.toDataURL('image/png');
    history.pushState({imageData: img}, '', window.location.href);

    ls.setItem('canvasImage' + '-' + this.canvas.id, img);
};

drawChim.prototype.storeCanvasAsImage = function() {
    var _this = this;
    if (window.localStorage) {
        var img = new Image();

        img.onload = function() {
            _this.ctx.drawImage(img, 0, 0);
        };

        var imgSrc = ls.getItem('canvasImage' + '-' + this.canvas.id);
        img.src = imgSrc;
        this.blankCanvas = false;
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

    // return if there is no object
    if (parentElm === null) return;
    parentElm.appendChild(createElm);
}

function findElementOnID(list, itemID) {
    var currentItem;
    list.forEach(function (item) {
      if (item.id === 'canvas-1') {
          currentItem = item;
      }
    });

    return currentItem;
}

module.exports = drawChim;

},{"./src/canvas-board":70,"./src/extend_default":71,"./src/local-storage":72,"./src/string-as-node":73,"./src/template-engine":74,"domquery":34,"modalblanc":50,"touchy":64}],2:[function(require,module,exports){
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

  return String(text).replace(/\{?\{([^\{\}]+)\}\}?/g, replace(context));
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
/* jshint node: true */

var $$ = require('domquery');
var ExtendDefault = require('./extend_default');
var TemplateEngine = require('./template-engine');

var CanvasBoard = function(options) {
    var defaults = {
        selector: null
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }
}

CanvasBoard.prototype.createBoard = function(text) {
    console.log('Hi just created this ' + text + ' for you');
}

module.exports = new CanvasBoard();

},{"./extend_default":71,"./template-engine":74,"domquery":34}],71:[function(require,module,exports){
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
},{}],72:[function(require,module,exports){
'use strict';
/* jshint node: true */

var LocalStorage = {
    getItem: function(key, optionalCallback) {
        if (!this.supportsLocalStorage()) {
            return null;
        }

        var callback = function(data) {
            data = typeof data !== 'undefined' ? data : null;

            return typeof optionalCallback == 'function' ? optionalCallback(data) : data;
        };

        var value = localStorage.getItem(key);

        if (value !== null) {
            value = JSON.parse(value);

            if (value.hasOwnProperty('__expiry')) {
                var expiry = value.__expiry;
                var now = Date.now();

                if (now >= expiry) {
                    this.removeItem(key);

                    return callback();
                } else {
                    // Return the data object only.
                    return callback(value.__data);
                }
            } else {
                // Value doesn't have expiry data, just send it wholesale.
                return callback(value);
            }
        } else {
            return callback();
        }
    },

    setItem: function (key, value, expiry) {
        if (!this.supportsLocalStorage() || typeof value === 'undefined' || key === null || value === null) {
            return false;
        }

        if (typeof expiry === 'number') {
            value = {
            __data: value,
            __expiry: Date.now() + (parseInt(expiry) * 1000)
            };
        }

        try {
            localStorage.setItem(key, JSON.stringify(value));

            return true;
        } catch (e) {
            console.log('Unable to store ' + key + ' in localStorage due to ' + e.name);

            return false;
        }
    },

    removeItem: function (key) {
        if (this.supportsLocalStorage()) {
            localStorage.removeItem(key);
        }
    },

    clear: function () {
        if (this.supportsLocalStorage()) {
            localStorage.clear();
        }
    },

    supportsLocalStorage: function () {
        try {
            localStorage.setItem('_', '_');
            localStorage.removeItem('_');

            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = LocalStorage;

},{}],73:[function(require,module,exports){
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

},{}],74:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AYmVuZHJ1Y2tlci9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AYmVuZHJ1Y2tlci9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbml0Lmpzb24iLCJub2RlX21vZHVsZXMvQGJlbmRydWNrZXIvc3ludGhldGljLWRvbS1ldmVudHMvdHlwZXMuanNvbiIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtY2xvc2VzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtZGVsZWdhdGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1tYXRjaGVzLXNlbGVjdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1xdWVyeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWJvdW5jeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kaXNjb3JlLWNsb3Nlc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGlzcGF0Y2gtZXZlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWNsYXNzZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvbGliL2Rpc3BhdGNoLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2RvbS1ldmVudC1zcGVjaWFsL2xpYi9kb20tZXZlbnQuanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvbGliL2V2ZW50LWNhY2hlLmpzIiwibm9kZV9tb2R1bGVzL2RvbS1ldmVudC1zcGVjaWFsL2xpYi9nZXQtY2FsbGJhY2staWQuanMiLCJub2RlX21vZHVsZXMvZG9tLWV2ZW50LXNwZWNpYWwvbGliL2lkLWdlbi5qcyIsIm5vZGVfbW9kdWxlcy9kb20tZXZlbnQtc3BlY2lhbC9saWIvd3JhcC1jYWxsYmFjay5qcyIsIm5vZGVfbW9kdWxlcy9kb20tZXZlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXNlbGVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kb20tc3R5bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbmV3LWVsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbm9kZV9tb2R1bGVzL2RvbS1zZWxlY3QvZmFsbGJhY2suanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbm9kZV9tb2R1bGVzL2RvbS1zZWxlY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLXRyZWUvbm9kZV9tb2R1bGVzL25ldy1lbGVtZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RvbS10cmVlL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9kb20tdmFsdWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9taWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RvbXF1ZXJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RvbXF1ZXJ5L2xpYi9hdHRyLmpzIiwibm9kZV9tb2R1bGVzL2RvbXF1ZXJ5L2xpYi9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvZG9tcXVlcnkvbGliL2h0bWwuanMiLCJub2RlX21vZHVsZXMvZG9tcXVlcnkvbGliL3NlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9kb21xdWVyeS9saWIvdGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9kb21xdWVyeS9saWIvdmFsdWUuanMiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvcm1hdC10ZXh0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL2luZGV4b2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2V5LWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleW5hbWUtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2V5bmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hlcy1zZWxlY3Rvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tb2RhbGJsYW5jL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21vZGFsYmxhbmMvbGliL2V4dGVuZF9kZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL21vZGFsYmxhbmMvbGliL2ltYWdlX3NsaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9tb2RhbGJsYW5jL2xpYi9zdHJpbmdfYXNfbm9kZS5qcyIsIm5vZGVfbW9kdWxlcy9tb2RhbGJsYW5jL2xpYi90ZW1wbGF0ZS1lbmdpbmUuanMiLCJub2RlX21vZHVsZXMvbmV3LWNoYWluL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9xd2VyeS9xd2VyeS5qcyIsIm5vZGVfbW9kdWxlcy9zaWJsaW5ncy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90by1jYW1lbC1jYXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvLW5vLWNhc2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG8tc3BhY2UtY2FzZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG91Y2h5L3RvdWNoeS5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJzcmMvY2FudmFzLWJvYXJkLmpzIiwic3JjL2V4dGVuZF9kZWZhdWx0LmpzIiwic3JjL2xvY2FsLXN0b3JhZ2UuanMiLCJzcmMvc3RyaW5nLWFzLW5vZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdldBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG52YXIgJCQgPSByZXF1aXJlKCdkb21xdWVyeScpO1xudmFyIEV4dGVuZERlZmF1bHQgPSByZXF1aXJlKCcuL3NyYy9leHRlbmRfZGVmYXVsdCcpO1xudmFyIFN0cmluZ0FzTm9kZSA9IHJlcXVpcmUoJy4vc3JjL3N0cmluZy1hcy1ub2RlJyk7XG52YXIgVGVtcGxhdGVFbmdpbmUgPSByZXF1aXJlKCcuL3NyYy90ZW1wbGF0ZS1lbmdpbmUnKTtcbnZhciBDYW52YXNCb2FyZCA9IHJlcXVpcmUoJy4vc3JjL2NhbnZhcy1ib2FyZCcpO1xudmFyIGxzID0gcmVxdWlyZSgnLi9zcmMvbG9jYWwtc3RvcmFnZScpO1xudmFyIFRvdWNoeSA9IHJlcXVpcmUoJ3RvdWNoeScpO1xudmFyIE1vZGFsYmxhbmMgPSByZXF1aXJlKCdtb2RhbGJsYW5jJyk7XG5Ub3VjaHkuZW5hYmxlT24oZG9jdW1lbnQpO1xuXG52YXIgZHJhd0NoaW0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRyYXdDaGltKSkge1xuICAgICAgcmV0dXJuIG5ldyBkcmF3Q2hpbSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgc3RhaW5zOiBbJzI1NSwgMCwgMCcsICcwLCAyNTUsIDAnLCAnMCwgMCwgMjU1JywgJzAsIDAsIDAnXSxcbiAgICAgICAgY2FudmFzOiBbJ2NhbnZhcy0xJ11cbiAgICB9O1xuXG4gICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBFeHRlbmREZWZhdWx0KGRlZmF1bHRzLCBhcmd1bWVudHNbMF0pO1xuICAgIH1cblxuICAgIHRoaXMuYXBwSWQgPSBudWxsO1xuICAgIHRoaXMuY2FudmFzSXRlbXMgPSBbXTtcbiAgICB0aGlzLmNhbnZhc09iamVjdCA9IHt9O1xuICAgIHRoaXMubnVtID0gMDtcbiAgICB0aGlzLnNldHRpbmdzQWN0aW9uU2V0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl9pbml0KCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuYnVpbGRDYW52YXMgPSBmdW5jdGlvbihjYW52YXNOYW1lLCBzdG9wQnVpbGQpIHtcbiAgICB2YXIgbnVtID0gKyt0aGlzLm51bTtcbiAgICB0aGlzLm51bSA9IG51bTtcbiAgICB2YXIgY2FudmFzSUQgPSBjYW52YXNOYW1lID8gY2FudmFzTmFtZSA6ICdjYW52YXMtJyArIG51bTtcblxuICAgIGlmICghc3RvcEJ1aWxkKSB7XG4gICAgICAgIC8vIGNyZWF0ZSBjYW52YXMgZWxlbWVudFxuICAgICAgICBidWlsZEVsZW1lbnQoe1xuICAgICAgICAgICAgZWxtOiAnY2FudmFzJyxcbiAgICAgICAgICAgIGJ1dHRvbklkOiBjYW52YXNJRCxcbiAgICAgICAgICAgIGJ1dHRvblRleHQ6IG51bGwsXG4gICAgICAgICAgICBwYXJlbnRJZDogdGhpcy5hcHBJZFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhbnZhc0lEKTtcbiAgICAgICAgdGhpcy5jYW52YXNJdGVtcy5wdXNoKHRoaXMuY2FudmFzKTtcblxuICAgICAgICBpZiAodGhpcy5jYW52YXNJdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBwcmV2aW91cyBpcy1hY3RpdmUgY2xhc3NlcyByZW1vdmUgdGhlbVxuICAgICAgICAgICAgdmFyIGxpc3QgPSB0aGlzLmNhbnZhc0l0ZW1zLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRDYW52YXMgPSB0aGlzLmNhbnZhcztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gbGlzdFtpXS5zdHlsZS56SW5kZXggPSAnMCdcbiAgICAgICAgICAgICAgICBsaXN0W2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgbHMuc2V0SXRlbSgnY2FudmFzSXRlbScgKyAnLScgKyBsaXN0W2ldLmlkLCBsaXN0W2ldLmlkLCAyODQyNTYwMCk7IC8vIGtlZXAgaW4gbG9jYWxzdG9yYWdlIGZvciAxIHllYXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEN1cnJlbnRDYW52YXMoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RDYW52YXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhbnZhc0lEKTsgLy90aGlzLmNhbnZhc0l0ZW1zWzBdLmlkXG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coZmluZEVsZW1lbnRPbklEKHRoaXMuY2FudmFzSXRlbXMsIGNhbnZhc0lEKSlcbiAgICAgICAgdGhpcy5zZWxlY3RDYW52YXMoKTtcbiAgICB9XG5cblxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMuY2FudmFzLmJnQ29sb3IgPSAnI2ZmZmZmZic7XG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJsYW5rQ2FudmFzID0gdHJ1ZTtcbiAgICB0aGlzLmFkZENvbG9yID0gZmFsc2U7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuY2FudmFzWDtcbiAgICB0aGlzLmNhbnZhc1k7XG5cbiAgICB0aGlzLmNyZWF0ZUNhbnZhcygpO1xuICAgIHRoaXMuY3JlYXRlU3RhaW4oKTtcbiAgICB0aGlzLnN0b3JlQ2FudmFzQXNJbWFnZSgpO1xuICAgIHRoaXMuc2V0RXZlbnRzKCk7XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zZWxlY3RDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGlzdCA9IHRoaXMuY2FudmFzSXRlbXMsXG4gICAgICAgIGN1cnJlbnRDYW52YXMgPSB0aGlzLmNhbnZhcztcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBsaXN0W2ldLnN0eWxlLnpJbmRleCA9ICcxJ1xuICAgICAgICBsaXN0W2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpXG4gICAgfVxuXG4gICAgY3VycmVudENhbnZhcy5zdHlsZS56SW5kZXggPSAnMidcbiAgICBjdXJyZW50Q2FudmFzLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xufVxuXG5kcmF3Q2hpbS5wcm90b3R5cGUucmVzaXplQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICB0aGlzLmNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgdGhpcy5zdG9yZUNhbnZhc0FzSW1hZ2UoKTtcbiAgICB0aGlzLmNyZWF0ZUNhbnZhcygpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIERlZmF1bHRDYW52YXMgPSAgbHMuZ2V0SXRlbSgnY2FudmFzSXRlbS0nICsgdGhpcy5vcHRpb25zLmNhbnZhc1swXSk7XG4gICAgdmFyIG5ld0tleSwgbmV3Q2FudmFzO1xuXG4gICAgdGhpcy5idWlsZFNjZW5lKCk7XG5cbiAgICBpZiAoRGVmYXVsdENhbnZhcykge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbG9jYWxTdG9yYWdlKXtcbiAgICAgICAgICAgIGlmIChrZXkubWF0Y2goL2NhbnZhc0l0ZW0tLykpIHtcbiAgICAgICAgICAgICAgICBuZXdLZXkgPSBrZXkucmVwbGFjZSgnY2FudmFzSXRlbS0nLCAnJylcbiAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkQ2FudmFzKG5ld0tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpbmRleCBpbiB0aGlzLm9wdGlvbnMuY2FudmFzKXtcbiAgICAgICAgICAgIG5ld0NhbnZhcyA9IHRoaXMub3B0aW9ucy5jYW52YXNbaW5kZXhdO1xuICAgICAgICAgICAgdGhpcy5idWlsZENhbnZhcyhuZXdDYW52YXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZXNpemVDYW52YXMoKTtcbiAgICB0aGlzLnN0b3JlQ2FudmFzQXNJbWFnZSgpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmNyZWF0ZUNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY2FudmFzLmJnQ29sb3I7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gNjtcbiAgICB0aGlzLmN0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICB0aGlzLmN0eC5saW5lSm9pbiA9ICdyb3VuZCc7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgnKyB0aGlzLm9wdGlvbnMuc3RhaW5zWzBdICsnLCAwLjUpJztcbiAgICAvLyB0aGlzLmN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGlmZmVyZW5jZSc7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuc2V0Q3VycmVudENhbnZhcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBzZWxlY3QgbGFzdCBpdGVtIGluIGFycmF5XG4gICAgdmFyIGxhc3RJdGVtQXJyYXkgPSB0aGlzLmNhbnZhc0l0ZW1zLnNsaWNlKC0xKVswXTtcbiAgICAvLyBhZGQgY2xhc3MgdG8gbGFzdCBpdGVtXG4gICAgbGFzdEl0ZW1BcnJheS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5idWlsZFNjZW5lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICBkcmF3Y2hpbUlkO1xuXG4gICAgaWYgKGJvZHlbMF0uaWQpIHtcbiAgICAgICAgZHJhd2NoaW1JZCA9IGJvZHlbMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd2NoaW1JZCA9ICdnby1kcmF3Y2hpbSc7XG4gICAgICAgIGJvZHlbMF0uaWQgPSBkcmF3Y2hpbUlkO1xuICAgIH1cbiAgICBidWlsZEVsZW1lbnQoe1xuICAgICAgICBlbG06ICdkaXYnLFxuICAgICAgICBidXR0b25JZDogJ2FwcC1jYW52YXMnLFxuICAgICAgICBidXR0b25UZXh0OiBudWxsLFxuICAgICAgICBwYXJlbnRJZDogZHJhd2NoaW1JZFxuICAgIH0pO1xuXG4gICAgdGhpcy5hcHBJZCA9ICdhcHAtY2FudmFzJ1xuXG4gICAgLy8gYnVpbGRFbGVtZW50KHtcbiAgICAvLyAgICAgZWxtOiAnc3BhbicsXG4gICAgLy8gICAgIGJ1dHRvbklkOiAnY2xlYXInLFxuICAgIC8vICAgICBidXR0b25UZXh0OiBudWxsLFxuICAgIC8vICAgICBwYXJlbnRJZDogdGhpcy5hcHBJZFxuICAgIC8vIH0pO1xuXG4gICAgYnVpbGRFbGVtZW50KHtcbiAgICAgICAgZWxtOiAnZGl2JyxcbiAgICAgICAgYnV0dG9uSWQ6ICdzdGFpbi1wYWxsZXQnLFxuICAgICAgICBidXR0b25UZXh0OiBudWxsLFxuICAgICAgICBwYXJlbnRJZDogdGhpcy5hcHBJZFxuICAgIH0pO1xuXG4gICAgYnVpbGRFbGVtZW50KHtcbiAgICAgICAgZWxtOiAnc3BhbicsXG4gICAgICAgIGJ1dHRvbklkOiAnb3ZlcnZpZXctY2FudmFzZXMnLFxuICAgICAgICBidXR0b25UZXh0OiAnb3ZlcnZpZXcnLFxuICAgICAgICBwYXJlbnRJZDogdGhpcy5hcHBJZFxuICAgIH0pO1xuXG4gICAgYnVpbGRFbGVtZW50KHtcbiAgICAgICAgZWxtOiAnc3BhbicsXG4gICAgICAgIGJ1dHRvbklkOiAnYXBwLXNldHRpbmdzJyxcbiAgICAgICAgYnV0dG9uVGV4dDogJ1NldHRpbmdzJyxcbiAgICAgICAgcGFyZW50SWQ6IHRoaXMuYXBwSWRcbiAgICB9KTtcbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLmFkZFN0YWluID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID1cbiAgICAgICAgXCI8ZGl2PlwiICtcbiAgICAgICAgICAgIFwiPGgxPktpZXMgZWVuIGtsZXVyPC9oMT5cIiArXG4gICAgICAgICAgICBcIjxpbnB1dCB0eXBlPSdjb2xvcicgdmFsdWU9JyNmZjQ0OTknLz5cIiArXG4gICAgICAgIFwiPC9kaXY+XCIsXG4gICAgICAgIHN0YWlucyA9IFRlbXBsYXRlRW5naW5lKHRlbXBsYXRlLCB7XG4gICAgICAgICAgICBjb2xvcnM6ICcnXG4gICAgICAgIH0pO1xuXG4gICAgdmFyIG1vZGFsID0gbmV3IE1vZGFsYmxhbmMoe1xuICAgICAgICBjb250ZW50OiBzdGFpbnMsXG4gICAgICAgIGFuaW1hdGlvbjogJ3NsaWRlLWluLXJpZ2h0J1xuICAgIH0pO1xuICAgIG1vZGFsLm9wZW4oKTtcbiAgICAvLyB2YXIgY29sb3VyID0gXCIyNTUsMTA1LDE4MFwiLFxuICAgIC8vICAgICBuZXdTdGFpbiA9IHRoaXMub3B0aW9ucy5zdGFpbnM7XG4gICAgLy9cbiAgICAvLyAvLyBwdXNoIG5ldyBzdGFpbnMgKyBzZXQgYWRkQ29sb3JcbiAgICAvLyBuZXdTdGFpbi5wdXNoKGNvbG91cik7XG4gICAgLy8gdGhpcy5hZGRDb2xvciA9IHRydWU7XG4gICAgLy9cbiAgICAvLyAvLyBjcmVhdGUgc3RhaW5zXG4gICAgLy8gdGhpcy5jcmVhdGVTdGFpbigpO1xuICAgIC8vIC8vIHNldCBldmVudFxuICAgIC8vIHRoaXMuc2V0RXZlbnRzKCk7XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5jcmVhdGVTdGFpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFpbkhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFpbi1wYWxsZXQnKTtcblxuICAgIC8vIElmIGFkZCBjb2xvciwgZmlydCBjbGVhciBzdGFpbkhvbGRlclxuICAgIGlmICh0aGlzLmFkZENvbG9yKSB7XG4gICAgICAgIHN0YWluSG9sZGVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgfVxuICAgIHZhciB0ZW1wbGF0ZSA9XG4gICAgICAgICc8dWwgY2xhc3M9XCJzdGFpbnNcIj4nICtcbiAgICAgICAgICAgICc8JWZvcih2YXIgaW5kZXggaW4gdGhpcy5jb2xvcnMpIHslPicgK1xuICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCI8JXRoaXMuY29sb3JzW2luZGV4XSA9PT0gXCInKyB0aGlzLm9wdGlvbnMuc3RhaW5zWzBdICsnXCIgPyBcImlzLWFjdGl2ZVwiIDogbnVsbCAlPlwiIGRhdGEtY29sb3I9XCI8JXRoaXMuY29sb3JzW2luZGV4XSU+XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOnJnYig8JXRoaXMuY29sb3JzW2luZGV4XSU+KVwiPjwvbGk+JyArXG4gICAgICAgICAgICAnPCV9JT4nICtcbiAgICAgICAgICAgICc8bGkgY2xhc3M9XCJhZGQtc3RhaW5cIj4rPC9saT4nICtcbiAgICAgICAgJzwvdWw+JyxcbiAgICAgICAgc3RhaW5zID0gVGVtcGxhdGVFbmdpbmUodGVtcGxhdGUsIHtcbiAgICAgICAgICAgIGNvbG9yczogdGhpcy5vcHRpb25zLnN0YWluc1xuICAgICAgICB9KTtcblxuICAgIHN0YWluSG9sZGVyLmlubmVySFRNTCA9IHN0YWlucztcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zZXRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5kcmF3U3RhcnQoZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBfdGhpcy5kcmF3TW92ZShlKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZHJhd0VuZCgpO1xuICAgIH0sIGZhbHNlKTtcblxuICAgICQkKCcjY2xlYXInKS5vbigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIH0pO1xuXG4gICAgJCQoJyNvdmVydmlldy1jYW52YXNlcycpLm9uKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF90aGlzLm92ZXJ2aWV3KCk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzLm9wdGlvbnMuY2xlYXJCdG4uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICBfdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIC8vIH0sIGZhbHNlKTtcblxuICAgICQkKCcuc3RhaW5zIGxpJykub24oJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLnN3YXBDb2xvcihlKTtcbiAgICB9KTtcblxuICAgICQkKCcjYXBwLXNldHRpbmdzJykub24oJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIGRlYnVnZ2VyXG4gICAgICAgIGlmICh0aGlzLmNsYXNzTGlzdC52YWx1ZSA9PT0gJ2lzLWFjdGl2ZScpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIF90aGlzLmZpbHRlcnMoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiAoIV90aGlzLnNldHRpbmdzQWN0aW9uU2V0KSB7XG4gICAgICAgIC8vICAgICBfdGhpcy5maWx0ZXJzKCk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICBfdGhpcy5zZXR0aW5nc0FjdGlvblNldCA9IGZhbHNlO1xuICAgICAgICAvLyB9XG4gICAgfSk7XG5cbiAgICAkJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbigpe1xuICAgICAgICBfdGhpcy5yZXNpemVDYW52YXMoKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RhcDpob2xkJywgZnVuY3Rpb24gKGUpIHtcbiAgICAvLyAgICAgX3RoaXMuY29sb3JQaWNrZXJDaXJjbGUoZSk7XG4gICAgLy8gfSk7XG5cbiAgICAkJCgnI3BhbGxldHMnKS5vbignc3dpcGU6ZG93bicsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jbG9zZU9wZW5QYWxsZXQodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICAkJCgnI2hlYWRlcicpLm9uKCdzd2lwZTp1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jbG9zZU9wZW5QYWxsZXQoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgJCQoJy5hZGQtc3RhaW4nKS5vbigndGFwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmFkZFN0YWluKCk7XG4gICAgfSk7XG5cbiAgICAkJCgnLmNhbnZhcy1vdmVydmlldy1pdGVtJykub24oJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBhcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChfdGhpcy5hcHBJZCk7XG4gICAgICAgIHZhciBjYW52YXNJRCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmNhbnZhc0lkO1xuICAgICAgICB2YXIgb3ZlcnZpZXdIb2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjYW52YXMtb3ZlcnZpZXctbGlzdCcpO1xuICAgICAgICBfdGhpcy5idWlsZENhbnZhcyhjYW52YXNJRCwgdHJ1ZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGlzLWFjdGl2ZSBjbGFzcyArIGNhbnZhcy1vdmVydmlldy1saXN0XG4gICAgICAgIGFwcC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgYXBwLnJlbW92ZUNoaWxkKG92ZXJ2aWV3SG9sZGVyWzBdKTtcbiAgICB9KTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5vdmVydmlldyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmFwcElkKTtcbiAgICBpZiAoIWFwcC5jbGFzc0xpc3QubGVuZ3RoKSB7XG4gICAgICAgIGFwcC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcblxuICAgICAgICB2YXIgY2FudmFzT3ZlcnZpZXdUbXAgPVxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImNhbnZhcy1vdmVydmlldy1saXN0XCI+JyArXG4gICAgICAgICAgICAgICAgJzwlZm9yKHZhciBpbmRleCBpbiB0aGlzLml0ZW1zKSB7JT4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cImNhbnZhcy1vdmVydmlldy1pdGVtXCIgZGF0YS1jYW52YXMtaWQ9XCI8JXRoaXMuaXRlbXNbaW5kZXhdLmlkJT5cIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8aW1nIHNyYz1cIjwldGhpcy5pbWFnZXNVUkxbaW5kZXhdJT5cIiAvPicgK1xuICAgICAgICAgICAgICAgICAgICAnPC9saT4nICtcbiAgICAgICAgICAgICAgICAnPCV9JT4nICtcbiAgICAgICAgICAgICc8L3VsPic7XG5cbiAgICAgICAgdmFyIGdldEJhc2U2NCA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmNhbnZhc0l0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYmFzZTY0VVJMID0gbHMuZ2V0SXRlbSgnY2FudmFzSW1hZ2UnICsgJy0nICsgdGhpcy5jYW52YXNJdGVtc1tpXS5pZClcbiAgICAgICAgICAgIGdldEJhc2U2NC5wdXNoKGJhc2U2NFVSTCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FudmFzT3ZlcnZpZXcgPSBUZW1wbGF0ZUVuZ2luZShjYW52YXNPdmVydmlld1RtcCwge1xuICAgICAgICAgICAgaXRlbXM6IHRoaXMuY2FudmFzSXRlbXMsXG4gICAgICAgICAgICBpbWFnZXNVUkw6IGdldEJhc2U2NFxuICAgICAgICB9KTtcblxuICAgICAgICBTdHJpbmdBc05vZGUoYXBwLCBjYW52YXNPdmVydmlldyk7XG4gICAgICAgIHRoaXMuc2V0RXZlbnRzKCk7XG4gICAgfVxufVxuXG5kcmF3Q2hpbS5wcm90b3R5cGUuZmlsdGVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnamhvbidcbiAgICAgICAgLy8gdmFyIHRlbXBsYXRlID1cbiAgICAgICAgLy8gICAgIFwiPGRpdj5cIiArXG4gICAgICAgIC8vICAgICAgICAgXCI8aDE+S2llcyBmaWx0ZXI8L2gxPlwiICtcbiAgICAgICAgLy8gICAgIFwiPC9kaXY+XCIsXG4gICAgICAgIC8vICAgICBmaWx0ZXJzID0gVGVtcGxhdGVFbmdpbmUodGVtcGxhdGUsIHtcbiAgICAgICAgLy8gICAgICAgICBjb2xvcnM6ICcnXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gdmFyIG1vZGFsID0gbmV3IE1vZGFsYmxhbmMoe1xuICAgICAgICAvLyAgICAgY29udGVudDogZmlsdGVyc1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbW9kYWwub3BlbigpO1xuICAgICAgICAvLyB0aGlzLnNldHRpbmdzQWN0aW9uU2V0ID0gdHJ1ZTtcbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLmNsb3NlT3BlblBhbGxldCA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlID09PSB0cnVlKSB7XG4gICAgICAgICQkKCcjaGVhZGVyJykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQkKCcjaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgIH1cbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLnN3YXBDb2xvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGVsbSA9IGV2ZW50LnNyY0VsZW1lbnQsXG4gICAgICAgIG5ld0NvbG9yID0gZWxtLmRhdGFzZXQuY29sb3I7XG5cbiAgICAkJCgnLnN0YWlucyBsaScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAkJChlbG0pLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKCcgKyBuZXdDb2xvciArICcsICcgKyAgMC41ICsgJyknO1xuICAgIC8vIHRoaXMuY2xvc2VPcGVuUGFsbGV0KGZhbHNlKTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5jb2xvclBpY2tlckNpcmNsZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdG91Y2hPYmogPSBlLmRldGFpbDtcbiAgICB2YXIgc3RhaW5DaXJjbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhaW4tY2lyY2xlJyk7XG5cbiAgICB0aGlzLmNhbnZhc1ggPSB0b3VjaE9iai5wYWdlWCAtIDEwMDtcbiAgICB0aGlzLmNhbnZhc1kgPSB0b3VjaE9iai5wYWdlWSAtIDEwMDtcblxuICAgIHN0YWluQ2lyY2xlLnN0eWxlLnRvcCA9IHRoaXMuY2FudmFzWSArICdweCc7XG4gICAgc3RhaW5DaXJjbGUuc3R5bGUubGVmdCA9IHRoaXMuY2FudmFzWCArICdweCc7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkJChzdGFpbkNpcmNsZSkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgIH0sIDMwMClcblxuICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICQkKHN0YWluQ2lyY2xlKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJylcbiAgICAvLyB9LCAxMDAwKVxufVxuXG5kcmF3Q2hpbS5wcm90b3R5cGUuZHJhd1N0YXJ0ID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciB0b3VjaE9iaiA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICBpZiAodGhpcy5ibGFua0NhbnZhcykge1xuICAgICAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xuICAgIH1cblxuICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcblxuICAgIHRoaXMuY2FudmFzWCA9IHRvdWNoT2JqLnBhZ2VYIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICB0aGlzLmNhbnZhc1kgPSB0b3VjaE9iai5wYWdlWSAtIHRoaXMuY2FudmFzLm9mZnNldFRvcDtcblxuICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNhbnZhc1gsIHRoaXMuY2FudmFzWSk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuZHJhd01vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRvdWNoT2JqID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgIGlmICh0aGlzLmlzRG93biAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5jYW52YXNYID0gdG91Y2hPYmoucGFnZVggLSB0aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgICAgICB0aGlzLmNhbnZhc1kgPSB0b3VjaE9iai5wYWdlWSAtIHRoaXMuY2FudmFzLm9mZnNldFRvcDtcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY2FudmFzWCwgdGhpcy5jYW52YXNZKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfVxufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmRyYXdFbmQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuc3RvcmVIaXN0b3J5KCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuc3RvcmVIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZGVidWdnZXJcbiAgICB2YXIgaW1nID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7aW1hZ2VEYXRhOiBpbWd9LCAnJywgd2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgbHMuc2V0SXRlbSgnY2FudmFzSW1hZ2UnICsgJy0nICsgdGhpcy5jYW52YXMuaWQsIGltZyk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuc3RvcmVDYW52YXNBc0ltYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkge1xuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpbWdTcmMgPSBscy5nZXRJdGVtKCdjYW52YXNJbWFnZScgKyAnLScgKyB0aGlzLmNhbnZhcy5pZCk7XG4gICAgICAgIGltZy5zcmMgPSBpbWdTcmM7XG4gICAgICAgIHRoaXMuYmxhbmtDYW52YXMgPSBmYWxzZTtcbiAgICB9XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY2xlYXJDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNhbnZhcy5iZ0NvbG9yO1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xufTtcblxuZnVuY3Rpb24gYnVpbGRFbGVtZW50KGJ1aWxkT3B0aW9ucykge1xuICAgIHZhciBjcmVhdGVFbG0sXG4gICAgICAgIHBhcmVudEVsbTtcblxuICAgIGNyZWF0ZUVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYnVpbGRPcHRpb25zLmVsbSk7XG4gICAgY3JlYXRlRWxtLmlkID0gYnVpbGRPcHRpb25zLmJ1dHRvbklkO1xuICAgIGNyZWF0ZUVsbS5pbm5lckhUTUwgPSBidWlsZE9wdGlvbnMuYnV0dG9uVGV4dDtcbiAgICBwYXJlbnRFbG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChidWlsZE9wdGlvbnMucGFyZW50SWQpO1xuXG4gICAgLy8gcmV0dXJuIGlmIHRoZXJlIGlzIG5vIG9iamVjdFxuICAgIGlmIChwYXJlbnRFbG0gPT09IG51bGwpIHJldHVybjtcbiAgICBwYXJlbnRFbG0uYXBwZW5kQ2hpbGQoY3JlYXRlRWxtKTtcbn1cblxuZnVuY3Rpb24gZmluZEVsZW1lbnRPbklEKGxpc3QsIGl0ZW1JRCkge1xuICAgIHZhciBjdXJyZW50SXRlbTtcbiAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmlkID09PSAnY2FudmFzLTEnKSB7XG4gICAgICAgICAgY3VycmVudEl0ZW0gPSBpdGVtO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGN1cnJlbnRJdGVtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRyYXdDaGltO1xuIiwiLy8gZm9yIGNvbXByZXNzaW9uXG52YXIgd2luID0gcmVxdWlyZSgnZ2xvYmFsL3dpbmRvdycpO1xudmFyIGRvYyA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpO1xudmFyIHJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50IHx8IHt9O1xuXG4vLyBkZXRlY3QgaWYgd2UgbmVlZCB0byB1c2UgZmlyZWZveCBLZXlFdmVudHMgdnMgS2V5Ym9hcmRFdmVudHNcbnZhciB1c2Vfa2V5X2V2ZW50ID0gdHJ1ZTtcbnRyeSB7XG4gICAgZG9jLmNyZWF0ZUV2ZW50KCdLZXlFdmVudHMnKTtcbn1cbmNhdGNoIChlcnIpIHtcbiAgICB1c2Vfa2V5X2V2ZW50ID0gZmFsc2U7XG59XG5cbi8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNjczNVxuZnVuY3Rpb24gY2hlY2tfa2IoZXYsIG9wdHMpIHtcbiAgICBpZiAoZXYuY3RybEtleSAhPSAob3B0cy5jdHJsS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5hbHRLZXkgIT0gKG9wdHMuYWx0S2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5zaGlmdEtleSAhPSAob3B0cy5zaGlmdEtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYubWV0YUtleSAhPSAob3B0cy5tZXRhS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5rZXlDb2RlICE9IChvcHRzLmtleUNvZGUgfHwgMCkgfHxcbiAgICAgICAgZXYuY2hhckNvZGUgIT0gKG9wdHMuY2hhckNvZGUgfHwgMCkpIHtcblxuICAgICAgICBldiA9IGRvYy5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZXYuaW5pdEV2ZW50KG9wdHMudHlwZSwgb3B0cy5idWJibGVzLCBvcHRzLmNhbmNlbGFibGUpO1xuICAgICAgICBldi5jdHJsS2V5ICA9IG9wdHMuY3RybEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYuYWx0S2V5ICAgPSBvcHRzLmFsdEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYuc2hpZnRLZXkgPSBvcHRzLnNoaWZ0S2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5tZXRhS2V5ICA9IG9wdHMubWV0YUtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYua2V5Q29kZSAgPSBvcHRzLmtleUNvZGUgfHwgMDtcbiAgICAgICAgZXYuY2hhckNvZGUgPSBvcHRzLmNoYXJDb2RlIHx8IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufVxuXG4vLyBtb2Rlcm4gYnJvd3NlcnMsIGRvIGEgcHJvcGVyIGRpc3BhdGNoRXZlbnQoKVxudmFyIG1vZGVybiA9IGZ1bmN0aW9uKHR5cGUsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgIC8vIHdoaWNoIGluaXQgZm4gZG8gd2UgdXNlXG4gICAgdmFyIGZhbWlseSA9IHR5cGVPZih0eXBlKTtcbiAgICB2YXIgaW5pdF9mYW0gPSBmYW1pbHk7XG4gICAgaWYgKGZhbWlseSA9PT0gJ0tleWJvYXJkRXZlbnQnICYmIHVzZV9rZXlfZXZlbnQpIHtcbiAgICAgICAgZmFtaWx5ID0gJ0tleUV2ZW50cyc7XG4gICAgICAgIGluaXRfZmFtID0gJ0tleUV2ZW50JztcbiAgICB9XG5cbiAgICB2YXIgZXYgPSBkb2MuY3JlYXRlRXZlbnQoZmFtaWx5KTtcbiAgICB2YXIgaW5pdF9mbiA9ICdpbml0JyArIGluaXRfZmFtO1xuICAgIHZhciBpbml0ID0gdHlwZW9mIGV2W2luaXRfZm5dID09PSAnZnVuY3Rpb24nID8gaW5pdF9mbiA6ICdpbml0RXZlbnQnO1xuXG4gICAgdmFyIHNpZyA9IGluaXRTaWduYXR1cmVzW2luaXRdO1xuICAgIHZhciBhcmdzID0gW107XG4gICAgdmFyIHVzZWQgPSB7fTtcblxuICAgIG9wdHMudHlwZSA9IHR5cGU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWcubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IHNpZ1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG9wdHNba2V5XTtcbiAgICAgICAgLy8gaWYgbm8gdXNlciBzcGVjaWZpZWQgdmFsdWUsIHRoZW4gdXNlIGV2ZW50IGRlZmF1bHRcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSBldltrZXldO1xuICAgICAgICB9XG4gICAgICAgIHVzZWRba2V5XSA9IHRydWU7XG4gICAgICAgIGFyZ3MucHVzaCh2YWwpO1xuICAgIH1cbiAgICBldltpbml0XS5hcHBseShldiwgYXJncyk7XG5cbiAgICAvLyB3ZWJraXQga2V5IGV2ZW50IGlzc3VlIHdvcmthcm91bmRcbiAgICBpZiAoZmFtaWx5ID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgZXYgPSBjaGVja19rYihldiwgb3B0cyk7XG4gICAgfVxuXG4gICAgLy8gYXR0YWNoIHJlbWFpbmluZyB1bnVzZWQgb3B0aW9ucyB0byB0aGUgb2JqZWN0XG4gICAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcbiAgICAgICAgaWYgKCF1c2VkW2tleV0pIHtcbiAgICAgICAgICAgIGV2W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59O1xuXG52YXIgbGVnYWN5ID0gZnVuY3Rpb24gKHR5cGUsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICB2YXIgZXYgPSBkb2MuY3JlYXRlRXZlbnRPYmplY3QoKTtcblxuICAgIGV2LnR5cGUgPSB0eXBlO1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRzKSB7XG4gICAgICAgIGlmIChvcHRzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXZba2V5XSA9IG9wdHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldjtcbn07XG5cbi8vIGV4cG9zZSBlaXRoZXIgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIGV2ZW50IGdlbmVyYXRpb24gb3IgbGVnYWN5XG4vLyBkZXBlbmRpbmcgb24gd2hhdCB3ZSBzdXBwb3J0XG4vLyBhdm9pZHMgaWYgc3RhdGVtZW50cyBpbiB0aGUgY29kZSBsYXRlclxubW9kdWxlLmV4cG9ydHMgPSBkb2MuY3JlYXRlRXZlbnQgPyBtb2Rlcm4gOiBsZWdhY3k7XG5cbnZhciBpbml0U2lnbmF0dXJlcyA9IHJlcXVpcmUoJy4vaW5pdC5qc29uJyk7XG52YXIgdHlwZXMgPSByZXF1aXJlKCcuL3R5cGVzLmpzb24nKTtcbnZhciB0eXBlT2YgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBzID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIHR5cGVzKSB7XG4gICAgICAgIHZhciB0cyA9IHR5cGVzW2tleV07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHR5cHNbdHNbaV1dID0ga2V5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0eXBzW25hbWVdIHx8ICdFdmVudCc7XG4gICAgfTtcbn0pKCk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaW5pdEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCJcbiAgXSxcbiAgXCJpbml0VUlFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiZGV0YWlsXCJcbiAgXSxcbiAgXCJpbml0TW91c2VFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiZGV0YWlsXCIsXG4gICAgXCJzY3JlZW5YXCIsXG4gICAgXCJzY3JlZW5ZXCIsXG4gICAgXCJjbGllbnRYXCIsXG4gICAgXCJjbGllbnRZXCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJidXR0b25cIixcbiAgICBcInJlbGF0ZWRUYXJnZXRcIlxuICBdLFxuICBcImluaXRNdXRhdGlvbkV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJyZWxhdGVkTm9kZVwiLFxuICAgIFwicHJldlZhbHVlXCIsXG4gICAgXCJuZXdWYWx1ZVwiLFxuICAgIFwiYXR0ck5hbWVcIixcbiAgICBcImF0dHJDaGFuZ2VcIlxuICBdLFxuICBcImluaXRLZXlib2FyZEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJrZXlDb2RlXCIsXG4gICAgXCJjaGFyQ29kZVwiXG4gIF0sXG4gIFwiaW5pdEtleUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJrZXlDb2RlXCIsXG4gICAgXCJjaGFyQ29kZVwiXG4gIF1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJNb3VzZUV2ZW50XCIgOiBbXG4gICAgXCJjbGlja1wiLFxuICAgIFwibW91c2Vkb3duXCIsXG4gICAgXCJtb3VzZXVwXCIsXG4gICAgXCJtb3VzZW92ZXJcIixcbiAgICBcIm1vdXNlbW92ZVwiLFxuICAgIFwibW91c2VvdXRcIlxuICBdLFxuICBcIktleWJvYXJkRXZlbnRcIiA6IFtcbiAgICBcImtleWRvd25cIixcbiAgICBcImtleXVwXCIsXG4gICAgXCJrZXlwcmVzc1wiXG4gIF0sXG4gIFwiTXV0YXRpb25FdmVudFwiIDogW1xuICAgIFwiRE9NU3VidHJlZU1vZGlmaWVkXCIsXG4gICAgXCJET01Ob2RlSW5zZXJ0ZWRcIixcbiAgICBcIkRPTU5vZGVSZW1vdmVkXCIsXG4gICAgXCJET01Ob2RlUmVtb3ZlZEZyb21Eb2N1bWVudFwiLFxuICAgIFwiRE9NTm9kZUluc2VydGVkSW50b0RvY3VtZW50XCIsXG4gICAgXCJET01BdHRyTW9kaWZpZWRcIixcbiAgICBcIkRPTUNoYXJhY3RlckRhdGFNb2RpZmllZFwiXG4gIF0sXG4gIFwiSFRNTEV2ZW50c1wiIDogW1xuICAgIFwibG9hZFwiLFxuICAgIFwidW5sb2FkXCIsXG4gICAgXCJhYm9ydFwiLFxuICAgIFwiZXJyb3JcIixcbiAgICBcInNlbGVjdFwiLFxuICAgIFwiY2hhbmdlXCIsXG4gICAgXCJzdWJtaXRcIixcbiAgICBcInJlc2V0XCIsXG4gICAgXCJmb2N1c1wiLFxuICAgIFwiYmx1clwiLFxuICAgIFwicmVzaXplXCIsXG4gICAgXCJzY3JvbGxcIlxuICBdLFxuICBcIlVJRXZlbnRcIiA6IFtcbiAgICBcIkRPTUZvY3VzSW5cIixcbiAgICBcIkRPTUZvY3VzT3V0XCIsXG4gICAgXCJET01BY3RpdmF0ZVwiXG4gIF1cbn1cbiIsIi8vIGh0dHA6Ly93aWtpLmNvbW1vbmpzLm9yZy93aWtpL1VuaXRfVGVzdGluZy8xLjBcbi8vXG4vLyBUSElTIElTIE5PVCBURVNURUQgTk9SIExJS0VMWSBUTyBXT1JLIE9VVFNJREUgVjghXG4vL1xuLy8gT3JpZ2luYWxseSBmcm9tIG5hcndoYWwuanMgKGh0dHA6Ly9uYXJ3aGFsanMub3JnKVxuLy8gQ29weXJpZ2h0IChjKSAyMDA5IFRob21hcyBSb2JpbnNvbiA8Mjgwbm9ydGguY29tPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0b1xuLy8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbi8vIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuLy8gc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU5cbi8vIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyB3aGVuIHVzZWQgaW4gbm9kZSwgdGhpcyB3aWxsIGFjdHVhbGx5IGxvYWQgdGhlIHV0aWwgbW9kdWxlIHdlIGRlcGVuZCBvblxuLy8gdmVyc3VzIGxvYWRpbmcgdGhlIGJ1aWx0aW4gdXRpbCBtb2R1bGUgYXMgaGFwcGVucyBvdGhlcndpc2Vcbi8vIHRoaXMgaXMgYSBidWcgaW4gbm9kZSBtb2R1bGUgbG9hZGluZyBhcyBmYXIgYXMgSSBhbSBjb25jZXJuZWRcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbC8nKTtcblxudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgaWYgKG9wdGlvbnMubWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBnZXRNZXNzYWdlKHRoaXMpO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH1cbiAgdmFyIHN0YWNrU3RhcnRGdW5jdGlvbiA9IG9wdGlvbnMuc3RhY2tTdGFydEZ1bmN0aW9uIHx8IGZhaWw7XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBub24gdjggYnJvd3NlcnMgc28gd2UgY2FuIGhhdmUgYSBzdGFja3RyYWNlXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuICAgIGlmIChlcnIuc3RhY2spIHtcbiAgICAgIHZhciBvdXQgPSBlcnIuc3RhY2s7XG5cbiAgICAgIC8vIHRyeSB0byBzdHJpcCB1c2VsZXNzIGZyYW1lc1xuICAgICAgdmFyIGZuX25hbWUgPSBzdGFja1N0YXJ0RnVuY3Rpb24ubmFtZTtcbiAgICAgIHZhciBpZHggPSBvdXQuaW5kZXhPZignXFxuJyArIGZuX25hbWUpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIC8vIG9uY2Ugd2UgaGF2ZSBsb2NhdGVkIHRoZSBmdW5jdGlvbiBmcmFtZVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHN0cmlwIG91dCBldmVyeXRoaW5nIGJlZm9yZSBpdCAoYW5kIGl0cyBsaW5lKVxuICAgICAgICB2YXIgbmV4dF9saW5lID0gb3V0LmluZGV4T2YoJ1xcbicsIGlkeCArIDEpO1xuICAgICAgICBvdXQgPSBvdXQuc3Vic3RyaW5nKG5leHRfbGluZSArIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YWNrID0gb3V0O1xuICAgIH1cbiAgfVxufTtcblxuLy8gYXNzZXJ0LkFzc2VydGlvbkVycm9yIGluc3RhbmNlb2YgRXJyb3JcbnV0aWwuaW5oZXJpdHMoYXNzZXJ0LkFzc2VydGlvbkVycm9yLCBFcnJvcik7XG5cbmZ1bmN0aW9uIHJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuICcnICsgdmFsdWU7XG4gIH1cbiAgaWYgKHV0aWwuaXNOdW1iZXIodmFsdWUpICYmICFpc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSB8fCB1dGlsLmlzUmVnRXhwKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdHJ1bmNhdGUocywgbikge1xuICBpZiAodXRpbC5pc1N0cmluZyhzKSkge1xuICAgIHJldHVybiBzLmxlbmd0aCA8IG4gPyBzIDogcy5zbGljZSgwLCBuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlKHNlbGYpIHtcbiAgcmV0dXJuIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuYWN0dWFsLCByZXBsYWNlciksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmV4cGVjdGVkLCByZXBsYWNlciksIDEyOCk7XG59XG5cbi8vIEF0IHByZXNlbnQgb25seSB0aGUgdGhyZWUga2V5cyBtZW50aW9uZWQgYWJvdmUgYXJlIHVzZWQgYW5kXG4vLyB1bmRlcnN0b29kIGJ5IHRoZSBzcGVjLiBJbXBsZW1lbnRhdGlvbnMgb3Igc3ViIG1vZHVsZXMgY2FuIHBhc3Ncbi8vIG90aGVyIGtleXMgdG8gdGhlIEFzc2VydGlvbkVycm9yJ3MgY29uc3RydWN0b3IgLSB0aGV5IHdpbGwgYmVcbi8vIGlnbm9yZWQuXG5cbi8vIDMuIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuICBBbGwgYXNzZXJ0aW9uIG1ldGhvZHMgcHJvdmlkZVxuLy8gYm90aCB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgdG8gdGhlIGFzc2VydGlvbiBlcnJvciBmb3Jcbi8vIGRpc3BsYXkgcHVycG9zZXMuXG5cbmZ1bmN0aW9uIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IsIHN0YWNrU3RhcnRGdW5jdGlvbikge1xuICB0aHJvdyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IsXG4gICAgc3RhY2tTdGFydEZ1bmN0aW9uOiBzdGFja1N0YXJ0RnVuY3Rpb25cbiAgfSk7XG59XG5cbi8vIEVYVEVOU0lPTiEgYWxsb3dzIGZvciB3ZWxsIGJlaGF2ZWQgZXJyb3JzIGRlZmluZWQgZWxzZXdoZXJlLlxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyA0LiBQdXJlIGFzc2VydGlvbiB0ZXN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdHJ1dGh5LCBhcyBkZXRlcm1pbmVkXG4vLyBieSAhIWd1YXJkLlxuLy8gYXNzZXJ0Lm9rKGd1YXJkLCBtZXNzYWdlX29wdCk7XG4vLyBUaGlzIHN0YXRlbWVudCBpcyBlcXVpdmFsZW50IHRvIGFzc2VydC5lcXVhbCh0cnVlLCAhIWd1YXJkLFxuLy8gbWVzc2FnZV9vcHQpOy4gVG8gdGVzdCBzdHJpY3RseSBmb3IgdGhlIHZhbHVlIHRydWUsIHVzZVxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKHRydWUsIGd1YXJkLCBtZXNzYWdlX29wdCk7LlxuXG5mdW5jdGlvbiBvayh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQub2spO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIDUuIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aFxuLy8gPT0uXG4vLyBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiBlcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09JywgYXNzZXJ0LmVxdWFsKTtcbn07XG5cbi8vIDYuIFRoZSBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciB3aGV0aGVyIHR3byBvYmplY3RzIGFyZSBub3QgZXF1YWxcbi8vIHdpdGggIT0gYXNzZXJ0Lm5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT0nLCBhc3NlcnQubm90RXF1YWwpO1xuICB9XG59O1xuXG4vLyA3LiBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbi8vIGFzc2VydC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZGVlcEVxdWFsID0gZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcEVxdWFsJywgYXNzZXJ0LmRlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNCdWZmZXIoYWN0dWFsKSAmJiB1dGlsLmlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIGlmIChhY3R1YWwubGVuZ3RoICE9IGV4cGVjdGVkLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCF1dGlsLmlzT2JqZWN0KGFjdHVhbCkgJiYgIXV0aWwuaXNPYmplY3QoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiKSB7XG4gIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy8gaWYgb25lIGlzIGEgcHJpbWl0aXZlLCB0aGUgb3RoZXIgbXVzdCBiZSBzYW1lXG4gIGlmICh1dGlsLmlzUHJpbWl0aXZlKGEpIHx8IHV0aWwuaXNQcmltaXRpdmUoYikpIHtcbiAgICByZXR1cm4gYSA9PT0gYjtcbiAgfVxuICB2YXIgYUlzQXJncyA9IGlzQXJndW1lbnRzKGEpLFxuICAgICAgYklzQXJncyA9IGlzQXJndW1lbnRzKGIpO1xuICBpZiAoKGFJc0FyZ3MgJiYgIWJJc0FyZ3MpIHx8ICghYUlzQXJncyAmJiBiSXNBcmdzKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIGlmIChhSXNBcmdzKSB7XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiKTtcbiAgfVxuICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAga2IgPSBvYmplY3RLZXlzKGIpLFxuICAgICAga2V5LCBpO1xuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwRXF1YWwnLCBhc3NlcnQubm90RGVlcEVxdWFsKTtcbiAgfVxufTtcblxuLy8gOS4gVGhlIHN0cmljdCBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc3RyaWN0IGVxdWFsaXR5LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbi8vIGFzc2VydC5zdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5zdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PT0nLCBhc3NlcnQuc3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG4vLyAxMC4gVGhlIHN0cmljdCBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciBzdHJpY3QgaW5lcXVhbGl0eSwgYXNcbi8vIGRldGVybWluZWQgYnkgIT09LiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9PScsIGFzc2VydC5ub3RTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpO1xuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dzKHNob3VsZFRocm93LCBibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGFjdHVhbDtcblxuICBpZiAodXRpbC5pc1N0cmluZyhleHBlY3RlZCkpIHtcbiAgICBtZXNzYWdlID0gZXhwZWN0ZWQ7XG4gICAgZXhwZWN0ZWQgPSBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYWN0dWFsID0gZTtcbiAgfVxuXG4gIG1lc3NhZ2UgPSAoZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubmFtZSA/ICcgKCcgKyBleHBlY3RlZC5uYW1lICsgJykuJyA6ICcuJykgK1xuICAgICAgICAgICAgKG1lc3NhZ2UgPyAnICcgKyBtZXNzYWdlIDogJy4nKTtcblxuICBpZiAoc2hvdWxkVGhyb3cgJiYgIWFjdHVhbCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKCFzaG91bGRUaHJvdyAmJiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ0dvdCB1bndhbnRlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoKHNob3VsZFRocm93ICYmIGFjdHVhbCAmJiBleHBlY3RlZCAmJlxuICAgICAgIWV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fCAoIXNob3VsZFRocm93ICYmIGFjdHVhbCkpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH1cbn1cblxuLy8gMTEuIEV4cGVjdGVkIHRvIHRocm93IGFuIGVycm9yOlxuLy8gYXNzZXJ0LnRocm93cyhibG9jaywgRXJyb3Jfb3B0LCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC50aHJvd3MgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbdHJ1ZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbi8vIEVYVEVOU0lPTiEgVGhpcyBpcyBhbm5veWluZyB0byB3cml0ZSBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW2ZhbHNlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuYXNzZXJ0LmlmRXJyb3IgPSBmdW5jdGlvbihlcnIpIHsgaWYgKGVycikge3Rocm93IGVycjt9fTtcblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn07XG4iLCIiLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG50cnkge1xuICB2YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKVxufSBjYXRjaCAoZXJyKSB7XG4gIHZhciBtYXRjaGVzID0gcmVxdWlyZSgnY29tcG9uZW50LW1hdGNoZXMtc2VsZWN0b3InKVxufVxuXG4vKipcbiAqIEV4cG9ydCBgY2xvc2VzdGBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb3Nlc3RcblxuLyoqXG4gKiBDbG9zZXN0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHNjb3BlIChvcHRpb25hbClcbiAqL1xuXG5mdW5jdGlvbiBjbG9zZXN0IChlbCwgc2VsZWN0b3IsIHNjb3BlKSB7XG4gIHNjb3BlID0gc2NvcGUgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gIC8vIHdhbGsgdXAgdGhlIGRvbVxuICB3aGlsZSAoZWwgJiYgZWwgIT09IHNjb3BlKSB7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0dXJuIGVsO1xuICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8vIGNoZWNrIHNjb3BlIGZvciBtYXRjaFxuICByZXR1cm4gbWF0Y2hlcyhlbCwgc2VsZWN0b3IpID8gZWwgOiBudWxsO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBjbG9zZXN0ID0gcmVxdWlyZSgnY2xvc2VzdCcpXG4gICwgZXZlbnQgPSByZXF1aXJlKCdldmVudCcpO1xuXG4vKipcbiAqIERlbGVnYXRlIGV2ZW50IGB0eXBlYCB0byBgc2VsZWN0b3JgXG4gKiBhbmQgaW52b2tlIGBmbihlKWAuIEEgY2FsbGJhY2sgZnVuY3Rpb25cbiAqIGlzIHJldHVybmVkIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gYC51bmJpbmQoKWAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCBzZWxlY3RvciwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICByZXR1cm4gZXZlbnQuYmluZChlbCwgdHlwZSwgZnVuY3Rpb24oZSl7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBlLmRlbGVnYXRlVGFyZ2V0ID0gY2xvc2VzdCh0YXJnZXQsIHNlbGVjdG9yLCB0cnVlLCBlbCk7XG4gICAgaWYgKGUuZGVsZWdhdGVUYXJnZXQpIGZuLmNhbGwoZWwsIGUpO1xuICB9LCBjYXB0dXJlKTtcbn07XG5cbi8qKlxuICogVW5iaW5kIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBldmVudC51bmJpbmQoZWwsIHR5cGUsIGZuLCBjYXB0dXJlKTtcbn07XG4iLCJ2YXIgYmluZCwgdW5iaW5kLCBwcmVmaXg7XG5cbmZ1bmN0aW9uIGRldGVjdCAoKSB7XG4gIGJpbmQgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdhdHRhY2hFdmVudCc7XG4gIHVuYmluZCA9IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2RldGFjaEV2ZW50JztcbiAgcHJlZml4ID0gYmluZCAhPT0gJ2FkZEV2ZW50TGlzdGVuZXInID8gJ29uJyA6ICcnO1xufVxuXG4vKipcbiAqIEJpbmQgYGVsYCBldmVudCBgdHlwZWAgdG8gYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGlmICghYmluZCkgZGV0ZWN0KCk7XG4gIGVsW2JpbmRdKHByZWZpeCArIHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgcmV0dXJuIGZuO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgYGVsYCBldmVudCBgdHlwZWAncyBjYWxsYmFjayBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBpZiAoIXVuYmluZCkgZGV0ZWN0KCk7XG4gIGVsW3VuYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuICByZXR1cm4gZm47XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnRyeSB7XG4gIHZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5Jyk7XG59IGNhdGNoIChlcnIpIHtcbiAgdmFyIHF1ZXJ5ID0gcmVxdWlyZSgnY29tcG9uZW50LXF1ZXJ5Jyk7XG59XG5cbi8qKlxuICogRWxlbWVudCBwcm90b3R5cGUuXG4gKi9cblxudmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbi8qKlxuICogVmVuZG9yIGZ1bmN0aW9uLlxuICovXG5cbnZhciB2ZW5kb3IgPSBwcm90by5tYXRjaGVzXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxuLyoqXG4gKiBFeHBvc2UgYG1hdGNoKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbWF0Y2g7XG5cbi8qKlxuICogTWF0Y2ggYGVsYCB0byBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbWF0Y2goZWwsIHNlbGVjdG9yKSB7XG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgIT09IDEpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZlbmRvcikgcmV0dXJuIHZlbmRvci5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gIHZhciBub2RlcyA9IHF1ZXJ5LmFsbChzZWxlY3RvciwgZWwucGFyZW50Tm9kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZXNbaV0gPT0gZWwpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xuICByZXR1cm4gZXhwb3J0cztcbn07XG4iLCJcbnZhciBub3cgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBEYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYW4gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgXCJtc1wiIG51bWJlciBvZiBtaWxsaXNlY29uZHNcbiAqIGFmdGVyIHRoZSBsYXN0IGNhbGwgdG8gaXRcbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCB0byBleGVjdXRlIGEgZnVuY3Rpb24gdGhhdCBtaWdodCBvY2N1ciB0b28gb2Z0ZW5cbiAqXG4gKiBAbWV0aG9kIGRlYm91bmNlXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gZiB7RnVuY3Rpb259IHRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZVxuICogQHBhcmFtIG1zIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQuIElmIGFueSBvdGhlciBjYWxsXG4gKiBpcyBtYWRlIGJlZm9yZSB0aGF0IHRocmVzaG9sZCB0aGUgd2FpdGluZyB3aWxsIGJlIHJlc3RhcnRlZFxuICogQHBhcmFtIFtjdHg9dW5kZWZpbmVkXSB7T2JqZWN0fSB0aGUgY29udGV4dCBvbiB3aGljaCB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgZXhlY3V0ZWRcbiAqICh0aGUgJ3RoaXMnIG9iamVjdCBpbnNpZGUgdGhlIGZ1bmN0aW9uIHdpbCBiZSBzZXQgdG8gY29udGV4dClcbiAqIEBwYXJhbSBbaW1tZWRpYXRlPXVuZGVmaW5lZF0ge0Jvb2xlYW59IGlmIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQgaW4gdGhlIGxlYWRpbmcgZWRnZSBvciB0aGUgdHJhaWxpbmcgZWRnZVxuICogYGBgXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVib3VuY2UoIGYsIG1zLCBjdHgsIGltbWVkaWF0ZSApIHtcbiAgdmFyIHRzLCBmbjtcbiAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICB2YXIgYXJncztcblxuICBmbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBjdHggPSBjdHggfHwgdGhpcztcbiAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHRzID0gbm93KCk7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZGlmZiA9IG5vdygpIC0gdHM7XG5cbiAgICAgIGlmICggZGlmZiA8IG1zICkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCggbGF0ZXIsIG1zIC0gZGlmZiApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcblxuICAgICAgaWYgKCAhaW1tZWRpYXRlICkge1xuICAgICAgICBmLmFwcGx5KCBjdHgsIGFyZ3MgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCB0aW1lb3V0ID09PSBudWxsICkge1xuICAgICAgaWYgKCBpbW1lZGlhdGUgKSB7XG4gICAgICAgIGYuYXBwbHkoIGN0eCwgYXJncyApO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoIGxhdGVyLCBtcyApO1xuICAgIH1cbiAgfTtcblxuICBmbi5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0ICk7XG4gIH07XG5cbiAgcmV0dXJuIGZuO1xufTtcbiIsInZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yLCBjaGVja1lvU2VsZiwgcm9vdCkge1xuICBlbGVtZW50ID0gY2hlY2tZb1NlbGYgPyB7cGFyZW50Tm9kZTogZWxlbWVudH0gOiBlbGVtZW50XG5cbiAgcm9vdCA9IHJvb3QgfHwgZG9jdW1lbnRcblxuICAvLyBNYWtlIHN1cmUgYGVsZW1lbnQgIT09IGRvY3VtZW50YCBhbmQgYGVsZW1lbnQgIT0gbnVsbGBcbiAgLy8gb3RoZXJ3aXNlIHdlIGdldCBhbiBpbGxlZ2FsIGludm9jYXRpb25cbiAgd2hpbGUgKChlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlKSAmJiBlbGVtZW50ICE9PSBkb2N1bWVudCkge1xuICAgIGlmIChtYXRjaGVzKGVsZW1lbnQsIHNlbGVjdG9yKSlcbiAgICAgIHJldHVybiBlbGVtZW50XG4gICAgLy8gQWZ0ZXIgYG1hdGNoZXNgIG9uIHRoZSBlZGdlIGNhc2UgdGhhdFxuICAgIC8vIHRoZSBzZWxlY3RvciBtYXRjaGVzIHRoZSByb290XG4gICAgLy8gKHdoZW4gdGhlIHJvb3QgaXMgbm90IHRoZSBkb2N1bWVudClcbiAgICBpZiAoZWxlbWVudCA9PT0gcm9vdClcbiAgICAgIHJldHVybiAgXG4gIH1cbn0iLCIndXNlIHN0cmljdCdcblxudmFyIERPTUV2ZW50ID0gcmVxdWlyZSgnQGJlbmRydWNrZXIvc3ludGhldGljLWRvbS1ldmVudHMnKVxudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hFdmVudCAoZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMpIHtcbiAgYXNzZXJ0KGVsZW1lbnQsICdBIERPTSBlbGVtZW50IGlzIHJlcXVpcmVkJylcbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICBldmVudCA9IERPTUV2ZW50KGV2ZW50LCBvcHRpb25zKVxuICB9XG4gIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcbiAgcmV0dXJuIGV2ZW50XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluZGV4ID0gcmVxdWlyZSgnaW5kZXhvZicpO1xuXG4vKipcbiAqIFdoaXRlc3BhY2UgcmVnZXhwLlxuICovXG5cbnZhciB3aGl0ZXNwYWNlUmUgPSAvXFxzKy87XG5cbi8qKlxuICogdG9TdHJpbmcgcmVmZXJlbmNlLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3Nlcztcbm1vZHVsZS5leHBvcnRzLmFkZCA9IGFkZDtcbm1vZHVsZS5leHBvcnRzLmNvbnRhaW5zID0gaGFzO1xubW9kdWxlLmV4cG9ydHMuaGFzID0gaGFzO1xubW9kdWxlLmV4cG9ydHMudG9nZ2xlID0gdG9nZ2xlO1xubW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gcmVtb3ZlO1xubW9kdWxlLmV4cG9ydHMucmVtb3ZlTWF0Y2hpbmcgPSByZW1vdmVNYXRjaGluZztcblxuZnVuY3Rpb24gY2xhc3NlcyAoZWwpIHtcbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIHJldHVybiBlbC5jbGFzc0xpc3Q7XG4gIH1cblxuICB2YXIgc3RyID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgdmFyIGFyciA9IHN0ci5zcGxpdCh3aGl0ZXNwYWNlUmUpO1xuICBpZiAoJycgPT09IGFyclswXSkgYXJyLnNoaWZ0KCk7XG4gIHJldHVybiBhcnI7XG59XG5cbmZ1bmN0aW9uIGFkZCAoZWwsIG5hbWUpIHtcbiAgLy8gY2xhc3NMaXN0XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSBjbGFzc2VzKGVsKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAoIX5pKSBhcnIucHVzaChuYW1lKTtcbiAgZWwuY2xhc3NOYW1lID0gYXJyLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gaGFzIChlbCwgbmFtZSkge1xuICByZXR1cm4gZWwuY2xhc3NMaXN0XG4gICAgPyBlbC5jbGFzc0xpc3QuY29udGFpbnMobmFtZSlcbiAgICA6ICEhIH5pbmRleChjbGFzc2VzKGVsKSwgbmFtZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoZWwsIG5hbWUpIHtcbiAgaWYgKCdbb2JqZWN0IFJlZ0V4cF0nID09IHRvU3RyaW5nLmNhbGwobmFtZSkpIHtcbiAgICByZXR1cm4gcmVtb3ZlTWF0Y2hpbmcoZWwsIG5hbWUpO1xuICB9XG5cbiAgLy8gY2xhc3NMaXN0XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSBjbGFzc2VzKGVsKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAofmkpIGFyci5zcGxpY2UoaSwgMSk7XG4gIGVsLmNsYXNzTmFtZSA9IGFyci5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU1hdGNoaW5nIChlbCwgcmUsIHJlZikge1xuICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2xhc3NlcyhlbCkpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChyZS50ZXN0KGFycltpXSkpIHtcbiAgICAgIHJlbW92ZShlbCwgYXJyW2ldKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlIChlbCwgbmFtZSkge1xuICAvLyBjbGFzc0xpc3RcbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIHJldHVybiBlbC5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgaWYgKGhhcyhlbCwgbmFtZSkpIHtcbiAgICByZW1vdmUoZWwsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGFkZChlbCwgbmFtZSk7XG4gIH1cbn1cbiIsInZhciBldnRMaWZlQ3ljbGUgPSB7IH07XG52YXIgZXh0ZW5kID0gcmVxdWlyZSggJ2V4dGVuZCcgKTtcbnZhciBjYWNoZSA9IHJlcXVpcmUoICcuL2xpYi9ldmVudC1jYWNoZScgKTtcbnZhciBnZXRFdmVudENhY2hlID0gY2FjaGUuZ2V0Q2FjaGUuYmluZCggY2FjaGUgKTtcbnZhciBkaXNwYXRjaEV2ZW50ID0gcmVxdWlyZSggJy4vbGliL2Rpc3BhdGNoLWV2ZW50JyApO1xuXG52YXIgZG9tRXZlbnQgPSByZXF1aXJlKCAnLi9saWIvZG9tLWV2ZW50JyApO1xudmFyIHdyYXBDYWxsYmFjayA9IHJlcXVpcmUoICcuL2xpYi93cmFwLWNhbGxiYWNrJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uICggZXZ0LCBsaWZlY3ljbGUgKSB7XG4gICAgZXZ0TGlmZUN5Y2xlWyBldnQgXSA9IGxpZmVjeWNsZTtcbiAgfSxcbiAgdHJpZ2dlcjogZnVuY3Rpb24gKCBlbGUsIGV2ZW50ICkge1xuICAgIGlmICggIWV2ZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnZXZlbnQgaXMgcmVxdWlyZWQnICk7XG4gICAgfVxuICAgIHZhciBldmVudENhY2hlID0gZ2V0RXZlbnRDYWNoZSggZWxlICk7XG4gICAgZXZlbnRDYWNoZSA9IGV2ZW50Q2FjaGVbIGV2ZW50IF07XG5cbiAgICBpZiAoICFldmVudENhY2hlICkge1xuICAgICAgLy8gbm90aGluZyB0byB0cmlnZ2VyXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoIGV2ZW50Q2FjaGUgKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGZuSWQgKSB7XG4gICAgICB2YXIgZm4gPSBldmVudENhY2hlWyBmbklkIF07XG4gICAgICBmbiAmJiBmbi5hcHBseSggZWxlLCBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiBldmVudFxuICAgICAgICB9XG4gICAgICBdICk7XG4gICAgfSApO1xuICB9LFxuICBmaXJlOiBmdW5jdGlvbiAoIGVsZSwgZXZ0LCBvcHRzICkge1xuICAgIGRpc3BhdGNoRXZlbnQoIGVsZSwgZXZ0LCBvcHRzICk7XG4gIH0sXG4gIG9uOiBmdW5jdGlvbiAoIGVsZSwgZXZlbnQsIHNlbGVjdG9yLCBjYWxsYmFjaywgY2FwdHVyZSApIHtcbiAgICB2YXIgbWUgPSB0aGlzO1xuICAgIGlmICggIWVsZSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ21pc3NpbmcgYXJndW1lbnQgZWxlbWVudCcgKTtcbiAgICB9XG4gICAgaWYgKCAhZXZlbnQgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdtaXNzaW5nIGFyZ3VtZW50IGV2ZW50JyApO1xuICAgIH1cblxuICAgIGV2ZW50LnNwbGl0KCAvXFxzKy8gKS5mb3JFYWNoKCBmdW5jdGlvbiAoIHR5cGUgKSB7XG4gICAgICB2YXIgcGFydHMgPSB0eXBlLnNwbGl0KCAnLicgKTtcbiAgICAgIHZhciBldmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50TmFtZSxcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIGNhcHR1cmU6IGNhcHR1cmUsXG4gICAgICAgIG5zOiBwYXJ0cy5yZWR1Y2UoIGZ1bmN0aW9uICggc2VxLCBucyApIHtcbiAgICAgICAgICBzZXFbIG5zIF0gPSB0cnVlO1xuICAgICAgICAgIHJldHVybiBzZXE7XG4gICAgICAgIH0sIHsgfSApXG4gICAgICB9O1xuXG4gICAgICBtZS5fb24oIGVsZSwgZGVzY3JpcHRvciApO1xuICAgIH0gKTtcblxuICB9LFxuICBfb246IGZ1bmN0aW9uICggZWxlLCBkZXNjcmlwdG9yICkge1xuICAgIGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yIHx8IHsgfTtcblxuICAgIHZhciBldmVudCA9IGRlc2NyaXB0b3IuZXZlbnQ7XG4gICAgdmFyIHNlbGVjdG9yID0gZGVzY3JpcHRvci5zZWxlY3RvcjtcbiAgICB2YXIgY2FwdHVyZSA9IGRlc2NyaXB0b3IuY2FwdHVyZTtcbiAgICB2YXIgbnMgPSBkZXNjcmlwdG9yLm5zO1xuXG4gICAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICBkZXNjcmlwdG9yLmNhbGxiYWNrID0gc2VsZWN0b3I7XG4gICAgICBzZWxlY3RvciA9ICcnO1xuICAgIH1cblxuICAgIHZhciBjYWxsYmFja0lkID0gcmVxdWlyZSggJy4vbGliL2dldC1jYWxsYmFjay1pZCcgKSggZGVzY3JpcHRvci5jYWxsYmFjayApO1xuXG4gICAgdmFyIGV2ZW50TGlmZUN5Y2xlRXZlbnQgPSBldnRMaWZlQ3ljbGVbIGV2ZW50IF07XG4gICAgdmFyIGV2ZW50Q2FjaGUgPSBnZXRFdmVudENhY2hlKCBlbGUsIGV2ZW50ICk7XG5cbiAgICBpZiAoIGV2ZW50TGlmZUN5Y2xlRXZlbnQgKSB7XG4gICAgICBpZiAoIE9iamVjdC5rZXlzKCBldmVudENhY2hlICkubGVuZ3RoID09PSAwICkge1xuICAgICAgICBldmVudExpZmVDeWNsZUV2ZW50LnNldHVwICYmIGV2ZW50TGlmZUN5Y2xlRXZlbnQuc2V0dXAuYXBwbHkoIGVsZSwgW1xuICAgICAgICAgIGRlc2NyaXB0b3JcbiAgICAgICAgXSApO1xuICAgICAgfVxuICAgICAgZXZlbnRMaWZlQ3ljbGVFdmVudC5hZGQgJiYgZXZlbnRMaWZlQ3ljbGVFdmVudC5hZGQuYXBwbHkoIGVsZSwgW1xuICAgICAgICBkZXNjcmlwdG9yXG4gICAgICBdICk7XG4gICAgfVxuXG4gICAgLy8gY291bGQgaGF2ZSBiZWVuIGNoYW5nZWQgaW5zaWRlIHRoZSBldmVudCBsaWZlIGN5Y2xlXG4gICAgLy8gc28gd2UganVzdCBlbnN1cmUgaGVyZSB0aGUgc2FtZSBpZCBmb3IgdGhlIGZ1bmN0aW9uIGlzIHNldFxuICAgIC8vIHRoaXMgaXMgdG8gYmUgYWJsZSB0byByZW1vdmUgdGhlIGxpc3RlbmVyIGlmIHRoZSBmdW5jdGlvbiBpcyBnaXZlblxuICAgIC8vIHRvIHRoZSBvZmYgbWV0aG9kXG4gICAgdmFyIGNhbGxiYWNrID0gZGVzY3JpcHRvci5jYWxsYmFjaztcbiAgICBjYWxsYmFjay54RklkID0gY2FsbGJhY2tJZDtcblxuICAgIHZhciB3cmFwcGVkRm4gPSB3cmFwQ2FsbGJhY2soIGVsZSwgY2FsbGJhY2ssIG5zLCBzZWxlY3RvciApO1xuXG4gICAgZXZlbnRDYWNoZVsgd3JhcHBlZEZuLnhGSWQgXSA9IHdyYXBwZWRGbjtcblxuICAgIHJldHVybiBkb21FdmVudC5vbiggZWxlLCBldmVudCwgd3JhcHBlZEZuLCBjYXB0dXJlICk7XG4gIH0sXG4gIG9mZjogZnVuY3Rpb24gKCBlbGUsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSApIHtcbiAgICB2YXIgbWUgPSB0aGlzO1xuICAgIGV2ZW50LnNwbGl0KCAvXFxzKy8gKS5mb3JFYWNoKCBmdW5jdGlvbiAoIHR5cGUgKSB7XG4gICAgICB2YXIgcGFydHMgPSB0eXBlLnNwbGl0KCAnLicgKTtcbiAgICAgIHZhciBldmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50TmFtZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICBjYXB0dXJlOiBjYXB0dXJlLFxuICAgICAgICBuczogcGFydHMucmVkdWNlKCBmdW5jdGlvbiAoIHNlcSwgbnMgKSB7XG4gICAgICAgICAgc2VxWyBucyBdID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gc2VxO1xuICAgICAgICB9LCB7IH0gKVxuICAgICAgfTtcblxuICAgICAgbWUuX29mZiggZWxlLCBkZXNjcmlwdG9yICk7XG4gICAgfSApO1xuICB9LFxuXG4gIF9kb1JlbW92ZUV2ZW50OiBmdW5jdGlvbiAoIGVsZSwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlICkge1xuICAgIHZhciBldmVudENhY2hlID0gZ2V0RXZlbnRDYWNoZSggZWxlICk7XG4gICAgdmFyIGN1cnJlbnRFdmVudENhY2hlID0gZXZlbnRDYWNoZVsgZXZlbnQgXTtcblxuICAgIGlmICggIWN1cnJlbnRFdmVudENhY2hlICkge1xuICAgICAgLy8gbm90aGluZyB0byByZW1vdmVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgeEZJZCA9IGNhbGxiYWNrLnhGSWQ7XG5cbiAgICBpZiAoIHhGSWQgKSB7XG4gICAgICBkZWxldGUgY3VycmVudEV2ZW50Q2FjaGVbIHhGSWQgXTtcblxuICAgICAgdmFyIGV2ZW50TGlmZUN5Y2xlRXZlbnQgPSBldnRMaWZlQ3ljbGVbIGV2ZW50IF07XG5cbiAgICAgIGlmICggZXZlbnRMaWZlQ3ljbGVFdmVudCApIHtcbiAgICAgICAgZXZlbnRMaWZlQ3ljbGVFdmVudC5yZW1vdmUgJiYgZXZlbnRMaWZlQ3ljbGVFdmVudC5yZW1vdmUuYXBwbHkoIGVsZSwge1xuICAgICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgICAgY2FwdHVyZTogY2FwdHVyZVxuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggT2JqZWN0LmtleXMoIGV2ZW50Q2FjaGUgKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgIGRlbGV0ZSBldmVudENhY2hlWyBldmVudCBdO1xuICAgICAgICBpZiAoIGV2ZW50TGlmZUN5Y2xlRXZlbnQgKSB7XG4gICAgICAgICAgZXZlbnRMaWZlQ3ljbGVFdmVudC50ZWFyZG93biAmJiBldmVudExpZmVDeWNsZUV2ZW50LnRlYXJkb3duLmFwcGx5KCBlbGUsIHtcbiAgICAgICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgICAgIGNhcHR1cmU6IGNhcHR1cmVcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBkb21FdmVudC5vZmYoIGVsZSwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlICk7XG4gIH0sXG5cbiAgX29mZjogZnVuY3Rpb24gKCBlbGUsIGRlc2NyaXB0b3IgKSB7XG4gICAgdmFyIG1lID0gdGhpcztcbiAgICB2YXIgZXZlbnRDYWNoZSA9IGdldEV2ZW50Q2FjaGUoIGVsZSApO1xuICAgIHZhciBldmVudHMgPSBPYmplY3Qua2V5cyggZXZlbnRDYWNoZSApO1xuXG4gICAgaWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuICAgICAgLy8gbm8gZXZlbnRzIHRvIHJlbW92ZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggIWRlc2NyaXB0b3IuZXZlbnQgKSB7XG4gICAgICBldmVudHMuZm9yRWFjaCggZnVuY3Rpb24gKCBldmVudCApIHtcbiAgICAgICAgbWUuX29mZiggZWxlLCBleHRlbmQoIHsgfSwgZGVzY3JpcHRvciwgeyBldmVudDogZXZlbnQgfSApICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgZXZlbnRDYWNoZSA9IGV2ZW50Q2FjaGVbIGRlc2NyaXB0b3IuZXZlbnQgXTtcblxuICAgIGlmICggIWV2ZW50Q2FjaGUgfHwgT2JqZWN0LmtleXMoIGV2ZW50Q2FjaGUgKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICAvLyBubyBldmVudHMgdG8gcmVtb3ZlIG9yIGFscmVhZHkgcmVtb3ZlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjYWxsYmFjayA9IGRlc2NyaXB0b3IuY2FsbGJhY2s7XG5cbiAgICBpZiAoIGNhbGxiYWNrICkge1xuICAgICAgdmFyIGlkID0gY2FsbGJhY2sueEZJZDtcbiAgICAgIGlmICggaWQgKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKCBldmVudENhY2hlICkuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG4gICAgICAgICAgdmFyIGZuID0gZXZlbnRDYWNoZVsga2V5IF07XG4gICAgICAgICAgaWYgKCBmbi5jYWxsYmFja0lkID09PSBpZCApIHtcbiAgICAgICAgICAgIG1lLl9kb1JlbW92ZUV2ZW50KCBlbGUsIGRlc2NyaXB0b3IuZXZlbnQsIGZuLCBkZXNjcmlwdG9yLmNhcHR1cmUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbmFtZXNwYWNlcyA9IE9iamVjdC5rZXlzKCBkZXNjcmlwdG9yLm5zICk7XG4gICAgdmFyIGhhc05hbWVzcGFjZXMgPSBuYW1lc3BhY2VzLmxlbmd0aCA+IDA7XG5cbiAgICBPYmplY3Qua2V5cyggZXZlbnRDYWNoZSApLmZvckVhY2goIGZ1bmN0aW9uICggZm5JZCApIHtcbiAgICAgIHZhciBmbiA9IGV2ZW50Q2FjaGVbIGZuSWQgXTtcbiAgICAgIGlmICggaGFzTmFtZXNwYWNlcyApIHtcbiAgICAgICAgLy8gb25seSByZW1vdmUgdGhlIGZ1bmN0aW9ucyB0aGF0IG1hdGNoIHRoZSBuc1xuICAgICAgICBuYW1lc3BhY2VzLmZvckVhY2goIGZ1bmN0aW9uICggbmFtZXNwYWNlICkge1xuICAgICAgICAgIGlmICggZm4ueE5TWyBuYW1lc3BhY2UgXSApIHtcbiAgICAgICAgICAgIG1lLl9kb1JlbW92ZUV2ZW50KCBlbGUsIGRlc2NyaXB0b3IuZXZlbnQsIGZuLCBkZXNjcmlwdG9yLmNhcHR1cmUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlbW92ZSBhbGxcbiAgICAgICAgbWUuX2RvUmVtb3ZlRXZlbnQoIGVsZSwgZGVzY3JpcHRvci5ldmVudCwgZm4sIGRlc2NyaXB0b3IuY2FwdHVyZSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCBlbGUsIGV2ZW50LCBvcHRpb25zICkge1xuICB2YXIgZXh0ZW5kID0gcmVxdWlyZSggJ2V4dGVuZCcgKTtcbiAgdmFyIG9wdHMgPSBleHRlbmQoIHsgYnViYmxlczogdHJ1ZSB9LCBvcHRpb25zICk7XG4gIHZhciBzZXRFdmVudCA9IGZhbHNlO1xuICB2YXIgQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbiAgaWYgKCBDdXN0b21FdmVudCApIHtcbiAgICB2YXIgZXZ0O1xuICAgIHRyeSB7XG4gICAgICBldnQgPSBuZXcgQ3VzdG9tRXZlbnQoIGV2ZW50LCBvcHRzICk7XG4gICAgICBlbGUuZGlzcGF0Y2hFdmVudCggZXZ0ICk7XG4gICAgICBzZXRFdmVudCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIHNldEV2ZW50ID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmICggIXNldEV2ZW50ICkge1xuICAgIHZhciBkaXNwYXRjaEV2ZW50ID0gcmVxdWlyZSggJ2Rpc3BhdGNoLWV2ZW50JyApO1xuICAgIGRpc3BhdGNoRXZlbnQoIGVsZSwgZXZlbnQsIG9wdHMgKTtcbiAgfVxufTtcbiIsImZ1bmN0aW9uIG9uKCBlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIGNhcHR1cmUgKSB7XG4gICFlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgKGV2ZW50ID0gJ29uJyArIGV2ZW50KTtcbiAgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciB8fCBlbGVtZW50LmF0dGFjaEV2ZW50KS5jYWxsKCBlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIGNhcHR1cmUgKTtcbiAgcmV0dXJuIGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBvZmYoIGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSApIHtcbiAgIWVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiAoZXZlbnQgPSAnb24nICsgZXZlbnQpO1xuICAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyIHx8IGVsZW1lbnQuZGV0YWNoRXZlbnQpLmNhbGwoIGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSApO1xuICByZXR1cm4gY2FsbGJhY2s7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb247XG5tb2R1bGUuZXhwb3J0cy5vbiA9IG9uO1xubW9kdWxlLmV4cG9ydHMub2ZmID0gb2ZmO1xuIiwidmFyIGNhY2hlID0geyB9O1xudmFyIGlkR2VuID0gcmVxdWlyZSggJy4vaWQtZ2VuJyApO1xudmFyIGdldElkID0gaWRHZW4uY3JlYXRlKCAnZG9tLWVsZScgKTtcblxuZnVuY3Rpb24gZ2V0Q2FjaGUoIGVsZSwgZXZlbnQsIF9jYWNoZSApIHtcblxuICB2YXIgZWxlSWQ7XG5cbiAgaWYgKCBlbGUgPT09IGRvY3VtZW50ICkge1xuICAgIGVsZUlkID0gJ2RvY3VtZW50JztcbiAgfVxuXG4gIGlmICggZWxlID09PSB3aW5kb3cgKSB7XG4gICAgZWxlSWQgPSAnd2luZG93JztcbiAgfVxuXG4gIGlmICggIWVsZUlkICkge1xuICAgIGVsZUlkID0gZWxlLmdldEF0dHJpYnV0ZSggJ3gtZGVzLWlkJyApO1xuXG4gICAgaWYgKCAhZWxlSWQgKSB7XG4gICAgICBlbGVJZCA9IGdldElkKCk7XG4gICAgICBlbGUuc2V0QXR0cmlidXRlKCAneC1kZXMtaWQnLCBlbGVJZCApO1xuICAgIH1cbiAgfVxuXG4gIF9jYWNoZVsgZWxlSWQgXSA9IF9jYWNoZVsgZWxlSWQgXSB8fCB7IH07XG5cbiAgaWYgKCAhZXZlbnQgKSB7XG4gICAgcmV0dXJuIF9jYWNoZVsgZWxlSWQgXTtcbiAgfVxuXG4gIF9jYWNoZVsgZWxlSWQgXVsgZXZlbnQgXSA9IF9jYWNoZVsgZWxlSWQgXVsgZXZlbnQgXSB8fCB7IH07XG5cbiAgcmV0dXJuIF9jYWNoZVsgZWxlSWQgXVsgZXZlbnQgXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENhY2hlOiBmdW5jdGlvbiAoIGVsZSwgZXZlbnQgKSB7XG4gICAgcmV0dXJuIGdldENhY2hlKCBlbGUsIGV2ZW50LCBjYWNoZSApO1xuICB9XG59O1xuIiwidmFyIGlkR2VuID0gcmVxdWlyZSggJy4vaWQtZ2VuJyApO1xudmFyIGdldEZuSWQgPSBpZEdlbi5jcmVhdGUoICdmbicgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRJZE9mQ2FsbGJhY2soIGNhbGxiYWNrICkge1xuICB2YXIgZWxlSWQgPSBjYWxsYmFjay54RklkO1xuICBpZiAoICFlbGVJZCApIHtcbiAgICBlbGVJZCA9IGdldEZuSWQoKTtcbiAgICBjYWxsYmFjay54RklkID0gZWxlSWQ7XG4gIH1cbiAgcmV0dXJuIGVsZUlkO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uICggcHJlZml4ICkge1xuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gZnVuY3Rpb24gZ2V0SWQoKSB7XG4gICAgICByZXR1cm4gcHJlZml4ICsgJy0nICsgRGF0ZS5ub3coKSArICctJyArIChjb3VudGVyKyspO1xuICAgIH07XG4gIH1cbn07XG4iLCJ2YXIgY2xvc2VzdCA9IHJlcXVpcmUoICdjb21wb25lbnQtY2xvc2VzdCcgKTtcblxudmFyIGdldElkT2ZDYWxsYmFjayA9IHJlcXVpcmUoICcuL2dldC1jYWxsYmFjay1pZCcgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3cmFwQ2FsbGJhY2soIGVsZSwgY2FsbGJhY2ssIG5zLCBzZWxlY3RvciApIHtcbiAgdmFyIGZuID0gZnVuY3Rpb24gKCBlICkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgaWYgKCAhc2VsZWN0b3IgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoIGVsZSwgYXJncyApO1xuICAgIH1cblxuICAgIHZhciBjbG9zZXN0RWxlID0gY2xvc2VzdCggZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LCBzZWxlY3RvciwgZWxlICk7XG5cbiAgICBpZiAoIGNsb3Nlc3RFbGUgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoIGNsb3Nlc3RFbGUsIGFyZ3MgKTtcbiAgICB9XG4gIH07XG5cbiAgZ2V0SWRPZkNhbGxiYWNrKCBmbiApO1xuXG4gIGZuLnhOUyA9IG5zO1xuXG4gIGZuLmNhbGxiYWNrSWQgPSBnZXRJZE9mQ2FsbGJhY2soIGNhbGxiYWNrICk7XG5cbiAgcmV0dXJuIGZuO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gb247XG5tb2R1bGUuZXhwb3J0cy5vbiA9IG9uO1xubW9kdWxlLmV4cG9ydHMub2ZmID0gb2ZmO1xuXG5mdW5jdGlvbiBvbiAoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG4gICFlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgKGV2ZW50ID0gJ29uJyArIGV2ZW50KTtcbiAgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciB8fCBlbGVtZW50LmF0dGFjaEV2ZW50KS5jYWxsKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgY2FwdHVyZSk7XG4gIHJldHVybiBjYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gb2ZmIChlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcbiAgIWVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiAoZXZlbnQgPSAnb24nICsgZXZlbnQpO1xuICAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyIHx8IGVsZW1lbnQuZGV0YWNoRXZlbnQpLmNhbGwoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrLCBjYXB0dXJlKTtcbiAgcmV0dXJuIGNhbGxiYWNrO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBvbmU7XG5tb2R1bGUuZXhwb3J0cy5hbGwgPSBhbGw7XG5cbmZ1bmN0aW9uIG9uZSAoc2VsZWN0b3IsIHBhcmVudCkge1xuICBwYXJlbnQgfHwgKHBhcmVudCA9IGRvY3VtZW50KTtcbiAgcmV0dXJuIHBhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gYWxsIChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHBhcmVudCB8fCAocGFyZW50ID0gZG9jdW1lbnQpO1xuICB2YXIgc2VsZWN0aW9uID0gcGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICByZXR1cm4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHNlbGVjdGlvbik7XG59XG4iLCJ2YXIgdG9DYW1lbENhc2UgPSByZXF1aXJlKCd0by1jYW1lbC1jYXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGU7XG5cbmZ1bmN0aW9uIGFsbChlbGVtZW50LCBjc3MpIHtcbiAgdmFyIG5hbWU7XG4gIGZvciAoIG5hbWUgaW4gY3NzICkge1xuICAgIG9uZShlbGVtZW50LCBuYW1lLCBjc3NbbmFtZV0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uZShlbGVtZW50LCBuYW1lLCB2YWx1ZSkge1xuICBlbGVtZW50LnN0eWxlW3RvQ2FtZWxDYXNlKChuYW1lID09ICdmbG9hdCcpID8gJ2Nzc0Zsb2F0JyA6IG5hbWUpXSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBzdHlsZShlbGVtZW50KSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDMpIHtcbiAgICByZXR1cm4gb25lKGVsZW1lbnQsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgfVxuXG4gIHJldHVybiBhbGwoZWxlbWVudCwgYXJndW1lbnRzWzFdKTtcbn1cbiIsInZhciBuZXdFbGVtZW50ID0gcmVxdWlyZShcIi4vbmV3LWVsZW1lbnRcIik7XG52YXIgc2VsZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogd2l0aENoaWxkcmVuKGFkZCksXG4gIGFkZEFmdGVyOiB3aXRoQ2hpbGRyZW4oYWRkQWZ0ZXIpLFxuICBhZGRCZWZvcmU6IHdpdGhDaGlsZHJlbihhZGRCZWZvcmUpLFxuICBpbnNlcnQ6IGluc2VydCxcbiAgcmVwbGFjZTogcmVwbGFjZSxcbiAgcmVtb3ZlOiByZW1vdmVcbn07XG5cbmZ1bmN0aW9uIGFkZCAocGFyZW50LCBjaGlsZCwgdmFycykge1xuICBzZWxlY3QocGFyZW50KS5hcHBlbmRDaGlsZChuZXdFbGVtZW50KGNoaWxkLCB2YXJzKSk7XG59XG5cbmZ1bmN0aW9uIGFkZEFmdGVyIChwYXJlbnQsIGNoaWxkLypbLCB2YXJzXSwgcmVmZXJlbmNlICovKSB7XG4gIHZhciByZWYgPSBzZWxlY3QoYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSwgcGFyZW50KS5uZXh0U2libGluZztcbiAgdmFyIHZhcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcblxuICBpZiAocmVmID09IG51bGwpIHtcbiAgICByZXR1cm4gYWRkKHBhcmVudCwgY2hpbGQsIHZhcnMpO1xuICB9XG5cbiAgYWRkQmVmb3JlKHBhcmVudCwgY2hpbGQsIHZhcnMsIHJlZik7XG59XG5cbmZ1bmN0aW9uIGFkZEJlZm9yZSAocGFyZW50LCBjaGlsZC8qWywgdmFyc10sIHJlZmVyZW5jZSAqLykge1xuICB2YXIgcmVmID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgdmFyIHZhcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcbiAgc2VsZWN0KHBhcmVudCkuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQoY2hpbGQsIHZhcnMpLCBzZWxlY3QocmVmLCBwYXJlbnQpKTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0IChlbGVtZW50IC8qWyx2YXJzXSwgcGFyZW50ICovKSB7XG4gIHZhciBwYXJlbnQgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICB2YXIgdmFycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuXG4gIGFkZChzZWxlY3QocGFyZW50KSwgZWxlbWVudCwgdmFycyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UgKHBhcmVudCwgdGFyZ2V0LCByZXBsLCB2YXJzKSB7XG4gIHNlbGVjdChwYXJlbnQpLnJlcGxhY2VDaGlsZChzZWxlY3QobmV3RWxlbWVudChyZXBsLCB2YXJzKSksIHNlbGVjdCh0YXJnZXQsIHBhcmVudCkpO1xufVxuXG5mdW5jdGlvbiByZW1vdmUgKGVsZW1lbnQsIGNoaWxkKSB7XG4gIHZhciBpLCBhbGw7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiB0eXBlb2YgZWxlbWVudCAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cblxuICBhbGwgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IHNlbGVjdC5hbGwoY2hpbGQsIGVsZW1lbnQpIDogc2VsZWN0LmFsbChlbGVtZW50KTtcbiAgaSA9IGFsbC5sZW5ndGg7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIGFsbFtpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGFsbFtpXSk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiB3aXRoQ2hpbGRyZW4gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoXywgY2hpbGRyZW4pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSBjaGlsZHJlbiA9IFtjaGlsZHJlbl07XG5cbiAgICB2YXIgaSA9IC0xO1xuICAgIHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGg7XG4gICAgdmFyIHBhcmFtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICBwYXJhbXNbMV0gPSBjaGlsZHJlbltpXTtcbiAgICAgIGZuLmFwcGx5KHVuZGVmaW5lZCwgcGFyYW1zKTtcbiAgICB9XG4gIH07XG59XG4iLCJ2YXIgbmV3RWxlbWVudCA9IHJlcXVpcmUoXCJuZXctZWxlbWVudFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpZk5lY2Vzc2FyeTtcblxuZnVuY3Rpb24gaWZOZWNlc3NhcnkgKGh0bWwsIHZhcnMpIHtcbiAgaWYgKCFpc0hUTUwoaHRtbCkpIHJldHVybiBodG1sO1xuICByZXR1cm4gbmV3RWxlbWVudChodG1sLCB2YXJzKTtcbn1cblxuZnVuY3Rpb24gaXNIVE1MKHRleHQpe1xuICByZXR1cm4gdHlwZW9mIHRleHQgPT0gJ3N0cmluZycgJiYgdGV4dC5jaGFyQXQoMCkgPT0gJzwnO1xufVxuIiwidmFyIHF3ZXJ5ID0gcmVxdWlyZShcInF3ZXJ5XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25lOiBvbmUsXG4gIGFsbDogYWxsXG59O1xuXG5mdW5jdGlvbiBhbGwgKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgcmV0dXJuIHF3ZXJ5KHNlbGVjdG9yLCBwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBvbmUgKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgcmV0dXJuIGFsbChzZWxlY3RvciwgcGFyZW50KVswXTtcbn1cbiIsInZhciBmYWxsYmFjayA9IHJlcXVpcmUoJy4vZmFsbGJhY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvbmU7XG5tb2R1bGUuZXhwb3J0cy5hbGwgPSBhbGw7XG5cbmZ1bmN0aW9uIG9uZSAoc2VsZWN0b3IsIHBhcmVudCkge1xuICBwYXJlbnQgfHwgKHBhcmVudCA9IGRvY3VtZW50KTtcblxuICBpZiAocGFyZW50LnF1ZXJ5U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIGZhbGxiYWNrLm9uZShzZWxlY3RvciwgcGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYWxsIChzZWxlY3RvciwgcGFyZW50KSB7XG4gIHBhcmVudCB8fCAocGFyZW50ID0gZG9jdW1lbnQpO1xuXG4gIGlmIChwYXJlbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIHJldHVybiBwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH1cblxuICByZXR1cm4gZmFsbGJhY2suYWxsKHNlbGVjdG9yLCBwYXJlbnQpO1xufVxuIiwidmFyIGRvbWlmeSA9IHJlcXVpcmUoXCJkb21pZnlcIik7XG52YXIgZm9ybWF0ID0gcmVxdWlyZShcImZvcm1hdC10ZXh0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ld0VsZW1lbnQ7XG5cbmZ1bmN0aW9uIG5ld0VsZW1lbnQgKGh0bWwsIHZhcnMpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkgcmV0dXJuIGRvbWlmeShodG1sKTtcbiAgcmV0dXJuIGRvbWlmeShmb3JtYXQoaHRtbCwgdmFycykpO1xufVxuIiwidmFyIHNlbGVjdCA9IHJlcXVpcmUoJ2RvbS1zZWxlY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpZk5lY2Vzc2FyeTtcbm1vZHVsZS5leHBvcnRzLmFsbCA9IGlmTmVjZXNzYXJ5QWxsO1xuXG5mdW5jdGlvbiBpZk5lY2Vzc2FyeSAoY2hpbGQsIHBhcmVudCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHtcbiAgICBjaGlsZCA9IGNoaWxkWzBdO1xuICB9XG5cbiAgaWYgKCB0eXBlb2YgY2hpbGQgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY2hpbGQ7XG4gIH1cblxuICBpZiAodHlwZW9mIHBhcmVudCA9PSAnc3RyaW5nJykge1xuICAgIHBhcmVudCA9IHNlbGVjdChwYXJlbnQsIGRvY3VtZW50KTtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3QoY2hpbGQsIHBhcmVudCk7XG59XG5cbmZ1bmN0aW9uIGlmTmVjZXNzYXJ5QWxsIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkge1xuICAgIGNoaWxkID0gY2hpbGRbMF07XG4gIH1cblxuICBpZiAoIHR5cGVvZiBjaGlsZCAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiBbY2hpbGRdO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwYXJlbnQgPT0gJ3N0cmluZycpIHtcbiAgICBwYXJlbnQgPSBzZWxlY3QocGFyZW50LCBkb2N1bWVudCk7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0LmFsbChjaGlsZCwgcGFyZW50KTtcbn1cbiIsIlxuLyoqXG4gKiBTZXQgb3IgZ2V0IGBlbGAncycgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgdmFsKXtcbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNldChlbCwgdmFsKTtcbiAgcmV0dXJuIGdldChlbCk7XG59O1xuXG4vKipcbiAqIEdldCBgZWxgJ3MgdmFsdWUuXG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsKSB7XG4gIHN3aXRjaCAodHlwZShlbCkpIHtcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgY2FzZSAncmFkaW8nOlxuICAgICAgaWYgKGVsLmNoZWNrZWQpIHtcbiAgICAgICAgdmFyIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIHJldHVybiBudWxsID09IGF0dHIgPyB0cnVlIDogYXR0cjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIGlmIChyYWRpby5jaGVja2VkKSByZXR1cm4gcmFkaW8udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIG9wdGlvbjsgb3B0aW9uID0gZWwub3B0aW9uc1tpXTsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQpIHJldHVybiBvcHRpb24udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGVsLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGBlbGAncyB2YWx1ZS5cbiAqL1xuXG5mdW5jdGlvbiBzZXQoZWwsIHZhbCkge1xuICBzd2l0Y2ggKHR5cGUoZWwpKSB7XG4gICAgY2FzZSAnY2hlY2tib3gnOlxuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PT0gdmFsO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvcHRpb247IG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07IGkrKykge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBvcHRpb24udmFsdWUgPT09IHZhbDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBlbC52YWx1ZSA9IHZhbDtcbiAgfVxufVxuXG4vKipcbiAqIEVsZW1lbnQgdHlwZS5cbiAqL1xuXG5mdW5jdGlvbiB0eXBlKGVsKSB7XG4gIHZhciBncm91cCA9ICdhcnJheScgPT0gdHlwZU9mKGVsKSB8fCAnb2JqZWN0JyA9PSB0eXBlT2YoZWwpO1xuICBpZiAoZ3JvdXApIGVsID0gZWxbMF07XG4gIHZhciBuYW1lID0gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgdmFyIHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcblxuICBpZiAoZ3JvdXAgJiYgdHlwZSAmJiAncmFkaW8nID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdyYWRpb2dyb3VwJztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdjaGVja2JveCcgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ2NoZWNrYm94JztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdyYWRpbycgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ3JhZGlvJztcbiAgaWYgKCdzZWxlY3QnID09IG5hbWUpIHJldHVybiAnc2VsZWN0JztcbiAgcmV0dXJuIG5hbWU7XG59XG5cbmZ1bmN0aW9uIHR5cGVPZih2YWwpIHtcbiAgc3dpdGNoIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IEVycm9yXSc6IHJldHVybiAnZXJyb3InO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgIT09IHZhbCkgcmV0dXJuICduYW4nO1xuICBpZiAodmFsICYmIHZhbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuICdlbGVtZW50JztcblxuICB2YWwgPSB2YWwudmFsdWVPZlxuICAgID8gdmFsLnZhbHVlT2YoKVxuICAgIDogT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHZhbClcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHBhcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIG9wdGlvbjogWzEsICc8c2VsZWN0IG11bHRpcGxlPVwibXVsdGlwbGVcIj4nLCAnPC9zZWxlY3Q+J10sXG4gIG9wdGdyb3VwOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdGhlYWQ6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0Ym9keTogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRmb290OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgY29sZ3JvdXA6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjYXB0aW9uOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICB0ZDogWzMsICc8dGFibGU+PHRib2R5Pjx0cj4nLCAnPC90cj48L3Rib2R5PjwvdGFibGU+J10sXG4gIHRoOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgX2RlZmF1bHQ6IFswLCAnJywgJyddXG59O1xuXG4vKipcbiAqIFBhcnNlIGBodG1sYCBhbmQgcmV0dXJuIHRoZSBjaGlsZHJlbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sKSB7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgaHRtbCkgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RyaW5nIGV4cGVjdGVkJyk7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnRzIHdlcmUgZ2VuZXJhdGVkLicpO1xuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbC5pbm5lckhUTUwgPSBwcmVmaXggKyBodG1sICsgc3VmZml4O1xuICB3aGlsZSAoZGVwdGgtLSkgZWwgPSBlbC5sYXN0Q2hpbGQ7XG5cbiAgdmFyIGVscyA9IGVsLmNoaWxkcmVuO1xuICBpZiAoMSA9PSBlbHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsc1swXSk7XG4gIH1cblxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbHMubGVuZ3RoKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCJ2YXIgbmV3RWxlbWVudCA9IHJlcXVpcmUoXCJuZXctZWxlbWVudFwiKTtcbnZhciBzZWxlY3QgPSByZXF1aXJlKFwiLi9saWIvc2VsZWN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGVjdDtcbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcblxuZnVuY3Rpb24gY3JlYXRlICh0YWcpIHtcbiAgaWYgKHRhZy5jaGFyQXQoMCkgPT0gJzwnKSB7IC8vIGh0bWxcbiAgICByZXR1cm4gc2VsZWN0KG5ld0VsZW1lbnQodGFnKSk7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGF0dHI7XG5cbmZ1bmN0aW9uIGF0dHIgKGNoYWluKSB7XG4gIHJldHVybiBmdW5jdGlvbiBhdHRyIChlbGVtZW50LCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG5cbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gY2hhaW47XG4gIH07XG59XG4iLCJ2YXIgZXZlbnRzID0gcmVxdWlyZShcImRvbS1ldmVudFwiKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoXCJjb21wb25lbnQtZGVsZWdhdGVcIik7XG52YXIga2V5RXZlbnQgPSByZXF1aXJlKFwia2V5LWV2ZW50XCIpO1xudmFyIHRyaW0gPSByZXF1aXJlKFwidHJpbVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNoYW5nZTogc2hvcnRjdXQoJ2NoYW5nZScpLFxuICBjbGljazogc2hvcnRjdXQoJ2NsaWNrJyksXG4gIGtleWRvd246IHNob3J0Y3V0KCdrZXlkb3duJyksXG4gIGtleXVwOiBzaG9ydGN1dCgna2V5dXAnKSxcbiAga2V5cHJlc3M6IHNob3J0Y3V0KCdrZXlwcmVzcycpLFxuICBtb3VzZWRvd246IHNob3J0Y3V0KCdtb3VzZWRvd24nKSxcbiAgbW91c2VvdmVyOiBzaG9ydGN1dCgnbW91c2VvdmVyJyksXG4gIG1vdXNldXA6IHNob3J0Y3V0KCdtb3VzZXVwJyksXG4gIHJlc2l6ZTogc2hvcnRjdXQoJ3Jlc2l6ZScpLFxuICBvbjogb24sXG4gIG9mZjogb2ZmLFxuICBvbktleTogb25LZXksXG4gIG9mZktleTogb2ZmS2V5XG59O1xuXG5mdW5jdGlvbiBzaG9ydGN1dCAodHlwZSl7XG4gIHJldHVybiBmdW5jdGlvbihlbGVtZW50LCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIG9uKGVsZW1lbnQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb2ZmIChlbGVtZW50LCBldmVudCwgc2VsZWN0b3IsIGNhbGxiYWNrKXtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCkge1xuICAgIHJldHVybiBkZWxlZ2F0ZS51bmJpbmQoZWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50LCBjYWxsYmFjayk7XG4gIH1cblxuICBjYWxsYmFjayA9IHNlbGVjdG9yO1xuXG4gIGV2ZW50cy5vZmYoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gb24gKGVsZW1lbnQsIGV2ZW50LCBzZWxlY3RvciwgY2FsbGJhY2spe1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgY2FsbGJhY2sgPSBzZWxlY3RvcjtcbiAgfVxuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQpIHtcbiAgICByZXR1cm4gZGVsZWdhdGUuYmluZChlbGVtZW50LCBzZWxlY3RvciwgZXZlbnQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGV2ZW50cy5vbihlbGVtZW50LCBldmVudCwgY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBvbktleSAoZWxlbWVudCwga2V5LCBjYWxsYmFjaykge1xuICBrZXlFdmVudC5vbihlbGVtZW50LCBrZXksIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gb2ZmS2V5IChlbGVtZW50LCBrZXksIGNhbGxiYWNrKSB7XG4gIGtleUV2ZW50Lm9mZihlbGVtZW50LCBrZXksIGNhbGxiYWNrKTtcbn1cbiIsInZhciBmb3JtYXQgPSByZXF1aXJlKCdmb3JtYXQtdGV4dCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGh0bWw7XG5cbmZ1bmN0aW9uIGh0bWwgKGNoYWluKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgbmV3VmFsdWUsIHZhcnMpe1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IGZvcm1hdChuZXdWYWx1ZSwgdmFycykgOiBuZXdWYWx1ZTtcbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUw7XG4gIH07XG59XG4iLCJ2YXIgbmV3Q2hhaW4gPSByZXF1aXJlKFwibmV3LWNoYWluXCIpO1xudmFyIGZvcm1hdCA9IHJlcXVpcmUoJ2Zvcm1hdC10ZXh0Jyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJ2RvbS1jbGFzc2VzJyk7XG52YXIgdHJlZSA9IHJlcXVpcmUoJ2RvbS10cmVlJyk7XG52YXIgbmV3RWxlbWVudCA9IHJlcXVpcmUoJ25ldy1lbGVtZW50Jyk7XG52YXIgc2VsZWN0RE9NID0gcmVxdWlyZSgnZG9tLXNlbGVjdCcpLmFsbDtcbnZhciBzdHlsZSA9IHJlcXVpcmUoJ2RvbS1zdHlsZScpO1xudmFyIGNsb3Nlc3QgPSByZXF1aXJlKFwiZGlzY29yZS1jbG9zZXN0XCIpO1xudmFyIHNpYmxpbmdzID0gcmVxdWlyZShcInNpYmxpbmdzXCIpO1xuXG52YXIgYXR0ciA9IHJlcXVpcmUoJy4vYXR0cicpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpO1xudmFyIHRleHQgPSByZXF1aXJlKCcuL3RleHQnKTtcbnZhciB2YWx1ZSA9IHJlcXVpcmUoJy4vdmFsdWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxlY3Q7XG5cbmZ1bmN0aW9uIHNob3coZSkge1xuICBzdHlsZShlLCAnZGlzcGxheScsICcnKVxufVxuXG5mdW5jdGlvbiBoaWRlKGUpIHtcbiAgc3R5bGUoZSwgJ2Rpc3BsYXknLCAnbm9uZScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdCAocXVlcnkpIHtcbiAgdmFyIGtleSwgY2hhaW4sIG1ldGhvZHMsIGVsZW1lbnRzO1xuICB2YXIgdGFzaztcblxuICBpZiAodHlwZW9mIHF1ZXJ5ID09ICdzdHJpbmcnICYmIHF1ZXJ5LmNoYXJBdCgwKSA9PSAnPCcpIHtcbiAgICAvLyBDcmVhdGUgbmV3IGVsZW1lbnQgZnJvbSBgcXVlcnlgXG4gICAgZWxlbWVudHMgPSBbbmV3RWxlbWVudChxdWVyeSwgYXJndW1lbnRzWzFdKV07XG4gIH0gZWxzZSBpZiAodHlwZW9mIHF1ZXJ5ID09ICdzdHJpbmcnKSB7XG4gICAgLy8gU2VsZWN0IGdpdmVuIENTUyBxdWVyeVxuICAgIGVsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoc2VsZWN0RE9NKHF1ZXJ5LCBhcmd1bWVudHNbMV0pKTtcbiAgfSBlbHNlIGlmIChxdWVyeSA9PSBkb2N1bWVudCkge1xuICAgIGVsZW1lbnRzID0gW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF07XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxICYmIEFycmF5LmlzQXJyYXkoYXJndW1lbnRzWzBdKSkge1xuICAgIGVsZW1lbnRzID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGVsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgfVxuXG4gIG1ldGhvZHMgPSB7XG4gICAgYWRkQ2xhc3M6IGFwcGx5RWFjaEVsZW1lbnQoY2xhc3Nlcy5hZGQsIGVsZW1lbnRzKSxcbiAgICByZW1vdmVDbGFzczogYXBwbHlFYWNoRWxlbWVudChjbGFzc2VzLnJlbW92ZSwgZWxlbWVudHMpLFxuICAgIHRvZ2dsZUNsYXNzOiBhcHBseUVhY2hFbGVtZW50KGNsYXNzZXMudG9nZ2xlLCBlbGVtZW50cyksXG4gICAgc2hvdzogYXBwbHlFYWNoRWxlbWVudChzaG93LCBlbGVtZW50cyksXG4gICAgaGlkZTogYXBwbHlFYWNoRWxlbWVudChoaWRlLCBlbGVtZW50cyksXG4gICAgc3R5bGU6IGFwcGx5RWFjaEVsZW1lbnQoc3R5bGUsIGVsZW1lbnRzKVxuICB9O1xuXG4gIGZvciAoa2V5IGluIGV2ZW50cykge1xuICAgIG1ldGhvZHNba2V5XSA9IGFwcGx5RWFjaEVsZW1lbnQoZXZlbnRzW2tleV0sIGVsZW1lbnRzKTtcbiAgfVxuXG4gIGZvciAoa2V5IGluIHRyZWUpIHtcbiAgICBtZXRob2RzW2tleV0gPSBhcHBseUVhY2hFbGVtZW50KHRyZWVba2V5XSwgZWxlbWVudHMpO1xuICB9XG5cbiAgY2hhaW4gPSBuZXdDaGFpbi5mcm9tKGVsZW1lbnRzKShtZXRob2RzKTtcblxuICBjaGFpbi5hdHRyID0gYXBwbHlFYWNoRWxlbWVudChhdHRyKGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi5jbGFzc2VzID0gYXBwbHlFYWNoRWxlbWVudChjbGFzc2VzLCBlbGVtZW50cyk7XG4gIGNoYWluLmhhc0NsYXNzID0gYXBwbHlFYWNoRWxlbWVudChjbGFzc2VzLmhhcywgZWxlbWVudHMpLFxuICBjaGFpbi5odG1sID0gYXBwbHlFYWNoRWxlbWVudChodG1sKGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi50ZXh0ID0gYXBwbHlFYWNoRWxlbWVudCh0ZXh0KGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi52YWwgPSBhcHBseUVhY2hFbGVtZW50KHZhbHVlKGNoYWluKSwgZWxlbWVudHMpO1xuICBjaGFpbi52YWx1ZSA9IGFwcGx5RWFjaEVsZW1lbnQodmFsdWUoY2hhaW4pLCBlbGVtZW50cyk7XG4gIGNoYWluLnBhcmVudCA9IHNlbGVjdEVhY2hFbGVtZW50KHBhcmVudCwgZWxlbWVudHMpO1xuICBjaGFpbi5zZWxlY3QgPSBzZWxlY3RFYWNoRWxlbWVudChzZWxlY3RDaGlsZCwgZWxlbWVudHMpO1xuICBjaGFpbi5zaWJsaW5ncyA9IHNlbGVjdEVhY2hFbGVtZW50KHNpYmxpbmdzLCBlbGVtZW50cyk7XG5cbiAgcmV0dXJuIGNoYWluO1xufVxuXG5mdW5jdGlvbiBwYXJlbnQgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gIGlmICghc2VsZWN0b3IpIHJldHVybiBlbGVtZW50LnBhcmVudE5vZGU7XG4gIHJldHVybiBjbG9zZXN0KGVsZW1lbnQsIHNlbGVjdG9yKTtcbn07XG5cbmZ1bmN0aW9uIHNlbGVjdENoaWxkIChlbGVtZW50LCBxdWVyeSkge1xuICByZXR1cm4gc2VsZWN0KHF1ZXJ5LCBlbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlFYWNoRWxlbWVudCAoZm4sIGVsZW1lbnRzKSB7XG4gIGlmICghZm4pIHRocm93IG5ldyBFcnJvcignVW5kZWZpbmVkIGZ1bmN0aW9uLicpO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGksIGxlbiwgcmV0LCBwYXJhbXMsIHJldDtcblxuICAgIGxlbiA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICBpID0gLTE7XG4gICAgcGFyYW1zID0gW3VuZGVmaW5lZF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXG4gICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgcGFyYW1zWzBdID0gZWxlbWVudHNbaV07XG4gICAgICByZXQgPSBmbi5hcHBseSh1bmRlZmluZWQsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0RWFjaEVsZW1lbnQgKGZuLCBlbHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIHBhcmFtcyA9IFt1bmRlZmluZWRdLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblxuICAgIHZhciBsZW4gPSBlbHMubGVuZ3RoO1xuICAgIHZhciBpID0gLTE7XG4gICAgdmFyIHJldDtcbiAgICB2YXIgdDtcbiAgICB2YXIgdGxlbjtcblxuICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgIHBhcmFtc1swXSA9IGVsc1tpXTtcbiAgICAgIHJldCA9IGZuLmFwcGx5KHVuZGVmaW5lZCwgcGFyYW1zKTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmV0KSkge1xuICAgICAgICB0bGVuID0gcmV0Lmxlbmd0aDtcbiAgICAgICAgdCA9IC0xO1xuXG4gICAgICAgIHdoaWxlICgrK3QgPCB0bGVuKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKHJldFt0XSkgIT0gLTEpIGNvbnRpbnVlO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHJldFt0XSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXQpIGNvbnRpbnVlO1xuICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKHJldCkgIT0gLTEpIGNvbnRpbnVlO1xuXG4gICAgICByZXN1bHQucHVzaChyZXQpO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHNlbGVjdChyZXN1bHQpO1xuICB9O1xufVxuIiwidmFyIGZvcm1hdCA9IHJlcXVpcmUoJ2Zvcm1hdC10ZXh0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGV4dDtcblxuZnVuY3Rpb24gdGV4dCAoY2hhaW4pe1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQsIG5ld1ZhbHVlLCB2YXJzKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBmb3JtYXQobmV3VmFsdWUsIHZhcnMpIDogbmV3VmFsdWU7XG4gICAgICByZXR1cm4gY2hhaW47XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gIH07XG59XG4iLCJ2YXIgdmFsdWUgPSByZXF1aXJlKFwiZG9tLXZhbHVlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpdGhDaGFpbjtcblxuZnVuY3Rpb24gd2l0aENoYWluIChjaGFpbikge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsLCB1cGRhdGUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICB2YWx1ZShlbCwgdXBkYXRlKTtcbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWUoZWwpO1xuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZvcm1hdDtcblxuZnVuY3Rpb24gZm9ybWF0KHRleHQpIHtcbiAgdmFyIGNvbnRleHQ7XG5cbiAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT0gJ29iamVjdCcgJiYgYXJndW1lbnRzWzFdKSB7XG4gICAgY29udGV4dCA9IGFyZ3VtZW50c1sxXTtcbiAgfSBlbHNlIHtcbiAgICBjb250ZXh0ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodGV4dCkucmVwbGFjZSgvXFx7P1xceyhbXlxce1xcfV0rKVxcfVxcfT8vZywgcmVwbGFjZShjb250ZXh0KSk7XG59O1xuXG5mdW5jdGlvbiByZXBsYWNlIChjb250ZXh0LCBuaWwpe1xuICByZXR1cm4gZnVuY3Rpb24gKHRhZywgbmFtZSkge1xuICAgIGlmICh0YWcuc3Vic3RyaW5nKDAsIDIpID09ICd7eycgJiYgdGFnLnN1YnN0cmluZyh0YWcubGVuZ3RoIC0gMikgPT0gJ319Jykge1xuICAgICAgcmV0dXJuICd7JyArIG5hbWUgKyAnfSc7XG4gICAgfVxuXG4gICAgaWYgKCFjb250ZXh0Lmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGFnO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29udGV4dFtuYW1lXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gY29udGV4dFtuYW1lXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZXh0W25hbWVdO1xuICB9XG59XG4iLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwiXG52YXIgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICBpZiAoaW5kZXhPZikgcmV0dXJuIGFyci5pbmRleE9mKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59OyIsInZhciBrZXluYW1lT2YgPSByZXF1aXJlKFwia2V5bmFtZS1vZlwiKTtcbnZhciBldmVudHMgPSByZXF1aXJlKFwiZG9tLWV2ZW50XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9uO1xubW9kdWxlLmV4cG9ydHMub24gPSBvbjtcbm1vZHVsZS5leHBvcnRzLm9mZiA9IG9mZjtcblxuZnVuY3Rpb24gb24gKGVsZW1lbnQsIGtleXMsIGNhbGxiYWNrKSB7XG4gIHZhciBleHBlY3RlZCA9IHBhcnNlKGtleXMpO1xuXG4gIHZhciBmbiA9IGV2ZW50cy5vbihlbGVtZW50LCAna2V5dXAnLCBmdW5jdGlvbihldmVudCl7XG5cbiAgICBpZiAoKGV2ZW50LmN0cmxLZXkgfHwgdW5kZWZpbmVkKSA9PSBleHBlY3RlZC5jdHJsICYmXG4gICAgICAgKGV2ZW50LmFsdEtleSB8fCB1bmRlZmluZWQpID09IGV4cGVjdGVkLmFsdCAmJlxuICAgICAgIChldmVudC5zaGlmdEtleSB8fCB1bmRlZmluZWQpID09IGV4cGVjdGVkLnNoaWZ0ICYmXG4gICAgICAga2V5bmFtZU9mKGV2ZW50LmtleUNvZGUpID09IGV4cGVjdGVkLmtleSl7XG5cbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcbiAgICB9XG5cbiAgfSk7XG5cblxuICBjYWxsYmFja1snY2ItJyArIGtleXNdID0gZm47XG5cbiAgcmV0dXJuIGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBvZmYgKGVsZW1lbnQsIGtleXMsIGNhbGxiYWNrKSB7XG4gIGV2ZW50cy5vZmYoZWxlbWVudCwgJ2tleXVwJywgY2FsbGJhY2tbJ2NiLScgKyBrZXlzXSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlIChrZXlzKXtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBrZXlzID0ga2V5cy5zcGxpdCgvW15cXHddKy8pO1xuXG4gIHZhciBpID0ga2V5cy5sZW5ndGgsIG5hbWU7XG4gIHdoaWxlICggaSAtLSApe1xuICAgIG5hbWUgPSBrZXlzW2ldLnRyaW0oKTtcblxuICAgIGlmKG5hbWUgPT0gJ2N0cmwnKSB7XG4gICAgICByZXN1bHQuY3RybCA9IHRydWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZihuYW1lID09ICdhbHQnKSB7XG4gICAgICByZXN1bHQuYWx0ID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmKG5hbWUgPT0gJ3NoaWZ0Jykge1xuICAgICAgcmVzdWx0LnNoaWZ0ID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc3VsdC5rZXkgPSBuYW1lLnRyaW0oKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCJ2YXIgbWFwID0gcmVxdWlyZShcImtleW5hbWVzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGtleW5hbWVPZjtcblxuZnVuY3Rpb24ga2V5bmFtZU9mIChuKSB7XG4gICByZXR1cm4gbWFwW25dIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUobikudG9Mb3dlckNhc2UoKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICA4ICAgOiAnYmFja3NwYWNlJyxcbiAgOSAgIDogJ3RhYicsXG4gIDEzICA6ICdlbnRlcicsXG4gIDE2ICA6ICdzaGlmdCcsXG4gIDE3ICA6ICdjdHJsJyxcbiAgMTggIDogJ2FsdCcsXG4gIDIwICA6ICdjYXBzbG9jaycsXG4gIDI3ICA6ICdlc2MnLFxuICAzMiAgOiAnc3BhY2UnLFxuICAzMyAgOiAncGFnZXVwJyxcbiAgMzQgIDogJ3BhZ2Vkb3duJyxcbiAgMzUgIDogJ2VuZCcsXG4gIDM2ICA6ICdob21lJyxcbiAgMzcgIDogJ2xlZnQnLFxuICAzOCAgOiAndXAnLFxuICAzOSAgOiAncmlnaHQnLFxuICA0MCAgOiAnZG93bicsXG4gIDQ1ICA6ICdpbnMnLFxuICA0NiAgOiAnZGVsJyxcbiAgOTEgIDogJ21ldGEnLFxuICA5MyAgOiAnbWV0YScsXG4gIDIyNCA6ICdtZXRhJ1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG52YXIgdmVuZG9yID0gcHJvdG8ubWF0Y2hlc1xuICB8fCBwcm90by5tYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLm1vek1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tc01hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5vTWF0Y2hlc1NlbGVjdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1hdGNoO1xuXG4vKipcbiAqIE1hdGNoIGBlbGAgdG8gYHNlbGVjdG9yYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIG1hdGNoKGVsLCBzZWxlY3Rvcikge1xuICBpZiAodmVuZG9yKSByZXR1cm4gdmVuZG9yLmNhbGwoZWwsIHNlbGVjdG9yKTtcbiAgdmFyIG5vZGVzID0gZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChub2Rlc1tpXSA9PSBlbCkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbnZhciBFeHRlbmREZWZhdWx0ID0gcmVxdWlyZSgnLi9saWIvZXh0ZW5kX2RlZmF1bHQnKTtcbnZhciBJbWFnZVNsaWRlciA9IHJlcXVpcmUoJy4vbGliL2ltYWdlX3NsaWRlcicpO1xudmFyIFN0cmluZ0FzTm9kZSA9IHJlcXVpcmUoJy4vbGliL3N0cmluZ19hc19ub2RlJyk7XG52YXIgVGVtcGxhdGUgPSByZXF1aXJlKCcuL2xpYi90ZW1wbGF0ZS1lbmdpbmUnKTtcblxuXG52YXIgTW9kYWxibGFuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTW9kYWxibGFuYykpIHtcbiAgICAgIHJldHVybiBuZXcgTW9kYWxibGFuYygpO1xuICAgIH1cblxuICAgIHRoaXMuY2xvc2VCdXR0b24gPSBudWxsO1xuICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgIGFuaW1hdGlvbjogJ2ZhZGUtaW4tb3V0JyxcbiAgICAgICAgY2xvc2VCdXR0b246IHRydWUsXG4gICAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgICBzbGlkZXI6IG51bGwsXG4gICAgICAgIHNpZGVUd286IHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IG51bGwsXG4gICAgICAgICAgICBhbmltYXRpb246IG51bGwsXG4gICAgICAgICAgICBidXR0b246IG51bGwsXG4gICAgICAgICAgICBidXR0b25CYWNrOiBudWxsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHt9O1xuXG4gICAgdGhpcy5oYXNTbGlkZXIgPSB0aGlzLmhhc1NsaWRlciA/IHRydWUgOiBmYWxzZTtcbiAgICB0aGlzLnNsaWRlcklzT3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBFeHRlbmREZWZhdWx0KGRlZmF1bHRzLCBhcmd1bWVudHNbMF0pO1xuICAgIH1cblxufTtcblxuTW9kYWxibGFuYy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNldHRpbmdzLm1vZGFsT3BlbikgcmV0dXJuO1xuXG4gICAgYnVpbGQuY2FsbCh0aGlzKTtcbiAgICBzZXRFdmVudHMuY2FsbCh0aGlzKTtcbn07XG5cbk1vZGFsYmxhbmMucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLm1vZGFsT3BlbikgcmV0dXJuO1xuXG4gICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3ZlcmxheS1tb2RhbC1ibGFuYycpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnaXMtaW5hY3RpdmUnKTtcblxuICAgIHZhciB0cmFuc1ByZWZpeCA9IHRyYW5zaXRpb25QcmVmaXgob3ZlcmxheSk7XG5cbiAgICBvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIodHJhbnNQcmVmaXguZW5kLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgX3RoaXMuc2V0dGluZ3MubW9kYWxPcGVuID0gZmFsc2U7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgZG9jdW1lbnQub25rZXl1cCA9IG51bGw7XG4gICAgZG9jdW1lbnQub25rZXlkb3duID0gbnVsbDtcbn07XG5cbk1vZGFsYmxhbmMucHJvdG90eXBlLnNsaWRlckluaXQgPSBmdW5jdGlvbihzaWRlKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zbGlkZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5oYXNTbGlkZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc1NsaWRlcikge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgdGhpcy5zbGlkZXJJc09wZW4gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2xpZGVyID0gbmV3IEltYWdlU2xpZGVyKHtcbiAgICAgICAgICAgIHBhcmVudDogc2lkZSxcbiAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLm9wdGlvbnMuc2xpZGVyXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbk1vZGFsYmxhbmMucHJvdG90eXBlLl9jb250ZW50TmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmhhc1NsaWRlcikge1xuICAgICAgICB0aGlzLnNsaWRlcklzT3BlbiA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5zbGlkZXIucGxheWluZykgdGhpcy5zbGlkZXIucGF1c2UoKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5tb2RhbENvbnRhaW5lciwgJ3NsaWRlci1tb2RhbCcpO1xuICAgICAgICBhZGRDbGFzcyh0aGlzLm1vZGFsQ29udGFpbmVyLCAnYmlnLW1vZGFsJyk7XG4gICAgfVxuXG4gICAgdmFyIGNhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZCcpLFxuICAgICAgICBjdXN0b21DbGFzcyA9IHRoaXMub3B0aW9ucy5zaWRlVHdvLmFuaW1hdGlvbjtcblxuICAgIGNhcmQuY2xhc3NMaXN0LnJlbW92ZSh0eXBlT2ZBbmltYXRpb24oY3VzdG9tQ2xhc3MsIDIpKTtcbiAgICBjYXJkLmNsYXNzTGlzdC5hZGQodHlwZU9mQW5pbWF0aW9uKGN1c3RvbUNsYXNzKSk7XG59O1xuXG5Nb2RhbGJsYW5jLnByb3RvdHlwZS5fY29udGVudFByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuaGFzU2xpZGVyKSB7XG4gICAgICAgIC8vIGlmICghdGhpcy5zbGlkZXIucGxheWluZykgdGhpcy5zbGlkZXIucGxheSgpO1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLm1vZGFsQ29udGFpbmVyLCAnYmlnLW1vZGFsJyk7XG4gICAgICAgIGFkZENsYXNzKHRoaXMubW9kYWxDb250YWluZXIsICdzbGlkZXItbW9kYWwnKTtcbiAgICB9XG5cbiAgICB2YXIgY2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJkJyksXG4gICAgICAgIGN1c3RvbUNsYXNzID0gdGhpcy5vcHRpb25zLnNpZGVUd28uYW5pbWF0aW9uO1xuXG4gICAgY2FyZC5jbGFzc0xpc3QucmVtb3ZlKHR5cGVPZkFuaW1hdGlvbihjdXN0b21DbGFzcykpO1xuICAgIGNhcmQuY2xhc3NMaXN0LmFkZCh0eXBlT2ZBbmltYXRpb24oY3VzdG9tQ2xhc3MsIDIpKTtcbn07XG5cbk1vZGFsYmxhbmMucHJvdG90eXBlLmNsYXNzRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGVsbSwgY2FsbGJhY2spIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbG0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxtW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiB0eXBlT2ZBbmltYXRpb24odHlwZSwgdHlwZUNsYXNzKSB7XG4gICAgdmFyIGFuaW1hdGlvblR5cGVzID0ge1xuICAgICAgICAgICAgJ3NsaWRlJzogWydzbGlkZS1uZXh0JywgJ3NsaWRlLWJhY2snXSxcbiAgICAgICAgICAgICdzY2FsZSc6IFsnc2NhbGUtbmV4dCcsICdzY2FsZS1iYWNrJ11cbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0aW9uQ2xhc3MgPSBhbmltYXRpb25UeXBlc1t0eXBlXTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodHlwZUNsYXNzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvblR5cGVzLnNsaWRlWzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uVHlwZXMuc2xpZGVbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZUNsYXNzID09PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uQ2xhc3NbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uQ2xhc3NbMF07XG4gICAgICAgIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNpdGlvblByZWZpeChlbG0pIHtcbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgICAgICAnV2Via2l0VHJhbnNpdGlvbicgOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICdNb3pUcmFuc2l0aW9uJyAgICA6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ09UcmFuc2l0aW9uJyAgICAgIDogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ3RyYW5zaXRpb24nICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgfTtcblxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XG4gICAgICBpZiAoZWxtLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRFdmVudHMoKSB7XG4gICAgdmFyIG5leHRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYnV0dG9uLW5leHQnKSxcbiAgICAgICAgcHJldkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1idXR0b24tcHJldicpLFxuICAgICAgICBjbG9zZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbC1mdWxsc2NyZWVuLWNsb3NlJyksXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuY2xhc3NFdmVudExpc3RlbmVyKGNsb3NlZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICBrZXlib2FyZEFjdGlvbnMuY2FsbCh0aGlzKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2lkZVR3by5jb250ZW50ID09PSBudWxsKSByZXR1cm47XG5cbiAgICBuZXh0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY29udGVudE5leHQuYmluZCh0aGlzKSk7XG4gICAgcHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NvbnRlbnRQcmV2aW91cy5iaW5kKHRoaXMpKTtcblxufVxuXG5mdW5jdGlvbiBidWlsZCgpIHtcbiAgICB0aGlzLm1vZGFsQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwtZnVsbHNjcmVlbi1jb250YWluZXInKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlQnV0dG9uKSB0aGlzLmNsb3NlQnV0dG9uID0gJzxzcGFuIGNsYXNzPVwibW9kYWwtZnVsbHNjcmVlbi1jbG9zZVwiPlg8L3NwYW4+JztcblxuICAgIHZhciBjb250ZW50U2lkZU9uZSA9ICF0aGlzLm9wdGlvbnMuc2xpZGVyID8gY29udGVudFR5cGUodGhpcy5vcHRpb25zLmNvbnRlbnQpIDogY29udGVudFR5cGUoJzxkaXYgaWQ9XCJtb2RhbC1zbGlkZXJcIj48L2Rpdj4nKTtcblxuICAgIHZhciB0eXBlTW9kYWwgPSB0aGlzLm9wdGlvbnMuc2xpZGVyID8gJ3NsaWRlci1tb2RhbCcgOiAnYmlnLW1vZGFsJztcbiAgICB2YXIgbW9kYWwgPSAnPGRpdiBpZD1cIm92ZXJsYXktbW9kYWwtYmxhbmNcIiBjbGFzcz1cIm1vZGFsLWZ1bGxzY3JlZW4tYmFja2dyb3VuZCA8JXRoaXMuYW5pbWF0aW9uJT4gPCV0aGlzLnN0YXRlJT5cIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJtb2RhbC1mdWxsc2NyZWVuLWNvbnRhaW5lclwiY2xhc3M9XCJtb2RhbC1mdWxsc2NyZWVuLWNvbnRhaW5lciA8JXRoaXMudHlwZSU+IFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJjYXJkXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZyb250XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwiZnJvbnQtY2FyZFwiIGNsYXNzPVwibW9kYWwtZnVsbHNjcmVlbi1pdGVtXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8JXRoaXMuY2xvc2VCdXR0b24lPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwldGhpcy5jb250ZW50VHlwZVNpZGVPbmUlPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJiYWNrXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2ICBpZD1cImJhY2stY2FyZFwiIGNsYXNzPVwibW9kYWwtZnVsbHNjcmVlbi1pdGVtXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPCV0aGlzLmNsb3NlQnV0dG9uJT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8JXRoaXMuY29udGVudFR5cGVTaWRlVHdvJT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuXG4gICAgdmFyIG1vZGFsVGVtcGxhdGUgPSBUZW1wbGF0ZShtb2RhbCwge1xuICAgICAgICBhbmltYXRpb246IHRoaXMub3B0aW9ucy5hbmltYXRpb24sXG4gICAgICAgIHN0YXRlOiAnaXMtYWN0aXZlJyxcbiAgICAgICAgdHlwZTogdHlwZU1vZGFsLFxuICAgICAgICBjbG9zZUJ1dHRvbjogdGhpcy5jbG9zZUJ1dHRvbixcbiAgICAgICAgY29udGVudFR5cGVTaWRlT25lOiBjb250ZW50U2lkZU9uZSxcbiAgICAgICAgY29udGVudFR5cGVTaWRlVHdvOiBjb250ZW50VHlwZSh0aGlzLm9wdGlvbnMuc2lkZVR3by5jb250ZW50KVxuICAgIH0pO1xuXG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICBtb2RhbElkO1xuXG4gICAgaWYgKGJvZHlbMF0uaWQpIHtcbiAgICAgICAgbW9kYWxJZCA9IGJvZHlbMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbW9kYWxJZCA9ICdnby1tb2RhbCc7XG4gICAgICAgIGJvZHlbMF0uaWQgPSBtb2RhbElkO1xuICAgIH1cblxuICAgIFN0cmluZ0FzTm9kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtb2RhbElkKSwgbW9kYWxUZW1wbGF0ZSk7XG4gICAgdGhpcy5zZXR0aW5ncy5tb2RhbE9wZW4gPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5zbGlkZXIpIHRoaXMuc2xpZGVySW5pdCgnI21vZGFsLXNsaWRlcicpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5zaWRlVHdvLmNvbnRlbnQgPT09IG51bGwpIHJldHVybjtcblxuICAgIGJ1aWxkQnV0dG9uKHRoaXMub3B0aW9ucy5zaWRlVHdvLmJ1dHRvbik7XG4gICAgYnVpbGRCdXR0b24odGhpcy5vcHRpb25zLnNpZGVUd28uYnV0dG9uQmFjaywgJ2JhY2snKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRFbGVtZW50KGJ1aWxkT3B0aW9ucykge1xuICAgIHZhciBjcmVhdGVFbG0sXG4gICAgICAgIHBhcmVudEVsbTtcblxuICAgIGNyZWF0ZUVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYnVpbGRPcHRpb25zLmVsbSk7XG4gICAgY3JlYXRlRWxtLmlkID0gYnVpbGRPcHRpb25zLmJ1dHRvbklkO1xuICAgIGNyZWF0ZUVsbS5pbm5lckhUTUwgPSBidWlsZE9wdGlvbnMuYnV0dG9uVGV4dDtcbiAgICBwYXJlbnRFbG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChidWlsZE9wdGlvbnMucGFyZW50SWQpO1xuXG4gICAgcGFyZW50RWxtLmFwcGVuZENoaWxkKGNyZWF0ZUVsbSk7XG59XG5cblxuZnVuY3Rpb24gYnVpbGRCdXR0b24oZWxtKSB7XG4gICAgdmFyIGJ1dHRvbixcbiAgICAgICAgY29tcHV0ZWRCdXR0b24sXG4gICAgICAgIGNvbXB1dGVkQnV0dG9uQmFjayxcbiAgICAgICAgZnJvbnRDYXJkLFxuICAgICAgICBiYWNrQ2FyZDtcblxuICAgIGlmIChlbG0gPT09IG51bGwgfHwgZWxtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1idXR0b24tbmV4dCcpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1idXR0b24tcHJldicpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWlsZEVsZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVsbTogJ2EnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbklkOiAnbW9kYWwtYnV0dG9uLW5leHQnLFxuICAgICAgICAgICAgICAgIGJ1dHRvblRleHQ6ICdOZXh0IHN0ZXAnLFxuICAgICAgICAgICAgICAgIHBhcmVudElkOiAnZnJvbnQtY2FyZCdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBidWlsZEVsZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVsbTogJ2EnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbklkOiAnbW9kYWwtYnV0dG9uLXByZXYnLFxuICAgICAgICAgICAgICAgIGJ1dHRvblRleHQ6ICdQcmV2aW91cyBzdGVwJyxcbiAgICAgICAgICAgICAgICBwYXJlbnRJZDogJ2JhY2stY2FyZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYnVpbGRFbGVtZW50KHtcbiAgICAgICAgICAgIGVsbTogZWxtLmVsZW1lbnQsXG4gICAgICAgICAgICBidXR0b25JZDogZWxtLmlkLFxuICAgICAgICAgICAgYnV0dG9uVGV4dDogZWxtLnRleHQsXG4gICAgICAgICAgICBwYXJlbnRJZDogZWxtLnBhcmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjb250ZW50VHlwZShjb250ZW50VmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIGNvbnRlbnRWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnRWYWx1ZTtcbiAgICB9IGVsc2UgaWYgKGNvbnRlbnRWYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnRWYWx1ZS5pbm5lckhUTUw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhZGRDbGFzcyhzZWxlY3RvciwgY2xhc3NOYW1lKSB7XG4gICAgc2VsZWN0b3JbMF0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKHNlbGVjdG9yLCBjbGFzc05hbWUpIHtcbiAgICBzZWxlY3RvclswXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSlcbn1cblxuZnVuY3Rpb24ga2V5Ym9hcmRBY3Rpb25zKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBkb2N1bWVudC5vbmtleXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChfdGhpcy5zZXR0aW5ncy5tb2RhbE9wZW4gJiYgZS5rZXlDb2RlID09IDI3KSB7XG4gICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbGJsYW5jO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb3VyY2UsIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgcHJvcGVydHk7XG4gICAgZm9yIChwcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgc291cmNlW3Byb3BlcnR5XSA9IHByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbnZhciBFeHRlbmREZWZhdWx0ID0gcmVxdWlyZSgnLi9leHRlbmRfZGVmYXVsdCcpO1xuXG52YXIgSW1hZ2VTbGlkZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgSW1hZ2VTbGlkZXIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW1hZ2VTbGlkZXIoKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgIHNlbGVjdG9yOiAnLnNsaWRlcycsXG4gICAgICAgIHRyYW5zaXRpb246ICdmYWRlLXNsaWRlJyxcbiAgICAgICAgYXV0b1BsYXk6IGZhbHNlXG4gICAgfTtcblxuICAgIGlmIChhcmd1bWVudHNbMF0gJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gRXh0ZW5kRGVmYXVsdChkZWZhdWx0cywgYXJndW1lbnRzWzBdKTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5jdXJyZW50U2xpZGUgPSAwO1xuICAgIHRoaXMucGxheWluZztcbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5zbGlkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuaW1hZ2Utc2xpZGVyLWhvbGRlciAuaW1hZ2Utc2xpZGVyJyk7XG4gICAgdGhpcy5zZXRTbGlkZSgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSkge1xuICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICB9XG59O1xuXG5JbWFnZVNsaWRlci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNyZWF0ZVNsaWRlcygpO1xuICAgIHNldEV2ZW50cy5jYWxsKHRoaXMpO1xufTtcblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLmNyZWF0ZVNsaWRlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2xpZGVzID0gW107XG4gICAgdmFyIHNsaWRlcyxcbiAgICAgICAgaW1hZ2VzID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xuXG4gICAgaWYgKGltYWdlcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHNsaWRlcyA9IGltYWdlcztcbiAgICB9IGVsc2Uge1xuICAgICAgICBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5zZWxlY3RvciArICcgaW1nJyk7XG4gICAgfVxuXG5cbiAgICB2YXIgcGFyZW50RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0aW9ucy5wYXJlbnQpLFxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgc2xpZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKSxcbiAgICAgICAgc2xpZGVJbWcsXG4gICAgICAgIHNsaWRlckVsbSxcbiAgICAgICAgaW1nRWxtO1xuXG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9ICdpbWFnZS1zbGlkZXItY29udGFpbmVyJztcbiAgICBzbGlkZXIuY2xhc3NOYW1lID0gJ2ltYWdlLXNsaWRlci1ob2xkZXInO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNsaWRlc1tpXS5zcmMpIHtcbiAgICAgICAgICAgIHNsaWRlSW1nID0gc2xpZGVzW2ldLnNyYztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNsaWRlSW1nID0gc2xpZGVzW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zbGlkZXMucHVzaCh7XG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIGVsOiBzbGlkZXNbaV0sXG4gICAgICAgICAgICBpbWFnZXM6IHNsaWRlSW1nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNsaWRlckVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIHNsaWRlckVsbS5jbGFzc05hbWUgPSAnaW1hZ2Utc2xpZGVyJztcblxuICAgICAgICBpbWdFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgaW1nRWxtLnNyYyA9IHNsaWRlSW1nO1xuXG4gICAgICAgIHNsaWRlckVsbS5hcHBlbmRDaGlsZChpbWdFbG0pO1xuICAgICAgICBzbGlkZXIuYXBwZW5kQ2hpbGQoc2xpZGVyRWxtKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNsaWRlcik7XG4gICAgICAgIHBhcmVudEVsLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMucGxheUJ0bi5pZCA9ICdwbGF5LWJ0bic7XG4gICAgc2xpZGVyLmFwcGVuZENoaWxkKHRoaXMucGxheUJ0bik7XG5cbiAgICB0aGlzLnByZXZpb3VzQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMucHJldmlvdXNCdG4uaWQgPSAncHJldmlvdXMtYnRuJztcbiAgICBzbGlkZXIuYXBwZW5kQ2hpbGQodGhpcy5wcmV2aW91c0J0bik7XG5cbiAgICB0aGlzLm5leHRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdGhpcy5uZXh0QnRuLmlkID0gJ25leHQtYnRuJztcbiAgICBzbGlkZXIuYXBwZW5kQ2hpbGQodGhpcy5uZXh0QnRuKTtcbn07XG5cbkltYWdlU2xpZGVyLnByb3RvdHlwZS5zZXRTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHNldCB0aGUgc2xpZGVyIHdpdGggaW1hZ2Ugc2xpZGVyIGVsZW1lbnRzLlxuICAgIHZhciBmaXJzdCA9IHRoaXMuc2xpZGVyWzBdO1xuICAgIGZpcnN0LmNsYXNzTGlzdC5hZGQoJ2lzLXNob3dpbmcnKTtcbn1cblxuZnVuY3Rpb24gc2V0RXZlbnRzKCkge1xuICAgIHZhciBwbGF5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXktYnRuJyksXG4gICAgICAgIHByZXZpb3VzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpb3VzLWJ0bicpLFxuICAgICAgICBuZXh0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25leHQtYnRuJyksXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIHBsYXlCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX3RoaXMucGxheWluZykge1xuICAgICAgICAgICAgX3RoaXMucGF1c2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXZpb3VzQnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucGF1c2UoKTtcbiAgICAgICAgX3RoaXMucHJldmlvdXNTbGlkZSgpO1xuICAgIH1cblxuICAgIG5leHRCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5wYXVzZSgpO1xuICAgICAgICBfdGhpcy5uZXh0U2xpZGUoKTtcbiAgICB9XG5cbiAgICBrZXlib2FyZEFjdGlvbnMuY2FsbCh0aGlzKTtcbn1cblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLm5leHRTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ29Ub1NsaWRlKHRoaXMuY3VycmVudFNsaWRlICsgMSwgJ25leHQnKTtcbn1cblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLnByZXZpb3VzU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdvVG9TbGlkZSh0aGlzLmN1cnJlbnRTbGlkZSAtIDEsICdwcmV2aW91cycpO1xufVxuXG5JbWFnZVNsaWRlci5wcm90b3R5cGUuZ29Ub1NsaWRlID0gZnVuY3Rpb24obiwgc2lkZSkge1xuICAgIHZhciBzbGlkZXMgPSB0aGlzLnNsaWRlcjtcblxuICAgIHNsaWRlc1t0aGlzLmN1cnJlbnRTbGlkZV0uY2xhc3NOYW1lID0gc2lkZSArICcgaW1hZ2Utc2xpZGVyJztcbiAgICB0aGlzLmN1cnJlbnRTbGlkZSA9IChuICsgc2xpZGVzLmxlbmd0aCkgJSBzbGlkZXMubGVuZ3RoO1xuICAgIHNsaWRlc1t0aGlzLmN1cnJlbnRTbGlkZV0uY2xhc3NOYW1lID0gc2lkZSArICcgaW1hZ2Utc2xpZGVyIGlzLXNob3dpbmcnO1xuXG4gICAgaWYgKHNpZGUgPT09ICdwcmV2aW91cycpIHtcbiAgICAgICAgdGhpcy5wcmV2U2xpZGUgPSAodGhpcy5jdXJyZW50U2xpZGUgKyAxKSAlIHNsaWRlcy5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcmV2U2xpZGUgPSAodGhpcy5jdXJyZW50U2xpZGUgLSAxKSAlIHNsaWRlcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHNpZGUgPT09ICdwcmV2aW91cycpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNsaWRlID09PSBzbGlkZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzbGlkZXNbc2xpZGVzLmxlbmd0aCArICAgMV0uY2xhc3NOYW1lID0gc2lkZSArICcgaW1hZ2Utc2xpZGVyIGlzLWhpZGluZyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzbGlkZXNbdGhpcy5wcmV2U2xpZGVdLmNsYXNzTmFtZSA9IHNpZGUgKyAnIGltYWdlLXNsaWRlciBpcy1oaWRpbmcnO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNsaWRlID09PSAwKSB7XG4gICAgICAgICAgICBzbGlkZXNbc2xpZGVzLmxlbmd0aCAtIDFdLmNsYXNzTmFtZSA9IHNpZGUgKyAnIGltYWdlLXNsaWRlciBpcy1oaWRpbmcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2xpZGVzW3RoaXMucHJldlNsaWRlXS5jbGFzc05hbWUgPSBzaWRlICsgJyBpbWFnZS1zbGlkZXIgaXMtaGlkaW5nJztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuSW1hZ2VTbGlkZXIucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGF5QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBhdXNlJyk7XG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnNsaWRlSW50ZXJ2YWwpO1xufVxuXG5JbWFnZVNsaWRlci5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLnBsYXlCdG4uY2xhc3NMaXN0LmFkZCgnaXMtcGF1c2UnKTtcbiAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgIHRoaXMuc2xpZGVJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5uZXh0U2xpZGUoKTtcbiAgICB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24ga2V5Ym9hcmRBY3Rpb25zKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gMzcpIHtcbiAgICAgICAgICAgIF90aGlzLnByZXZpb3VzU2xpZGUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT0gMzkpIHtcbiAgICAgICAgICAgIF90aGlzLm5leHRTbGlkZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZVNsaWRlcjtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCwgaHRtbCkge1xuICAgIGlmIChodG1sID09PSBudWxsKSByZXR1cm47XG5cbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcbiAgICAgICAgdG1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYm9keScpLFxuICAgICAgICBjaGlsZDtcblxuICAgIHRtcC5pbm5lckhUTUwgPSBodG1sO1xuXG4gICAgd2hpbGUgKGNoaWxkID0gdG1wLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgfVxuXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnKTtcbiAgICBmcmFnID0gdG1wID0gbnVsbDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxuLypcbiAgICB2YXIgdGVtcGxhdGUgPSAnPHA+SGVsbG8sIGlrIGJlbiA8JXRoaXMubmFtZSU+LiBJayBiZW4gPCV0aGlzLnByb2ZpbGUuYWdlJT4gamFhciBvdWQgZW4gYmVuIGVyZyA8JXRoaXMuc3RhdGUlPjwvcD4nO1xuICAgIGNvbnNvbGUubG9nKFRlbXBsYXRlRW5naW5lKHRlbXBsYXRlLCB7XG4gICAgICAgIG5hbWU6ICdKaG9uIE1ham9vcicsXG4gICAgICAgIHByb2ZpbGU6IHthZ2U6IDM0fSxcbiAgICAgICAgc3RhdGU6ICdsaWVmJ1xuICAgIH0pKTtcblxuICAgIHZhciBza2lsbFRlbXBsYXRlID0gXG4gICAgICAgICdNeSBTa2lsbHM6JyArXG4gICAgICAgICc8JWZvcih2YXIgaW5kZXggaW4gdGhpcy5za2lsbHMpIHslPicgK1xuICAgICAgICAnPGEgaHJlZj1cIiNcIj48JXRoaXMuc2tpbGxzW2luZGV4XSU+PC9hPicgK1xuICAgICAgICAnPCV9JT4nO1xuXG4gICAgY29uc29sZS5sb2coVGVtcGxhdGVFbmdpbmUoc2tpbGxUZW1wbGF0ZSwge1xuICAgICAgICBza2lsbHM6IFsnanMnLCAnaHRtbCcsICdjc3MnXVxuICAgIH0pKTtcbiovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaHRtbCwgb3B0aW9ucykge1xuICAgIHZhciByZSA9IC88JSguKz8pJT4vZyxcbiAgICAgICAgcmVFeHAgPSAvKF4oICk/KHZhcnxpZnxmb3J8ZWxzZXxzd2l0Y2h8Y2FzZXxicmVha3x7fH18OykpKC4qKT8vZyxcbiAgICAgICAgY29kZSA9ICd3aXRoKG9iaikgeyB2YXIgcj1bXTtcXG4nLFxuICAgICAgICBjdXJzb3IgPSAwLFxuICAgICAgICBtYXRjaCxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgdmFyIGFkZCA9IGZ1bmN0aW9uKGxpbmUsIGpzKSB7XG4gICAgICAgIGpzID8gY29kZSArPSBsaW5lLm1hdGNoKHJlRXhwKSA/IGxpbmUgKyAnXFxuJyA6ICdyLnB1c2goJyArIGxpbmUgKyAnKTtcXG4nIDpcbiAgICAgICAgICAgIChjb2RlICs9IGxpbmUgIT0gJycgPyAnci5wdXNoKFwiJyArIGxpbmUucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiKTtcXG4nIDogJycpO1xuICAgICAgICByZXR1cm4gYWRkO1xuICAgIH1cblxuICAgIHdoaWxlKG1hdGNoID0gcmUuZXhlYyhodG1sKSkge1xuICAgICAgICBhZGQoaHRtbC5zbGljZShjdXJzb3IsIG1hdGNoLmluZGV4KSkobWF0Y2hbMV0sIHRydWUpO1xuICAgICAgICBjdXJzb3IgPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICB9XG5cbiAgICBhZGQoaHRtbC5zdWJzdHIoY3Vyc29yLCBodG1sLmxlbmd0aCAtIGN1cnNvcikpO1xuICAgIGNvZGUgPSAoY29kZSArICdyZXR1cm4gci5qb2luKFwiXCIpOyB9JykucmVwbGFjZSgvW1xcclxcdFxcbl0vZywgJycpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEZ1bmN0aW9uKCdvYmonLCBjb2RlKS5hcHBseShvcHRpb25zLCBbb3B0aW9uc10pO1xuICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCInXCIgKyBlcnIubWVzc2FnZSArIFwiJ1wiLCBcIiBpbiBcXG5cXG5Db2RlOlxcblwiLCBjb2RlLCBcIlxcblwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufSIsIm1vZHVsZS5leHBvcnRzID0gbmV3Q2hhaW47XG5tb2R1bGUuZXhwb3J0cy5mcm9tID0gZnJvbTtcblxuZnVuY3Rpb24gZnJvbShjaGFpbil7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgdmFyIG0sIGk7XG5cbiAgICBtID0gbWV0aG9kcy5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gICAgaSAgID0gbS5sZW5ndGg7XG5cbiAgICB3aGlsZSAoIGkgLS0gKSB7XG4gICAgICBjaGFpblsgbVtpXS5uYW1lIF0gPSBtW2ldLmZuO1xuICAgIH1cblxuICAgIG0uZm9yRWFjaChmdW5jdGlvbihtZXRob2Qpe1xuICAgICAgY2hhaW5bIG1ldGhvZC5uYW1lIF0gPSBmdW5jdGlvbigpe1xuICAgICAgICBtZXRob2QuZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIGNoYWluO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjaGFpbjtcbiAgfTtcblxufVxuXG5mdW5jdGlvbiBtZXRob2RzKCl7XG4gIHZhciBhbGwsIGVsLCBpLCBsZW4sIHJlc3VsdCwga2V5O1xuXG4gIGFsbCAgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIHJlc3VsdCA9IFtdO1xuICBpICAgICAgPSBhbGwubGVuZ3RoO1xuXG4gIHdoaWxlICggaSAtLSApIHtcbiAgICBlbCA9IGFsbFtpXTtcblxuICAgIGlmICggdHlwZW9mIGVsID09ICdmdW5jdGlvbicgKSB7XG4gICAgICByZXN1bHQucHVzaCh7IG5hbWU6IGVsLm5hbWUsIGZuOiBlbCB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICggdHlwZW9mIGVsICE9ICdvYmplY3QnICkgY29udGludWU7XG5cbiAgICBmb3IgKCBrZXkgaW4gZWwgKSB7XG4gICAgICByZXN1bHQucHVzaCh7IG5hbWU6IGtleSwgZm46IGVsW2tleV0gfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbmV3Q2hhaW4oKXtcbiAgcmV0dXJuIGZyb20oe30pLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiFcbiAgKiBAcHJlc2VydmUgUXdlcnkgLSBBIEJsYXppbmcgRmFzdCBxdWVyeSBzZWxlY3RvciBlbmdpbmVcbiAgKiBodHRwczovL2dpdGh1Yi5jb20vZGVkL3F3ZXJ5XG4gICogY29weXJpZ2h0IER1c3RpbiBEaWF6IDIwMTJcbiAgKiBNSVQgTGljZW5zZVxuICAqL1xuXG4oZnVuY3Rpb24gKG5hbWUsIGNvbnRleHQsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZGVmaW5pdGlvbilcbiAgZWxzZSBjb250ZXh0W25hbWVdID0gZGVmaW5pdGlvbigpXG59KSgncXdlcnknLCB0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudFxuICAgICwgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnRcbiAgICAsIGJ5Q2xhc3MgPSAnZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSdcbiAgICAsIGJ5VGFnID0gJ2dldEVsZW1lbnRzQnlUYWdOYW1lJ1xuICAgICwgcVNBID0gJ3F1ZXJ5U2VsZWN0b3JBbGwnXG4gICAgLCB1c2VOYXRpdmVRU0EgPSAndXNlTmF0aXZlUVNBJ1xuICAgICwgdGFnTmFtZSA9ICd0YWdOYW1lJ1xuICAgICwgbm9kZVR5cGUgPSAnbm9kZVR5cGUnXG4gICAgLCBzZWxlY3QgLy8gbWFpbiBzZWxlY3QoKSBtZXRob2QsIGFzc2lnbiBsYXRlclxuXG4gICAgLCBpZCA9IC8jKFtcXHdcXC1dKykvXG4gICAgLCBjbGFzID0gL1xcLltcXHdcXC1dKy9nXG4gICAgLCBpZE9ubHkgPSAvXiMoW1xcd1xcLV0rKSQvXG4gICAgLCBjbGFzc09ubHkgPSAvXlxcLihbXFx3XFwtXSspJC9cbiAgICAsIHRhZ09ubHkgPSAvXihbXFx3XFwtXSspJC9cbiAgICAsIHRhZ0FuZE9yQ2xhc3MgPSAvXihbXFx3XSspP1xcLihbXFx3XFwtXSspJC9cbiAgICAsIHNwbGl0dGFibGUgPSAvKF58LClcXHMqWz5+K10vXG4gICAgLCBub3JtYWxpenIgPSAvXlxccyt8XFxzKihbLFxcc1xcK1xcfj5dfCQpXFxzKi9nXG4gICAgLCBzcGxpdHRlcnMgPSAvW1xcc1xcPlxcK1xcfl0vXG4gICAgLCBzcGxpdHRlcnNNb3JlID0gLyg/IVtcXHNcXHdcXC1cXC9cXD9cXCZcXD1cXDpcXC5cXChcXClcXCEsQCMlPD5cXHtcXH1cXCRcXCpcXF4nXCJdKlxcXXxbXFxzXFx3XFwrXFwtXSpcXCkpL1xuICAgICwgc3BlY2lhbENoYXJzID0gLyhbLiorP1xcXj0hOiR7fSgpfFxcW1xcXVxcL1xcXFxdKS9nXG4gICAgLCBzaW1wbGUgPSAvXihcXCp8W2EtejAtOV0rKT8oPzooW1xcLlxcI10rW1xcd1xcLVxcLiNdKyk/KS9cbiAgICAsIGF0dHIgPSAvXFxbKFtcXHdcXC1dKykoPzooW1xcfFxcXlxcJFxcKlxcfl0/XFw9KVsnXCJdPyhbIFxcd1xcLVxcL1xcP1xcJlxcPVxcOlxcLlxcKFxcKVxcISxAIyU8Plxce1xcfVxcJFxcKlxcXl0rKVtcIiddPyk/XFxdL1xuICAgICwgcHNldWRvID0gLzooW1xcd1xcLV0rKShcXChbJ1wiXT8oW14oKV0rKVsnXCJdP1xcKSk/L1xuICAgICwgZWFzeSA9IG5ldyBSZWdFeHAoaWRPbmx5LnNvdXJjZSArICd8JyArIHRhZ09ubHkuc291cmNlICsgJ3wnICsgY2xhc3NPbmx5LnNvdXJjZSlcbiAgICAsIGRpdmlkZXJzID0gbmV3IFJlZ0V4cCgnKCcgKyBzcGxpdHRlcnMuc291cmNlICsgJyknICsgc3BsaXR0ZXJzTW9yZS5zb3VyY2UsICdnJylcbiAgICAsIHRva2VuaXpyID0gbmV3IFJlZ0V4cChzcGxpdHRlcnMuc291cmNlICsgc3BsaXR0ZXJzTW9yZS5zb3VyY2UpXG4gICAgLCBjaHVua2VyID0gbmV3IFJlZ0V4cChzaW1wbGUuc291cmNlICsgJygnICsgYXR0ci5zb3VyY2UgKyAnKT8nICsgJygnICsgcHNldWRvLnNvdXJjZSArICcpPycpXG5cbiAgdmFyIHdhbGtlciA9IHtcbiAgICAgICcgJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUgJiYgbm9kZSAhPT0gaHRtbCAmJiBub2RlLnBhcmVudE5vZGVcbiAgICAgIH1cbiAgICAsICc+JzogZnVuY3Rpb24gKG5vZGUsIGNvbnRlc3RhbnQpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUgJiYgbm9kZS5wYXJlbnROb2RlID09IGNvbnRlc3RhbnQucGFyZW50Tm9kZSAmJiBub2RlLnBhcmVudE5vZGVcbiAgICAgIH1cbiAgICAsICd+JzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUgJiYgbm9kZS5wcmV2aW91c1NpYmxpbmdcbiAgICAgIH1cbiAgICAsICcrJzogZnVuY3Rpb24gKG5vZGUsIGNvbnRlc3RhbnQsIHAxLCBwMikge1xuICAgICAgICBpZiAoIW5vZGUpIHJldHVybiBmYWxzZVxuICAgICAgICByZXR1cm4gKHAxID0gcHJldmlvdXMobm9kZSkpICYmIChwMiA9IHByZXZpb3VzKGNvbnRlc3RhbnQpKSAmJiBwMSA9PSBwMiAmJiBwMVxuICAgICAgfVxuICAgIH1cblxuICBmdW5jdGlvbiBjYWNoZSgpIHtcbiAgICB0aGlzLmMgPSB7fVxuICB9XG4gIGNhY2hlLnByb3RvdHlwZSA9IHtcbiAgICBnOiBmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIHRoaXMuY1trXSB8fCB1bmRlZmluZWRcbiAgICB9XG4gICwgczogZnVuY3Rpb24gKGssIHYsIHIpIHtcbiAgICAgIHYgPSByID8gbmV3IFJlZ0V4cCh2KSA6IHZcbiAgICAgIHJldHVybiAodGhpcy5jW2tdID0gdilcbiAgICB9XG4gIH1cblxuICB2YXIgY2xhc3NDYWNoZSA9IG5ldyBjYWNoZSgpXG4gICAgLCBjbGVhbkNhY2hlID0gbmV3IGNhY2hlKClcbiAgICAsIGF0dHJDYWNoZSA9IG5ldyBjYWNoZSgpXG4gICAgLCB0b2tlbkNhY2hlID0gbmV3IGNhY2hlKClcblxuICBmdW5jdGlvbiBjbGFzc1JlZ2V4KGMpIHtcbiAgICByZXR1cm4gY2xhc3NDYWNoZS5nKGMpIHx8IGNsYXNzQ2FjaGUucyhjLCAnKF58XFxcXHMrKScgKyBjICsgJyhcXFxccyt8JCknLCAxKVxuICB9XG5cbiAgLy8gbm90IHF1aXRlIGFzIGZhc3QgYXMgaW5saW5lIGxvb3BzIGluIG9sZGVyIGJyb3dzZXJzIHNvIGRvbid0IHVzZSBsaWJlcmFsbHlcbiAgZnVuY3Rpb24gZWFjaChhLCBmbikge1xuICAgIHZhciBpID0gMCwgbCA9IGEubGVuZ3RoXG4gICAgZm9yICg7IGkgPCBsOyBpKyspIGZuKGFbaV0pXG4gIH1cblxuICBmdW5jdGlvbiBmbGF0dGVuKGFyKSB7XG4gICAgZm9yICh2YXIgciA9IFtdLCBpID0gMCwgbCA9IGFyLmxlbmd0aDsgaSA8IGw7ICsraSkgYXJyYXlMaWtlKGFyW2ldKSA/IChyID0gci5jb25jYXQoYXJbaV0pKSA6IChyW3IubGVuZ3RoXSA9IGFyW2ldKVxuICAgIHJldHVybiByXG4gIH1cblxuICBmdW5jdGlvbiBhcnJheWlmeShhcikge1xuICAgIHZhciBpID0gMCwgbCA9IGFyLmxlbmd0aCwgciA9IFtdXG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHJbaV0gPSBhcltpXVxuICAgIHJldHVybiByXG4gIH1cblxuICBmdW5jdGlvbiBwcmV2aW91cyhuKSB7XG4gICAgd2hpbGUgKG4gPSBuLnByZXZpb3VzU2libGluZykgaWYgKG5bbm9kZVR5cGVdID09IDEpIGJyZWFrO1xuICAgIHJldHVybiBuXG4gIH1cblxuICBmdW5jdGlvbiBxKHF1ZXJ5KSB7XG4gICAgcmV0dXJuIHF1ZXJ5Lm1hdGNoKGNodW5rZXIpXG4gIH1cblxuICAvLyBjYWxsZWQgdXNpbmcgYHRoaXNgIGFzIGVsZW1lbnQgYW5kIGFyZ3VtZW50cyBmcm9tIHJlZ2V4IGdyb3VwIHJlc3VsdHMuXG4gIC8vIGdpdmVuID0+IGRpdi5oZWxsb1t0aXRsZT1cIndvcmxkXCJdOmZvbygnYmFyJylcbiAgLy8gZGl2LmhlbGxvW3RpdGxlPVwid29ybGRcIl06Zm9vKCdiYXInKSwgZGl2LCAuaGVsbG8sIFt0aXRsZT1cIndvcmxkXCJdLCB0aXRsZSwgPSwgd29ybGQsIDpmb28oJ2JhcicpLCBmb28sICgnYmFyJyksIGJhcl1cbiAgZnVuY3Rpb24gaW50ZXJwcmV0KHdob2xlLCB0YWcsIGlkc0FuZENsYXNzZXMsIHdob2xlQXR0cmlidXRlLCBhdHRyaWJ1dGUsIHF1YWxpZmllciwgdmFsdWUsIHdob2xlUHNldWRvLCBwc2V1ZG8sIHdob2xlUHNldWRvVmFsLCBwc2V1ZG9WYWwpIHtcbiAgICB2YXIgaSwgbSwgaywgbywgY2xhc3Nlc1xuICAgIGlmICh0aGlzW25vZGVUeXBlXSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKHRhZyAmJiB0YWcgIT09ICcqJyAmJiB0aGlzW3RhZ05hbWVdICYmIHRoaXNbdGFnTmFtZV0udG9Mb3dlckNhc2UoKSAhPT0gdGFnKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoaWRzQW5kQ2xhc3NlcyAmJiAobSA9IGlkc0FuZENsYXNzZXMubWF0Y2goaWQpKSAmJiBtWzFdICE9PSB0aGlzLmlkKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoaWRzQW5kQ2xhc3NlcyAmJiAoY2xhc3NlcyA9IGlkc0FuZENsYXNzZXMubWF0Y2goY2xhcykpKSB7XG4gICAgICBmb3IgKGkgPSBjbGFzc2VzLmxlbmd0aDsgaS0tOykgaWYgKCFjbGFzc1JlZ2V4KGNsYXNzZXNbaV0uc2xpY2UoMSkpLnRlc3QodGhpcy5jbGFzc05hbWUpKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHBzZXVkbyAmJiBxd2VyeS5wc2V1ZG9zW3BzZXVkb10gJiYgIXF3ZXJ5LnBzZXVkb3NbcHNldWRvXSh0aGlzLCBwc2V1ZG9WYWwpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAod2hvbGVBdHRyaWJ1dGUgJiYgIXZhbHVlKSB7IC8vIHNlbGVjdCBpcyBqdXN0IGZvciBleGlzdGFuY2Ugb2YgYXR0cmliXG4gICAgICBvID0gdGhpcy5hdHRyaWJ1dGVzXG4gICAgICBmb3IgKGsgaW4gbykge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspICYmIChvW2tdLm5hbWUgfHwgaykgPT0gYXR0cmlidXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAod2hvbGVBdHRyaWJ1dGUgJiYgIWNoZWNrQXR0cihxdWFsaWZpZXIsIGdldEF0dHIodGhpcywgYXR0cmlidXRlKSB8fCAnJywgdmFsdWUpKSB7XG4gICAgICAvLyBzZWxlY3QgaXMgZm9yIGF0dHJpYiBlcXVhbGl0eVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbihzKSB7XG4gICAgcmV0dXJuIGNsZWFuQ2FjaGUuZyhzKSB8fCBjbGVhbkNhY2hlLnMocywgcy5yZXBsYWNlKHNwZWNpYWxDaGFycywgJ1xcXFwkMScpKVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tBdHRyKHF1YWxpZnksIGFjdHVhbCwgdmFsKSB7XG4gICAgc3dpdGNoIChxdWFsaWZ5KSB7XG4gICAgY2FzZSAnPSc6XG4gICAgICByZXR1cm4gYWN0dWFsID09IHZhbFxuICAgIGNhc2UgJ149JzpcbiAgICAgIHJldHVybiBhY3R1YWwubWF0Y2goYXR0ckNhY2hlLmcoJ149JyArIHZhbCkgfHwgYXR0ckNhY2hlLnMoJ149JyArIHZhbCwgJ14nICsgY2xlYW4odmFsKSwgMSkpXG4gICAgY2FzZSAnJD0nOlxuICAgICAgcmV0dXJuIGFjdHVhbC5tYXRjaChhdHRyQ2FjaGUuZygnJD0nICsgdmFsKSB8fCBhdHRyQ2FjaGUucygnJD0nICsgdmFsLCBjbGVhbih2YWwpICsgJyQnLCAxKSlcbiAgICBjYXNlICcqPSc6XG4gICAgICByZXR1cm4gYWN0dWFsLm1hdGNoKGF0dHJDYWNoZS5nKHZhbCkgfHwgYXR0ckNhY2hlLnModmFsLCBjbGVhbih2YWwpLCAxKSlcbiAgICBjYXNlICd+PSc6XG4gICAgICByZXR1cm4gYWN0dWFsLm1hdGNoKGF0dHJDYWNoZS5nKCd+PScgKyB2YWwpIHx8IGF0dHJDYWNoZS5zKCd+PScgKyB2YWwsICcoPzpefFxcXFxzKyknICsgY2xlYW4odmFsKSArICcoPzpcXFxccyt8JCknLCAxKSlcbiAgICBjYXNlICd8PSc6XG4gICAgICByZXR1cm4gYWN0dWFsLm1hdGNoKGF0dHJDYWNoZS5nKCd8PScgKyB2YWwpIHx8IGF0dHJDYWNoZS5zKCd8PScgKyB2YWwsICdeJyArIGNsZWFuKHZhbCkgKyAnKC18JCknLCAxKSlcbiAgICB9XG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIC8vIGdpdmVuIGEgc2VsZWN0b3IsIGZpcnN0IGNoZWNrIGZvciBzaW1wbGUgY2FzZXMgdGhlbiBjb2xsZWN0IGFsbCBiYXNlIGNhbmRpZGF0ZSBtYXRjaGVzIGFuZCBmaWx0ZXJcbiAgZnVuY3Rpb24gX3F3ZXJ5KHNlbGVjdG9yLCBfcm9vdCkge1xuICAgIHZhciByID0gW10sIHJldCA9IFtdLCBpLCBsLCBtLCB0b2tlbiwgdGFnLCBlbHMsIGludHIsIGl0ZW0sIHJvb3QgPSBfcm9vdFxuICAgICAgLCB0b2tlbnMgPSB0b2tlbkNhY2hlLmcoc2VsZWN0b3IpIHx8IHRva2VuQ2FjaGUucyhzZWxlY3Rvciwgc2VsZWN0b3Iuc3BsaXQodG9rZW5penIpKVxuICAgICAgLCBkaXZpZGVkVG9rZW5zID0gc2VsZWN0b3IubWF0Y2goZGl2aWRlcnMpXG5cbiAgICBpZiAoIXRva2Vucy5sZW5ndGgpIHJldHVybiByXG5cbiAgICB0b2tlbiA9ICh0b2tlbnMgPSB0b2tlbnMuc2xpY2UoMCkpLnBvcCgpIC8vIGNvcHkgY2FjaGVkIHRva2VucywgdGFrZSB0aGUgbGFzdCBvbmVcbiAgICBpZiAodG9rZW5zLmxlbmd0aCAmJiAobSA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0ubWF0Y2goaWRPbmx5KSkpIHJvb3QgPSBieUlkKF9yb290LCBtWzFdKVxuICAgIGlmICghcm9vdCkgcmV0dXJuIHJcblxuICAgIGludHIgPSBxKHRva2VuKVxuICAgIC8vIGNvbGxlY3QgYmFzZSBjYW5kaWRhdGVzIHRvIGZpbHRlclxuICAgIGVscyA9IHJvb3QgIT09IF9yb290ICYmIHJvb3Rbbm9kZVR5cGVdICE9PSA5ICYmIGRpdmlkZWRUb2tlbnMgJiYgL15bK35dJC8udGVzdChkaXZpZGVkVG9rZW5zW2RpdmlkZWRUb2tlbnMubGVuZ3RoIC0gMV0pID9cbiAgICAgIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgIHdoaWxlIChyb290ID0gcm9vdC5uZXh0U2libGluZykge1xuICAgICAgICAgIHJvb3Rbbm9kZVR5cGVdID09IDEgJiYgKGludHJbMV0gPyBpbnRyWzFdID09IHJvb3RbdGFnTmFtZV0udG9Mb3dlckNhc2UoKSA6IDEpICYmIChyW3IubGVuZ3RoXSA9IHJvb3QpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJcbiAgICAgIH0oW10pIDpcbiAgICAgIHJvb3RbYnlUYWddKGludHJbMV0gfHwgJyonKVxuICAgIC8vIGZpbHRlciBlbGVtZW50cyBhY2NvcmRpbmcgdG8gdGhlIHJpZ2h0LW1vc3QgcGFydCBvZiB0aGUgc2VsZWN0b3JcbiAgICBmb3IgKGkgPSAwLCBsID0gZWxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKGl0ZW0gPSBpbnRlcnByZXQuYXBwbHkoZWxzW2ldLCBpbnRyKSkgcltyLmxlbmd0aF0gPSBpdGVtXG4gICAgfVxuICAgIGlmICghdG9rZW5zLmxlbmd0aCkgcmV0dXJuIHJcblxuICAgIC8vIGZpbHRlciBmdXJ0aGVyIGFjY29yZGluZyB0byB0aGUgcmVzdCBvZiB0aGUgc2VsZWN0b3IgKHRoZSBsZWZ0IHNpZGUpXG4gICAgZWFjaChyLCBmdW5jdGlvbiAoZSkgeyBpZiAoYW5jZXN0b3JNYXRjaChlLCB0b2tlbnMsIGRpdmlkZWRUb2tlbnMpKSByZXRbcmV0Lmxlbmd0aF0gPSBlIH0pXG4gICAgcmV0dXJuIHJldFxuICB9XG5cbiAgLy8gY29tcGFyZSBlbGVtZW50IHRvIGEgc2VsZWN0b3JcbiAgZnVuY3Rpb24gaXMoZWwsIHNlbGVjdG9yLCByb290KSB7XG4gICAgaWYgKGlzTm9kZShzZWxlY3RvcikpIHJldHVybiBlbCA9PSBzZWxlY3RvclxuICAgIGlmIChhcnJheUxpa2Uoc2VsZWN0b3IpKSByZXR1cm4gISF+ZmxhdHRlbihzZWxlY3RvcikuaW5kZXhPZihlbCkgLy8gaWYgc2VsZWN0b3IgaXMgYW4gYXJyYXksIGlzIGVsIGEgbWVtYmVyP1xuXG4gICAgdmFyIHNlbGVjdG9ycyA9IHNlbGVjdG9yLnNwbGl0KCcsJyksIHRva2VucywgZGl2aWRlZFRva2Vuc1xuICAgIHdoaWxlIChzZWxlY3RvciA9IHNlbGVjdG9ycy5wb3AoKSkge1xuICAgICAgdG9rZW5zID0gdG9rZW5DYWNoZS5nKHNlbGVjdG9yKSB8fCB0b2tlbkNhY2hlLnMoc2VsZWN0b3IsIHNlbGVjdG9yLnNwbGl0KHRva2VuaXpyKSlcbiAgICAgIGRpdmlkZWRUb2tlbnMgPSBzZWxlY3Rvci5tYXRjaChkaXZpZGVycylcbiAgICAgIHRva2VucyA9IHRva2Vucy5zbGljZSgwKSAvLyBjb3B5IGFycmF5XG4gICAgICBpZiAoaW50ZXJwcmV0LmFwcGx5KGVsLCBxKHRva2Vucy5wb3AoKSkpICYmICghdG9rZW5zLmxlbmd0aCB8fCBhbmNlc3Rvck1hdGNoKGVsLCB0b2tlbnMsIGRpdmlkZWRUb2tlbnMsIHJvb3QpKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIGdpdmVuIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSByaWdodC1tb3N0IHBhcnQgb2YgYSBzZWxlY3RvciwgZmlsdGVyIG91dCBhbnkgdGhhdCBkb24ndCBtYXRjaCB0aGUgcmVzdFxuICBmdW5jdGlvbiBhbmNlc3Rvck1hdGNoKGVsLCB0b2tlbnMsIGRpdmlkZWRUb2tlbnMsIHJvb3QpIHtcbiAgICB2YXIgY2FuZFxuICAgIC8vIHJlY3Vyc2l2ZWx5IHdvcmsgYmFja3dhcmRzIHRocm91Z2ggdGhlIHRva2VucyBhbmQgdXAgdGhlIGRvbSwgY292ZXJpbmcgYWxsIG9wdGlvbnNcbiAgICBmdW5jdGlvbiBjcmF3bChlLCBpLCBwKSB7XG4gICAgICB3aGlsZSAocCA9IHdhbGtlcltkaXZpZGVkVG9rZW5zW2ldXShwLCBlKSkge1xuICAgICAgICBpZiAoaXNOb2RlKHApICYmIChpbnRlcnByZXQuYXBwbHkocCwgcSh0b2tlbnNbaV0pKSkpIHtcbiAgICAgICAgICBpZiAoaSkge1xuICAgICAgICAgICAgaWYgKGNhbmQgPSBjcmF3bChwLCBpIC0gMSwgcCkpIHJldHVybiBjYW5kXG4gICAgICAgICAgfSBlbHNlIHJldHVybiBwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChjYW5kID0gY3Jhd2woZWwsIHRva2Vucy5sZW5ndGggLSAxLCBlbCkpICYmICghcm9vdCB8fCBpc0FuY2VzdG9yKGNhbmQsIHJvb3QpKVxuICB9XG5cbiAgZnVuY3Rpb24gaXNOb2RlKGVsLCB0KSB7XG4gICAgcmV0dXJuIGVsICYmIHR5cGVvZiBlbCA9PT0gJ29iamVjdCcgJiYgKHQgPSBlbFtub2RlVHlwZV0pICYmICh0ID09IDEgfHwgdCA9PSA5KVxuICB9XG5cbiAgZnVuY3Rpb24gdW5pcShhcikge1xuICAgIHZhciBhID0gW10sIGksIGo7XG4gICAgbzpcbiAgICBmb3IgKGkgPSAwOyBpIDwgYXIubGVuZ3RoOyArK2kpIHtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBhLmxlbmd0aDsgKytqKSBpZiAoYVtqXSA9PSBhcltpXSkgY29udGludWUgb1xuICAgICAgYVthLmxlbmd0aF0gPSBhcltpXVxuICAgIH1cbiAgICByZXR1cm4gYVxuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlMaWtlKG8pIHtcbiAgICByZXR1cm4gKHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBpc0Zpbml0ZShvLmxlbmd0aCkpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVSb290KHJvb3QpIHtcbiAgICBpZiAoIXJvb3QpIHJldHVybiBkb2NcbiAgICBpZiAodHlwZW9mIHJvb3QgPT0gJ3N0cmluZycpIHJldHVybiBxd2VyeShyb290KVswXVxuICAgIGlmICghcm9vdFtub2RlVHlwZV0gJiYgYXJyYXlMaWtlKHJvb3QpKSByZXR1cm4gcm9vdFswXVxuICAgIHJldHVybiByb290XG4gIH1cblxuICBmdW5jdGlvbiBieUlkKHJvb3QsIGlkLCBlbCkge1xuICAgIC8vIGlmIGRvYywgcXVlcnkgb24gaXQsIGVsc2UgcXVlcnkgdGhlIHBhcmVudCBkb2Mgb3IgaWYgYSBkZXRhY2hlZCBmcmFnbWVudCByZXdyaXRlIHRoZSBxdWVyeSBhbmQgcnVuIG9uIHRoZSBmcmFnbWVudFxuICAgIHJldHVybiByb290W25vZGVUeXBlXSA9PT0gOSA/IHJvb3QuZ2V0RWxlbWVudEJ5SWQoaWQpIDpcbiAgICAgIHJvb3Qub3duZXJEb2N1bWVudCAmJlxuICAgICAgICAoKChlbCA9IHJvb3Qub3duZXJEb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpICYmIGlzQW5jZXN0b3IoZWwsIHJvb3QpICYmIGVsKSB8fFxuICAgICAgICAgICghaXNBbmNlc3Rvcihyb290LCByb290Lm93bmVyRG9jdW1lbnQpICYmIHNlbGVjdCgnW2lkPVwiJyArIGlkICsgJ1wiXScsIHJvb3QpWzBdKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHF3ZXJ5KHNlbGVjdG9yLCBfcm9vdCkge1xuICAgIHZhciBtLCBlbCwgcm9vdCA9IG5vcm1hbGl6ZVJvb3QoX3Jvb3QpXG5cbiAgICAvLyBlYXN5LCBmYXN0IGNhc2VzIHRoYXQgd2UgY2FuIGRpc3BhdGNoIHdpdGggc2ltcGxlIERPTSBjYWxsc1xuICAgIGlmICghcm9vdCB8fCAhc2VsZWN0b3IpIHJldHVybiBbXVxuICAgIGlmIChzZWxlY3RvciA9PT0gd2luZG93IHx8IGlzTm9kZShzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiAhX3Jvb3QgfHwgKHNlbGVjdG9yICE9PSB3aW5kb3cgJiYgaXNOb2RlKHJvb3QpICYmIGlzQW5jZXN0b3Ioc2VsZWN0b3IsIHJvb3QpKSA/IFtzZWxlY3Rvcl0gOiBbXVxuICAgIH1cbiAgICBpZiAoc2VsZWN0b3IgJiYgYXJyYXlMaWtlKHNlbGVjdG9yKSkgcmV0dXJuIGZsYXR0ZW4oc2VsZWN0b3IpXG4gICAgaWYgKG0gPSBzZWxlY3Rvci5tYXRjaChlYXN5KSkge1xuICAgICAgaWYgKG1bMV0pIHJldHVybiAoZWwgPSBieUlkKHJvb3QsIG1bMV0pKSA/IFtlbF0gOiBbXVxuICAgICAgaWYgKG1bMl0pIHJldHVybiBhcnJheWlmeShyb290W2J5VGFnXShtWzJdKSlcbiAgICAgIGlmIChoYXNCeUNsYXNzICYmIG1bM10pIHJldHVybiBhcnJheWlmeShyb290W2J5Q2xhc3NdKG1bM10pKVxuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3Qoc2VsZWN0b3IsIHJvb3QpXG4gIH1cblxuICAvLyB3aGVyZSB0aGUgcm9vdCBpcyBub3QgZG9jdW1lbnQgYW5kIGEgcmVsYXRpb25zaGlwIHNlbGVjdG9yIGlzIGZpcnN0IHdlIGhhdmUgdG9cbiAgLy8gZG8gc29tZSBhd2t3YXJkIGFkanVzdG1lbnRzIHRvIGdldCBpdCB0byB3b3JrLCBldmVuIHdpdGggcVNBXG4gIGZ1bmN0aW9uIGNvbGxlY3RTZWxlY3Rvcihyb290LCBjb2xsZWN0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHMpIHtcbiAgICAgIHZhciBvaWQsIG5pZFxuICAgICAgaWYgKHNwbGl0dGFibGUudGVzdChzKSkge1xuICAgICAgICBpZiAocm9vdFtub2RlVHlwZV0gIT09IDkpIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGVsIGhhcyBhbiBpZCwgcmV3cml0ZSB0aGUgcXVlcnksIHNldCByb290IHRvIGRvYyBhbmQgcnVuIGl0XG4gICAgICAgICAgaWYgKCEobmlkID0gb2lkID0gcm9vdC5nZXRBdHRyaWJ1dGUoJ2lkJykpKSByb290LnNldEF0dHJpYnV0ZSgnaWQnLCBuaWQgPSAnX19xd2VyeW1ldXBzY290dHknKVxuICAgICAgICAgIHMgPSAnW2lkPVwiJyArIG5pZCArICdcIl0nICsgcyAvLyBhdm9pZCBieUlkIGFuZCBhbGxvdyB1cyB0byBtYXRjaCBjb250ZXh0IGVsZW1lbnRcbiAgICAgICAgICBjb2xsZWN0b3Iocm9vdC5wYXJlbnROb2RlIHx8IHJvb3QsIHMsIHRydWUpXG4gICAgICAgICAgb2lkIHx8IHJvb3QucmVtb3ZlQXR0cmlidXRlKCdpZCcpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcy5sZW5ndGggJiYgY29sbGVjdG9yKHJvb3QsIHMsIGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpc0FuY2VzdG9yID0gJ2NvbXBhcmVEb2N1bWVudFBvc2l0aW9uJyBpbiBodG1sID9cbiAgICBmdW5jdGlvbiAoZWxlbWVudCwgY29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gKGNvbnRhaW5lci5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihlbGVtZW50KSAmIDE2KSA9PSAxNlxuICAgIH0gOiAnY29udGFpbnMnIGluIGh0bWwgP1xuICAgIGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lcltub2RlVHlwZV0gPT09IDkgfHwgY29udGFpbmVyID09IHdpbmRvdyA/IGh0bWwgOiBjb250YWluZXJcbiAgICAgIHJldHVybiBjb250YWluZXIgIT09IGVsZW1lbnQgJiYgY29udGFpbmVyLmNvbnRhaW5zKGVsZW1lbnQpXG4gICAgfSA6XG4gICAgZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lcikge1xuICAgICAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUpIGlmIChlbGVtZW50ID09PSBjb250YWluZXIpIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICAgIH1cbiAgLCBnZXRBdHRyID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gZGV0ZWN0IGJ1Z2d5IElFIHNyYy9ocmVmIGdldEF0dHJpYnV0ZSgpIGNhbGxcbiAgICAgIHZhciBlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3AnKVxuICAgICAgcmV0dXJuICgoZS5pbm5lckhUTUwgPSAnPGEgaHJlZj1cIiN4XCI+eDwvYT4nKSAmJiBlLmZpcnN0Q2hpbGQuZ2V0QXR0cmlidXRlKCdocmVmJykgIT0gJyN4JykgP1xuICAgICAgICBmdW5jdGlvbiAoZSwgYSkge1xuICAgICAgICAgIHJldHVybiBhID09PSAnY2xhc3MnID8gZS5jbGFzc05hbWUgOiAoYSA9PT0gJ2hyZWYnIHx8IGEgPT09ICdzcmMnKSA/XG4gICAgICAgICAgICBlLmdldEF0dHJpYnV0ZShhLCAyKSA6IGUuZ2V0QXR0cmlidXRlKGEpXG4gICAgICAgIH0gOlxuICAgICAgICBmdW5jdGlvbiAoZSwgYSkgeyByZXR1cm4gZS5nZXRBdHRyaWJ1dGUoYSkgfVxuICAgIH0oKVxuICAsIGhhc0J5Q2xhc3MgPSAhIWRvY1tieUNsYXNzXVxuICAgIC8vIGhhcyBuYXRpdmUgcVNBIHN1cHBvcnRcbiAgLCBoYXNRU0EgPSBkb2MucXVlcnlTZWxlY3RvciAmJiBkb2NbcVNBXVxuICAgIC8vIHVzZSBuYXRpdmUgcVNBXG4gICwgc2VsZWN0UVNBID0gZnVuY3Rpb24gKHNlbGVjdG9yLCByb290KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW10sIHNzLCBlXG4gICAgICB0cnkge1xuICAgICAgICBpZiAocm9vdFtub2RlVHlwZV0gPT09IDkgfHwgIXNwbGl0dGFibGUudGVzdChzZWxlY3RvcikpIHtcbiAgICAgICAgICAvLyBtb3N0IHdvcmsgaXMgZG9uZSByaWdodCBoZXJlLCBkZWZlciB0byBxU0FcbiAgICAgICAgICByZXR1cm4gYXJyYXlpZnkocm9vdFtxU0FdKHNlbGVjdG9yKSlcbiAgICAgICAgfVxuICAgICAgICAvLyBzcGVjaWFsIGNhc2Ugd2hlcmUgd2UgbmVlZCB0aGUgc2VydmljZXMgb2YgYGNvbGxlY3RTZWxlY3RvcigpYFxuICAgICAgICBlYWNoKHNzID0gc2VsZWN0b3Iuc3BsaXQoJywnKSwgY29sbGVjdFNlbGVjdG9yKHJvb3QsIGZ1bmN0aW9uIChjdHgsIHMpIHtcbiAgICAgICAgICBlID0gY3R4W3FTQV0ocylcbiAgICAgICAgICBpZiAoZS5sZW5ndGggPT0gMSkgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gZS5pdGVtKDApXG4gICAgICAgICAgZWxzZSBpZiAoZS5sZW5ndGgpIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoYXJyYXlpZnkoZSkpXG4gICAgICAgIH0pKVxuICAgICAgICByZXR1cm4gc3MubGVuZ3RoID4gMSAmJiByZXN1bHQubGVuZ3RoID4gMSA/IHVuaXEocmVzdWx0KSA6IHJlc3VsdFxuICAgICAgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgcmV0dXJuIHNlbGVjdE5vbk5hdGl2ZShzZWxlY3Rvciwgcm9vdClcbiAgICB9XG4gICAgLy8gbm8gbmF0aXZlIHNlbGVjdG9yIHN1cHBvcnRcbiAgLCBzZWxlY3ROb25OYXRpdmUgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHJvb3QpIHtcbiAgICAgIHZhciByZXN1bHQgPSBbXSwgaXRlbXMsIG0sIGksIGwsIHIsIHNzXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2Uobm9ybWFsaXpyLCAnJDEnKVxuICAgICAgaWYgKG0gPSBzZWxlY3Rvci5tYXRjaCh0YWdBbmRPckNsYXNzKSkge1xuICAgICAgICByID0gY2xhc3NSZWdleChtWzJdKVxuICAgICAgICBpdGVtcyA9IHJvb3RbYnlUYWddKG1bMV0gfHwgJyonKVxuICAgICAgICBmb3IgKGkgPSAwLCBsID0gaXRlbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHIudGVzdChpdGVtc1tpXS5jbGFzc05hbWUpKSByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSBpdGVtc1tpXVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH1cbiAgICAgIC8vIG1vcmUgY29tcGxleCBzZWxlY3RvciwgZ2V0IGBfcXdlcnkoKWAgdG8gZG8gdGhlIHdvcmsgZm9yIHVzXG4gICAgICBlYWNoKHNzID0gc2VsZWN0b3Iuc3BsaXQoJywnKSwgY29sbGVjdFNlbGVjdG9yKHJvb3QsIGZ1bmN0aW9uIChjdHgsIHMsIHJld3JpdGUpIHtcbiAgICAgICAgciA9IF9xd2VyeShzLCBjdHgpXG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSByLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmIChjdHhbbm9kZVR5cGVdID09PSA5IHx8IHJld3JpdGUgfHwgaXNBbmNlc3RvcihyW2ldLCByb290KSkgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gcltpXVxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICAgIHJldHVybiBzcy5sZW5ndGggPiAxICYmIHJlc3VsdC5sZW5ndGggPiAxID8gdW5pcShyZXN1bHQpIDogcmVzdWx0XG4gICAgfVxuICAsIGNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAvLyBjb25maWdOYXRpdmVRU0E6IHVzZSBmdWxseS1pbnRlcm5hbCBzZWxlY3RvciBvciBuYXRpdmUgcVNBIHdoZXJlIHByZXNlbnRcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uc1t1c2VOYXRpdmVRU0FdICE9PSAndW5kZWZpbmVkJylcbiAgICAgICAgc2VsZWN0ID0gIW9wdGlvbnNbdXNlTmF0aXZlUVNBXSA/IHNlbGVjdE5vbk5hdGl2ZSA6IGhhc1FTQSA/IHNlbGVjdFFTQSA6IHNlbGVjdE5vbk5hdGl2ZVxuICAgIH1cblxuICBjb25maWd1cmUoeyB1c2VOYXRpdmVRU0E6IHRydWUgfSlcblxuICBxd2VyeS5jb25maWd1cmUgPSBjb25maWd1cmVcbiAgcXdlcnkudW5pcSA9IHVuaXFcbiAgcXdlcnkuaXMgPSBpc1xuICBxd2VyeS5wc2V1ZG9zID0ge31cblxuICByZXR1cm4gcXdlcnlcbn0pO1xuIiwidmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGUgPSBlbC5wYXJlbnROb2RlLmZpcnN0Q2hpbGRcbiAgdmFyIHNpYmxpbmdzID0gW11cbiAgXG4gIGZvciAoIDsgbm9kZTsgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcgKSB7XG4gICAgaWYgKCBub2RlLm5vZGVUeXBlID09PSAxICYmIG5vZGUgIT09IGVsICkge1xuICAgICAgaWYgKCFzZWxlY3Rvcikgc2libGluZ3MucHVzaChub2RlKVxuICAgICAgZWxzZSBpZiAobWF0Y2hlcyhub2RlLCBzZWxlY3RvcikpIHNpYmxpbmdzLnB1c2gobm9kZSlcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBzaWJsaW5nc1xufVxuIiwiXG52YXIgc3BhY2UgPSByZXF1aXJlKCd0by1zcGFjZS1jYXNlJylcblxuLyoqXG4gKiBFeHBvcnQuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0NhbWVsQ2FzZVxuXG4vKipcbiAqIENvbnZlcnQgYSBgc3RyaW5nYCB0byBjYW1lbCBjYXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB0b0NhbWVsQ2FzZShzdHJpbmcpIHtcbiAgcmV0dXJuIHNwYWNlKHN0cmluZykucmVwbGFjZSgvXFxzKFxcdykvZywgZnVuY3Rpb24gKG1hdGNoZXMsIGxldHRlcikge1xuICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKVxuICB9KVxufVxuIiwiXG4vKipcbiAqIEV4cG9ydC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvTm9DYXNlXG5cbi8qKlxuICogVGVzdCB3aGV0aGVyIGEgc3RyaW5nIGlzIGNhbWVsLWNhc2UuXG4gKi9cblxudmFyIGhhc1NwYWNlID0gL1xccy9cbnZhciBoYXNTZXBhcmF0b3IgPSAvKF98LXxcXC58OikvXG52YXIgaGFzQ2FtZWwgPSAvKFthLXpdW0EtWl18W0EtWl1bYS16XSkvXG5cbi8qKlxuICogUmVtb3ZlIGFueSBzdGFydGluZyBjYXNlIGZyb20gYSBgc3RyaW5nYCwgbGlrZSBjYW1lbCBvciBzbmFrZSwgYnV0IGtlZXBcbiAqIHNwYWNlcyBhbmQgcHVuY3R1YXRpb24gdGhhdCBtYXkgYmUgaW1wb3J0YW50IG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdG9Ob0Nhc2Uoc3RyaW5nKSB7XG4gIGlmIChoYXNTcGFjZS50ZXN0KHN0cmluZykpIHJldHVybiBzdHJpbmcudG9Mb3dlckNhc2UoKVxuICBpZiAoaGFzU2VwYXJhdG9yLnRlc3Qoc3RyaW5nKSkgcmV0dXJuICh1bnNlcGFyYXRlKHN0cmluZykgfHwgc3RyaW5nKS50b0xvd2VyQ2FzZSgpXG4gIGlmIChoYXNDYW1lbC50ZXN0KHN0cmluZykpIHJldHVybiB1bmNhbWVsaXplKHN0cmluZykudG9Mb3dlckNhc2UoKVxuICByZXR1cm4gc3RyaW5nLnRvTG93ZXJDYXNlKClcbn1cblxuLyoqXG4gKiBTZXBhcmF0b3Igc3BsaXR0ZXIuXG4gKi9cblxudmFyIHNlcGFyYXRvclNwbGl0dGVyID0gL1tcXFdfXSsoLnwkKS9nXG5cbi8qKlxuICogVW4tc2VwYXJhdGUgYSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdW5zZXBhcmF0ZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHNlcGFyYXRvclNwbGl0dGVyLCBmdW5jdGlvbiAobSwgbmV4dCkge1xuICAgIHJldHVybiBuZXh0ID8gJyAnICsgbmV4dCA6ICcnXG4gIH0pXG59XG5cbi8qKlxuICogQ2FtZWxjYXNlIHNwbGl0dGVyLlxuICovXG5cbnZhciBjYW1lbFNwbGl0dGVyID0gLyguKShbQS1aXSspL2dcblxuLyoqXG4gKiBVbi1jYW1lbGNhc2UgYSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdW5jYW1lbGl6ZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGNhbWVsU3BsaXR0ZXIsIGZ1bmN0aW9uIChtLCBwcmV2aW91cywgdXBwZXJzKSB7XG4gICAgcmV0dXJuIHByZXZpb3VzICsgJyAnICsgdXBwZXJzLnRvTG93ZXJDYXNlKCkuc3BsaXQoJycpLmpvaW4oJyAnKVxuICB9KVxufVxuIiwiXG52YXIgY2xlYW4gPSByZXF1aXJlKCd0by1uby1jYXNlJylcblxuLyoqXG4gKiBFeHBvcnQuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NwYWNlQ2FzZVxuXG4vKipcbiAqIENvbnZlcnQgYSBgc3RyaW5nYCB0byBzcGFjZSBjYXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB0b1NwYWNlQ2FzZShzdHJpbmcpIHtcbiAgcmV0dXJuIGNsZWFuKHN0cmluZykucmVwbGFjZSgvW1xcV19dKygufCQpL2csIGZ1bmN0aW9uIChtYXRjaGVzLCBtYXRjaCkge1xuICAgIHJldHVybiBtYXRjaCA/ICcgJyArIG1hdGNoIDogJydcbiAgfSkudHJpbSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW5hYmxlT246IGZ1bmN0aW9uICggZWwsIG9wdHMgKSB7XG4gICAgdmFyIFRhcCA9IHJlcXVpcmUoICcuL3RvdWNoeScgKTtcbiAgICB2YXIgaW5zID0gbmV3IFRhcCggZWwsIG9wdHMgKTtcbiAgICByZXR1cm4gaW5zO1xuICB9XG59O1xuIiwidmFyIGRlYm91bmNlID0gcmVxdWlyZSggJ2RlYm91bmN5JyApO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoICdleHRlbmQnICk7XG52YXIgZXZlbnRIZWxwZXIgPSByZXF1aXJlKCAnZG9tLWV2ZW50LXNwZWNpYWwnICk7XG5cbmZ1bmN0aW9uIFRvdWNoeSggZWwsIG9wdHMgKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgbWUuX29wdHMgPSB7XG4gICAgbWluU3dpcGVEZWx0YVg6IDI1LFxuICAgIG1pblN3aXBlRGVsdGFZOiAyNSxcbiAgICB0YXA6IHRydWUsXG4gICAgdGFwaG9sZDogdHJ1ZSxcbiAgICBzd2lwZTogdHJ1ZSxcbiAgICBtaW5UYXBEaXNwbGFjZW1lbnRUb2xlcmFuY2U6IDEwLFxuICAgIHRhcEhvbGRNaW5UaHJlc2hvbGQ6IDUwMCxcbiAgICBzd2lwZVRocmVzaG9sZDogMTAwMCxcbiAgICBtb3VzZWRvd25UaHJlc2hvbGQ6IDUwMCxcbiAgICBkaXNjYXJkVGFwaG9sZElmTW92ZTogdHJ1ZVxuICB9O1xuXG4gIGV4dGVuZCggbWUuX29wdHMsIG9wdHMgKTtcblxuICB2YXIgZWxlID0gbWUuZWwgPSAodHlwZW9mIGVsID09PSAnb2JqZWN0JyAmJiBlbCAhPT0gbnVsbCkgPyBlbCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBlbCApO1xuICBtZS5tb3ZlZCA9IGZhbHNlO1xuICBtZS5zdGFydFggPSAwO1xuICBtZS5zdGFydFkgPSAwO1xuXG4gIG1lLl9tb3VzZUV2ZW50c0FsbG93ZWQgPSB0cnVlO1xuXG4gIG1lLnNldE1vdXNlRXZlbnRzQWxsb3dlZCA9IGRlYm91bmNlKCBmdW5jdGlvbiAoKSB7XG4gICAgbWUuX21vdXNlRXZlbnRzQWxsb3dlZCA9IHRydWU7XG4gIH0sIG1lLl9vcHRzLm1vdXNlZG93blRocmVzaG9sZCApO1xuXG4gIGVsZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIG1lLCBmYWxzZSApO1xuICBlbGUuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG1lLCBmYWxzZSApO1xufVxuXG52YXIgdGFwUHJvdG8gPSBUb3VjaHkucHJvdG90eXBlO1xuXG50YXBQcm90by5ibG9ja01vdXNlRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICBtZS5fbW91c2VFdmVudHNBbGxvd2VkID0gZmFsc2U7XG4gIG1lLnNldE1vdXNlRXZlbnRzQWxsb3dlZCgpO1xufTtcblxudGFwUHJvdG8uX2dldENsaWVudFggPSBmdW5jdGlvbiAoIGUgKSB7XG4gIGlmICggZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAwICkge1xuICAgIHJldHVybiBlLnRvdWNoZXNbIDAgXS5jbGllbnRYO1xuICB9XG4gIHJldHVybiBlLmNsaWVudFg7XG59O1xuXG50YXBQcm90by5fZ2V0Q2xpZW50WSA9IGZ1bmN0aW9uICggZSApIHtcbiAgaWYgKCBlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDAgKSB7XG4gICAgcmV0dXJuIGUudG91Y2hlc1sgMCBdLmNsaWVudFk7XG4gIH1cbiAgcmV0dXJuIGUuY2xpZW50WTtcbn07XG5cbnRhcFByb3RvLl9nZXRQYWdlWCA9IGZ1bmN0aW9uICggZSApIHtcbiAgaWYgKCBlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDAgKSB7XG4gICAgcmV0dXJuIGUudG91Y2hlc1sgMCBdLnBhZ2VYO1xuICB9XG4gIHJldHVybiBlLnBhZ2VYO1xufTtcblxudGFwUHJvdG8uX2dldFBhZ2VZID0gZnVuY3Rpb24gKCBlICkge1xuICBpZiAoIGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMCApIHtcbiAgICByZXR1cm4gZS50b3VjaGVzWyAwIF0ucGFnZVk7XG4gIH1cbiAgcmV0dXJuIGUucGFnZVk7XG59O1xuXG5cbnRhcFByb3RvLnN0YXJ0ID0gZnVuY3Rpb24gKCBlICkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIHZhciBlbGUgPSBtZS5lbDtcblxuICBtZS5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gIGlmICggZS50eXBlID09PSAndG91Y2hzdGFydCcgKSB7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBtZSwgZmFsc2UgKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgbWUsIGZhbHNlICk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGNhbmNlbCcsIG1lLCBmYWxzZSApO1xuICAgIG1lLmNoZWNrRm9yVGFwaG9sZCggZSApO1xuICAgIG1lLmJsb2NrTW91c2VFdmVudHMoKTtcbiAgfVxuXG4gIGlmICggZS50eXBlID09PSAnbW91c2Vkb3duJyAmJiBtZS5fbW91c2VFdmVudHNBbGxvd2VkICYmIChlLndoaWNoID09PSAxIHx8IGUuYnV0dG9uID09PSAwKSApIHtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1lLCBmYWxzZSApO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1lLCBmYWxzZSApO1xuICAgIG1lLmNoZWNrRm9yVGFwaG9sZCggZSApO1xuICB9XG5cbiAgbWUuc3RhcnRUYXJnZXQgPSBlLnRhcmdldDtcblxuICBtZS5oYW5kbGluZ1N0YXJ0ID0gdHJ1ZTtcblxuICBtZS5tb3ZlZCA9IGZhbHNlO1xuICBtZS5zdGFydFggPSBtZS5fZ2V0Q2xpZW50WCggZSApOyAvL2UudHlwZSA9PT0gJ3RvdWNoc3RhcnQnID8gZS50b3VjaGVzWyAwIF0uY2xpZW50WCA6IGUuY2xpZW50WDtcbiAgbWUuc3RhcnRZID0gbWUuX2dldENsaWVudFkoIGUgKTsgLy9lLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyA/IGUudG91Y2hlc1sgMCBdLmNsaWVudFkgOiBlLmNsaWVudFk7XG5cbn07XG5cbnRhcFByb3RvLmNoZWNrRm9yVGFwaG9sZCA9IGZ1bmN0aW9uICggZSApIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICBpZiAoICFtZS5fb3B0cy50YXBob2xkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNsZWFyVGltZW91dCggbWUudGFwSG9sZEludGVydmFsICk7XG5cbiAgbWUudGFwSG9sZEludGVydmFsID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCAobWUubW92ZWQgJiYgbWUuX29wdHMuZGlzY2FyZFRhcGhvbGRJZk1vdmUpIHx8ICFtZS5oYW5kbGluZ1N0YXJ0IHx8ICFtZS5fb3B0cy50YXBob2xkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ZW50SGVscGVyLmZpcmUoIG1lLnN0YXJ0VGFyZ2V0LCAndGFwOmhvbGQnLCB7XG4gICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIGRldGFpbDoge1xuICAgICAgICBwYWdlWDogbWUuX2dldFBhZ2VYKCBlICksXG4gICAgICAgIHBhZ2VZOiBtZS5fZ2V0UGFnZVkoIGUgKVxuICAgICAgfVxuICAgIH0gKTtcbiAgfSwgbWUuX29wdHMudGFwSG9sZE1pblRocmVzaG9sZCApO1xufTtcblxudGFwUHJvdG8ubW92ZSA9IGZ1bmN0aW9uICggZSApIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICBtZS5fbW92ZVggPSBtZS5fZ2V0Q2xpZW50WCggZSApO1xuICBtZS5fbW92ZVkgPSBtZS5fZ2V0Q2xpZW50WSggZSApO1xuXG4gIHZhciB0b2xlcmFuY2UgPSBtZS5fb3B0cy5taW5UYXBEaXNwbGFjZW1lbnRUb2xlcmFuY2U7XG4gIC8vaWYgZmluZ2VyIG1vdmVzIG1vcmUgdGhhbiAxMHB4IGZsYWcgdG8gY2FuY2VsXG4gIGlmICggTWF0aC5hYnMoIG1lLl9tb3ZlWCAtIHRoaXMuc3RhcnRYICkgPiB0b2xlcmFuY2UgfHwgTWF0aC5hYnMoIG1lLl9tb3ZlWSAtIHRoaXMuc3RhcnRZICkgPiB0b2xlcmFuY2UgKSB7XG4gICAgdGhpcy5tb3ZlZCA9IHRydWU7XG4gIH1cbn07XG5cbnRhcFByb3RvLmVuZCA9IGZ1bmN0aW9uICggZSApIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgdmFyIGVsZSA9IG1lLmVsO1xuXG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbWUsIGZhbHNlICk7XG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgbWUsIGZhbHNlICk7XG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBtZSwgZmFsc2UgKTtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaGNhbmNlbCcsIG1lLCBmYWxzZSApO1xuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtZSwgZmFsc2UgKTtcblxuICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gIHZhciBlbmRUaW1lID0gRGF0ZS5ub3coKTtcbiAgdmFyIHRpbWVEZWx0YSA9IGVuZFRpbWUgLSBtZS5zdGFydFRpbWU7XG5cbiAgbWUuaGFuZGxpbmdTdGFydCA9IGZhbHNlO1xuICBjbGVhclRpbWVvdXQoIG1lLnRhcEhvbGRJbnRlcnZhbCApO1xuXG4gIGlmICggIW1lLm1vdmVkICkge1xuXG4gICAgaWYgKCB0YXJnZXQgIT09IG1lLnN0YXJ0VGFyZ2V0IHx8IHRpbWVEZWx0YSA+IG1lLl9vcHRzLnRhcEhvbGRNaW5UaHJlc2hvbGQgKSB7XG4gICAgICBtZS5zdGFydFRhcmdldCA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBtZS5fb3B0cy50YXAgKSB7XG4gICAgICBldmVudEhlbHBlci5maXJlKCB0YXJnZXQsICd0YXAnLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIHBhZ2VYOiBtZS5fZ2V0UGFnZVgoIGUgKSxcbiAgICAgICAgICBwYWdlWTogbWUuX2dldFBhZ2VZKCBlIClcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICggIW1lLl9vcHRzLnN3aXBlIHx8IHRpbWVEZWx0YSA+IG1lLl9vcHRzLnN3aXBlVGhyZXNob2xkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkZWx0YVggPSBtZS5fbW92ZVggLSBtZS5zdGFydFg7XG4gIHZhciBkZWx0YVkgPSBtZS5fbW92ZVkgLSBtZS5zdGFydFk7XG5cbiAgdmFyIGFic0RlbHRhWCA9IE1hdGguYWJzKCBkZWx0YVggKTtcbiAgdmFyIGFic0RlbHRhWSA9IE1hdGguYWJzKCBkZWx0YVkgKTtcblxuICB2YXIgc3dpcGVJblggPSBhYnNEZWx0YVggPiBtZS5fb3B0cy5taW5Td2lwZURlbHRhWDtcbiAgdmFyIHN3aXBlSW5ZID0gYWJzRGVsdGFZID4gbWUuX29wdHMubWluU3dpcGVEZWx0YVk7XG5cbiAgdmFyIHN3aXBlSGFwcGVuID0gc3dpcGVJblggfHwgc3dpcGVJblk7XG5cbiAgaWYgKCAhc3dpcGVIYXBwZW4gKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGRpcmVjdGlvbiA9ICcnO1xuXG4gIGlmICggYWJzRGVsdGFYID49IGFic0RlbHRhWSApIHtcbiAgICBkaXJlY3Rpb24gKz0gKGRlbHRhWCA+IDAgPyAncmlnaHQnIDogJ2xlZnQnKTtcbiAgfSBlbHNlIHtcbiAgICBkaXJlY3Rpb24gKz0gKGRlbHRhWSA+IDAgPyAnZG93bicgOiAndXAnKTtcbiAgfVxuXG4gIGV2ZW50SGVscGVyLmZpcmUoIHRhcmdldCwgJ3N3aXBlJywge1xuICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICBkZXRhaWw6IHtcbiAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uLFxuICAgICAgZGVsdGFYOiBkZWx0YVgsXG4gICAgICBkZWx0YVk6IGRlbHRhWVxuICAgIH1cbiAgfSApO1xuXG4gIGV2ZW50SGVscGVyLmZpcmUoIHRhcmdldCwgJ3N3aXBlOicgKyBkaXJlY3Rpb24sIHtcbiAgICBidWJibGVzOiB0cnVlLFxuICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgZGV0YWlsOiB7XG4gICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgIGRlbHRhWDogZGVsdGFYLFxuICAgICAgZGVsdGFZOiBkZWx0YVlcbiAgICB9XG4gIH0gKTtcbn07XG5cbnRhcFByb3RvLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgY2xlYXJUaW1lb3V0KCBtZS50YXBIb2xkSW50ZXJ2YWwgKTtcblxuICBtZS5oYW5kbGluZ1N0YXJ0ID0gZmFsc2U7XG4gIG1lLm1vdmVkID0gZmFsc2U7XG4gIG1lLnN0YXJ0WCA9IDA7XG4gIG1lLnN0YXJ0WSA9IDA7XG59O1xuXG50YXBQcm90by5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICB2YXIgZWxlID0gbWUuZWw7XG5cbiAgbWUuaGFuZGxpbmdTdGFydCA9IGZhbHNlO1xuICBjbGVhclRpbWVvdXQoIG1lLnRhcEhvbGRJbnRlcnZhbCApO1xuXG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIG1lLCBmYWxzZSApO1xuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG1lLCBmYWxzZSApO1xuICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgbWUsIGZhbHNlICk7XG4gIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hjYW5jZWwnLCBtZSwgZmFsc2UgKTtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBtZSwgZmFsc2UgKTtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbWUsIGZhbHNlICk7XG4gIG1lLmVsID0gbnVsbDtcbn07XG5cbnRhcFByb3RvLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24gKCBlICkge1xuICB2YXIgbWUgPSB0aGlzO1xuICBzd2l0Y2ggKGUudHlwZSkge1xuICAgIGNhc2UgJ3RvdWNoc3RhcnQnOiBtZS5zdGFydCggZSApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW91c2Vtb3ZlJzogbWUubW92ZSggZSApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG91Y2htb3ZlJzogbWUubW92ZSggZSApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG91Y2hlbmQnOiBtZS5lbmQoIGUgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RvdWNoY2FuY2VsJzogbWUuY2FuY2VsKCBlICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtb3VzZWRvd24nOiBtZS5zdGFydCggZSApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW91c2V1cCc6IG1lLmVuZCggZSApO1xuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVG91Y2h5O1xuIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxudmFyICQkID0gcmVxdWlyZSgnZG9tcXVlcnknKTtcbnZhciBFeHRlbmREZWZhdWx0ID0gcmVxdWlyZSgnLi9leHRlbmRfZGVmYXVsdCcpO1xudmFyIFRlbXBsYXRlRW5naW5lID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS1lbmdpbmUnKTtcblxudmFyIENhbnZhc0JvYXJkID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgc2VsZWN0b3I6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBFeHRlbmREZWZhdWx0KGRlZmF1bHRzLCBhcmd1bWVudHNbMF0pO1xuICAgIH1cbn1cblxuQ2FudmFzQm9hcmQucHJvdG90eXBlLmNyZWF0ZUJvYXJkID0gZnVuY3Rpb24odGV4dCkge1xuICAgIGNvbnNvbGUubG9nKCdIaSBqdXN0IGNyZWF0ZWQgdGhpcyAnICsgdGV4dCArICcgZm9yIHlvdScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBDYW52YXNCb2FyZCgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6dHJ1ZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNvdXJjZSwgcHJvcGVydGllcykge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICBzb3VyY2VbcHJvcGVydHldID0gcHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxudmFyIExvY2FsU3RvcmFnZSA9IHtcbiAgICBnZXRJdGVtOiBmdW5jdGlvbihrZXksIG9wdGlvbmFsQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRzTG9jYWxTdG9yYWdlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZGF0YSA9IHR5cGVvZiBkYXRhICE9PSAndW5kZWZpbmVkJyA/IGRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIG9wdGlvbmFsQ2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbmFsQ2FsbGJhY2soZGF0YSkgOiBkYXRhO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG5cbiAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUuaGFzT3duUHJvcGVydHkoJ19fZXhwaXJ5JykpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhwaXJ5ID0gdmFsdWUuX19leHBpcnk7XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGV4cGlyeSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUl0ZW0oa2V5KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGRhdGEgb2JqZWN0IG9ubHkuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh2YWx1ZS5fX2RhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVmFsdWUgZG9lc24ndCBoYXZlIGV4cGlyeSBkYXRhLCBqdXN0IHNlbmQgaXQgd2hvbGVzYWxlLlxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRJdGVtOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgZXhwaXJ5KSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0c0xvY2FsU3RvcmFnZSgpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgfHwga2V5ID09PSBudWxsIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGV4cGlyeSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHZhbHVlID0ge1xuICAgICAgICAgICAgX19kYXRhOiB2YWx1ZSxcbiAgICAgICAgICAgIF9fZXhwaXJ5OiBEYXRlLm5vdygpICsgKHBhcnNlSW50KGV4cGlyeSkgKiAxMDAwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVW5hYmxlIHRvIHN0b3JlICcgKyBrZXkgKyAnIGluIGxvY2FsU3RvcmFnZSBkdWUgdG8gJyArIGUubmFtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW1vdmVJdGVtOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICh0aGlzLnN1cHBvcnRzTG9jYWxTdG9yYWdlKCkpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3VwcG9ydHNMb2NhbFN0b3JhZ2UoKSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3VwcG9ydHNMb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdfJywgJ18nKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfJyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxTdG9yYWdlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50LCBodG1sKSB7XG4gICAgaWYgKGh0bWwgPT09IG51bGwpIHJldHVybjtcblxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxuICAgICAgICB0bXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib2R5JyksXG4gICAgICAgIGNoaWxkO1xuXG4gICAgdG1wLmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICB3aGlsZSAoY2hpbGQgPSB0bXAuZmlyc3RDaGlsZCkge1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG5cbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xuICAgIGZyYWcgPSB0bXAgPSBudWxsO1xufTtcbiJdfQ==
