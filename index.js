'use strict';
/* jshint node: true */

var $$ = require('domquery');
var ExtendDefault = require('./src/extend_default');
var TemplateEngine = require('./src/template-engine');
var Touchy = require('touchy');
Touchy.enableOn(document);

var drawChim = function(options) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    var defaults = {
        selector: null,
        clearBtn: null,
        stains: ['255, 0, 0', '0, 255, 0', '0, 0, 255', '0, 0, 0']
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

    this.canvas = this.options.selector;
    this.canvas.width = 1000;
    this.canvas.height = 788;
    this.canvas.bgColor = '#ffffff';
    this.isDown = false;
    this.blankCanvas = true;
    this.ctx = this.canvas.getContext('2d');
    this.canvasX;
    this.canvasY;

    this._init();
};

drawChim.prototype._init = function() {
    this.createCanvas();
    this.setEvents();
    this.storeCanvasAsImage();
};

drawChim.prototype.createCanvas = function() {
    this.ctx.fillStyle = this.canvas.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'rgba(58, 56, 68, 0.5)';

    this.createStain();
};

drawChim.prototype.createStain = function() {
    var template = 
        '<ul class="stains">' +
            '<%for(var index in this.colors) {%>' +
                '<li data-color="<%this.colors[index]%>" style="background:rgb(<%this.colors[index]%>)"></li>' +
            '<%}%>' +
            '<li class="add-stain">+</li>' +
        '</ul>',
        stainHolder = document.getElementById('stain-pallet'),
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

    this.options.clearBtn.addEventListener('touchstart', function() {
        _this.clearCanvas();
    }, false);

    $$('.stains li').on('touchstart', function(e) {
        _this.swapColor(e);
    });

    this.canvas.addEventListener('tap:hold', function (e) {
        _this.colorPickerCircle(e);
    });
};

drawChim.prototype.swapColor = function(event) {
    var elm = event.srcElement,
        newColor = elm.dataset.color;

    $$('.stains li').removeClass('is-active');
    $$(elm).addClass('is-active');
    this.ctx.strokeStyle = 'rgba(' + newColor + ', ' +  0.5 + ')';
    // debugger;
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

module.exports = drawChim;