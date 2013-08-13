<!DOCTYPE html>
<html manifest="drawchim.manifest">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<meta name="apple-mobile-web-app-title" content="DrawChim">

        <title>DrawChim</title>

	<link type="text/css" rel="stylesheet" href="css/base-draw.css"/>
	<script type="text/javascript" src="js/lib/jquery.min.js"></script>
	<!-- Home screen icons -->
	<link rel="apple-touch-icon" href="img/apple-touch-icon.png" />
	<link rel="apple-touch-icon" sizes="72x72" href="img/apple-touch-icon-72-72.png" />
	<link rel="apple-touch-icon" sizes="114x114" href="img/apple-touch-icon-114-114.png" />
	<link rel="apple-touch-icon" sizes="144x144" href="img/apple-touch-icon-144-144.png" />

	<!-- iPad -->
	<link rel="apple-touch-startup-image" href="img/startup-l-ipad.png" media="screen and (min-device-width: 481px) and (max-device-width: 1024px) and (orientation:landscape)" />
	<link rel="apple-touch-startup-image" href="img/startup-p-ipad.png" media="screen and (min-device-width: 481px) and (max-device-width: 1024px) and (orientation:portrait)" />
	<!-- iPhone (retina) -->
	<link rel="apple-touch-startup-image" href="img/startup.png" media="screen and (max-device-width: 640px)" />
    </head>
    <body>
	<div id='board'>
	    <canvas id='drawCanvas' width='900' height='500'>
		Sorry, your browser doesn't support canvas technology.
	    </canvas>
	    <img id='snapshotImageElement'/>
	    <ul id="color-picker">
		<li class="selected-stain" id="yellow" data-stain="255,255,0, 0.5"><span></span></li>
		<li id="blue" data-stain="0,0,255, 0.5"><span></span></li>
		<li id="red" data-stain="255,0,0,0.5"><span></span></li>
		<li id="orange" data-stain="255,165,0,0.5"><span></span></li>
		<li id="green" data-stain="0,128,0,0.5"><span></span></li>
		<li id="white" data-stain="255,255,255,0.5"><span></span></li>
	    </ul>
	    <ul id="line-picker">
		<li class="line6 selected-stroke" id="6" data-line="6"><span></span></li>
		<li class="line10" id="10" data-line="10"><span></span></li>
		<li class="line14" id="14" data-line="14"><span></span></li>
		<li class="line18" id="18" data-line="18"><span></span></li>
		<li class="line22" id="22" data-line="22"><span></span></li>
		<li class="line26" id="26" data-line="26"><span></span></li>
	    </ul>
	</div>

	<div id='controls'>
	    <span></span>
	    <input id='snapshotButton' type='button' value='Take snapshot'/>
	    <input id ="clearCanvas" type="button" value="Clear canvas" />
	</div>
	<script type="text/javascript" src="js/drag.js"></script>
	<script type="text/javascript" src="js/drawsomething.js"></script>
    </body>
</html>
