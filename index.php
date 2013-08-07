<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	
        <title>Canvas sprite</title>

	<link type="text/css" rel="stylesheet" href="css/base-draw.css"/>
    </head>
    <body>
	<div id='board'>
	    <canvas id='drawCanvas' width='900' height='500'>
		Sorry, your browser doesn't support canvas technology.
	    </canvas>
	    <img id='snapshotImageElement'/>
	    <p style="float:left;">
		Color picker:
		<select id='selectColor'>
		    <option id='colBlack' value='black' selected='selected'>Black</option>
		    <option id='colRed' value='red'>Red</option>
		    <option id='colBlue' value='blue'>Blue</option>
		    <option id='colGreen' value='green'>Green</option>
		    <option id='colOrange' value='orange'>Orange</option>
		    <option id='colYellow' value='yellow'>Yellow</option>
		</select>
	    </p>
	    <p style="float:right;">
		Stroke picker:
		<select id='selectStroke'>
		    <option id='stroke1' value='6' selected='selected'>1</option>
		    <option id='stroke2' value='10'>2</option>
		    <option id='stroke3' value='14'>3</option>
		    <option id='stroke4' value='18'>4</option>
		    <option id='stroke5' value='22'>5</option>
		    <option id='stroke6' value='26'>6</option>
		</select>
	    </p>
	</div>
	<div id='controls'>
	    <input id='snapshotButton' type='button' value='Take snapshot'/>
	    <input id ="clearCanvas" type="button" value="Clear canvas" />
	</div>
	
	<script type="text/javascript" src="js/drawsomething.js"></script>
    </body>
</html>
