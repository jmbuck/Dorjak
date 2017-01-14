setInterval(loop, 1000/60); //60Hz step rate (I assume. 1000/30 is 30Hz)
var ready = false;
var d = new Date();
var startTime;
var loop = function() {
	if(ready) update();
}

self.onmessage = function(e)
{
 if(e.data === "init") {
	 initWorld();
	 startTime = d.getTime();
 } else {
	
 }
}
function update() {
	var currTime = d.getTime();
	if(currTime - startTime > 1000) {	
		startTime = currTime;
		generateAsteroids();
	}		
}
function generateAsteroids();















