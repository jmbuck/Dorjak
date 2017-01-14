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
	if(this.gameObjects.length > 0)
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
	this.timer = setTimeout( function() { that.tick(); }  , 1000 / this.fps);
}

game.prototype.draw = function()
{
	this.ctx.clearRect(0, 0, this.scaleWidth * widthToScale, this.scaleHeight * heightToScale);
	
	for(var i = 0; i < this.renderObjects.length; i++)
	{
		this.renderObjects[i].draw({context : this.ctx, width : this.scaleWidth, height : this.scaleHeight});
	}
}

game.prototype.handleEvent = function(e)
{
	if(e.data.gameStatus === 'init')
	{
		var sunObject = new sun(e.data.sun);
		
		this.gameObjects.push(sunObject);
		
		for(var i = 0; i < e.data.planets.length; i++)
		{
			var planetData = e.data.planets[i];
			planetData.sun = sunObject;
			this.gameObjects.push(new planet(planetData));
		}
	}
	this.queuedMessages.push(e.data);
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

sun.prototype.draw = function(context)
{
	var ctx = context.ctx;
	var scaleWidth = context.width;
	var scaleHeight = context.height;
}

function planet(data)
{
	this.sun = data.sun;
	this.radius = data.radius;
	this.arc = data.sun;
}

planet.prototype.draw = function(context)
{
	
}