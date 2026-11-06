(function (global) {
  "use strict";
  const api = global.AppAnimations || {};
  const init = () => {
    api.initRevealOnScroll?.();
    api.initAnimatedTitles?.();
  };

  if (api.onReady) api.onReady(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})(window);
