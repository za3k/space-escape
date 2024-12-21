class Vector {
    constructor(x, y) {
        if (typeof(x) == "object") {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
    }
    
    clone() {
        return new Vector(this.x, this.y)
    }
    
    rotateBy(radians) { return Vector.rotateBy(this, radians) }
    subtract(v) { return Vector.subtract(this, v) }
    add(v) { return Vector.add(this, v) }
    scale(k) { return Vector.scale(this, k) }
    magnitude() { return Vector.magnitude(this) }
    normalize() { return Vector.normalize(this) }
    dot(v) { return Vector.normalize(v) }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    static subtract(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y)
    }

    static scale(v, k) {
        return new Vector(v.x * k, v.y * k)
    }

    static rotateBy(v, radians) {
        const cos = Math.cos(radians)
        const sin = Math.sin(radians)
        return new Vector(v.x * cos - v.y * sin, v.x * sin + v.y * cos)
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y
    }

    static magnitude(v) {
        return Math.sqrt(v.x ** 2 + v.y ** 2);
    }

    static normalize(v) {
        const mag = Vector.magnitude(v);
        if (mag > 0) {
            return Vector.scale(v, 1 / mag);
        }
        return new Vector(0, 0);
    }
}