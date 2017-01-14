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
	
	this.renderObjects.push(new sun());
	for(var i = 0; i < 4; i++)
		this.renderObjects.push(new planet(i));
	
	this.logicHandler.postMessage({gameStatus : 'init'});
	
	this.draw();
	
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

game.prototype.draw = function()
{
	this.ctx.clearRect(0, 0, this.scaleWidth * widthToScale, this.scaleHeight * heightToScale);
	
	for(var i = 0; i < this.renderObjects.length; i++)
	{
		this.renderObjects[i].draw({context : this.ctx, width : this.scaleWidth, height : this.scaleHeight});
	}
}

game.prototype.handleEvent = function(event)
{
	
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

function sun()
{
	
}

sun.prototype.draw = function(context)
{
	
}

function planet()
{
	
}

planet.prototype.draw = function(context)
{
	
}