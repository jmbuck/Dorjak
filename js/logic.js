importScripts('Box2D.js');

var b2Vec2 = Box2D.Common.Math.b2Vec2
	, b2AABB = Box2D.Collision.b2AABB
	, b2BodyDef = Box2D.Dynamics.b2BodyDef
	, b2Body = Box2D.Dynamics.b2Body
	, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	, b2Fixture = Box2D.Dynamics.b2Fixture
	, b2World = Box2D.Dynamics.b2World
	, b2MassData = Box2D.Collision.Shapes.b2MassData
	, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	, b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	, b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	, b2Shape = Box2D.Collision.Shapes.b2Shape
	, b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
	, b2Joint = Box2D.Dynamics.Joints.b2Joint
	, b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
	, b2ContactListener = Box2D.Dynamics.b2ContactListener
	, b2ContactListener = Box2D.Dynamics.b2ContactListener
	, b2Settings = Box2D.Common.b2Settings
	, b2Mat22 = Box2D.Common.Math.b2Mat22
	, b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef
	, b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
	, b2WorldManifold = Box2D.Collision.b2WorldManifold
	;

var time = new Date();
var startTime;
var sunBody;
var planets = [];
var asteroids = [];
var asteroidSpawnRate = 1000 //in milliseconds
var baseRadius = 100;
var baseDistance = 20;
var screenWidth = 1920;
var screenHeight = 1080;
var baseVel = 4;
var currentOrbit = 0;
var currentOrbitTwo = 1;
var playerOneHold;
var playerTwoHold;
var isMultiplayer;
var thrustCap = 10;
var world;
var fps;
var sunRadius = 30;
var orbitSize = 2;
var sunObject;
var destroyList = [];
var score;
var asteroidId = 13;
var interval;
var totalSteps = 0;

self.onmessage = function(e)
{
	if(e.data.gameStatus == "init") 
	{
		fps = e.data.fps;
		startTime = time.getTime();
		isMultiplayer = e.data.multiplayer;
		initWorld();
	} 
	else if(e.data.gameStatus == "input")
	{
		if(e.data.keyStatus == 0)
		{
			keyRelease(e.data.key);
		}
		else
		{
			keyPress(e.data.key);
		}
	}
}
 
function keyPress(key)
{
	var keyA = 0, keyD = 0, keyJ = 0, keyL = 0;
	if(key == 'w' && !playerOneHold)
	{
		playerOneHold = true;
		currentOrbit = (currentOrbit + (isMultiplayer ? 2 : 1)) % 4;
	}
	else if(key == 's' && !playerOneHold)
	{
		playerOneHold = true;
		currentOrbit = (currentOrbit - (isMultiplayer ? 2 : 1)) % 4;
		if(currentOrbit < 0)
			currentOrbit = isMultiplayer ? 2 : 3;
	}
	else if(key == 'a')
	{
		keyA = 1;
	}
	else if(key == 'd')
	{
		keyD = 1;
	}
	else if(key == 'i')
	{
		playerTwoHold = true;
		currentOrbitTwo = (currentOrbitTwo + 2) % 4;
	}
	else if(key == 'k')
	{
		playerTwoHold = true;
		currentOrbitTwo = (currentOrbitTwo - 2) % 4;
		if(currentOrbitTwo < 0)
			currentOrbitTwo = 3;
	}
	else if(key == 'j')
	{
		keyJ = 1;
	}
	else if(key == 'l')
	{
		keyL = 1;
	}
	
	movePlanets(keyA, keyD, keyJ, keyL);
}

function keyRelease(key)
{
	if(key == 'w')
	{
		playerOneHold = false;
	}
	else if(key == 's')
	{
		playerOneHold = false;
	}
	else if(key == 'j')
	{
		playerTwoHold = false;
	}
	else if(key == 'l')
	{
		playerTwoHold = false;
	}
}

function movePlanets(keyA, keyD, keyJ, keyL)
{
	var multiplier = 1;
	for(var i = 0; i < planets.length; i++)
	{
		if(planets[i].baseAngularVelocity > 0)
		{
			multiplier = 1;
		}
		else
		{
			multiplier = -1;
		}
		if(currentOrbit == Math.floor(i / 2))
		{
			if((keyA || keyD) && keyA != keyD)
			{
				if(keyD)
					planets[i].angularVelocity += .05;
				else
					planets[i].angularVelocity -= .05;
			}
		}
		if(currentOrbitTwo = Math.floor(i / 2) && isMultiplayer)
		{
			if((keyJ || keyL) && keyJ != keyL)
			{
				if(keyL)
					planets[i].angularVelocity += .05;
				else
					planets[i].angularVelocity -= .05;
			}
		}
	}
}

