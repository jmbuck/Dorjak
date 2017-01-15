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
var asteroidFixtures = [];
var asteroidSpawnRate = 1000 //in milliseconds
var baseRadius = 100;
var baseDistance = 20;
var screenWidth = 1920;
var screenHeight = 1080;
var baseVel = 4;
var currentOrbit = 0;
var currentOrbitTwo = 0;
var keys = [];
var isMultiplayer;
var thrust;
var thrustTwo;
var thrustCap = 2;
var world;
var fps;
var sunRadius = 30;
var orbitSize = 2;
var sunObject;
var listener = new b2ContactListener();
var destroyList = [];
var score;
var asteroidId = 13;
var debris = [];
var debrisFixtures = [];
var debrisId = 1000;
var debrisRadius = 5;
var interval;
var totalSteps = 0;
var keyHeldJ = 0;
var keyHeldL = 0;
var keyHeldI = 0;
var keyHeldK = 0;

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
 
function keyPress(key)
{
	
}

function keyRelease(key)
{
	
}

function update() 
{
	var timeStep = 1000 / fps;
	//timestep, velocityIterations, positionIterations
	world.Step(timeStep, 6, 2);
	var keyA = 0;
	var keyD = 0;
	var keyW = 0;
	var keyS = 0;
	var keyJ = 0;
	var keyL = 0;
	var keyI = 0;
	var keyK = 0;
	for(var i = 0; i < keys.length; i++)
	{
		if(keys[i] == 'a')
			keyA = 1;
		else if(keys[i] == 'd')
			keyD = 1;
		else if(keys[i] == 'w')
			keyW = 1;
		else if(keys[i] == 's')
			keyS = 1;
	}
	if(isMultiplayer)
	{
		orbitTwo = 1;
		for(var i = 0; i < keys.length; i++)
		{
			if(keys[i] == 'j')
				keyJ = 1;
			else if(keys[i] == 'l')
				keyL = 1;
			else if(keys[i] == 'i')
				keyI = 1;
			else if(keys[i] == 'k')
				keyK = 1;
		}
	}
	
	if(totalSteps == 60) 
	{
		generateAsteroids();
		totalSteps = 0;
	} 
	else 
	{
		totalSteps++;
	}
	
	selectOrbit(keyW, keyS, keyI, keyK);
	movePlanets(keyA, keyD, keyJ, keyL);
	
	var destroyData = [];
	
	for(var i = 0; i < destroyList.length; i++)
	{
		destroyData.push({id : destroyList[i].id});
	}
	
	//asteroid capturing/slingshotting; also creates asteroidData to send
	var asteroidsData = [];
	for(var i = 0; i < asteroids.length; i++) {
		for(var j = 0; j < planets.length; j++) {
			var dist = calculateDistance(asteroids[i], planets[j]); 
			if(dist - planets[j].fixtureDef.shape.GetRadius() <= 10) {
				var xDiff = asteroids[i].bodyDef.position.x - planets[j].bodyDef.position.x;
				var yDiff = asteroids[i].bodyDef.position.y - planets[j].bodyDef.position.y;
				//y
				if(yDiff < 0) asteroids[i].bodyDef.linearVelocity.y += 3;
				else asteroids[i].bodyDef.linearVelocity.y -= 3;
				//x
				if(xDiff < 0) asteroids[i].bodyDef.linearVelocity.x += 3;
				else asteroids[i].bodyDef.linearVelocity.x -= 3;
			}
		}
		var x = asteroids[i].bodyDef.position.x
		var y = asteroids[i].bodyDef.position.y
		asteroids[i].bodyDef.position.x += asteroids[i].bodyDef.linearVelocity.x;
		asteroids[i].bodyDef.position.y += asteroids[i].bodyDef.linearVelocity.y;
		//remove asteroid if off screen (plus a little leeway, 15 in this case)
		if(x > screenWidth+15 || x < -15 || y > screenHeight+15 || y < -15) {
			destroyList.push(asteroids[i].body)
			destroyData.push({id: asteroids[i].id});
			asteroids.splice(i, 1);
			asteroidFixtures.splice(i, 1);
			i--;
			continue;
		}
		asteroidsData.push({sun : null, x: asteroids[i].bodyDef.position.x, y: asteroids[i].bodyDef.position.y, radius: asteroids[i].fixtureDef.shape.GetRadius(), id: asteroids[i].id});
	}
	
	//sends gameStatus, asteroids, planets
	var planetsData = [];
	for(var i = 0; i < planets.length; i++) {
		planets[i].arc += planets[i].baseAngularVelocity;
		planetsData.push({arc : planets[i].arc, id: planets[i].id});
	}
	
	var debrisData = [];
	for(var i = 0; i < debris.length; i++) {
		debrisData.push({x: debris[i].bodyDef.position.x, y: debris[i].bodyDef.position.y, radius: debrisRadius, id: debris[i].id});
	}
	//destroyed items will have an "explode" flag set to true if they explode
	self.postMessage({gameStatus : 'update', asteroids: asteroidsData, destroyed: destroyData, planets: planetsData, debris: debrisData, orbitOne : currentOrbit, orbitTwo : currentOrbitTwo});
while(destroyList.length > 0) world.DestroyBody(destroyList.pop());
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
		var radius = planets[i * 2].distance;
		orbitsData.push({sun : null, radius : radius, size : orbitSize, id: i+9});
		
		planetsData.push({sun : null, radius : radius, arc : planets[i * 2].arc, size : planets[i * 2].fixtureDef.shape.GetRadius(), id: planets[i*2].id});
		planetsData.push({sun : null, radius : radius, arc : planets[i * 2 + 1].arc, size : planets[i * 2 + 1].fixtureDef.shape.GetRadius(), id: planets[i*2+1].id});
	}
	
	self.postMessage({gameStatus : 'init', sun : sunData, orbits : orbitsData, planets : planetsData, score: score});

	listener.BeginContact = function(contact) 
	{
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		//asteroid collides with asteroid
		if(fixtureA.GetBody().GetUserData() instanceof Asteroid && fixtureB.GetBody().GetUserData() instanceof Asteroid)
		{
			console.log("asteroid-asteroid!");
			var asteroid = asteroids[asteroids.indexOf(fixtureA.GetBody().GetUserData())];
			if(asteroid.fixtureDef.shape.GetRadius() >= 75)
			{
				explode(asteroid);
			}
			
			destroyList.push(asteroid.body);
			asteroids.splice(asteroids.indexOf(fixtureA.GetBody().GetUserData()), 1);
			//asteroidFixtures.splice(fixtureA, 1);
			
			asteroid = asteroids[asteroids.indexOf(fixtureB.GetBody().GetUserData() instanceof Asteroid)];
			if(asteroid.fixtureDef.shape.GetRadius() >= 75)
			{
				explode(asteroid);
			}
			
			destroyList.push(asteroid.body);
			asteroids.splice(asteroids.indexOf(fixtureB.GetBody().GetUserData()), 1);
			//asteroidFixtures.splice(fixtureB, 1);
			
			if(score == 0) score++;
		}
		//asteroid collides with planet
		if((fixtureA.GetBody().GetUserData() instanceof Asteroid && fixtureB.GetBody().GetUserData() instanceof Planet) ||
		   (fixtureB.GetBody().GetUserData() instanceof Asteroid && fixtureA.GetBody().GetUserData() instanceof Planet)) 
		{
			console.log("asteroid-planet!");
			var asteroid; 
			var index;
			if(fixtureA.GetBody().GetUserData() instanceof Asteroid) 
			{
				asteroid = asteroids[asteroids.indexOf(fixtureA.GetBody().GetUserData())];
				index = asteroids.indexOf(fixtureA.GetBody().GetUserData());
				console.log("Index" + index);
			}
			else 
			{
				asteroid = asteroids[asteroids.indexOf(fixtureB.GetBody().GetUserData())];
				index = asteroids.indexOf(fixtureB.GetBody().GetUserData());
				console.log("Index" + index);
			}
			
			if(asteroid.fixtureDef.shape.GetRadius() >= 75) 
			{
				explode(asteroid);
			}
			
			score++;
			destroyList.push(asteroid.body);
			asteroids.splice(index, 1);
			//asteroidFixtures.splice(asteroid.fixtureDef, 1);
		}
		//asteroid collides with sun
		if((fixtureA.GetBody().GetUserData() instanceof Asteroid  && fixtureB.GetBody().GetUserData() instanceof Sun) ||
		   (fixtureB.GetBody().GetUserData() instanceof Asteroid && fixtureA.GetBody().GetUserData() instanceof Sun)) 
		{ 
			console.log("asteroid-sun!");
		   self.postMessage({gameStatus : 'gameover', score: score});
		   clearInterval(interval);
		   self.close();
		}
		//debris collides with debris
		/*if(debrisFixtures.indexOf(fixtureA) != -1 && debrisFixtures.indexOf(fixtureB) != -1) {
			destroyList.push(debris[debrisFixtures.indexOf(fixtureA)].body);
			destroyList.push(debris[debrisFixtures.indexOf(fixtureB)].body);
			destroyData.push({id: debrisFixtures[debrisFixtures.indexOf(fixtureA)].id});
			destroyData.push({id: debrisFixtures[debrisFixtures.indexOf(fixtureB)].id});
			debris.splice(debrisFixtures.indexOf(fixtureA), 1);
			debris.splice(debrisFixtures.indexOf(fixtureB), 1);
			asteroidFixtures.splice(asteroid1, 1);
			asteroidFixtures.splice(debrisFixtures.indexOf(fixtureB), 1);
		}
		//debris collides with asteroid, possibly implement destroying asteroids
		if((debrisFixtures.indexOf(fixtureA) != -1 && asteroidFixtures.indexOf(fixtureB)) != -1 ||
		   (debrisFixtures.indexOf(fixtureB) != -1 && asteroidFixtures.indexOf(fixtureA)) != -1) {
		   var debrisIndex;
		   if(asteroidFixtures.indexOf(fixtureA) == -1) {
				debrisIndex = debrisFixtures.indexOf(fixtureA);
			}
			else {
				debrisIndex = debrisFixtures.indexOf(fixtureB);
			}
			destroyList.push(debris[debrisIndex].body);
			destroyData.push({id: debrisFixtures[debrisIndex]});
			debris.splice(debrisIndex, 1);
			debrisFixtures.splice(debrisIndex, 1);
		}
		//debris collides with planet or sun 
		if((debrisFixtures.indexOf(fixtureA) != -1 && (planetsFixtures.indexOf(fixtureB) != -1 || sunObject.fixtureDef == fixtureB)) ||
			(debrisFixtures.indexOf(fixtureB) != -1 && (planetsFixtures.indexOf(fixtureA) != -1 || sunObject.fixtureDef == fixtureA))) {
			var debrisIndex;
			if(debrisFixtures.indexOf(fixtureA) != -1) debrisIndex = debrisFixtures.indexOf(fixtureA);
			else debrisIndex = debrisFixtures.indexOf(fixtureA);
			destroyList.push(debris[debrisIndex].body);
			destroyData.push({id: debrisFixtures[debrisIndex]});
			debris.splice(debrisIndex, 1);
			debrisFixtures.splice(debrisIndex, 1);
		}*/
	}
	world.SetContactListener(listener);
	interval = setInterval(update, 1000 / fps);
}

