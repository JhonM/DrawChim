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

    var picker = document.getElementsByName('li');

    picker.addEventListener('touchstart', function(e) {
        debugger
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5kZXguanMiLCJzcmMvZXh0ZW5kX2RlZmF1bHQuanMiLCJzcmMvdGVtcGxhdGUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbnZhciBFeHRlbmREZWZhdWx0ID0gcmVxdWlyZSgnLi9zcmMvZXh0ZW5kX2RlZmF1bHQnKTtcbnZhciBUZW1wbGF0ZUVuZ2luZSA9IHJlcXVpcmUoJy4vc3JjL3RlbXBsYXRlLWVuZ2luZScpO1xuXG52YXIgZHJhd0NoaW0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRyYXdDaGltKSkge1xuICAgICAgcmV0dXJuIG5ldyBkcmF3Q2hpbSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgc2VsZWN0b3I6IG51bGwsXG4gICAgICAgIGNsZWFyQnRuOiBudWxsLFxuICAgICAgICBzdGFpbnM6IFsncmVkJywgJ2dyZWVuJywgJ3BpbmsnLCAneWVsbG93JywgJ3B1cnBsZScsICdibGFjaycsICdibHVlJ11cbiAgICB9O1xuXG4gICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBFeHRlbmREZWZhdWx0KGRlZmF1bHRzLCBhcmd1bWVudHNbMF0pO1xuICAgIH1cblxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTAwMDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSA3ODg7XG4gICAgdGhpcy5jYW52YXMuYmdDb2xvciA9ICcjZmZmZmZmJztcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIHRoaXMuYmxhbmtDYW52YXMgPSB0cnVlO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLmNhbnZhc1g7XG4gICAgdGhpcy5jYW52YXNZO1xuXG4gICAgdGhpcy5faW5pdCgpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jcmVhdGVDYW52YXMoKTtcbiAgICB0aGlzLnNldEV2ZW50cygpO1xuICAgIHRoaXMuc3RvcmVDYW52YXNBc0ltYWdlKCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY3JlYXRlQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jYW52YXMuYmdDb2xvcjtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSA2O1xuICAgIHRoaXMuY3R4LmxpbmVDYXAgPSAncm91bmQnO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ3JnYmEoNTgsIDU2LCA2OCwgMC41KSc7XG5cbiAgICB0aGlzLmNyZWF0ZVN0YWluKCk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuY3JlYXRlU3RhaW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBcbiAgICAgICAgJzx1bCBjbGFzcz1cInN0YWluc1wiPicgK1xuICAgICAgICAgICAgJzwlZm9yKHZhciBpbmRleCBpbiB0aGlzLmNvbG9ycykgeyU+JyArXG4gICAgICAgICAgICAgICAgJzxsaSBkYXRhLWNvbG9yPVwiPCV0aGlzLmNvbG9yc1tpbmRleF0lPlwiIHN0eWxlPVwiYmFja2dyb3VuZDo8JXRoaXMuY29sb3JzW2luZGV4XSU+XCI+PC9saT4nICtcbiAgICAgICAgICAgICc8JX0lPicgK1xuICAgICAgICAgICAgJzxsaSBjbGFzcz1cImFkZC1zdGFpblwiPis8L2xpPicgK1xuICAgICAgICAnPC91bD4nLFxuICAgICAgICBzdGFpbkhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFpbi1wYWxsZXQnKSxcbiAgICAgICAgc3RhaW5zID0gVGVtcGxhdGVFbmdpbmUodGVtcGxhdGUsIHtcbiAgICAgICAgICAgIGNvbG9yczogdGhpcy5vcHRpb25zLnN0YWluc1xuICAgICAgICB9KTtcblxuICAgIHN0YWluSG9sZGVyLmlubmVySFRNTCA9IHN0YWlucztcbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zZXRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5kcmF3U3RhcnQoZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBfdGhpcy5kcmF3TW92ZShlKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZHJhd0VuZCgpO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHRoaXMub3B0aW9ucy5jbGVhckJ0bi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdmFyIHBpY2tlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdsaScpO1xuXG4gICAgcGlja2VyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGRlYnVnZ2VyXG4gICAgfSk7XG59O1xuXG5kcmF3Q2hpbS5wcm90b3R5cGUuZHJhd1N0YXJ0ID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciB0b3VjaE9iaiA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICBpZiAodGhpcy5ibGFua0NhbnZhcykge1xuICAgICAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xuICAgIH1cblxuICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICBcbiAgICB0aGlzLmNhbnZhc1ggPSB0b3VjaE9iai5wYWdlWCAtIHRoaXMuY2FudmFzLm9mZnNldExlZnQ7XG4gICAgdGhpcy5jYW52YXNZID0gdG91Y2hPYmoucGFnZVkgLSB0aGlzLmNhbnZhcy5vZmZzZXRUb3A7XG5cbiAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jYW52YXNYLCB0aGlzLmNhbnZhc1kpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmRyYXdNb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciB0b3VjaE9iaiA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICBpZiAodGhpcy5pc0Rvd24gIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuY2FudmFzWCA9IHRvdWNoT2JqLnBhZ2VYIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICAgICAgdGhpcy5jYW52YXNZID0gdG91Y2hPYmoucGFnZVkgLSB0aGlzLmNhbnZhcy5vZmZzZXRUb3A7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNhbnZhc1gsIHRoaXMuY2FudmFzWSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH1cbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5kcmF3RW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLnN0b3JlSGlzdG9yeSgpO1xufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLnN0b3JlSGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbWcgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtpbWFnZURhdGE6IGltZ30sICcnLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY3VySW1nID0gaW1nO1xuICAgIH1cbn07XG5cbmRyYXdDaGltLnByb3RvdHlwZS5zdG9yZUNhbnZhc0FzSW1hZ2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5jdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5jdXJJbWcpIHtcbiAgICAgICAgICAgIGltZy5zcmMgPSBsb2NhbFN0b3JhZ2UuY3VySW1nO1xuICAgICAgICAgICAgdGhpcy5ibGFua0NhbnZhcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZHJhd0NoaW0ucHJvdG90eXBlLmNsZWFyQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jYW52YXMuYmdDb2xvcjtcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgdGhpcy5zdG9yZUhpc3RvcnkoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZHJhd0NoaW07IiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6dHJ1ZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNvdXJjZSwgcHJvcGVydGllcykge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICBzb3VyY2VbcHJvcGVydHldID0gcHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cblxuLypcbiAgICB2YXIgdGVtcGxhdGUgPSAnPHA+SGVsbG8sIGlrIGJlbiA8JXRoaXMubmFtZSU+LiBJayBiZW4gPCV0aGlzLnByb2ZpbGUuYWdlJT4gamFhciBvdWQgZW4gYmVuIGVyZyA8JXRoaXMuc3RhdGUlPjwvcD4nO1xuICAgIGNvbnNvbGUubG9nKFRlbXBsYXRlRW5naW5lKHRlbXBsYXRlLCB7XG4gICAgICAgIG5hbWU6ICdKaG9uIE1ham9vcicsXG4gICAgICAgIHByb2ZpbGU6IHthZ2U6IDM0fSxcbiAgICAgICAgc3RhdGU6ICdsaWVmJ1xuICAgIH0pKTtcblxuICAgIHZhciBza2lsbFRlbXBsYXRlID0gXG4gICAgICAgICdNeSBTa2lsbHM6JyArXG4gICAgICAgICc8JWZvcih2YXIgaW5kZXggaW4gdGhpcy5za2lsbHMpIHslPicgK1xuICAgICAgICAnPGEgaHJlZj1cIiNcIj48JXRoaXMuc2tpbGxzW2luZGV4XSU+PC9hPicgK1xuICAgICAgICAnPCV9JT4nO1xuXG4gICAgY29uc29sZS5sb2coVGVtcGxhdGVFbmdpbmUoc2tpbGxUZW1wbGF0ZSwge1xuICAgICAgICBza2lsbHM6IFsnanMnLCAnaHRtbCcsICdjc3MnXVxuICAgIH0pKTtcbiovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaHRtbCwgb3B0aW9ucykge1xuICAgIHZhciByZSA9IC88JSguKz8pJT4vZyxcbiAgICAgICAgcmVFeHAgPSAvKF4oICk/KHZhcnxpZnxmb3J8ZWxzZXxzd2l0Y2h8Y2FzZXxicmVha3x7fH18OykpKC4qKT8vZyxcbiAgICAgICAgY29kZSA9ICd3aXRoKG9iaikgeyB2YXIgcj1bXTtcXG4nLFxuICAgICAgICBjdXJzb3IgPSAwLFxuICAgICAgICBtYXRjaCxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgdmFyIGFkZCA9IGZ1bmN0aW9uKGxpbmUsIGpzKSB7XG4gICAgICAgIGpzID8gY29kZSArPSBsaW5lLm1hdGNoKHJlRXhwKSA/IGxpbmUgKyAnXFxuJyA6ICdyLnB1c2goJyArIGxpbmUgKyAnKTtcXG4nIDpcbiAgICAgICAgICAgIChjb2RlICs9IGxpbmUgIT0gJycgPyAnci5wdXNoKFwiJyArIGxpbmUucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiKTtcXG4nIDogJycpO1xuICAgICAgICByZXR1cm4gYWRkO1xuICAgIH1cblxuICAgIHdoaWxlKG1hdGNoID0gcmUuZXhlYyhodG1sKSkge1xuICAgICAgICBhZGQoaHRtbC5zbGljZShjdXJzb3IsIG1hdGNoLmluZGV4KSkobWF0Y2hbMV0sIHRydWUpO1xuICAgICAgICBjdXJzb3IgPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICB9XG5cbiAgICBhZGQoaHRtbC5zdWJzdHIoY3Vyc29yLCBodG1sLmxlbmd0aCAtIGN1cnNvcikpO1xuICAgIGNvZGUgPSAoY29kZSArICdyZXR1cm4gci5qb2luKFwiXCIpOyB9JykucmVwbGFjZSgvW1xcclxcdFxcbl0vZywgJycpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEZ1bmN0aW9uKCdvYmonLCBjb2RlKS5hcHBseShvcHRpb25zLCBbb3B0aW9uc10pO1xuICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCInXCIgKyBlcnIubWVzc2FnZSArIFwiJ1wiLCBcIiBpbiBcXG5cXG5Db2RlOlxcblwiLCBjb2RlLCBcIlxcblwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufSJdfQ==
