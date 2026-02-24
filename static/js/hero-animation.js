// static/js/hero-animation.js
// Canvas animado SOLO dentro del HERO (.hero-canvas)

let points = [];
let tickSpeed = 10;
let base = 200;          // ✅ fijo (azul/cian tech)
let numPoints = 10;
let maxTicks = 3000;
let ticks = 0;

let canvasParentEl = null;

function Point(x = random(width), y = random(height), a = random(PI)) {
  this.x = x;
  this.y = y;
  this.a = a;
  this.dx = cos(a);
  this.dy = sin(a);

  // ✅ rango acotado alrededor del azul
  this.hue = (random(35) + base) % 360;
  this.color = color(this.hue, 100, 100, 0.02); // un poquito más visible
}

Point.prototype.update = function () {
  this.x += this.dx;
  this.y += this.dy;

  if (this.x < 0 || this.x >= width) this.dx *= -1;
  if (this.y < 0 || this.y >= height) this.dy *= -1;

  stroke(this.color);
  line(this.x, this.y, this.neighbor.x, this.neighbor.y);
};

function setup() {
  canvasParentEl = document.querySelector(".hero-canvas");
  if (!canvasParentEl) return;

  const c = createCanvas(10, 10);
  c.parent(canvasParentEl);

  colorMode(HSB);
  blendMode(ADD);
  strokeWeight(1.5);

  resizeToHero();
  initSketch();
}

function initSketch() {
  points = [];
  ticks = 0;

  for (let i = 0; i < numPoints; i++) points.push(new Point());

  for (let i = 0; i < points.length; i++) {
    let j = i;
    while (j === i) j = floor(random(points.length));
    points[i].neighbor = points[j];
  }

  clear();
  background(10); // ✅ oscuro suave
}

function draw() {
  if (!canvasParentEl) return;
  if (ticks > maxTicks) return;

  for (let n = 0; n < tickSpeed; n++) {
    for (let i = 0; i < points.length; i++) {
      points[i].update();
    }
    ticks++;
  }
}

function mouseClicked() {
  if (!canvasParentEl) return;
  const hero = canvasParentEl.closest(".hero");
  if (!hero) return;
  initSketch();
}

function windowResized() {
  resizeToHero();
  initSketch();
}

function resizeToHero() {
  if (!canvasParentEl) return;

  const hero = canvasParentEl.closest(".hero");
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  resizeCanvas(Math.floor(rect.width), Math.floor(rect.height));
  pixelDensity(1);
}