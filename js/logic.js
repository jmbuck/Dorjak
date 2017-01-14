setInterval(loop, 1000/60); //60Hz step rate (I assume. 1000/30 is 30Hz)
var ready = false;
var d = new Date();
var startTime;
var sun = Box2D.Collision.Shapes.b2CircleShape;
var planets = [];
var asteroids = [];
var baseRadius = 50;
var screenWidth = 1920;
var screenHeight = 1080;

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
	if(currTime - startTime > 1000) {	//asteroid generation
		startTime = currTime;
		generateAsteroids();
	}		
}
function generateAsteroids() {
	 var numAsteroids =  getRandomInt(0, 3); //generates between 0-3 (inclusive)
	 var minRadius = Math.floor(baseSize / 4);
	 var maxRadius = baseRadius;
	 for(var i = 0; i < numAsteroids; i++) {
		 var asteroid = Box2D.Collision.Shapes.b2CircleShape;
		 
		 var side = getRandomInt(1, 4) //generate start position
		 switch(side) {
			 case 1: //left
			 asteroid.m_position.Set(0, getRandomInt(0, screenHeight));
			 break;
			 case 2: //right
			 asteroid.m_position.Set(screenWidth, getRandomInt(0, screenHeight));
			 break;
			 case 3: //top
			 asteroid.m_position.Set(getRandomInt(0, screenWidth), screenHeight);
			 break;
			 case 4: //bottom
			 default:
			 asteroid.m_position.Set(getRandomInt(0, screenWidth), 0);
		 }
		 
		 asteroid.m_radius.Set(getRandomInt(minRadius, maxRadius)); //generate size
	 }
	
}

var baseVel = 100;

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















































function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}















