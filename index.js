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