(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  function createHeroParticles({
    container, tickSpeed = 10, baseHue = 180, numPoints = 10,
    maxTicks = 3000, strokeWeight = 1.5, lineAlpha = 0.01,
  } = {}) {
    if (!container || !global.p5) return null;

    const dark = {
      baseHue, hueRange: 100, saturation: 100, brightness: 100,
      lineAlpha, blend: "ADD",
    };
    const light = {
      baseHue: 130, hueRange: 70, saturation: 55, brightness: 70,
      lineAlpha: 0.02, blend: "BLEND",
    };
    const getPalette = () =>
      (document.documentElement.getAttribute("data-theme") || "dark") === "light"
        ? light : dark;

    let palette = getPalette();
    let points = [];
    let ticks = 0;

    const sketch = (p) => {
      const point = (x = p.random(p.width), y = p.random(p.height), angle = p.random(p.PI)) => ({
        x, y, dx: p.cos(angle), dy: p.sin(angle), neighbor: null,
        color: p.color(
          (p.random(palette.hueRange) + palette.baseHue) % 360,
          palette.saturation, palette.brightness, palette.lineAlpha
        ),
      });

      const update = (item) => {
        item.x += item.dx; item.y += item.dy;
        if (item.x < 0 || item.x >= p.width) item.dx *= -1;
        if (item.y < 0 || item.y >= p.height) item.dy *= -1;
        p.stroke(item.color);
        if (item.neighbor) p.line(item.x, item.y, item.neighbor.x, item.neighbor.y);
      };

      const resize = () => {
        const hero = container.closest(".hero-home") || container.closest(".hero") || container;
        const rect = hero.getBoundingClientRect();
        p.resizeCanvas(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
        p.pixelDensity(1);
      };

      const restart = () => {
        palette = getPalette(); points = []; ticks = 0;
        for (let i = 0; i < numPoints; i += 1) points.push(point());
        points.forEach((item, index) => {
          let neighbor = index;
          while (neighbor === index) neighbor = Math.floor(p.random(points.length));
          item.neighbor = points[neighbor];
        });
        p.blendMode(palette.blend === "ADD" ? p.ADD : p.BLEND);
        p.clear();
        if (palette.blend === "ADD") p.background(0);
      };

      p.setup = () => {
        p.createCanvas(10, 10).parent(container);
        p.colorMode(p.HSB); p.strokeWeight(strokeWeight);
        resize(); restart();
      };
      p.draw = () => {
        if (ticks > maxTicks) return;
        for (let n = 0; n < tickSpeed; n += 1) {
          points.forEach(update); ticks += 1;
        }
      };
      p.windowResized = () => { resize(); restart(); };
      p.mouseClicked = () => {
        const hero = container.closest(".hero-home") || container.closest(".hero");
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        if (p.mouseX >= 0 && p.mouseX <= rect.width && p.mouseY >= 0 && p.mouseY <= rect.height) restart();
      };
      p._restartSketch = restart;
    };

    const instance = new global.p5(sketch);
    const observer = new MutationObserver(() => instance?._restartSketch?.());
    observer.observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"],
    });

    return {
      restart: () => instance?._restartSketch?.(),
      destroy() { observer.disconnect(); instance?.remove?.(); },
    };
  }

  api.createHeroParticles = createHeroParticles;
  api.initHeroParticles = (selector = ".hero-canvas", options = {}) => {
    const container = document.querySelector(selector);
    return container ? createHeroParticles({ container, ...options }) : null;
  };
  global.AppAnimations = api;
})(window);
