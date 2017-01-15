var gameSession = null;

var widthToScale = 1920;
var heightToScale = 1080;

var singleplayer = [];
var multiplayer = [];
var isMultiplayer = false;

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
	gameSession = new menu();
	
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
	this.timeElapsed1 = 0;
	
	this.width = 0;
	this.height = 0;
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
	$(window).mousemove(gameSession.mouseMove);
	$(window).click(gameSession.mouseClick);
}

menu.prototype.mouseMove = function(e)
{
	if(e.pageX < gameSession.width * .7 && e.pageX > gameSession.width * .3)
	{
		if(e.pageY < 300 + gameSession.height / 15 && e.pageY > 300 - gameSession.height / 10)
		{
			gameSession.timeElapsed1 = 0;
			gameSession.timeElapsed++;
			return;
		}
		if(e.pageY < 400 + gameSession.height / 15 && e.pageY > 400 - gameSession.height / 10)
		{
			gameSession.timeElapsed = 0;
			gameSession.timeElapsed1++;
			return;
		}
	}
	gameSession.timeElapsed = 0;
	gameSession.timeElapsed1 = 0;
}

menu.prototype.mouseClick = function(e)
{
	if(gameSession.timeElapsed > 0)
	{
		isMultiplayer = false;
		gameSession = new game;
	
		$(window).unbind("mousemove");
		$(window).unbind("click");
		gameSession.init();
	}
	else if(gameSession.timeElapsed1 > 0)
	{
		isMultiplayer = true;
		gameSession = new game;
		
		$(window).unbind("mousemove");
		$(window).unbind("click");
		gameSession.init();
	}
}

menu.prototype.tick = function()
{
	this.ctx.beginPath();
	this.ctx.rect(0, 0, this.width, this.height);
	this.ctx.fillStyle = 'white';
	this.ctx.fill();
	
	this.ctx.lineWidth = 4;
	
	this.ctx.font = "96px game";
	this.ctx.fillStyle = 'orange';
	this.ctx.textAlign = 'center';
	this.ctx.strokeStyle = 'black';
	this.ctx.fillText("Dorjak", this.width / 2, 100);
	this.ctx.strokeText("Dorjak", this.width / 2, 100);
	
	this.ctx.lineWidth = 1.5;
	this.ctx.strokeText("Dorjak", this.width / 2 + Math.random() * 3, 100 + Math.random() * 3);
	
	this.ctx.lineWidth = 2;
	
	this.ctx.font = '48px game';
	this.ctx.strokeText("Let's Start", this.width / 2, 300);
	this.ctx.strokeText("Bring a Pal", this.width / 2, 400);
	if(this.timeElapsed > 0)
	{
		this.ctx.strokeText("Let's Start", this.width / 2 + Math.random() * 3, 300 + Math.random() * 3);
	}
	if(this.timeElapsed1 > 0)
	{
		this.ctx.strokeText("Bring a Pal", this.width / 2 + Math.random() * 3, 400 + Math.random() * 3);
	}
	
	this.ctx.fillStyle = 'orange';
	this.ctx.textAlign = 'left';
	this.ctx.fillText("Single Ladies", this.width / 20, 100);
	this.ctx.strokeText("Single Ladies", this.width / 20, 100);
	
	this.ctx.font = "36px game";
	
	for(var i = 0; i < singleplayer.length; i++)
	{
		this.ctx.strokeText(singleplayer[i], this.width / 20, 140 + i * 40);
	}
	
	this.ctx.font = '48px game';
	this.ctx.textAlign = 'right';
	
	this.ctx.fillText("Tribal Hermits", this.width * 19 / 20, 100);
	this.ctx.strokeText("Tribal Hermits", this.width * 19 / 20, 100);
	
	this.ctx.font = "36px game";
	
	for(var i = 0; i < multiplayer.length; i++)
	{
		this.ctx.strokeText(multiplayer[i], this.width * 19 / 20, 140 + i * 40);
	}
	
	if(gameSession == this)
		this.timer = setTimeout( function() { gameSession.tick(); } , 1000 / this.fps);
}

