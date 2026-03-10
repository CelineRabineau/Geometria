Marche sur p5.js ;)

let plantGroup;
let lifeSpan = 600;
let lifeTimer = 0;
let spores = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 255);
  generatePlants();
}

function draw() {
  setGradient(0, 0, width, height, color(0, 0, 0), color(255, 255, 255), 'Y');

  drawSpores();

  plantGroup.forEach(p => {
    p.update();
    p.display();
  });

  drawGround();

  lifeTimer++;
  if (lifeTimer > lifeSpan) {
    generatePlants();
    lifeTimer = 0;
  }
}

function generatePlants() {
  plantGroup = [];
  let baseX = width / 2;
  let baseY = height - 20; // above the soil

  plantGroup.push(new GeometricPlant(baseX, baseY, int(random(6, 10)), -20));
  plantGroup.push(new GeometricPlant(baseX, baseY, int(random(8, 12)), 0));
  plantGroup.push(new GeometricPlant(baseX, baseY, int(random(6, 10)), 20));
}

class GeometricPlant {
  constructor(x, y, steps, baseAngle = 0) {
    this.x = x;
    this.y = y;
    this.baseAngle = baseAngle;
    this.segments = [];
    this.currentStep = 0;
    this.stepTimer = 0;
    this.stepInterval = 20;
    this.state = 'growing';
    this.timer = 0;
    this.build(steps);
  }

  build(steps) {
    for (let i = 0; i < steps; i++) {
      this.segments.push({
        len: random(30, 60),
        angle: random(-25, 25),
        wiggle: random(0.5, 1.2),
        offset: random(1000),
        shape: random(['line', 'burst', 'hexagon'])
      });
    }
  }

  update() {
    this.timer++;
    if (this.state === 'growing') {
      this.stepTimer++;
      if (this.stepTimer > this.stepInterval) {
        this.stepTimer = 0;
        if (this.currentStep < this.segments.length) {
          this.currentStep++;
        } else {
          this.state = 'alive';
        }
      }
    } else if (this.state === 'alive') {
      if (this.timer > lifeSpan * 0.6) {
        this.state = 'dying';
      }
    } else if (this.state === 'dying') {
      this.currentStep -= 0.2;
      if (this.currentStep < 0) this.currentStep = 0;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.baseAngle);

    let pos = createVector(0, 0);
    let dir = createVector(0, -1);

    for (let i = 0; i < floor(this.currentStep); i++) {
      let s = this.segments[i];
      let dynamicAngle = s.angle + sin(frameCount * s.wiggle + s.offset) * 5;
      dir.rotate(dynamicAngle);
      let nextPos = p5.Vector.add(pos, p5.Vector.mult(dir, s.len));

      let alpha = this.state === 'dying' ? 255 * (this.currentStep / this.segments.length) : 255;
      let hue = map(i, 0, this.segments.length, 120, 180);
      stroke(hue, 80, 100, alpha);
      fill(hue, 60, 90, alpha * 0.4);
      strokeWeight(2);

      if (s.shape === 'line') {
        line(pos.x, pos.y, nextPos.x, nextPos.y);
      } else if (s.shape === 'burst') {
        let mid = p5.Vector.lerp(pos, nextPos, 0.5);
        let count = 6;
        for (let j = 0; j < count; j++) {
          let angle = 360 / count * j;
          let r = s.len * 0.4;
          let bx = mid.x + cos(angle) * r;
          let by = mid.y + sin(angle) * r;
          line(mid.x, mid.y, bx, by);
        }
      } else if (s.shape === 'hexagon') {
        let mid = p5.Vector.lerp(pos, nextPos, 0.5);
        let r = s.len * 0.4;
        beginShape();
        for (let j = 0; j < 6; j++) {
          let angle = 60 * j;
          vertex(mid.x + cos(angle) * r, mid.y + sin(angle) * r);
        }
        endShape(CLOSE);
      }

      pos = nextPos.copy();
    }

    pop();
  }
}

function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function drawSpores() {
  if (spores.length < 100) {
    spores.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.2, 0.5),
      alpha: random(50, 100)
    });
  }

  noStroke();
  for (let spore of spores) {
    fill(60, 20, 100, spore.alpha);
    ellipse(spore.x, spore.y, spore.size);
    spore.y -= spore.speed;
    if (spore.y < 0) spore.y = height;
  }
}


function drawGround() {
  noStroke();
  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let n = noise(x * 0.01, frameCount * 0.002);
    let y = height - 10 - n * 30; // adjust the height variance
    let c = lerpColor(color(90, 50, 30), color(120, 80, 40), n);
    fill(c);
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}
