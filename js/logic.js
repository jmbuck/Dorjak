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

var baseVel = 100;
var baseSize = 100;
var sun = Box2D.Collision.Shapes.b2CircleShape;
var planets = [];

function initWorld()
{
	sun.m_position.Set(screen.width/2, screen.height/2);
	
	for(var i = 1; i < 11; i++)
	{
		var planet = Box2D.Collision.Shapes.b2CircleShape;
		planet.m_position.Set(screen.width*i/11, screen.height/2);
		planets.push(planet);
		if(i == 4)
		{
			i+= 2;
		}
	}
	planets[1].
	ready = true;
}















