// hero-animation.js
// Legacy compatibility shim. New implementation lives in js/animations/hero.js.

(function (global) {
  "use strict";

  const AppAnimations = global.AppAnimations || {};
  if (!AppAnimations.onReady || !AppAnimations.initHeroParticles) return;

  AppAnimations.onReady(() => {
    AppAnimations.initHeroParticles(".hero-canvas");
  });
})(window);