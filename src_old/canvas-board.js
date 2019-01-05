'use strict';
/* jshint node: true */

var ExtendDefault = require('./extend_default');

var CanvasBoard = function() {
    var defaults = {
        selector: null
    };

    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = ExtendDefault(defaults, arguments[0]);
    }
};

CanvasBoard.prototype.createBoard = function(text) {
    // eslint-disable-next-line no-console
    console.log('Hi just created this ' + text + ' for you');
};

module.exports = new CanvasBoard();