function update() 
{
	var timeStep = 1000 / fps;
	//timestep, velocityIterations, positionIterations
	world.Step(timeStep, 6, 2);
	
	if(totalSteps == 60) 
	{
		generateAsteroids();
		totalSteps = 0;
	} 
	else 
	{
		totalSteps++;
	}
<<<<<<< HEAD
	
=======
	for(var i = 0; i < asteroids.length; i++){
		
		{
				for(var j = 1; j < asteroids.length; j++)
				{
					collideAsteroids(asteroids[i], asteroids[j]);
				}
			for(var j = 0; j < planets.length; j++)
			{
				collidePlanets(asteroids[i], planets[j]);
			}
			collideSun(asteroids[i]);
		}
	}

>>>>>>> 8f5f2c88afe5a8c06169dbc7691460598d3e7a11
	//asteroid capturing/slingshotting; also creates asteroidData to send
	var asteroidsData = [];
	for(var i = 0; i < asteroids.length; i++) {
		for(var j = 0; j < planets.length; j++) {
			/*var dist = calculateDistance(asteroids[i], planets[j]); 
			if(dist - planets[j].fixtureDef.shape.GetRadius() <= 10) {
				var xDiff = asteroids[i].bodyDef.position.x - planets[j].bodyDef.position.x;
				var yDiff = asteroids[i].bodyDef.position.y - planets[j].bodyDef.position.y;
				//y
				if(yDiff < 0) asteroids[i].bodyDef.linearVelocity.y += 3;
				else asteroids[i].bodyDef.linearVelocity.y -= 3;
				//x
				if(xDiff < 0) asteroids[i].bodyDef.linearVelocity.x += 3;
				else asteroids[i].bodyDef.linearVelocity.x -= 3;
			}*/
		}
		var x = asteroids[i].bodyDef.position.x;
		var y = asteroids[i].bodyDef.position.y;
		asteroids[i].bodyDef.position.x += asteroids[i].bodyDef.linearVelocity.x;
		asteroids[i].bodyDef.position.y += asteroids[i].bodyDef.linearVelocity.y;
		//remove asteroid if off screen (plus a little leeway, 15 in this case)
		if(asteroids[i].bodyDef.position.x > screenWidth+15 || asteroids[i].bodyDef.position.x < -15 || asteroids[i].bodyDef.position.y > screenHeight+15 || asteroids[i].bodyDef.position.y < -15) {
			destroyList.push(asteroids[i]);
			asteroids.splice(i, 1);
			i--;
			continue;
		}
	}
	
	for(var i = 0; i < asteroids.length; i++)
	{
			for(var j = 1; j < asteroids.length && i < asteroids.length; j++)
			{
				if(collideAsteroids(asteroids[i], asteroids[j]))
					i = 0, j = 0;
			}
			for(var j = 0; j < planets.length && i < asteroids.length; j++)
			{
				if(collidePlanets(asteroids[i], planets[j]))
					i = 0, j = 0;
			}
			if(i < asteroids.length)
			collideSun(asteroids[i]);
	}
	
	for(var i = 0; i < asteroids.length; i++)
	{
		for(var j = 0; j < asteroids.length && i < asteroids.length; j++)
		{
			if(collideAsteroids(asteroids[i], asteroids[j]))
			{
				i = 0, j = 0;
			}
		}
		for(var j = 0; j < planets.length && i < asteroids.length; j++)
		{
			if(collidePlanets(asteroids[i], planets[j]))
				i = 0, j = 0;
		}
		if(asteroids.length > i)
			collideSun(asteroids[i]);
	}
	
	//sends gameStatus, asteroids, planets
	var planetsData = [];
	for(var i = 0; i < planets.length; i++) 
	{
		planets[i].arc += planets[i].baseAngularVelocity + planets[i].angularVelocity;
		planets[i].angularVelocity /= 1.1;
		planets[i].arc %= 2 * Math.PI;
		
		planets[i].bodyDef.position.x = planets[i].distance * Math.cos(planets[i].arc);
		planets[i].bodyDef.position.y = planets[i].distance * Math.sin(planets[i].arc);
		planets[i].bodyDef.position.x += sunObject.bodyDef.position.x;
		planets[i].bodyDef.position.y += sunObject.bodyDef.position.y;
		planets[i].bodyDef.position.x += sunObject.fixtureDef.shape.GetRadius() * Math.cos(planets[i].arc);
		planets[i].bodyDef.position.y += sunObject.fixtureDef.shape.GetRadius() * Math.sin(planets[i].arc);
		
		planetsData.push({arc : planets[i].arc, id: planets[i].id});
	}
	
	for(var i = 0; i < asteroids.length; i++)
	{
		for(var j = 0; j < planets.length && i < asteroids.length; j++)
		{
			if(collidePlanets(asteroids[i], planets[j]))
				i = 0, j = 0;
		}
	}

	var destroyData = [];
	
	for(var i = 0; i < destroyList.length; i++)
	{
		destroyData.push({id : destroyList[i].id});
	}
	
	for(var i = 0; i < asteroids.length; i++)
	{
		asteroidsData.push({sun : null, x: asteroids[i].bodyDef.position.x, y: asteroids[i].bodyDef.position.y, radius: asteroids[i].fixtureDef.shape.GetRadius(), id: asteroids[i].id});
	}
	
	//destroyed items will have an "explode" flag set to true if they explode
	self.postMessage({gameStatus : 'update', asteroids: asteroidsData, destroyed: destroyData, planets: planetsData, orbitOne : currentOrbit, orbitTwo : currentOrbitTwo});
	for(var i = 0; i < destroyList.length; i++)
	{
		world.DestroyBody(destroyList[i].body);
	}
	destroyList = [];
}


