(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.animateFilterTransition = function animateFilterTransition(
    container,
    items,
    predicate
  ) {
    if (!container || !items?.length || typeof predicate !== "function") return;
    if (api.applyFilterTransition) {
      api.applyFilterTransition(items, predicate);
      return;
    }
    items.forEach((item) => {
      item.style.display = predicate(item) ? "" : "none";
    });
  };

  global.AppAnimations = api;
})(window);
