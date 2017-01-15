var gameSession = null;

var widthToScale = 1920;
var heightToScale = 1080;

$j(function() { 
	start();
});

function start()
{
	gameSession = new game();
	
	$j(window).resize(function(event) {
		gameSession.resize();
	});
	
	gameSession.init();
}

function game()
{
	this.fps = 60;
	this.on = true;
	this.paused = false;
	
	this.scaleWidth = this.scaleHeight = 1;
	
	this.renderObjects = [];
	this.queuedMessages = [];
	
	this.timeElapsed = 0;
	this.destroyObjects = [];
}

game.prototype.init = function()
{
	this.ctx = $j('#canvas')[0].getContext('2d');
	this.canvas = this.ctx.canvas;
	
	this.resize();
	
	this.logicHandler = new Worker("./js/logic.js");
	
	this.logicHandler.onmessage = this.handleEvent;
	
	this.logicHandler.postMessage({gameStatus : 'init', fps : this.fps});
	
	//this.renderObjects.push(new stars({count : 200}));
	this.renderObjects.push(new sun({x : this.ctx.canvas.width / 2, y : this.ctx.canvas.height / 2, radius : 50}));
	this.renderObjects.push(new orbit({sun : this.renderObjects[0], radius : 60, size : 1}));
	this.renderObjects.push(new orbit({sun : this.renderObjects[0], radius : 100, size : 1}));
	this.renderObjects.push(new orbit({sun : this.renderObjects[0], radius : 160, size : 1}));
	this.renderObjects.push(new planet({sun : this.renderObjects[0], radius : 100, arc : 0, size : 10}));
	this.renderObjects.push(new planet({sun : this.renderObjects[0], radius : 160, arc : 0, size : 8}));
	this.renderObjects.push(new planet({sun : this.renderObjects[0], radius : 160, arc : Math.PI, size : 12}));
	this.renderObjects.push(new planet({sun : this.renderObjects[0], radius : 100, arc : Math.PI, size : 15}));
	this.renderObjects.push(new planet({sun : this.renderObjects[0], radius : 60, arc : 0, size : 3}));
	this.renderObjects.push(new planet({sun : this.renderObjects[0], radius : 60, arc : Math.PI, size : 5}));
	this.tick();
	
	console.log('Finished Loading');
}

game.prototype.resize = function()
{
	this.width = $j(window).innerWidth();
	this.height = $j(window).innerHeight();
	
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	
	this.scaleWidth = this.width / widthToScale;
	this.scaleHeight = this.height / heightToScale;
}

game.prototype.tick = function(cnt)
{
	if(this.renderObjects.length > 0)
	{
		if(this.paused)
		{
			
		}
		else
		{
			for(var message in this.queuedMessages)
			{
				
			}
			
			this.draw();
		}
	}
	this.timer = setTimeout( function() { gameSession.tick(); }  , 1000 / this.fps);
}

game.prototype.draw = function()
{
	this.ctx.clearRect(0, 0, this.scaleWidth * widthToScale, this.scaleHeight * heightToScale);
	
	this.ctx.lineWidth = 1;
	this.ctx.beginPath();
    this.ctx.fillStyle = 'orange';
    this.ctx.fill();
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
	for(var i = 0; i < this.renderObjects.length; i++)
	{
		this.renderObjects[i].draw(this.ctx);
	}
}

game.prototype.handleEvent = function(e)
{
	if(e.data.gameStatus === 'init')
	{
		var sunObject = new sun(e.data.sun);
		
		this.gameObjects.push(sunObject);
		
		for(var i = 0; i < e.data.orbits.length; i++)
		{
			var orbitData = e.data.orbits[i];
			orbitData.sun = sunObject;
			this.gameObjects.push(new orbit(orbitData));
		}
		
		for(var i = 0; i < e.data.planets.length; i++)
		{
			var planetData = e.data.planets[i];
			planetData.sun = sunObject;
			this.gameObjects.push(new planet(planetData));
		}
		
		this.tick();
	}
	else
	{
		this.queuedMessages.push(e.data);
	}
}

game.prototype.start_handling = function()
{	
	$j(document).on('keydown.game', gameSession.keyPress);
	$j(document).on('keyup.game', gameSession.keyRelease);
}

game.prototype.keyPress = function(e)
{
	this.logicHandler.postMessage({gameStatus : 'input', key : e, keyStatus : 1});
	return false;
}

game.prototype.keyRelease = function(e)
{
	this.logicHandler.postMessage({gameStatus : 'input', key : e, keyStatus : 0});
	return false;
}

function sun(data)
{
	this.x = data.x;
	this.y = data.y;
	this.radius = data.radius;
}

sun.prototype.draw = function(ctx)
{
	ctx.lineWidth = .5;
	ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'orange';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function orbit(data)
{
	this.sun = data.sun;
	this.radius = data.radius;
	this.size = data.size;
	this.highlighed = true;
}

orbit.prototype.draw = function(ctx)
{
	ctx.beginPath();
	ctx.arc(this.sun.x, this.sun.y, this.sun.radius + this.radius - this.size / 5, 0, Math.PI * 2);
	ctx.lineWidth = this.size * 10;
	ctx.strokeStyle = 'rgba(0, 153, 153, 0.5)';
	ctx.stroke();
	
	ctx.beginPath();
	ctx.arc(this.sun.x, this.sun.y, this.sun.radius + this.radius, 0, Math.PI * 2);
	ctx.lineWidth = this.size;
	ctx.strokeStyle = 'black';
	ctx.stroke();
}

function planet(data)
{
	this.sun = data.sun;
	this.radius = data.radius;
	this.arc = data.arc;
	this.size = data.size;
}

planet.prototype.draw = function(ctx)
{	
	ctx.beginPath();
	ctx.arc(this.sun.x + (this.sun.radius + this.radius) * Math.cos(this.arc), this.sun.y + (this.sun.radius + this.radius) * Math.sin(this.arc), this.size, 0, Math.PI * 2);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1.5;
	ctx.stroke();
	
	this.arc -= Math.PI / (Math.pow(Math.log(this.radius), 4));
}

/*function stars(data)
{
	this.count = data.count;
	this.starSystem = [];
	for(var i = 0; i < this.count; i++)
	{
		this.starSystem.push({x : Math.random() * (gameSession.canvas.width - 20 + 1) + 20, y : Math.random() * (gameSession.canvas.height - 20 + 1) + 20});
	}
}

stars.prototype.draw = function(ctx)
{
	ctx.beginPath();
	ctx.rect(0, 0, gameSession.canvas.width, gameSession.canvas.height);
	ctx.fillStyle = 'black';
	ctx.fill();
	var size = .1;
	for(var i = 0; i < this.starSystem.length; i++)
	{
		ctx.beginPath();
		ctx.rect(this.starSystem[i].x - size, this.starSystem[i].y - size, 2 * size, 2 * size);
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = 'white';
		ctx.stroke();
	}
}*/