function game()
{
	this.fps = 60;
	this.paused = 0;
	this.ticks = 0;
	
	this.width = 0;
	this.height = 0;
	
	this.scaleWidth = this.scaleHeight = 1;
	
	this.renderObjects = [];
	this.queuedMessages = [];
	
	this.timeElapsed = 0;
}

game.prototype.init = function()
{
	this.score = 0;
	this.player1 = 0;
	this.player2 = 1;
	
	this.ctx = $('#canvas')[0].getContext('2d');
	this.canvas = this.ctx.canvas;
	
	this.resize();
	
	this.startInputHandlers();
	
	this.logicHandler = new Worker("./js/logic.js");
	
	this.logicHandler.addEventListener('message', this.handleEvent);
	this.logicHandler.postMessage({gameStatus : 'init', fps : this.fps, multiplayer : isMultiplayer});
	
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
	for(var i = 0; i < this.queuedMessages.length; i++)
	{
		for(var j = 8; j < this.renderObjects.length; j++)
		{
			if(this.queuedMessages[i].id == this.renderObjects[j].id)
			{
				this.renderObjects.splice(j, 1);
				break;
			}
		}
	}
	this.queuedMessages = [];
	
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
				for(var i = 0; i < 2 * Math.PI; i += Math.PI / 10)
				{
					var cos = Math.cos(i) * (.5 - (this.ticks - 60 - j * 2) * 2);
					var sin = Math.sin(i) * (.5 - (this.ticks - 60 - j * 2) * 2);
					this.ctx.beginPath();
					this.ctx.moveTo(this.width / 2 + 15 * cos, this.height / 2 + sin * 15);
					this.ctx.lineTo(this.width / 2 + 35 * cos, this.height / 2 + sin * 35);
					this.ctx.fill();
					this.ctx.stroke();
				}
				this.ctx.font = "48px game";
				this.ctx.textAlign = 'center';
				this.ctx.fillText(this.score, this.width / 2, this.height / 2 + 16);
			}
		}
		else
		{
			this.draw();
		}
	}
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
		gameSession.player1 = 0;
		gameSession.renderObjects[gameSession.player1 + 1].color = 'rgba(0, 153, 153, 127)';
		if(isMultiplayer)
		{
			gameSession.player2 = 1;
			gameSession.renderObjects[gameSession.player2 + 1].color = 'rgba(153, 153, 0, 127)';
		}
	}
	else if(e.data.gameStatus == 'update')
	{
		for(var i = 0; i < gameSession.renderObjects.length; i++)
		{
			for(var j = 0; j < e.data.planets.length; j++)
			{
				if(gameSession.renderObjects[i].id == e.data.planets[j].id)
				{
					gameSession.renderObjects[i].arc = e.data.planets[j].arc;
					break;
				}
			}
			for(var j = 0; j < e.data.asteroids.length; j++)
			{
				if(gameSession.renderObjects[i].id == e.data.asteroids[j].id)
				{
					gameSession.renderObjects[i].x = e.data.asteroids[j].x;
					gameSession.renderObjects[i].y = e.data.asteroids[j].y;
					e.data.asteroids.splice(j, 1);
					break;
				}
			}
		}
		if(gameSession.player1 != e.data.orbitOne)
		{
			gameSession.renderObjects[gameSession.player1 + 1].color = null;
			gameSession.renderObjects[e.data.orbitOne + 1].color = 'rgba(0, 153, 153, 127)';
			gameSession.player1 = e.data.orbitOne;
		}

		if(isMultiplayer)
		{
			if(gameSession.player2 != e.data.orbitTwo)
			{
				gameSession.renderObjects[gameSession.player2 + 1].color = null;
				gameSession.renderObjects[e.data.orbitTwo + 1].color = 'rgba(153, 153, 0, 127)';
				gameSession.player2 = e.data.orbitTwo;
			}
		}
		for(var i = 0; i < e.data.asteroids.length; i++)
		{
			e.data.asteroids[i].sun = gameSession.renderObjects[0];
			e.data.asteroids[i].x *= gameSession.scaleWidth;
			e.data.asteroids[i].y *= gameSession.scaleHeight;
			gameSession.renderObjects.push(new asteroid(e.data.asteroids[i]));
		}
		
		var destroyObjects = [];
		for(var i = 0; i < e.data.destroyed.length; i++)
		{
			destroyObjects.push(e.data.destroyed[i]);
		}
		gameSession.queuedMessages.push(destroyObjects);
	}
	else
	{
		gameSession.paused = 2;
		gameSession.score = e.data.score;
		if(isMultiplayer)
		{
			for(var i = 0; i < multiplayer.length; i++)
			{
				if(multiplayer[i] < e.data.score)
				{
					multiplayer.splice(i, 0, e.data.score);
					break;
				}
			}
			if(multiplayer.length > 15)
			{
				multiplayer.splice(15, 1);
			}
		}
		else
		{
			for(var i = 0; i < multiplayer.length; i++)
			{
				if(singleplayer[i] < e.data.score)
				{
					singleplayer.splice(i, 0, e.data.score);
					break;
				}
			}
			if(singleplayer.length > 15)
			{
				singleplayer.splice(15, 1);
			}
		}
	}
	gameSession.tick();
}

