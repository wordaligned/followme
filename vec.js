// 2-D Vectors
function Vec(x, y) {
    this.x = x;
    this.y = y;
}

Vec.prototype = {
    equal: function(v) {
        return this.x === v.x && this.y == v.y;
    },

    // Add v to this
    add: function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    },

    // Subtract v from this
    sub: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },

    // Dot product with v
    dot: function(v) {
        return this.x * v.x + this.y * v.y;
    },

    // Z component of cross product with v
    crossz: function(v) {
        return this.x * v.y - v.x * this.y;
    },

    // Scale by r
    scale: function(r) {
        this.x *= r;
        this.y *= r;
        return this;
    },

    // Return the modulus (length) of this
    mod: function() {
        return Math.sqrt(this.dot(this));
    },

    // Return a vector perpendicular to this one
    // (Rotate this vector by PI/2 anticlockwise)
    perp: function() {
        var t = this.x;
        this.x = -this.y;
        this.y = t;
        return this;
    },

    // Return the angle to the vector v (range 0 to PI)
    angleTo: function(v) {
        var d = this.mod() * v.mod();
        return d == 0 ? 0 : Math.acos(this.dot(v) / d);
	},

    // Rotate by theta radians anticlockwise
    rotate: function(theta) {
        var x = this.x * Math.cos(theta) - this.y * Math.sin(theta),
            y = this.x * Math.sin(theta) + this.y * Math.cos(theta);

        this.x = x;
        this.y = y;
        return this;
    },

    // Return a vector of length 1 with the same direction as this
    unit: function() {
        var m = this.mod();
        if (m === 0.0) {
            this.x = 1;
            this.y = 0;
        } else {
            this.scale(1/m);
        }
        return this;
    },

    // Clamp x and y coordinates of this vector to be within the specified ranges
    clamp: function(x, y, X, Y) {
        this.x = Math.max(x, Math.min(this.x, X));
        this.y = Math.max(y, Math.min(this.y, Y));
        return this;
    },

    // Clone this vector
    clone: function() {
        return new Vec(this.x, this.y);
    }
};