function initWorld()
{
	var worldAABB = new b2AABB();
	
	worldAABB.lowerBound.x = 0;
	worldAABB.lowerBound.y = 0;
	worldAABB.upperBound.x = screenWidth
	worldAABB.upperBound.y = screenHeight;
	
	world = new b2World(worldAABB, new b2Vec2(0, 0), true);
	
	sunObject = new Sun();
	
	for(var i = 2; i < 9; i += 2)
	{
		var planetObj = new Planet(i, 0, i - 1);
		var planetObj2 = new Planet(i, Math.PI, i);
		planets.push(planetObj);
		planets.push(planetObj2);
	}
	score = 0;
	
	var sunData = {x : sunObject.bodyDef.position.x, y: sunObject.bodyDef.position.y , radius : sunObject.fixtureDef.shape.GetRadius()};
	var orbitsData = [];
	var planetsData = [];
	for(var i = 0; i < 4; i++) //incorporate ID
	{
		var radius = planets[i * 2].distance;
		orbitsData.push({sun : null, radius : radius, size : orbitSize, id: i+9});
		
		planetsData.push({sun : null, radius : radius, arc : planets[i * 2].arc, size : planets[i * 2].fixtureDef.shape.GetRadius(), id: planets[i*2].id});
		planetsData.push({sun : null, radius : radius, arc : planets[i * 2 + 1].arc, size : planets[i * 2 + 1].fixtureDef.shape.GetRadius(), id: planets[i*2+1].id});
	}
	
	self.postMessage({gameStatus : 'init', sun : sunData, orbits : orbitsData, planets : planetsData, score: score});


	interval = setInterval(update, 1000 / fps);
}

function generateAsteroids()
{
	 var numAsteroids =  getRandomInt(0, 3); //generates between 0-3 (inclusive)

	 for(var i = 0; i < numAsteroids; i++) {
		//add to world
		var asteroid = new Asteroid();
		asteroids.push(asteroid); //add to array
		asteroidId++;
	 }
	
}

function collideAsteroids(asteroidOne, asteroidTwo)
{
	if(calculateDistance(asteroidOne.bodyDef, asteroidTwo.bodyDef) <= asteroidOne.fixtureDef.shape.GetRadius() + asteroidTwo.fixtureDef.shape.GetRadius());
	{
		destroyList.push(asteroidOne);
		destroyList.push(asteroidTwo);
		asteroids.splice(asteroids.indexOf(asteroidOne), 1);
		asteroids.splice(asteroids.indexOf(asteroidTwo), 1);
		return true;
	}
	return false;
}

function calculateDistance(a, b) { //returns distance between object a and object b
	return Math.sqrt((a.position.x - b.position.x)*(a.position.x - b.position.x)+
					  (a.position.y - b.position.y)*(a.position.y - b.position.y));
}