function generateAsteroids()
{
	 var numAsteroids =  getRandomInt(0, 3); //generates between 0-3 (inclusive)

	 for(var i = 0; i < numAsteroids; i++) {
		//add to world
		var asteroid = new Asteroid();
		asteroids.push(asteroid); //add to array
		asteroidFixtures.push(asteroid.fixtureDef);
		asteroidId++;
	 }
	
}

function selectOrbit(keyW, keyS, keyI, keyK)
{
	if(!isMultiplayer)
	{
		if(keyW && !keyHeldW && currentOrbit != 3)
		{
			currentOrbit++;
			keyHeldW = 1;
		}
		else
			keyHeldW = 0;
		else if(keyS && !keyHeldS && currentOrbit != 0)
		{
			currentOrbit--;
			keyHeldS = 1;
		}
		else
			keyHeldS = 0;
	}
	else
	{
		if(keyW && !keyHeldW && currentOrbit != 2)
		{
			currentOrbit+=2;
			keyHeldW = 1;
		}
		else
			keyHeldW = 0;
		if(keyS && !keyHeldS && currentOrbit != 0)
		{
			currentOrbit-=2;
			keyHeldS = 1;
		}
		else
			keyHeldS = 0;
		if(keyI && !keyHeldI && currentOrbitTwo != 3)
		{
			currentOrbit+=2;
			keyHeldI = 1;
		}
		else
			keyHeldI = 0;
		if(keyK && !keyHeldK && currentOrbitTwo != 1)
		{
			currentOrbit-=2;
			keyHeldK = 1;
		}
		else
			keyHeldK = 0;
	}
	for(var i = 0; i < 8; i++)
	{
		if(Math.floor(i/2) == currentOrbit || (isMultiplayer && Math.floor(i/2) == currentOrbitTwo))
			planets[i].selected = 1;
		else
			planets[i].selected = 0;
	}
}

