var gameSession = null;

var widthToScale = 1920;
var heightToScale = 1080;

$(function() { 
WebFontConfig = {
  google:{ families: ['game'] },
  active: function(){start();},
};
(function(){
  var wf = document.createElement("script");
  wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
  wf.async = 'true';
  document.head.appendChild(wf);
})();
});

function start()
{
	gameSession = new game();
	
	$(window).resize(function(e) {
		gameSession.resize();
	});
	
	gameSession.init();
}

function menu()
{
	this.fps = 60;
	
	this.scaleWidth = this.scaleHeight = 1;
	this.timeElapsed = 0;
}

menu.prototype.init = function()
{
	this.ctx = $('#canvas')[0].getContext('2d');
	this.canvas = this.ctx.canvas;
	
	this.resize();
	
	this.startInputHandlers();
	
	this.tick();
}

menu.prototype.resize = function()
{
	this.width = $(window).innerWidth();
	this.height = $(window).innerHeight();
	
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	
	this.scaleWidth = this.width / widthToScale;
	this.scaleHeight = this.height / heightToScale;
}

menu.prototype.startInputHandlers = function()
{
	$(document).mousemove(gameSession.mouseMove);
	$(document).click(gameSession.mouseClick);
}

menu.prototype.mouseMove = function(e)
{
	
}

menu.prototype.mouseClick = function(e)
{
	
}

menu.prototype.changeGui = function()
{
	gameSession = new game();
	
	$(window).resize(function(event) {
		gameSession.resize();
	});
	
	gameSession.init();
}

menu.prototype.tick = function()
{
	this.ctx.beginPath();
	this.ctx.rect(0, 0, this.width, this.height);
	this.ctx.fillStyle = 'white';
	this.ctx.fill();
	
	this.ctx.font = "96px game";
	this.ctx.fillStyle = 'orange';
	this.ctx.textAlign = 'center';
	this.ctx.fillText("Dorjak", this.width / 2, 100);
	this.ctx.strokeText("Dorjak", this.width / 2, 100);
		
	this.timer = setTimeout( function() { gameSession.tick(); } , 1000 / this.fps);
}

function game()
{
	this.fps = 60;
	this.paused = 0;
	this.ticks = 0;
	
	this.scaleWidth = this.scaleHeight = 1;
	
	this.renderObjects = [];
	this.queuedMessages = [];
	
	this.timeElapsed = 0;
	this.destroyObjects = [];
}

game.prototype.init = function()
{
	this.score = 0;
	
	this.ctx = $('#canvas')[0].getContext('2d');
	this.canvas = this.ctx.canvas;
	
	this.resize();
	
	this.startInputHandlers();
	
	this.logicHandler = new Worker("./js/logic.js");
	
	this.logicHandler.addEventListener('message', this.handleEvent);
	this.logicHandler.postMessage({gameStatus : 'init', fps : this.fps});
	
	this.tick();
}

game.prototype.resize = function()
{
	this.width = $(window).innerWidth();
	this.height = $(window).innerHeight();
	
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	
	this.scaleWidth = this.width / widthToScale;
	this.scaleHeight = this.height / heightToScale;
}