function calculateAngle(current, target) { //returns angle to target (typically sun) in radians
	var triangleHeight = current.bodyDef.position.y - target.bodyDef.position.y;
	var triangleBase = current.bodyDef.position.x - target.bodyDef.position.x;
	return Math.atan2(triangleHeight, triangleBase);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function collideSun(asteroid)
{
	if(calculateDistance(sunObject.bodyDef, asteroid.bodyDef) <= (sunObject.fixtureDef.shape.GetRadius() + asteroid.fixtureDef.shape.GetRadius()))
	{
		destroyList.push(asteroid);
		clearInterval(interval);
		self.postMessage({gameStatus : 'gameover', score : score});
		self.close();
	}
}

function Sun()
{
	this.bodyDef = new b2BodyDef;
	this.bodyDef.type = b2Body.b2_staticBody;
	this.bodyDef.position = new b2Vec2(screenWidth/2, screenHeight/2);
	this.bodyDef.angle = 0;
	this.bodyDef.userData = this;
	
	this.body = world.CreateBody(this.bodyDef);
	
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape(sunRadius);
	this.fixtureDef.density = 1;
	
	this.body.CreateFixture(this.fixtureDef);
}

function Planet(planetOrbit, angle, id)
{
	this.id = id;
	this.arc = angle;
	this.selected = 0;
	this.distance = (planetOrbit * baseDistance + Math.pow(1.25, 3 * planetOrbit) - (planetOrbit > 6 ? 20 : 0) + Math.pow(1.2, 3 * Math.min(planetOrbit, 5)));
	this.baseAngularVelocity = (planetOrbit == 3 || planetOrbit == 4 ? -1 : 1) * (((10 - planetOrbit)) / 4 ) / this.distance;
	this.angularVelocity = 0;
	
	this.bodyDef = new b2BodyDef;
	
	this.bodyDef.position = new b2Vec2(this.distance * Math.cos(this.arc), this.distance * Math.sin(this.arc));
	this.bodyDef.position.x += sunObject.bodyDef.position.x;
	this.bodyDef.position.y += sunObject.bodyDef.position.y;
	this.bodyDef.position.x += sunObject.fixtureDef.shape.GetRadius() * Math.cos(this.arc);
	this.bodyDef.position.y += sunObject.fixtureDef.shape.GetRadius() * Math.sin(this.arc);
	
	this.bodyDef.type = b2Body.b2_kinematicBody;
	this.bodyDef.angle = 0;
	this.bodyDef.userData = this;
	
	this.body = world.CreateBody(this.bodyDef);
	
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape((Math.random() / 3 + 1 + planetOrbit / 3) * (planetOrbit / 2 + 1));
	this.fixtureDef.density = 1;
	
	this.body.CreateFixture(this.fixtureDef);
}

function Asteroid() {
	var minRadius = 5;
	var maxRadius = 15
	var minVel = Math.floor(baseVel / 2);
	var maxVel = Math.ceil(baseVel * 2);
	
	this.bodyDef = new b2BodyDef; 
	this.bodyDef.type = b2Body.b2_dynamicBody;
	this.bodyDef.userData = this;
	  
	var side = getRandomInt(1, 4) //generate start position
	switch(side) {
		case 1: //left
			 this.bodyDef.position = new b2Vec2(0, getRandomInt(0, screenHeight));
			 break;
		case 2: //right
			 this.bodyDef.position = new b2Vec2(screenWidth-100, getRandomInt(0, screenHeight));
			 break;
	    case 3: //top
			 var rand = getRandomInt(1, 100);
			 if(rand <= 45)	this.bodyDef.position = new b2Vec2(getRandomInt(0, Math.ceil(.05*screenWidth)), screenHeight);	 
			 else if(rand <=90)  this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.95*screenWidth), screenWidth), screenHeight);
			 else   this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.05*screenWidth), Math.ceil(.95*screenWidth)), screenHeight);
			 break;
		case 4: //bottom
		default:
			var rand = getRandomInt(1, 100);
			 if(rand <= 45)	this.bodyDef.position = new b2Vec2(getRandomInt(0, Math.ceil(.05*screenWidth)), 0);	 
			 else if(rand <=90)  this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.95*screenWidth), screenWidth), 0);
			 else   this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.05*screenWidth), Math.ceil(.95*screenWidth)), 0);
			 break;
	}
		 
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape(getRandomInt(minRadius, maxRadius)); //random Radius
	this.fixtureDef.density = 1;
	
	//generate velocity
	this.bodyDef.angle = 0;
	var angleToSun = calculateAngle(this, sunObject);
	
	var triangleHeight = this.bodyDef.position.y - sunObject.bodyDef.position.y;
	var triangleBase = this.bodyDef.position.x - sunObject.bodyDef.position.x;
	var ratio = triangleHeight/triangleBase;
	var velocity = getRandomInt(1, 3);
	this.bodyDef.baseVelocity = velocity;
	if(triangleBase < 0) 
		this.bodyDef.linearVelocity.x =  velocity;
	else
		this.bodyDef.linearVelocity.x = -velocity;
	if (triangleHeight < 0)
		this.bodyDef.linearVelocity.y = ratio * velocity;
	else
		this.bodyDef.linearVelocity.y = -Math.abs(ratio) * velocity;
	
	this.id = asteroidId;
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixtureDef);
}
function collidePlanets(asteroid, planet) {
	if(calculateDistance(asteroid.bodyDef, planet.bodyDef) <= asteroid.fixtureDef.shape.GetRadius() + planet.fixtureDef.shape.GetRadius()) {
		//colliding
		destroyList.push(asteroid);
		score++;
		asteroids.splice(asteroids.indexOf(asteroid), 1);
		return true;
	}
	return false;
}