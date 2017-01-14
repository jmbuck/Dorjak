var vec2 = Box2D.Common.Math.b2Vec2;
var collision = Box2D.Collision.b2AABB;
var bodyDef = Box2D.Dynamics.b2BodyDef;
var body = Box2D.Dynamics.b2Body;
var fixtureDef = Box2D.Dynamics.b2FixtureDef;
var fixture = Box2D.Dynamics.b2Fixture;
var world = Box2D.Dynamics.b2World;
var massData = Box2D.Collision.Shapes.b2MassData;
var polygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var circleShape = Box2D.Collision.Shapes.b2CircleShape;
var debugDraw = Box2D.Dynamics.b2DebugDraw;
var mouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
var shape = Box2D.Collision.Shapes.b2Shape;
var revoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
var joint = Box2D.Dynamics.Joints.b2Joint;
var prismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
var contactListener = Box2D.Dynamics.b2ContactListener;
var settings = Box2D.Common.b2Settings;
var mat22 = Box2D.Common.Math.b2Mat22;
var edgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;
var edgeShape = Box2D.Collisions.Shapes.b2EdgeShape;
var worldManifold = Box2D.Collision.b2WorldManifold;

//max speed = 10 mps for higher velocity
settings.b2_maxTranslation = 10.0;
settings.b2_maxRotation = 50.0;

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