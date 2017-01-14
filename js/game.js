var gameSession = null;

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
	
	this.logicHandler = new Worker("./js/logic.js");
	
	this.logicHandler.onmessage = this.handleEvent;
	
	this.renderObjects.push(new sun());
	for(var i = 0; i < 4; i++)
		this.renderObjects.push(new planet(i));
	
	this.logicHandler.postMessage({gameStatus : 'init'});
	
	console.log('Some Text');
}

game.prototype.resize = function()
{
	this.canvas.width($j(window).innerWidth());
	this.canvas.height($j(window).innerHeight());
}

game.prototype.handleEvent = function(event)
{
	
}

game.prototype.start_handling = function()
{	
	$j(document).on('keydown.game' , function(e)
	{
		gameSession.keyRelease(e);
		return false;
	});
	
	$j(document).on('keyup.game' ,function(e)
	{
		gameSession.keyPress(e);
		return false;
	});
}

game.prototype.keyPress(key)
{
	
}

game.prototype.keyRelease(key)
{
	
}

function sun()
{
	
}

function planet()
{
	
}