function movePlanets(keyA, keyD, keyJ, keyL)
{
	for(var i = 0; i < planets.length; i++)
	{
		if(planets[i].selected && (keyA || keyD) && keyA != keyD)
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
		var angularVelocity = (planets[i].baseAngularVelocity + thrust*0.5);
		planets[i].angle = planets[i].angle + angularVelocity;
		if(isMultiplayer)
		{
			i++;
		}
	}
	for(var i = 1; i < planets.length && isMultiplayer; i+=2)
	{
		if(planets[i].selected && (keyJ || keyL) && keyJ != keyL)
		{
			if(keyL)
			{
				thrustTwo += 0.2;
				if(thrustTwo < -thrustCap)
					thrustTwo = -thrustCap;
			}
			else if(keyJ)
			{
				thrustTwo -= 0.2;
				if(thrustTwo < -thrustCap)
					thrustTwo = -thrustCap;
			}	
		}
		else if(thrustTwo < 0)
			thrust += 0.1;
		else if(thrustTwo > 0)
			thrust -= 0.1;
		var angularVelocity = (planets[i].baseAngularVelocity + thrustTwo*0.5);
		planets[i].angle = planets[i].angle + angularVelocity;
		
	}
	
}

function calculateDistance(a, b) { //returns distance between object a and object b
	return Math.sqrt((a.bodyDef.position.x - b.bodyDef.position.x)*(a.bodyDef.position.x - b.bodyDef.position.x)+
					  (a.bodyDef.position.y - b.bodyDef.position.y)*(a.bodyDef.position.y - b.bodyDef.position.y));
}

