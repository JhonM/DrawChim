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
        stains: ['255, 0, 0', '0, 255, 0', '0, 0, 255', '0, 0, 0']
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

    this.appId = null;
    this.canvasItems = [];
    this.canvasObject = {};
    this.num = 0;

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
                ls.setItem('canvasItem' + '-' + list[i].id, list[i].id, 3600);
            }
        }
    } else {
        this.canvas = document.getElementById(canvasID); //this.canvasItems[0].id

        // console.log(findElementOnID(this.canvasItems, canvasID))
        this.selectCanvas();
    }

    this.setCurrentCanvas();

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
    this.buildScene();
    this.buildCanvas();
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
        _this.filters(e);
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
        _this.buildCanvas(canvasID, true);

        // remove is-active class
        app.classList.remove('is-active');
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
        var template =
            "<div>" +
                "<h1>Kies filter</h1>" +
            "</div>",
            stains = TemplateEngine(template, {
                colors: ''
            });

        var modal = new Modalblanc({
            content: stains,
            animation: 'slide-in-right'
        });
        modal.open();
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
