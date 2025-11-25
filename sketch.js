// ----------------------------------------
//  BIRD SWARM WITH PIXEL ART SPRITE
// ----------------------------------------

let boids = [];
let numBoids = 40; // FEWER BIRDS

let birdImg;

function preload() {
  birdImg = loadImage("bird.gif"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  createCanvas(windowWidth, windowHeight);

// Force crisp scaling everywhere (GitHub Pages, retina screens, etc.)
pixelDensity(1);
noSmooth();

  for (let i = 0; i < numBoids; i++) {
    boids.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(255);

  for (let b of boids) {
    b.flock(boids);
    b.mouseRepel();   // <<< NEW STRONG MOUSE FORCE
    b.update();
    b.edges();
    b.show();
  }
}

// ----------------------------------------
//  BOID CLASS
// ----------------------------------------

class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().setMag(random(1, 2));
    this.acc = createVector();
    this.maxForce = 0.2;   // MORE RESPONSIVE
    this.maxSpeed = 3;
  }

  flock(boids) {
    let sep = this.separate(boids).mult(1.5);
    let ali = this.align(boids).mult(1.0);
    let coh = this.cohesion(boids).mult(1.0);

    this.acc.add(sep);
    this.acc.add(ali);
    this.acc.add(coh);
  }

  // -------------------------
  // STRONG MOUSE REPEL
  // -------------------------
  mouseRepel() {
    let mouse = createVector(mouseX, mouseY);
    let d = dist(this.pos.x, this.pos.y, mouse.x, mouse.y);

    let radius = 180; // larger radius of effect

    if (d < radius) {
      let force = p5.Vector.sub(this.pos, mouse);
      force.setMag((radius - d) * 0.15);  // STRONG PUSH FORCE
      this.acc.add(force);
    }
  }

  separate(boids) {
    let desiredSeparation = 25;
    let steer = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steer.div(total);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  align(boids) {
    let perception = 50;
    let avg = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < perception && other !== this) {
        avg.add(other.vel);
        total++;
      }
    }

    if (total > 0) {
      avg.div(total);
      avg.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(avg, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }

    return createVector();
  }

  cohesion(boids) {
    let perception = 50;
    let center = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < perception && other !== this) {
        center.add(other.pos);
        total++;
      }
    }

    if (total > 0) {
      center.div(total);
      return this.seek(center);
    }

    return createVector();
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    rotate(this.vel.heading());

    imageMode(CENTER);
    noSmooth();

   let birdSize = 64; // make them bigger and consistent everywhere
image(birdImg, 0, 0, birdSize, birdSize);

    pop();
  }
}
