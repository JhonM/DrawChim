$.fn.draggable = function() {
    var offset = null;
    var start = function(e) {
	var orig = e.originalEvent;
	var pos = $(this).position();
	offset = {
	    x: orig.changedTouches[0].pageX - pos.left,
	    y: orig.changedTouches[0].pageY - pos.top
	};
    };
    var moveMe = function(e) {
	e.preventDefault();
	var orig = e.originalEvent;
	$(this).css({
	    top: orig.changedTouches[0].pageY - offset.y,
	    left: orig.changedTouches[0].pageX - offset.x
	});
    };
    this.bind("touchstart", start);
    this.bind("touchmove", moveMe);
};

$("#controls").draggable();