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
var planetsFixtures = [];
var asteroids = [];
var asteroidsFixtures = [];
var asteroidSpawnRate = 1000 //in milliseconds
var baseRadius = 100;
var baseDistance = 10;
var screenWidth = 1920;
var screenHeight = 1080;
var baseVel = 100;
var currentOrbit = 0;
var keys = [];
var thrust;
var thrustCap = 2;
var world;
var fps;
var sunRadius = 40;
var orbitSize = 2;
var sunObject;
var listener = new b2ContactListener();
var destroyList = [];
var score;
var asteroidId = 13;

self.onmessage = function(e)
{
	if(e.data.gameStatus == "init") 
	{
		fps = e.data.fps;
		startTime = time.getTime();
		initWorld();
	} 
	else if(e.data.gameStatus == "input")
	{
		if(e.data.keyStatus == 0)
		{
			for(var i = 0; i < keys.length; i++)
			{
				if(keys[i] == e.data.key)
				{
					keyRelease(e.data.key);
					keys.splice(i, 1);
				}
			}
		}
		else
		{
			keyPress(e.data.key);
			keys.push(e.data.key);
		}
	}
}
 

function update() 
{
	var timeStep = 1.0 / fps;
	//timestep, velocityIterations, positionIterations
	world.Step(timeStep, 8, 3);
	var keyPress;
	var keyA = 0;
	var keyD = 0;
	var keyW = 0;
	var keyS = 0;
	for(var i = 0; i < keys.length; i++)
	{
		if(keys[i] == 'a')
			keyA = 1;
		if(keys[i] == 'd')
			keyD = 1;
		if(keys[i] == 'w')
			keyW = 1;
		if(keys[i] == 's')
			keyS = 1;
	}
	
	var currTime = time.getTime();
	if(currTime - startTime > asteroidSpawnRate) 
	{
		startTime = currTime;
		generateAsteroids();
	}
	selectOrbit(keyW, keyS);
	movePlanets(keyA, keyD);
	
	var destroyData = [];
	listener.BeginContact = function(contact) {
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		//asteroid collides with asteroid
		if(asteroidsFixtures.indexOf(fixtureA) != -1 && asteroidsFixtures.indexOf(fixtureB) != -1)  {
			var asteroid1 = asteroidsFixtures.indexOf(fixtureA);
			var asteroid2 = asteroidsFixtures.indexOf(fixtureB);
			destroyList.push(asteroids[asteroid1]);
			destroyList.push(asteroids[asteroid2]);
			destroyData.push({id: asteroids[asteroid1].id});
			destroyData.push({id: asteroids[asteroid2].id}); 
			asteroids.splice(asteroid1, 1);
			asteroids.splice(asteroid2, 1);
			asteroidsFixtures.splice(asteroid1, 1);
			asteroidsFixtures.splice(asteroid1, 1);
			if(score == 0) score++;
		}
		//asteroid collides with planet
		if((asteroidsFixtures.indexOf(fixtureA) != -1 && planetsFixtures.indexOf(fixtureB) != -1) ||
		   (asteroidsFixtures.indexOf(fixtureB) != -1 && planetsFixtures.indexOf(fixtureA) != -1)) {
			var asteroid; 
			if(asteroidsFixtures.indexOf(fixtureA) != -1) {
				asteroid = asteroidsFixtures.indexOf(fixtureA);
			}
			else {
				asteroid = asteroidsFixtures.indexOf(fixtureB);
			}
			score++;
			destroyList.push(asteroids[asteroid]);
			destroyData.push({id: asteroids[asteroid].id});
			asteroids.splice(asteroid, 1);
			asteroidsFixtures.splice(asteroid, 1);
		}
		//asteroid collides with sun
		if((asteroidsFixtures.indexOf(fixtureA) != -1 && fixtureB == sunObject.fixtureDef) ||
		   (asteroidsFixtures.indexOf(fixtureB) != -1 && fixtureA == sunObject.fixtureDef)) { 
		   self.postMessage({gameStatus : 'gameover', score: score});
		}
	}
	
	//asteroid capturing/slingshotting; also creates asteroidData to send
	var asteroidsData = [];
	for(a in asteroids) {
		for(p in planets) {
			var dist = calculateDistance(a, p); 
			if(dist - p.fixtureDef.shape.GetRadius() <= 10) {
				var xDiff = a.bodyDef.position.x - p.bodyDef.position.x;
				var yDiff = a.bodyDef.position.y - p.bodyDef.position.y;
				//y
				if(aY < 0) a.bodyDef.linearVelocity.y += 3;
				else a.bodyDef.linearVelocity.y -= 3;
				//x
				if(aX < 0) a.bodyDef.linearVelocity.x += 3;
				else a.bodyDef.linearVelocity.x -= 3;
			}
		}
		asteroidsData.push({sun : null, x: asteroid.bodyDef.position.x, y: asteroid.bodyDef.position.y, radius: asteroid.fixtureDef.shape.GetRadius(), id: asteroid.id});
	}
	
	//sends gameStatus, asteroids, planets
	var planetsData = [];
	for(planet in planets) {
		planetsData.push({arc : planet.arc, id: planet.id});
	}
	
	self.postMessage({gameStatus : 'update', asteroids: asteroidsData, destroyed: destroyData, planets: planetsData});
	while(destroyList.length > 0) {
		world.DestroyBody(destroyList.pop());
		destroyData.pop();
	}
	
	timer = setTimeout( function() { update(); }  , 1000 / fps);
}

