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
	, b2Settings = Box2D.Common.b2Settings
	, b2Mat22 = Box2D.Common.Math.b2Mat22
	, b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef
	, b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
	, b2WorldManifold = Box2D.Collision.b2WorldManifold
	;

var d = new Date();
var startTime;
var sunBody;
var planets = [];
var asteroids = [];
var data = [];
var asteroidSpawnRate = 1000 //in milliseconds
var baseRadius = 50;
var screenWidth = 1920;
var screenHeight = 1080;
var baseVel = 100;
var keys = [];
var thrust;
var world;
var fps;
var sunRadius = 50;
var sunObject;

self.onmessage = function(e)
{
	if(e.data.gameStatus == "init") 
	{
		fps = e.data.fps;
		startTime = d.getTime();
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
	
	var currTime = d.getTime();
	if(currTime - startTime > asteroidSpawnRate) 
	{
		startTime = currTime;
		generateAsteroids();
	}
	timer = setTimeout( function() { update(); }  , 1000 / fps);
}

function initWorld()
{
	//var gravity = new b2Vec2(0, 0);
	var worldAABB = new b2AABB();
	worldAABB.lowerBound.x = 0;
	worldAABB.lowerBound.y = 0;
	worldAABB.upperBound.x = screenWidth
	worldAABB.upperBound.y = screenHeight;
	world = new b2World(worldAABB, new b2Vec2(0, 0), true);
	
	sunObject = new sun();
	
	for(var i = 0; i < 8; i += 2)
	{
		planets.push(new planet(i, 0));
		planets.push(new planet(i, Math.PI));
	}
	
	postMessage({gameStatus : 'init', sun : {x : sunObject.bodyDef.position.x, y: sunObject.bodyDef.position.y , radius : sunObject.fixtureDef.shape.GetRadius()}, planets : data});
}

function generateAsteroids() {
	 var numAsteroids =  getRandomInt(0, 3); //generates between 0-3 (inclusive)
	 var minRadius = Math.floor(baseSize / 4);
	 var maxRadius = baseRadius;
	 var minVel = Math.floor(baseVel / 2);
	 var maxVel = Math.ceil(baseVel * 2);
	 for(var i = 0; i < numAsteroids; i++) {
		var asteroidBd = new b2BodyDef; 
		asteroidBd.type = b2Body.b2_dynamicBody;
	
		asteroidFixt = new b2FixtureDef;
		asteroidFixt.shape = new b2CircleShape(getRandomInt(minRadius, maxRadius));
		asteroidFixt.density = 1;
	
		  
		 var side = getRandomInt(1, 4) //generate start position
		 switch(side) {
			 case 1: //left
			 asteroidBd.position.x = 0;
			 asteroidBd.position.y = getRandomInt(0, screenHeight);
			 break;
			 case 2: //right
			 asteroidBd.position.x = 0;
			 asteroidBd.position.y = getRandomInt(screenWidth, screenHeight);
			 break;
			 case 3: //top
				 var rand = getRandomInt(1, 100);
				 if(rand <= 45) {
					 asteroidBd.position.x = getRandomInt(0, Math.ceil(.15*screenWidth));
					 asteroidBd.position.y = screenHeight;
					 
				 }
				 else if(rand <=90) {
					 asteroidBd.position.x = getRandomInt(Math.floor(.85*screenWidth), screenWidth);
					 asteroidBd.position.y = screenHeight;
				 }
				 else {
					 asteroidBd.position.x = getRandomInt(Math.floor(.15*screenWidth), Math.ceil(.85*screenWidth));
					 asteroidBd.position.y = screenHeight;
				 }
			 break;
			 case 4: //bottom
			 default:
				var rand = getRandomInt(1, 100);
				if(rand <= 45) {
					asteroidBd.position.x = getRandomInt(0, Math.ceil(.15*screenWidth));
					asteroidBd.position.y = 0;
				}
				else if(rand <=90) { 
					asteroidBd.position.x = getRandomInt(Math.floor(.85*screenWidth), screenWidth);
					asteroidBd.position.y = 0;
				}
				else {
					asteroidBd.position.x = (getRandomInt(Math.floor(.15*screenWidth), Math.ceil(.85*screenWidth));
					asteroidBd.position.y = 0;
				}
		 }
		//generate velocity
		var asteroidBd.angle = calculateAngle(asteroidBd, sunObject); 
		var velocity = getRandomInt(minVel, maxVel);
		asteroidBd.baseVelocity = velocity;
		asteroidBd.linearVelocity.x = velocity*Math.cos(asteroidBd.angle);
		asteroidBd.linearVeocity.y = velocity*Math.sin(asteroidBd.angle); 
		
		//add to world
		asteroids.push(world.createBody(asteroidBd).createFixture(asteroidFixt); //add to array
	 }
	
}

function movePlanets()
{
	for(var planet in planets)
	{
		/*if(-selected- && pressed)
		{
			if(-speed-)
				thrust += 0.2;
			else if(-slow-)
				thrust -= 0.2;
		}
		else if(thrust < 0)
			thrust += 0.1;
		else if(thrust > 0)
			thrust -= 0.1;
		var angVelocity = (planet.m_baseVelocity + thrust*10)/planet.radiusFromSun;
		planet.angleToSun = planet.angleToSun + angVelocity;*/
	}
}

function calculateDistance(a, b) { //returns distance between object a and object b
	return Math.sqrt((a.m_position.x - b.m_position.x)*(a.m_position.x - b.m_position.x)+
					  (a.m_position.y - b.m_position.y)*(a.m_position.y - b.m_position.y));
}

function calculateAngle(current, target) { //returns angle to sun in radians
	var triangleHeight = current.position.y - target.bodyDef.position.y;
	var triangleBase = current.position.x - target.bodyDef.position.x;
	return Math.atan(triangleBase/triangleHeight);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sun()
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

function planet(planetOrbit, angle)
{
	this.bodyDef = new b2BodyDef;
	this.bodyDef.type = b2Body.b2_kinematicBody;
	this.bodyDef.position = new b2Vec2(screenWidth / 2 + (sunRadius + baseRadius * Math.pow(1.5, i)) * Math.cos(angle), screenHeight / 2 + (sunRadius + baseRadius * Math.pow(1.5, i)) * Math.sin(angle))
	this.bodyDef.angle - 0;
	
	this.body = world.CreateBody(this.bodyDef);
	
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape((Math.random() / 2 + .75) * Math.pow(2, i));
	this.fixtureDef.density = 1;
	
	this.body.CreateFixture(this.fixtureDef);
}















