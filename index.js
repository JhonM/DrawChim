'use strict';
/* jshint node: true */

var Multiply = require('./src/multiply');

var drawChim = function(elm) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    this.canvas = elm;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.isDown = false;
    this.blankCanvas = true;
    this.ctx = canvas.getContext('2d');
    this.canvasX;
    this.canvasY;

    this._init();
};

drawChim.prototype._init = function() {
    this.createCanvas();
    this.setEvents();
    this.storeCanvasAsImage()
}

drawChim.prototype.createCanvas = function() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'rgba(0,0,255,0.5)';
}

drawChim.prototype.setEvents = function() {
    var _this = this;

    this.canvas.addEventListener('touchstart', function(e) {
        _this.drawStart(e);
    }, false);

    this.canvas.addEventListener('touchmove', function(e) {
        _this.drawMove(e);
    }, false);

    this.canvas.addEventListener('touchend', function(e) {
        _this.drawEnd(e);
    }, false);
}

drawChim.prototype.drawStart = function(e) {
    e.preventDefault();
    var touchObj = e.changedTouches[0];

    if (this.blankCanvas) {
        this.storeHistory();
    }

    this.isDown = true;
    this.ctx.beginPath();
    
    this.canvasX = touchObj.pageX - this.canvas.offsetLeft;
    this.canvasY = touchObj.pageY - this.canvas.offsetTop;

    this.ctx.moveTo(this.canvasX, this.canvasY);
}

drawChim.prototype.drawMove = function(e) {
    e.preventDefault();
    var touchObj = e.changedTouches[0];

    if (this.isDown !== false) {
        this.canvasX = touchObj.pageX - this.canvas.offsetLeft;
        this.canvasY = touchObj.pageY - this.canvas.offsetTop;
        this.ctx.lineTo(this.canvasX, this.canvasY);
        this.ctx.stroke();
    }
}

drawChim.prototype.drawEnd = function(e) {
    e.preventDefault();
    this.isDown = false;
    this.ctx.closePath();
    this.storeHistory();
}

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
        }

        if (localStorage.curImg) {
            img.src = localStorage.curImg;
            this.blankCanvas = false;
        }
    }
}

module.exports = drawChim;