game.prototype.tick = function(cnt)
{
	for(var data in this.queuedMessages)
	{
		if(data.gameStatus === 'update')
		{
			console.log("this");
			for(var object in this.renderObjects)
			{
				var found = false;
				for(var i = 0; i < data.planets.length; i++)
				{
					if(data.planets[i].id == object.id)
					{
						if(object instanceof planet)
						{
							object.arc = data.arc;
						}
						else if(object instanceof asteroid)
						{
							object.x = data.x;
							object.y = data.y;
						}
						found = true;
						break;
					}
				}
				if(!found)
				{
					data.sun = this.renderObjects[0];
					this.renderObjects.push(new asteroid(data));
				}
			}
		}
		else if(e.data.gameStatus === 'gameover')
		{
			this.paused = 2;
			this.score = data.score;
		}
	}
	if(this.renderObjects.length > 0)
	{
		if(this.paused === 2)
		{
			var sunObject = this.renderObjects[0];
			
			this.ticks ++;
			this.draw();
			if(this.ticks < 60)
			{
				this.ctx.lineWidth = .5;
				this.ctx.beginPath();
				this.ctx.arc(sunObject.x, sunObject.y, sunObject.radius, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = this.ticks % 10 < 5 ? 'red' : 'orange';
				this.ctx.fill();
				this.ctx.strokeStyle = 'black';
				this.ctx.stroke();
			}
			else
			{
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.arc(sunObject.x, sunObject.y, sunObject.radius, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = 'white';
				this.ctx.fill();
				this.ctx.strokeStyle = 'white';
				this.ctx.stroke();
				
				this.ctx.lineWidth = 1;
				this.ctx.fillStyle = this.ctx.strokeStyle = 'black';
				for(var j = 0; j < 5; j++)
				{
					if(this.ticks - 60 - j * 2 > 0) {
				for(var i = 0; i < 2 * Math.PI; i += Math.PI / 10)
				{
					var cos = Math.cos(i) * (.5 - (this.ticks - 60 - j * 2) * 2);
					var sin = Math.sin(i) * (.5 - (this.ticks - 60 - j * 2) * 2);
					this.ctx.beginPath();
					this.ctx.moveTo(this.width / 2 + 15 * cos, this.height / 2 + sin * 15);
					this.ctx.lineTo(this.width / 2 + 35 * cos, this.height / 2 + sin * 35);
					this.ctx.fill();
					this.ctx.stroke();
				}}
				}
				this.ctx.font = "48px game";
				this.ctx.textAlign = 'center';
				this.ctx.fillText(this.score, this.width / 2, this.height / 2 + 16);
			}
			this.timer = setTimeout( function() { gameSession.tick(); }  , 1000 / this.fps);
		}
		else if(this.paused === 1)
		{
			
		}
		else
		{
			this.draw();
		}
	}
	//this.timer = setTimeout( function() { gameSession.tick(); }  , 1000 / this.fps);
}

game.prototype.draw = function()
{
	this.ctx.clearRect(0, 0, this.width, this.height);
	
	for(var i = 0; i < this.renderObjects.length; i++)
	{
		this.renderObjects[i].draw(this.ctx);
	}
}

game.prototype.handleEvent = function(e)
{
	if(e.data.gameStatus === 'init')
	{
		e.data.sun.x *= gameSession.scaleWidth;
		e.data.sun.y *= gameSession.scaleHeight;
		var sunObject = new sun(e.data.sun);
		
		gameSession.renderObjects.push(sunObject);
		
		for(var i = 0; i < e.data.orbits.length; i++)
		{
			var orbitData = e.data.orbits[i];
			orbitData.sun = sunObject;
			orbitData.radius *= gameSession.scaleWidth;
			gameSession.renderObjects.push(new orbit(orbitData));
		}
		
		for(var i = 0; i < e.data.planets.length; i++)
		{
			var planetData = e.data.planets[i];
			planetData.sun = sunObject;
			planetData.radius *= gameSession.scaleWidth;
			gameSession.renderObjects.push(new planet(planetData));
		}
		
		gameSession.tick();
	}
	else
	{
		gameSession.queuedMessages.push(e.data);
	}
}

game.prototype.startInputHandlers = function()
{	
	$(document).on('keydown.game', gameSession.keyPress);
	$(document).on('keyup.game', gameSession.keyRelease);
}

game.prototype.keyPress = function(e)
{
	if(this.paused === 0)
	{
		if(e.key == 32)
		{
			gameSession = new menu;
			
			gameSession.init();
		}
		else
		{
			this.fps = 60;
			this.paused = 0;
			this.ticks = 0;

			this.scaleWidth = this.scaleHeight = 1;

			this.renderObjects = [];
			this.queuedMessages = [];
	
			this.timeElapsed = 0;
			this.destroyObjects = [];
			
			this.init();
		}
	}
	else if(this.paused == 1)
	{
		
	}
	else
	{
		this.logicHandler.postMessage({gameStatus : 'input', key : e, keyStatus : 1});	
	}
	return false;
}

game.prototype.keyRelease = function(e)
{
	if(this.paused === 3)
		this.logicHandler.postMessage({gameStatus : 'input', key : e, keyStatus : 0});
	return false;
}

function sun(data)
{
	this.id = -1;
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
	this.id = data.id;
	this.sun = data.sun;
	this.radius = data.radius;
	this.size = data.size;
	this.highlighted = false;
}

orbit.prototype.draw = function(ctx)
{
	if(this.highlighted)
	{
		ctx.beginPath();
		ctx.arc(this.sun.x, this.sun.y, this.sun.radius + this.radius - this.size / 5, 0, Math.PI * 2);
		ctx.lineWidth = this.size * 10;
		ctx.strokeStyle = 'rgba(0, 153, 153, 0.5)';
		ctx.stroke();	
	}
	
	ctx.beginPath();
	ctx.arc(this.sun.x, this.sun.y, this.sun.radius + this.radius, 0, Math.PI * 2);
	ctx.lineWidth = this.size;
	ctx.strokeStyle = 'black';
	ctx.stroke();
}

function planet(data)
{
	this.id = data.id;
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
}

function asteroid(data)
{
	this.id = data.id;
	this.sun = data.sun;
	this.x = data.x;
	this.y = data.y;
	this.radius = data.radius;
	
	if('tailX' in data)
	{
		this.tailX = data.tailX;
		this.tailY = data.tailY;
	}
	else
	{
		this.tailX = 0;
		this.tailY = 0;
	}
}

asteroid.prototype.draw = function(ctx)
{
	var angle = Math.atan2(this.x - this.sun.x, this.y - this.sun.y);
	
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, angle - Math.PI / 3, angle + Math.PI / 3);
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 4;
	ctx.stroke();
}