class Game {
    constructor(e) {
        this.e = e
        this.objects = []
        this.keys = {}
        this.pixelsPerMeter = 10
        this.spaceship = new Spaceship({x: 50, y: 50})
        this.addObject(this.spaceship)
        for (var i=-100; i<100; i+=10)
            for (var j=-100; j<100; j+=10)
                this.addObject(new Asteroid({x: i*2, y: j}))
        
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
        setInterval(() => {
            const newT = +Date.now()
            const elapsed = newT - t
            t = newT
            this.tick(elapsed/1000.0)
            this.updateFps(1000.0/elapsed)
        }, 50)
    }
    
    addObject(obj) {
        this.objects.push(obj)
        this.e.append(obj.e)
    }
    
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
        return fov
    }
    
    tick(elapsed) {
        const fov = this.calcFov()
        for (let o of this.objects) o.tick(this, elapsed)
        for (let o of this.objects) o.render(fov)
    }
}

class GameObject {
    constructor(pos) {
        this.pos = new Vector(pos)
    }
    tick(g, elapsed) {}
    render(fov) {
        const displayPos = this.pos.clone().subtract(fov.center).rotateBy(fov.rotation).scale(fov.pixelsPerMeter).add(fov.screenCenter)
        this.e.css({ left: `${displayPos.x}px`, top: `${displayPos.y}px` })
    }
}
class Spaceship extends GameObject {
    constructor(pos) {
        super(pos)
        this.e = $(`<div class="spaceship"></div>`)
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
}

class Asteroid extends GameObject {
    constructor(pos) {
        super(pos)
        this.e = $(`<div class="asteroid"></div>`)
    }
}

window.game = new Game($(".game"))