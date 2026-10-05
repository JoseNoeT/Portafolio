// home.js
// Home-specific initialization. Global reveal logic lives in animations/scroll-animations.js.

(function (global) {
    "use strict";

    const AppAnimations = global.AppAnimations || {};

    if (!AppAnimations.onReady || !AppAnimations.initHeroParticles) {
        return;
    }

    AppAnimations.onReady(() => {
        let attempts = 0;
        const maxAttempts = 30;

        function startHero() {
            const canvasContainer = document.querySelector(".hero-canvas");
            if (!canvasContainer) return;

            if (!global.p5) {
                attempts += 1;
                if (attempts < maxAttempts) {
                    setTimeout(startHero, 120);
                }
                return;
            }

            AppAnimations.initHeroParticles(".hero-canvas", {
                tickSpeed: 10,
                baseHue: 180,
                numPoints: 10,
                maxTicks: 3000,
                strokeWeight: 1.5,
                lineAlpha: 0.01,
            });
        }

        startHero();
    });
})(window);

// Methodology image: roll-in-blurred once when it enters the viewport.
(() => {
  const image = document.querySelector(".methodology-roll-image");
  if (!image) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      const entry = entries[0];
      if (!entry.isIntersecting || hasAnimated) return;

      hasAnimated = true;
      image.classList.add("is-roll-running");
      currentObserver.unobserve(image);

      image.addEventListener(
        "animationend",
        () => image.classList.remove("is-roll-running"),
        { once: true }
      );
    },
    {
      threshold: 0.28,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  observer.observe(image);
})();
