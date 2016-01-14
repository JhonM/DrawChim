(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Drawchim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* jshint node: true */

var Multiply = require('./src/multiply');

var drawChim = function(elm) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    this.elm = elm;
    this.elm.width = window.innerWidth;
    this.elm.height = window.innerHeight;
    
    this.ctx = elm.getContext('2d');

    this._init();
};

drawChim.prototype._init = function() {
    this.createCanvas();
}

drawChim.prototype.createCanvas = function() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'rgba(0,0,255,0.5)';
}

module.exports = drawChim;
},{"./src/multiply":2}],2:[function(require,module,exports){
'use strict';
/* jshint node: true */

module.exports = function(val) {
    return val * 5;
};
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5kZXguanMiLCJzcmMvbXVsdGlwbHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxudmFyIE11bHRpcGx5ID0gcmVxdWlyZSgnLi9zcmMvbXVsdGlwbHknKTtcblxudmFyIGRyYXdDaGltID0gZnVuY3Rpb24oZWxtKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRyYXdDaGltKSkge1xuICAgICAgcmV0dXJuIG5ldyBkcmF3Q2hpbSgpO1xuICAgIH1cblxuICAgIHRoaXMuZWxtID0gZWxtO1xuICAgIHRoaXMuZWxtLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy5lbG0uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIFxuICAgIHRoaXMuY3R4ID0gZWxtLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNyZWF0ZUNhbnZhcygpO1xufVxuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY3JlYXRlQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDY7XG4gICAgdGhpcy5jdHgubGluZUNhcCA9ICdyb3VuZCc7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgwLDAsMjU1LDAuNSknO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRyYXdDaGltOyIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHZhbCAqIDU7XG59OyJdfQ==
