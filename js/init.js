/*
	Load image from asset manager
*/
function img_res(path)
{
	var i = new Image();
	i.src = 'code/media/' + path;
	
	return i;
}

/*
	Generic function to write text
	example :
	
	write_text({x : game.canvas_width - 100 , y : game.canvas_height - 50 , font : 'bold 35px arial' , color : '#fff' , text : time , ctx : game.ctx})
*/
function write_text(options)
{
	var x = options.x;
	var y = options.y;
	var font = options.font;
	var color = options.color;
	var text = options.text;
	var ctx = options.ctx;
	
	ctx.save();
	
	if('shadow' in options)
	{
		ctx.shadowColor = options.shadow.color;
		ctx.shadowOffsetX = options.shadow.x;
		ctx.shadowOffsetY = options.shadow.y;
		ctx.shadowBlur = options.shadow.blur;
	}
	
	ctx.font = font;
	/*ctx.textAlign = 'center';*/
	ctx.fillStyle = color;
	
	if('align' in options)
	{
		ctx.textAlign = options.align;
	}
	
	ctx.fillText( text , x , y);
	
	ctx.restore();
}