function calculateAngle(current, target) { //returns angle to target (typically sun) in radians
	var triangleHeight = current.bodyDef.position.y - target.bodyDef.position.y;
	var triangleBase = current.bodyDef.position.x - target.bodyDef.position.x;
	return Math.atan2(triangleHeight, triangleBase);
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
	
	this.bodyDef = new b2BodyDef;
	this.bodyDef.position = new b2Vec2(this.distance*Math.cos(angle), this.distance*Math.sin(angle));
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
	
	var triangleHeight = this.bodyDef.position.y - sunObject.bodyDef.position.y;
	var triangleBase = this.bodyDef.position.x - sunObject.bodyDef.position.x;
	var ratio = triangleHeight/triangleBase;
	var velocity = getRandomInt(2, 5);
	this.bodyDef.baseVelocity = velocity;
	if(triangleBase < 0) 
		this.bodyDef.linearVelocity.x =  velocity;
	else 
		this.bodyDef.linearVelocity.x =  -velocity;
	
	if (triangleHeight < 0)
		this.bodyDef.linearVelocity.y = ratio*velocity;
	else
		this.bodyDef.linearVelocity.y = -ratio*velocity;
	
	this.id = asteroidId;
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixtureDef);
	
}

function Debris(x, y, angle) {
	this.id = id;
	
	this.bodyDef = new b2BodyDef;
	this.bodyDef.position = new b2Vec2(x, y);
	this.bodyDef.type = b2Body.b2_dynamicBody;
	
	this.body = world.CreateBody(this.bodyDef);
	
	this.fixtureDef = new b2FixtureDef;
	this.fixtureDef.shape = new b2CircleShape(debrisRadius);
	this.fixtureDef.density = 1;
	var velocity = Math.ceil(baseVel*1.75);
	this.bodyDef.linearVelocity = new b2Vec2(velocity*Math.cos(angle), velocity*Math.sin(angle));
	this.body.CreateFixture(this.fixtureDef);
	
	
}

function explode(asteroid) {
	var x = asteroid.bodyDef.position.x;
	var y = asteroid.bodyDef.position.y;
	angle = Math.PI/5; 
	for(var i = 0; i < 10; i++) {
		var debrisObject = new Debris(x, y, angle);
		debris.push(debrisObject);
		debrisFixtures.push(debrisObject.fixtureDef);
		angle += (Math.PI/5);
		debrisId++;
	}	
}