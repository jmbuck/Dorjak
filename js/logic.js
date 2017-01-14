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
var baseVel = 100;
var key;
var pressed;
var loop = function() {
	if(ready) update();
}

self.onmessage = function(e)
{
 if(e.data.gameStatus === "init") {
	 initWorld();
	 pressed = 0;
	 startTime = d.getTime();
 } else if(e.data.gameStatus === "input")
	key = e.data.key;
	pressed = e.data.keyStatus; //1 for pressed, 0 for released
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
	 var minVel = Math.floor(baseVel / 2);
	 var maxVel = Math.floor(baseVel * 2);
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
		 asteroid.m_velocity.Set(getRandomInt(minVel, maxVel)); //generate velocity
		 asteroids.push(asteroid);
	 }
	
}

function initWorld()
{
	sun.m_position.Set(screenWidth/2, screenHeight/2);
	sun.m_radius = baseRad*5;
	
	for(var i = 1; i < 11; i++)
	{
		var planet = Box2D.Collision.Shapes.b2CircleShape;
		planet.m_position.Set(screenWidth/2, screenHeight*i/11);
		planets.push(planet);
		if(i == 4)
		{
			i+= 2;
		}
	}
	planets[4].m_radius = baseRad;
	planets[7].m_radius = baseRad;
	planets[3].m_radius = baseRad*1.5;
	planets[8].m_radius = baseRad*1.5;
	planets[2].m_radius = baseRad*2.25;
	planets[9].m_radius = baseRad*2.25;
	planets[1].m_radius = baseRad*3;
	planets[10].m_radius = baseRad*3;
	
	planets[4].m_velocity.Set(baseVel, 0);
	planets[7].m_velocity.Set(baseVel, 0);
	planets[3].m_velocity.Set(-baseVel/1.4, 0);
	planets[8].m_velocity.Set(-baseVel/1.4, 0);
	planets[2].m_velocity.Set(baseVel/1.7, 0);
	planets[9].m_velocity.Set(baseVel/1.7, 0);
	planets[1].m_velocity.Set(baseVel/2, 0);
	planets[10].m_velocity.Set(baseVel/2, 0);
	
	ready = true;
}

function movePlanets()
{
	for()
}









































function calculateDistance(a, b) { //returns distance between object a and object b
	return Math.sqrt((a.m_position.x - b.m_position.x)*(a.m_position.x - b.m_position.x)+
					  (a.m_position.y - b.m_position.y)*(a.m_position.y - b.m_position.y));
}

function calculateAngle(current, target) {
	var triangleHeight = current.m_position.y - target.m_position.y;
	var triangleBase = current.m_position.x - target.m_position.x;
	return Math.atan(triangleBase/triangleHeight);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}















