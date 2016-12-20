'use strict';
/* jshint node: true */

var $$ = require('domquery');
var ExtendDefault = require('./src/extend_default');
var TemplateEngine = require('./src/template-engine');
var CanvasBoard = require('./src/canvas-board');
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
    CanvasBoard.createBoard('hello')

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
        buttonText: null,
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
