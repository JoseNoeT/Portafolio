// hero.js
// Encapsulated p5.js hero particle animation.
(function (global) {
  "use strict";

  const AppAnimations = global.AppAnimations || {};

  function createHeroParticles({
    container,
    tickSpeed = 10,
    baseHue = 180,
    numPoints = 10,
    maxTicks = 3000,
    strokeWeight = 1.5,
    lineAlpha = 0.01,
  } = {}) {
    if (!container || !global.p5) return null;

    let points = [];
    let ticks = 0;

    const sketch = (p) => {
      function buildPoint(x = p.random(p.width), y = p.random(p.height), angle = p.random(p.PI)) {
        return {
          x,
          y,
          dx: p.cos(angle),
          dy: p.sin(angle),
          color: p.color((p.random(100) + baseHue) % 360, 100, 100, lineAlpha),
          neighbor: null,
        };
      }

      function updatePoint(point) {
        point.x += point.dx;
        point.y += point.dy;

        if (point.x < 0 || point.x >= p.width) point.dx *= -1;
        if (point.y < 0 || point.y >= p.height) point.dy *= -1;

        p.stroke(point.color);
        if (point.neighbor) p.line(point.x, point.y, point.neighbor.x, point.neighbor.y);
      }

      function resizeToHero() {
        const hero = container.closest(".hero-home") || container.closest(".hero") || container;
        const rect = hero.getBoundingClientRect();
        p.resizeCanvas(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
        p.pixelDensity(1);
      }

      function initSketch() {
        points = [];
        ticks = 0;

        for (let i = 0; i < numPoints; i += 1) {
          points.push(buildPoint());
        }

        points.forEach((point, index) => {
          let neighborIndex = index;
          while (neighborIndex === index) {
            neighborIndex = Math.floor(p.random(points.length));
          }
          point.neighbor = points[neighborIndex];
        });

        p.clear();
        p.background(0);
      }

      p.setup = function setup() {
        const c = p.createCanvas(10, 10);
        c.parent(container);

        p.colorMode(p.HSB);
        p.blendMode(p.ADD);
        p.strokeWeight(strokeWeight);

        resizeToHero();
        initSketch();
      };

      p.draw = function draw() {
        if (ticks > maxTicks) return;

        for (let n = 0; n < tickSpeed; n += 1) {
          points.forEach(updatePoint);
          ticks += 1;
        }
      };

      p.windowResized = function onWindowResized() {
        resizeToHero();
        initSketch();
      };

      p.mouseClicked = function onMouseClicked() {
        const hero = container.closest(".hero-home") || container.closest(".hero");
        if (!hero) return;

        const rect = hero.getBoundingClientRect();
        const insideHero =
          p.mouseX >= 0 &&
          p.mouseX <= rect.width &&
          p.mouseY >= 0 &&
          p.mouseY <= rect.height;

        if (insideHero) initSketch();
      };

      p._restartSketch = initSketch;
    };

    const instance = new global.p5(sketch);

    return {
      restart() {
        if (instance && typeof instance._restartSketch === "function") {
          instance._restartSketch();
        }
      },
      destroy() {
        if (instance && typeof instance.remove === "function") {
          instance.remove();
        }
      },
    };
  }

  function initHeroParticles(selector = ".hero-canvas", options = {}) {
    const container = document.querySelector(selector);
    if (!container) return null;

    return createHeroParticles({ container, ...options });
  }

  AppAnimations.createHeroParticles = createHeroParticles;
  AppAnimations.initHeroParticles = initHeroParticles;
  global.AppAnimations = AppAnimations;
})(window);
