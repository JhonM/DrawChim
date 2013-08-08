function drawSometing() {
    var drawCanvas = document.getElementById('drawCanvas');
    var menuColor = document.getElementById('selectColor');
    var menuStroke = document.getElementById('selectStroke');

    var chooseColor = menuColor.options[menuColor.selectedIndex];
    var chooseStroke = menuStroke.options[menuStroke.selectedIndex];
    
    var ulMenu = document.getElementsByClassName('selected-stain');

    for (var i = 0; i < ulMenu.length; i++) {
	var dataLi = ulMenu[i].dataset;
	var selectedColor = dataLi.stain;
    }
    console.log(selectedColor);
    
    var e = document.getElementById('red');
    var dataLo = e.dataset.stain;
    console.log(dataLo);
    
    

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
	ctx.strokeStyle = selectedColor;
	
	// Get colors
	var ids = [];
	var ul = document.getElementById('color-picker');
	var lis = ul.getElementsByTagName('li');
	var li;
	for (var i = 0, iLen = lis.length; i < iLen; i++) {
	    li = lis[i];
	    if (li.id) {
		li.onclick = function(e) {
		    ctx.strokeStyle = this.id;
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

    }
    return snap();
}
//function getDataColor(id) {
//    var e = document.getElementById(id);
//    var dataLo = e.dataset.stain;
//    console.log(dataLo);
//}
window.onload = drawSometing();
