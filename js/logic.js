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
var baseRad = 50;
var sun = Box2D.Collision.Shapes.b2CircleShape;
var planets = [];

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















