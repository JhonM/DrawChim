var Draggable = function(element) {
	if (!(this instanceof Draggable)) {
		return new Draggable(element);
	}

	this.element = element;
	this.offSet = null;
	this.holder = [];

	this._init();
	this.setEvents();
};

Draggable.prototype._init = function(first_argument) {
	this.element.style.position = 'absolute';
	this.ease();
};

Draggable.prototype.setEvents = function() {
	var self = this;
	this.element.addEventListener('touchstart', function(e) {
		self.start(e)
	});
	this.element.addEventListener('touchmove', function(e) {
		self.move(e);
	});
	this.element.addEventListener('touchend', function() {
		self.ease();
	});
};

Draggable.prototype.start = function(e) {
	var orig = e.touches;
	this.offSet = {
		x: orig[0].pageX - this.element.offsetLeft,
		y: orig[0].pageY - this.element.offsetTop
	}
	this.holder.x = this.offSet.x;
	this.holder.y = this.offSet.y;
};

Draggable.prototype.move = function(e) {
	e.preventDefault();
	var orig = e.touches;
	this.element.style.top = (orig[0].pageY - this.holder.y + 'px');
	this.element.style.left = (orig[0].pageX - this.holder.x + 'px');
};

Draggable.prototype.ease = function() {
	this.element.style.transition = '.4s';
};

new Draggable(document.querySelector('#controls'));

