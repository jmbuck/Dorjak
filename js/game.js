var gameSession = null;

start();

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
	
	this.renderObjects = [];
	this.queuedMessages = [];
	
	this.timeElapsed = 0;
	this.destroyObjects = [];
}

game.prototype.init = function()
{
	this.canvas = $j('#canvas');
	this.ctx = this.canvas.get(0).getContext('2d');
	
	this.resize();
	
	this.logicHandler = new Worker('logic.js');
	
	this.logicHandler.onmessage = this.handleEvent;
	
	this.renderObjects.push(new sun());
	for(var i = 0; i < 4; i++)
		this.renderObjects.pust(new planet(i));
	
	this.logicHandler.postMessage({gameStatus : 'init'});
	
	console.log('Some Text');
}

game.prototype.resize = function()
{
	this.canvas.width = $(window).innerWidth();
	this.canvas.height = $(height).innerHeight();
}

game.prototype.handleEvent = function(event)
{
	
}

game.prototype.start_handling = function()
{	
	$j(document).on('keydown.game' , function(e)
	{
		gameSession.key_down(e);
		return false;
	});
	
	$j(document).on('keyup.game' ,function(e)
	{
		gameSession.key_up(e);
		return false;
	});
}

function sun()
{
	
}

function planet()
{
	
}