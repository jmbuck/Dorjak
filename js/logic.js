




























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