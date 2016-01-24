(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Drawchim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* jshint node: true */

var ExtendDefault = require('./src/extend_default');
var TemplateEngine = require('./src/template-engine');

var drawChim = function(options) {
    if (!(this instanceof drawChim)) {
      return new drawChim();
    }

    var defaults = {
        selector: null,
        clearBtn: null,
        stains: ['red', 'green', 'pink', 'yellow', 'purple', 'black', 'blue']
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
                '<li data-color="<%this.colors[index]%>" style="background:<%this.colors[index]%>"></li>' +
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

    var picker = document.getElementsByTagName('li');
};

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
},{"./src/extend_default":2,"./src/template-engine":3}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5kZXguanMiLCJzcmMvZXh0ZW5kX2RlZmF1bHQuanMiLCJzcmMvdGVtcGxhdGUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG52YXIgRXh0ZW5kRGVmYXVsdCA9IHJlcXVpcmUoJy4vc3JjL2V4dGVuZF9kZWZhdWx0Jyk7XG52YXIgVGVtcGxhdGVFbmdpbmUgPSByZXF1aXJlKCcuL3NyYy90ZW1wbGF0ZS1lbmdpbmUnKTtcblxudmFyIGRyYXdDaGltID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBkcmF3Q2hpbSkpIHtcbiAgICAgIHJldHVybiBuZXcgZHJhd0NoaW0oKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgIHNlbGVjdG9yOiBudWxsLFxuICAgICAgICBjbGVhckJ0bjogbnVsbCxcbiAgICAgICAgc3RhaW5zOiBbJ3JlZCcsICdncmVlbicsICdwaW5rJywgJ3llbGxvdycsICdwdXJwbGUnLCAnYmxhY2snLCAnYmx1ZSddXG4gICAgfTtcblxuICAgIGlmIChhcmd1bWVudHNbMF0gJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gRXh0ZW5kRGVmYXVsdChkZWZhdWx0cywgYXJndW1lbnRzWzBdKTtcbiAgICB9XG5cbiAgICB0aGlzLmNhbnZhcyA9IHRoaXMub3B0aW9ucy5zZWxlY3RvcjtcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IDEwMDA7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gNzg4O1xuICAgIHRoaXMuY2FudmFzLmJnQ29sb3IgPSAnI2ZmZmZmZic7XG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJsYW5rQ2FudmFzID0gdHJ1ZTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5jYW52YXNYO1xuICAgIHRoaXMuY2FudmFzWTtcblxuICAgIHRoaXMuX2luaXQoKTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3JlYXRlQ2FudmFzKCk7XG4gICAgdGhpcy5zZXRFdmVudHMoKTtcbiAgICB0aGlzLnN0b3JlQ2FudmFzQXNJbWFnZSgpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmNyZWF0ZUNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY2FudmFzLmJnQ29sb3I7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gNjtcbiAgICB0aGlzLmN0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKDU4LCA1NiwgNjgsIDAuNSknO1xuXG4gICAgdGhpcy5jcmVhdGVTdGFpbigpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmNyZWF0ZVN0YWluID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gXG4gICAgICAgICc8dWwgY2xhc3M9XCJzdGFpbnNcIj4nICtcbiAgICAgICAgICAgICc8JWZvcih2YXIgaW5kZXggaW4gdGhpcy5jb2xvcnMpIHslPicgK1xuICAgICAgICAgICAgICAgICc8bGkgZGF0YS1jb2xvcj1cIjwldGhpcy5jb2xvcnNbaW5kZXhdJT5cIiBzdHlsZT1cImJhY2tncm91bmQ6PCV0aGlzLmNvbG9yc1tpbmRleF0lPlwiPjwvbGk+JyArXG4gICAgICAgICAgICAnPCV9JT4nICtcbiAgICAgICAgICAgICc8bGkgY2xhc3M9XCJhZGQtc3RhaW5cIj4rPC9saT4nICtcbiAgICAgICAgJzwvdWw+JyxcbiAgICAgICAgc3RhaW5Ib2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhaW4tcGFsbGV0JyksXG4gICAgICAgIHN0YWlucyA9IFRlbXBsYXRlRW5naW5lKHRlbXBsYXRlLCB7XG4gICAgICAgICAgICBjb2xvcnM6IHRoaXMub3B0aW9ucy5zdGFpbnNcbiAgICAgICAgfSk7XG5cbiAgICBzdGFpbkhvbGRlci5pbm5lckhUTUwgPSBzdGFpbnM7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuc2V0RXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMuZHJhd1N0YXJ0KGUpO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZHJhd01vdmUoZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLmRyYXdFbmQoKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLm9wdGlvbnMuY2xlYXJCdG4uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHZhciBwaWNrZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5kcmF3U3RhcnQgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRvdWNoT2JqID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgIGlmICh0aGlzLmJsYW5rQ2FudmFzKSB7XG4gICAgICAgIHRoaXMuc3RvcmVIaXN0b3J5KCk7XG4gICAgfVxuXG4gICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIFxuICAgIHRoaXMuY2FudmFzWCA9IHRvdWNoT2JqLnBhZ2VYIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICB0aGlzLmNhbnZhc1kgPSB0b3VjaE9iai5wYWdlWSAtIHRoaXMuY2FudmFzLm9mZnNldFRvcDtcblxuICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNhbnZhc1gsIHRoaXMuY2FudmFzWSk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuZHJhd01vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRvdWNoT2JqID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgIGlmICh0aGlzLmlzRG93biAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5jYW52YXNYID0gdG91Y2hPYmoucGFnZVggLSB0aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgICAgICB0aGlzLmNhbnZhc1kgPSB0b3VjaE9iai5wYWdlWSAtIHRoaXMuY2FudmFzLm9mZnNldFRvcDtcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY2FudmFzWCwgdGhpcy5jYW52YXNZKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfVxufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmRyYXdFbmQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuc3RvcmVIaXN0b3J5KCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuc3RvcmVIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGltZyA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoe2ltYWdlRGF0YTogaW1nfSwgJycsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5jdXJJbWcgPSBpbWc7XG4gICAgfVxufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLnN0b3JlQ2FudmFzQXNJbWFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLmN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmN1ckltZykge1xuICAgICAgICAgICAgaW1nLnNyYyA9IGxvY2FsU3RvcmFnZS5jdXJJbWc7XG4gICAgICAgICAgICB0aGlzLmJsYW5rQ2FudmFzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY2xlYXJDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNhbnZhcy5iZ0NvbG9yO1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkcmF3Q2hpbTsiLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTp0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc291cmNlLCBwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gcHJvcGVydGllcykge1xuICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgIHNvdXJjZVtwcm9wZXJ0eV0gPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xufTsiLCIndXNlIHN0cmljdCc7XG4vKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG4vKlxuICAgIHZhciB0ZW1wbGF0ZSA9ICc8cD5IZWxsbywgaWsgYmVuIDwldGhpcy5uYW1lJT4uIElrIGJlbiA8JXRoaXMucHJvZmlsZS5hZ2UlPiBqYWFyIG91ZCBlbiBiZW4gZXJnIDwldGhpcy5zdGF0ZSU+PC9wPic7XG4gICAgY29uc29sZS5sb2coVGVtcGxhdGVFbmdpbmUodGVtcGxhdGUsIHtcbiAgICAgICAgbmFtZTogJ0pob24gTWFqb29yJyxcbiAgICAgICAgcHJvZmlsZToge2FnZTogMzR9LFxuICAgICAgICBzdGF0ZTogJ2xpZWYnXG4gICAgfSkpO1xuXG4gICAgdmFyIHNraWxsVGVtcGxhdGUgPSBcbiAgICAgICAgJ015IFNraWxsczonICtcbiAgICAgICAgJzwlZm9yKHZhciBpbmRleCBpbiB0aGlzLnNraWxscykgeyU+JyArXG4gICAgICAgICc8YSBocmVmPVwiI1wiPjwldGhpcy5za2lsbHNbaW5kZXhdJT48L2E+JyArXG4gICAgICAgICc8JX0lPic7XG5cbiAgICBjb25zb2xlLmxvZyhUZW1wbGF0ZUVuZ2luZShza2lsbFRlbXBsYXRlLCB7XG4gICAgICAgIHNraWxsczogWydqcycsICdodG1sJywgJ2NzcyddXG4gICAgfSkpO1xuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihodG1sLCBvcHRpb25zKSB7XG4gICAgdmFyIHJlID0gLzwlKC4rPyklPi9nLFxuICAgICAgICByZUV4cCA9IC8oXiggKT8odmFyfGlmfGZvcnxlbHNlfHN3aXRjaHxjYXNlfGJyZWFrfHt8fXw7KSkoLiopPy9nLFxuICAgICAgICBjb2RlID0gJ3dpdGgob2JqKSB7IHZhciByPVtdO1xcbicsXG4gICAgICAgIGN1cnNvciA9IDAsXG4gICAgICAgIG1hdGNoLFxuICAgICAgICByZXN1bHQ7XG5cbiAgICB2YXIgYWRkID0gZnVuY3Rpb24obGluZSwganMpIHtcbiAgICAgICAganMgPyBjb2RlICs9IGxpbmUubWF0Y2gocmVFeHApID8gbGluZSArICdcXG4nIDogJ3IucHVzaCgnICsgbGluZSArICcpO1xcbicgOlxuICAgICAgICAgICAgKGNvZGUgKz0gbGluZSAhPSAnJyA/ICdyLnB1c2goXCInICsgbGluZS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCIpO1xcbicgOiAnJyk7XG4gICAgICAgIHJldHVybiBhZGQ7XG4gICAgfVxuXG4gICAgd2hpbGUobWF0Y2ggPSByZS5leGVjKGh0bWwpKSB7XG4gICAgICAgIGFkZChodG1sLnNsaWNlKGN1cnNvciwgbWF0Y2guaW5kZXgpKShtYXRjaFsxXSwgdHJ1ZSk7XG4gICAgICAgIGN1cnNvciA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgIH1cblxuICAgIGFkZChodG1sLnN1YnN0cihjdXJzb3IsIGh0bWwubGVuZ3RoIC0gY3Vyc29yKSk7XG4gICAgY29kZSA9IChjb2RlICsgJ3JldHVybiByLmpvaW4oXCJcIik7IH0nKS5yZXBsYWNlKC9bXFxyXFx0XFxuXS9nLCAnJyk7XG5cbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBuZXcgRnVuY3Rpb24oJ29iaicsIGNvZGUpLmFwcGx5KG9wdGlvbnMsIFtvcHRpb25zXSk7XG4gICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIidcIiArIGVyci5tZXNzYWdlICsgXCInXCIsIFwiIGluIFxcblxcbkNvZGU6XFxuXCIsIGNvZGUsIFwiXFxuXCIpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59Il19
