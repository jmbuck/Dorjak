var b2Vec3 = Class.create();
b2Vec3.prototype = 
{
	initialize: function(x_, y_, z_) {this.rad=x_; this.angle=y_; this.dist=z_},

	SetZero: function() { this.rad = 0.0; this.angle = 0.0; this.dist = 0.0 },
	Set: function(x_, y_, z_) {this.rad=x_; this.angle=y_; this.dist=z_},
	
	rad: null,
	angle: null
	dist: null
};

b2Vec3.Make = function(x_, y_, z_)
{
	return new b2Vec3(x_, y_, z_);
};