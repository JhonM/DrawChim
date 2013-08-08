<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	
        <title>DrawChim</title>

	<link type="text/css" rel="stylesheet" href="css/base-draw.css"/>
	<script type="text/javascript">
	    
	
	</script>
    </head>
    <body>
	<div id='board'>
	    <canvas id='drawCanvas' width='900' height='500'>
		Sorry, your browser doesn't support canvas technology.
	    </canvas>
	    <img id='snapshotImageElement'/>
	    <ul id="color-picker">
		<li class="selected-stain" id="yellow" data-stain="yellow"><span></span></li>
		<li id="blue" data-stain="blue"><span></span></li>
		<li id="red" data-stain="red"><span></span></li>
		<li id="orange" data-stain="orange"><span></span></li>
		<li id="green" data-stain="green"><span></span></li>
		<li id="pink" data-stain="pink"><span></span></li>
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
	
	<script type="text/javascript" src="js/drawsomething.js"></script>
    </body>
</html>