function initWorld()
{
	var worldAABB = new b2AABB();
	
	worldAABB.lowerBound.x = 0;
	worldAABB.lowerBound.y = 0;
	worldAABB.upperBound.x = screenWidth
	worldAABB.upperBound.y = screenHeight;
	
	world = new b2World(worldAABB, new b2Vec2(0, 0), true);
	world.SetContactListener(listener);
	
	sunObject = new Sun();
	
	for(var i = 2; i < 10; i += 2)
	{
		var planetObj = new Planet(i, 0, i-1);
		var planetObj2 = new Planet(i, Math.PI, i);
		planets.push(planetObj);
		planets.push(planetObj2);
		planetsFixtures.push(planetObj.fixtureDef);
		planetsFixtures.push(planetObj2.fixtureDef);
	}
	score = 0;
	
	var sunData = {x : sunObject.bodyDef.position.x, y: sunObject.bodyDef.position.y , radius : sunObject.fixtureDef.shape.GetRadius()};
	var orbitsData = [];
	var planetsData = [];
	for(var i = 0; i < 4; i++) //incorporate ID
	{
		var radius = (i*baseDistance/2 + Math.pow(1.25, 3*i+6) + 1)*8;
		orbitsData.push({sun : null, radius : radius, size : orbitSize, id: i+9});
		
		planetsData.push({sun : null, radius : radius, arc : planets[i * 2].arc, size : planets[i * 2].fixtureDef.shape.GetRadius(), id: planets[i*2].id});
		planetsData.push({sun : null, radius : radius, arc : planets[i * 2 + 1].arc, size : planets[i * 2 + 1].fixtureDef.shape.GetRadius(), id: planets[i*2+1].id});
	}
	
	self.postMessage({gameStatus : 'init', sun : sunData, orbits : orbitsData, planets : planetsData, score: score});
	
	update();
}

function generateAsteroids()
{
	 var numAsteroids =  getRandomInt(0, 3); //generates between 0-3 (inclusive)

	 for(var i = 0; i < numAsteroids; i++) {
		//add to world
		var asteroid = new Asteroid();
		asteroids.push(asteroid); //add to array
		asteroidsFixtures.push(asteroid.fixtureDef);
		asteroidId++;
	 }
	
}

function selectOrbit(keyW, keyS)
{
	if(keyW && currentOrbit != 3)
		currentOrbit++;
	else if(keyS && currentOrbit != 0)
		currentOrbit--;
	for(var i = 0; i < 8; i++)
	{
		if(Math.floor(i/2) == currentOrbit)
			planets[i].selected = 1;
		else
			planets[i].selected = 0;
	}
}

function movePlanets(keyA, keyD)
{
	for(var planet in planets)
	{
		if(planet.selected && (keyA || keyD) && keyA != keyD)
		{
			if(keyD)
			{
				thrust += 0.2;
				if(thrust < -thrustCap)
					thrust = -thrustCap;
			}
			else if(keyA)
			{
				thrust -= 0.2;
				if(thrust < -thrustCap)
					thrust = -thrustCap;
			}	
		}
		else if(thrust < 0)
			thrust += 0.1;
		else if(thrust > 0)
			thrust -= 0.1;
		var angularVelocity = (planet.baseAngularVelocity + thrust*10);
		planet.angle = planet.angle + angularVelocity;	
	}
}

