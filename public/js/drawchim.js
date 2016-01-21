(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Drawchim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* jshint node: true */

var ExtendDefault = require('./src/extend_default');

var drawChim = function(options) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    var defaults = {
        selector: null,
        clearBtn: null
    }

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }

    this.canvas = this.options.selector;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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
}

drawChim.prototype.createCanvas = function() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'rgba(0,0,255,0.5)';
}

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
}

drawChim.prototype.drawMove = function(e) {
    var touchObj = e.changedTouches[0];

    if (this.isDown !== false) {
        this.canvasX = touchObj.pageX - this.canvas.offsetLeft;
        this.canvasY = touchObj.pageY - this.canvas.offsetTop;
        this.ctx.lineTo(this.canvasX, this.canvasY);
        this.ctx.stroke();
    }
}

drawChim.prototype.drawEnd = function() {
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

drawChim.prototype.clearCanvas = function() {
    this.ctx.fillStyle = '#000';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.storeHistory();
}

module.exports = drawChim;
},{"./src/extend_default":2}],2:[function(require,module,exports){
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
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5kZXguanMiLCJzcmMvZXh0ZW5kX2RlZmF1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxudmFyIEV4dGVuZERlZmF1bHQgPSByZXF1aXJlKCcuL3NyYy9leHRlbmRfZGVmYXVsdCcpO1xuXG52YXIgZHJhd0NoaW0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRyYXdDaGltKSkge1xuICAgICAgcmV0dXJuIG5ldyBkcmF3Q2hpbSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgc2VsZWN0b3I6IG51bGwsXG4gICAgICAgIGNsZWFyQnRuOiBudWxsXG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBFeHRlbmREZWZhdWx0KGRlZmF1bHRzLCBhcmd1bWVudHNbMF0pO1xuICAgIH1cblxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XG4gICAgdGhpcy5ibGFua0NhbnZhcyA9IHRydWU7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuY2FudmFzWDtcbiAgICB0aGlzLmNhbnZhc1k7XG5cbiAgICB0aGlzLl9pbml0KCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNyZWF0ZUNhbnZhcygpO1xuICAgIHRoaXMuc2V0RXZlbnRzKCk7XG4gICAgdGhpcy5zdG9yZUNhbnZhc0FzSW1hZ2UoKTtcbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLmNyZWF0ZUNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSA2O1xuICAgIHRoaXMuY3R4LmxpbmVDYXAgPSAncm91bmQnO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ3JnYmEoMCwwLDI1NSwwLjUpJztcbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLnNldEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF90aGlzLmRyYXdTdGFydChlKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLmRyYXdNb3ZlKGUpO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBfdGhpcy5kcmF3RW5kKCk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy5vcHRpb25zLmNsZWFyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuY2xlYXJDYW52YXMoKTtcbiAgICB9LCBmYWxzZSk7XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5kcmF3U3RhcnQgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRvdWNoT2JqID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgIGlmICh0aGlzLmJsYW5rQ2FudmFzKSB7XG4gICAgICAgIHRoaXMuc3RvcmVIaXN0b3J5KCk7XG4gICAgfVxuXG4gICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIFxuICAgIHRoaXMuY2FudmFzWCA9IHRvdWNoT2JqLnBhZ2VYIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICB0aGlzLmNhbnZhc1kgPSB0b3VjaE9iai5wYWdlWSAtIHRoaXMuY2FudmFzLm9mZnNldFRvcDtcblxuICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNhbnZhc1gsIHRoaXMuY2FudmFzWSk7XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5kcmF3TW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdG91Y2hPYmogPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuXG4gICAgaWYgKHRoaXMuaXNEb3duICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmNhbnZhc1ggPSB0b3VjaE9iai5wYWdlWCAtIHRoaXMuY2FudmFzLm9mZnNldExlZnQ7XG4gICAgICAgIHRoaXMuY2FudmFzWSA9IHRvdWNoT2JqLnBhZ2VZIC0gdGhpcy5jYW52YXMub2Zmc2V0VG9wO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jYW52YXNYLCB0aGlzLmNhbnZhc1kpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICB9XG59XG5cbmRyYXdDaGltLnByb3RvdHlwZS5kcmF3RW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xufVxuXG5kcmF3Q2hpbS5wcm90b3R5cGUuc3RvcmVIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGltZyA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoe2ltYWdlRGF0YTogaW1nfSwgJycsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5jdXJJbWcgPSBpbWc7XG4gICAgfVxufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLnN0b3JlQ2FudmFzQXNJbWFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLmN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuY3VySW1nKSB7XG4gICAgICAgICAgICBpbWcuc3JjID0gbG9jYWxTdG9yYWdlLmN1ckltZztcbiAgICAgICAgICAgIHRoaXMuYmxhbmtDYW52YXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZHJhd0NoaW0ucHJvdG90eXBlLmNsZWFyQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRyYXdDaGltOyIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOnRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb3VyY2UsIHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgc291cmNlW3Byb3BlcnR5XSA9IHByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG59OyJdfQ==
