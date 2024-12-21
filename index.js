class Game {
    constructor(e) {
        this.e = e
        this.objects = []
        this.keys = {}
        this.pixelsPerMeter = 10
        this.spaceship = new Spaceship({x: 50, y: 50})
        this.addObject(this.spaceship)

        // Initialize endless asteroid field
        for (let i = 0; i < 50; i++) {
            const position = Asteroid.randomOutsidePosition(this);
            this.addObject(new Asteroid(position));
        }
        
        // Starting asteroids nearby so you can tell where you are
        for (var i = -10; i <= 10; i += 5) {
            for (var j = -10; j <= 10; j += 5) {
                if (i == 0 && j == 0) continue
                this.addObject(new Asteroid({x: i, y: j}))
            }
        }

        $(".game-over").hide()
        this.mainLoop();
        
        $(document).on("keydown", (e) => this.keysChanged(e, true));
        $(document).on("keyup", (e) => this.keysChanged(e, false));
    }
    
    updateFps(fps) {
        this._data ||= []
        this._sum ||= 0
        this._count ||= 0
        this._data.push(fps)
        this._sum += fps
        this._count += 1
        if (this._data.length > 20) this._sum -= this._data.shift()
        const avg = this._sum / this._data.length
        if(this._count > 20) {
            $(".fps").text(`${Math.round(avg)} fps`)
            this._count = 0
        }
    }
    
    mainLoop() {
        var t = +Date.now()
        this.interval = setInterval(() => {
            const newT = +Date.now()
            const elapsed = newT - t
            t = newT
            this.tick(elapsed/1000.0)
            this.updateFps(1000.0/elapsed)
        }, 10)
    }
    
    addObject(obj) {
        this.objects.push(obj)
        this.e.append(obj.e)
    }
    
    stop() {
        //clearInterval(this.interval)
        //$(".gameOver").show()
    }
    
    playSound(url) {
        // TODO
    }
    
    removeObject(obj) { o.destroy() }
    
    keysChanged(event, isPressed) {
        this.keys[event.key.toLowerCase()] = isPressed
    }
    
    calcFov() {
        var fov = {
            center: this.spaceship.pos,
            rotation: this.spaceship.rotationPos - Math.PI/2,
            bounds: { width: this.e.width(), height: this.e.height() },
            pixelsPerMeter: this.pixelsPerMeter,
        }
        fov.screenCenter = new Vector(fov.bounds.width/2, fov.bounds.height/2)
        fov.metersToScreen = function(posMeters) {
            return posMeters.clone().subtract(fov.center).rotateBy(fov.rotation).scale(fov.pixelsPerMeter).add(fov.screenCenter)
        }
        fov.screenToMeters = function(posPx) {
            return posPx.subtract(fov.screenCenter).scale(1/fov.pixelsPerMeter).rotateBy(-fov.rotation).add(fov.center)
        }
        return fov
    }
    
    tick(elapsed) { // Main game loop
        // Physics tick
        for (let o of this.objects) 
            if (!o.removed) o.tick(this, elapsed)
        
        // Collision detection
        for (let o of this.objects) {
            if (o == this.spaceship) continue;
            if (o.collides(this.spaceship)) this.spaceship.collide(g, o)
        }
        
        // Filter out removed objects
        this.objects = this.objects.filter(o => !o.removed)
        
        // Render tick
        const fov = this.calcFov()
        for (let o of this.objects) o.render(fov)
    }
}

class GameObject {
    constructor(pos) {
        this.pos = new Vector(pos)
    }
    tick(g, elapsed) {}
    destroy() { this.removed = true }
    
    collides(other) { return false; }
    collide(other) { }
    render(fov) {
        const displayPos = fov.metersToScreen(this.pos)
        this.e.css({ left: `${displayPos.x}px`, top: `${displayPos.y}px` })
    }
}
class Spaceship extends GameObject {
    constructor(pos) {
        super(pos)
        this.e = $(`<div class="spaceship"></div>`)
        this.radius = this.e.width()/2
        this.velocity = {x: 0, y: 0} // meters/s each
        this.rotationPos = 0 // radians
        this.speed = 30 // 
        
        // Constant
        this.acceleration = 1 // meters/s/s
        this.rotationalAcceleration = 5 // radians/s/s
        this.maxRotationalSpeed = 10 // radians/s
        this.maxSpeed = 10 // meters/s
        this.linearDrag = -2 // meters/s/s
        this.rotationalDrag = -2 // radians/s/s
    }
    
    collides(other) {
        return other.pos.subtract(this.pos).magnitude() <= this.radius
    }
    
    tick(g, elapsed){
        const keys = g.keys

        var forward = 0
        var rotationImpulse = 0
        if (keys["arrowup"] || keys["w"]) forward += 1
        if (keys["arrowleft"] || keys["a"]) rotationImpulse -= 1
        if (keys["arrowright"] || keys["d"]) rotationImpulse += 1

        // Move forward in the direction of the rotation
        this.pos.x += Math.cos(this.rotationPos) * this.speed * elapsed * forward;
        this.pos.y -= Math.sin(this.rotationPos) * this.speed * elapsed * forward;
        
        this.rotationPos -= 2 * elapsed * rotationImpulse
        
        //this.rotation -= 5 * elapsed * rotationImpulse * this.rotationalAcceleration
        //this.velocity = this.velocity.add(this.acceleration * direction) * elapsed
    }
    
    collide(g, o) {
        g.stop()
        g.playSound("explode.mp3")
    }
}

class Asteroid extends GameObject {
    constructor(pos) {
        super(pos)
        this.e = $(`<div class="asteroid"></div>`)
    }


    static randomOutsidePosition(g) {
        const width = g.e.width(), height = g.e.height()
        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // Top
                return { x: Math.random() * width, y: -50 };
            case 1: // Bottom
                return { x: Math.random() * width, y: height + 50 };
            case 2: // Left
                return { x: -50, y: Math.random() * height };
            case 3: // Right
                return { x: width + 50, y: Math.random() * height };
        }
    }
}

window.game = new Game($(".game"))