function calculateDistance(a, b) { //returns distance between object a and object b
	return Math.sqrt((a.bodyDef.position.x - b.bodyDef.position.x)*(a.bodyDef.position.x - b.bodyDef.position.x)+
					  (a.bodyDef.position.y - b.bodyDef.position.y)*(a.bodyDef.position.y - b.bodyDef.position.y));
}

function calculateAngle(current, target) { //returns angle to target (typically sun) in radians
	var triangleHeight = current.bodyDef.position.y - target.bodyDef.position.y;
	var triangleBase = current.bodyDef.position.x - target.bodyDef.position.x;
	return Math.atan(triangleBase/triangleHeight);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Sun()
{
	this.bodyDef = new b2BodyDef;
	this.bodyDef.type = b2Body.b2_staticBody;
	this.bodyDef.position = new b2Vec2(screenWidth / 2, screenHeight / 2);
	this.bodyDef.angle = 0;
	
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
	var distance = (i*baseDistance/2 + Math.pow(1.25, 3*i+6) + 1)*8
	this.baseAngularVelocity = (((10-planetOrbit)*baseVel)/4)/this.distance;
	
	this.bodyDef = new b2BodyDef;
	this.bodyDef.position = new b2Vec2(distance*Math.cos(angle), distance*Math.sin(angle));
	this.bodyDef.type = b2Body.b2_kinematicBody;
	this.bodyDef.angle = 0;
	
	this.body = world.CreateBody(this.bodyDef);
	
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape((Math.random() + planetOrbit / 4)*(planetOrbit + 1));
	this.fixtureDef.density = 1;
	
	this.body.CreateFixture(this.fixtureDef);
}

function Asteroid() {
	var minRadius = Math.floor(baseSize / 4);
	var maxRadius = baseRadius;
	var minVel = Math.floor(baseVel / 2);
	var maxVel = Math.ceil(baseVel * 2);
	
	this.bodyDef = new b2BodyDef; 
	this.bodyDef.type = b2Body.b2_dynamicBody;
	  
	var side = getRandomInt(1, 4) //generate start position
	switch(side) {
		case 1: //left
			 this.bodyDef.position = new b2Vec2(0, getRandomInt(0, screenHeight));
			 break;
		case 2: //right
			 this.bodyDef.position = new b2Vec2(screenWidth, getRandomInt(0, screenHeight));
			 break;
	    case 3: //top
			 var rand = getRandomInt(1, 100);
			 if(rand <= 45)	this.bodyDef.position = new b2Vec2(getRandomInt(0, Math.ceil(.15*screenWidth)), screenHeight);	 
			 else if(rand <=90)  this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.85*screenWidth), screenWidth), screenHeight);
			 else   this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.15*screenWidth), Math.ceil(.85*screenWidth)), screenHeight);
			 break;
		case 4: //bottom
		default:
			var rand = getRandomInt(1, 100);
			 if(rand <= 45)	this.bodyDef.position = new b2Vec2(getRandomInt(0, Math.ceil(.15*screenWidth)), 0);	 
			 else if(rand <=90)  this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.85*screenWidth), screenWidth), 0);
			 else   this.bodyDef.position = new b2Vec2(getRandomInt(Math.floor(.15*screenWidth), Math.ceil(.85*screenWidth)), 0);
			 break;
	}
		 
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape(getRandomInt(minRadius, maxRadius)); //random Radius
	this.fixtureDef.density = 1;
	
	//generate velocity
	this.bodyDef.angle = 0;
	var angleToSun = calculateAngle(this, sunObject);
	var velocity = getRandomInt(minVel, maxVel);
	this.bodyDef.baseVelocity = velocity;
	this.bodyDef.linearVelocity = new b2Vec2(velocity*Math.cos(angleToSun), velocity*Math.sin(angleToSun));
	this.id = asteroidId;
	this.body = world.createBody(this.bodyDef);
	this.body.CreateFixture(this.fixtureDef);
	
}