game.prototype.startInputHandlers = function()
{	
	$(document).on('keydown.game', gameSession.keyPress);
	$(document).on('keyup.game', gameSession.keyRelease);
}

game.prototype.keyPress = function(e)
{
	if(gameSession.paused === 2)
	{
		if(e.which == 32)
		{
			gameSession = new menu;
			
			gameSession.init();
		}
		else
		{
			gameSession.fps = 60;
			gameSession.paused = 0;
			gameSession.ticks = 0;

			gameSession.scaleWidth = gameSession.scaleHeight = 1;

			gameSession.renderObjects = [];
			gameSession.queuedMessages = [];
	
			gameSession.timeElapsed = 0;
			
			gameSession.init();
		}
	}
	else if ((gameSession instanceof game))
	{
		if(e.which == 27)
		{
			gameSession.logicHandler.terminate();
			
			gameSession = new menu;
			
			gameSession.init();
		}
		else
		{
			gameSession.logicHandler.postMessage({gameStatus : 'input', key : e.key, keyStatus : 1});	
		}
	}
	return false;
}

game.prototype.keyRelease = function(e)
{
	if((gameSession instanceof game))
		gameSession.logicHandler.postMessage({gameStatus : 'input', key : e.key, keyStatus : 0});
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
	ctx.lineWidth = 1;
	ctx.beginPath();
    ctx.arc(this.x + Math.random(), this.y + Math.random(), this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'orange';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
	
	ctx.arc(this.x + Math.random() * 3, this.y + Math.random() * 3, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'orange';
	ctx.fill();
	ctx.stroke();
}

function orbit(data)
{
	this.id = data.id;
	this.sun = data.sun;
	this.radius = data.radius;
	this.size = data.size;
	this.color = null;
}

orbit.prototype.draw = function(ctx)
{
	if(this.color != null)
	{
		ctx.beginPath();
		ctx.arc(this.sun.x, this.sun.y, this.sun.radius + this.radius - this.size / 5, 0, Math.PI * 2);
		ctx.lineWidth = this.size * 10;
		ctx.strokeStyle = this.color;
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
	
	ctx.arc(this.sun.x + (this.sun.radius + this.radius) * Math.cos(this.arc) + (Math.random() * 3), this.sun.y + (this.sun.radius + this.radius) * Math.sin(this.arc) + (Math.random() * 3), this.size, 0, Math.PI * 2);
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
	ctx.arc(this.x, this.y, this.radius, angle - Math.PI / 6, angle + Math.PI / 6);
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 4;
	ctx.stroke();
}