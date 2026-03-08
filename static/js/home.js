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
                baseHue: 200,
                numPoints: 10,
                maxTicks: 3000,
                lineAlpha: 0.2,
            });
        }

        startHero();
    });
})(window);
