function drawSometing() {
    var drawCanvas = document.getElementById('drawCanvas');
    var menuColor = document.getElementById('selectColor');
    var menuStroke = document.getElementById('selectStroke');

    var chooseColor = menuColor.options[menuColor.selectedIndex];
    var chooseStroke = menuStroke.options[menuStroke.selectedIndex];

    if (drawCanvas) {
	var isDown = false;
	var ctx = drawCanvas.getContext("2d");
	var canvasX,
		canvasY,
		blankCanvas = true;
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, 900, 500);
	ctx.lineWidth = 6;
	ctx.lineWidth = chooseStroke;

	drawCanvas.addEventListener('touchstart', function(e) {
	    var touchobj = e.changedTouches[0];
	    if (blankCanvas) {
		storeHistory();
		blankCanvas = false;
	    }
	    isDown = true;
	    ctx.beginPath();
	    canvasX = touchobj.pageX - drawCanvas.offsetLeft;
	    canvasY = touchobj.pageY - drawCanvas.offsetTop;
	    ctx.moveTo(canvasX, canvasY);
	    e.preventDefault();
	}, false);
//	drawCanvas.onmousedown = function(e) {
//	    isDown = true;
//	    ctx.beginPath();
//	    canvasX = e.pageX - drawCanvas.offsetLeft;
//	    canvasY = e.pageY - drawCanvas.offsetTop;
//	    ctx.moveTo(canvasX, canvasY);
//	};

	drawCanvas.addEventListener('touchmove', function(e) {
	    var touchobj = e.changedTouches[0];
	    if (isDown !== false) {
		canvasX = touchobj.pageX - drawCanvas.offsetLeft;
		canvasY = touchobj.pageY - drawCanvas.offsetTop;
		ctx.lineTo(canvasX, canvasY);
		ctx.strokeStyle = chooseColor;
		ctx.stroke();
		e.preventDefault();
	    }
	}, false);
//	drawCanvas.onmousemove = function(e) {
//	    if (isDown !== false) {
//		canvasX = e.pageX - drawCanvas.offsetLeft;
//		canvasY = e.pageY - drawCanvas.offsetTop;
//		ctx.lineTo(canvasX, canvasY);
//		ctx.strokeStyle = chooseColor;
//		ctx.stroke();
//	    }
//	};

	drawCanvas.addEventListener('touchend', function(e) {
	    isDown = false;
	    ctx.closePath();
	    storeHistory();
	    e.preventDefault();
	}, false);
//	drawCanvas.onmouseup = function() {
//	    isDown = false;
//	    ctx.closePath();
//	};

	if (window.localStorage) {
	    img = new Image();
	    img.onload = function() {
		ctx.drawImage(img, 0, 0);
	    };
	    if (localStorage.curImg) {
		img.src = localStorage.curImg;
		blankCanvas = false;
	    }
	}
    }

    var storeHistory = function() {
	img = drawCanvas.toDataURL("image/png");
	history.pushState({imageData: img}, "", window.location.href);

	if (window.localStorage) {
	    localStorage.curImg = img;
	}

    };

    menuColor.onchange = function() {
	chooseColor = this.options[this.selectedIndex].value;
    };

    menuStroke.onchange = function() {
	chooseStroke = this.options[this.selectedIndex].value;

	if (chooseStroke === '10') {
	    ctx.lineWidth = 10;
	}
	if (chooseStroke === '14') {
	    ctx.lineWidth = 14;
	}
	if (chooseStroke === '18') {
	    ctx.lineWidth = 18;
	}
	if (chooseStroke === '22') {
	    ctx.lineWidth = 22;
	}
	if (chooseStroke === '26') {
	    ctx.lineWidth = 26;
	} else {
	    ctx.lineWidth = chooseStroke;
	}
    };

    var clearCanvas = document.getElementById('clearCanvas');

    clearCanvas.addEventListener('click', function(e) {
	e.preventDefault();
	ctx.clearRect(0, 0, 900, 500);
    });

    function snap() {
	var canvas = document.getElementById('drawCanvas'),
		//context = canvas.getContext('2d'),
		snapshotButton = document.getElementById('snapshotButton'),
		snapshotImageElement = document.getElementById('snapshotImageElement'),
		loop;

	snapshotButton.onclick = function(e) {
	    var dataUrl;

	    if (snapshotButton.value === 'Take snapshot') {
		dataUrl = canvas.toDataURL();
		clearInterval(loop);
		snapshotImageElement.src = dataUrl;
		snapshotImageElement.style.display = 'inline';
		canvas.style.display = 'none';
		snapshotButton.value = 'Return to Canvas';
	    }
	    else {
		canvas.style.display = 'inline';
		snapshotImageElement.style.display = 'none';
		//loop = setInterval(drawSometing, 1000);
		snapshotButton.value = 'Take snapshot';
	    }
	};

	// Initialization................................................

	//context.font = FONT_HEIGHT + 'px Arial';
	//loop = setInterval(drawSometing, 1000);
	//return drawSomething();

    }
    return snap();
}

window.onload = drawSometing();