function drawSometing() {
    var drawCanvas = document.getElementById('drawCanvas');

    
    // first stain
    var ulMenu = document.getElementsByClassName('selected-stain');
    for (var i = 0; i < ulMenu.length; i++) {
	var dataLi = ulMenu[i].dataset;
	var selectedColor = dataLi.stain;
    }

    
    // If user start drawing
    if (drawCanvas) {
	var isDown = false;
	var ctx = drawCanvas.getContext("2d");
	var canvasX,
	canvasY,
	blankCanvas = true;

	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, 900, 500);
	ctx.lineWidth = 6;
	ctx.lineCap = 'round';
	ctx.strokeStyle = 'rgba(0,0,255,0.5)';
	
	// Get colors
	var ids = [];
	var ul = document.getElementById('color-picker');
	var lis = ul.getElementsByTagName('li');
	var li;
	for (var i = 0, iLen = lis.length; i < iLen; i++) {
	    li = lis[i];
	    if (li.id) {
		li.onclick = function(e) {
		    var e = document.getElementById(this.id);
			var colorPicker = e.dataset.stain;
			ctx.strokeStyle = 'rgba(' + colorPicker + ')';
		};
	    }
	}
	
	
	//Get line stroke
	var ids = [];
	var ul = document.getElementById('line-picker');
	var lis = ul.getElementsByTagName('li');
	var li;
	for (var i = 0, iLen = lis.length; i < iLen; i++) {
	    li = lis[i];
	    if (li.id) {
		li.onclick = function(e) {
		    var e = document.getElementById(this.id);
		        var linePicker = e.dataset.line;
			ctx.lineWidth = linePicker;
		};
	    }
	}

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

	drawCanvas.addEventListener('touchmove', function(e) {
	    var touchobj = e.changedTouches[0];
	    if (isDown !== false) {
		canvasX = touchobj.pageX - drawCanvas.offsetLeft;
		canvasY = touchobj.pageY - drawCanvas.offsetTop;
		ctx.lineTo(canvasX, canvasY);
		ctx.stroke();
		e.preventDefault();
	    }
	}, false);

	drawCanvas.addEventListener('touchend', function(e) {
	    isDown = false;
	    ctx.closePath();
	    storeHistory();
	    e.preventDefault();
	}, false);

	// Localstore Canvas in image
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
    
    //Store canvas history
    var storeHistory = function() {
	img = drawCanvas.toDataURL("image/png");
	history.pushState({imageData: img}, "", window.location.href);

	if (window.localStorage) {
	    localStorage.curImg = img;
	}

    };

    //Clear Canvas
    var clearCanvas = document.getElementById('clearCanvas');
    clearCanvas.addEventListener('click', function(e) {
	e.preventDefault();
	ctx.clearRect(0, 0, 900, 500);
	storeHistory();
    });

    //Take snapshot to save as image
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

    }
    return snap();
}
//function getDataColor(id) {
//    var e = document.getElementById(id);
//    var dataLo = e.dataset.stain;
//    console.log(dataLo);
//}
window.onload = drawSometing();
