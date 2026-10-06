export function initHomeHeroParticles() {
  const api = window.AppAnimations || {};
  if (!api.onReady || !api.initHeroParticles) return;

  api.onReady(() => {
    let attempts = 0;
    const maxAttempts = 30;

    const start = () => {
      if (!document.querySelector(".hero-canvas")) return;
      if (!window.p5) {
        attempts += 1;
        if (attempts < maxAttempts) setTimeout(start, 120);
        return;
      }

      api.initHeroParticles(".hero-canvas", {
        tickSpeed: 10,
        baseHue: 180,
        numPoints: 10,
        maxTicks: 3000,
        strokeWeight: 1.5,
        lineAlpha: 0.01,
      });
    };

    start();
  });
}
