(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.applyFilterTransition = function applyFilterTransition(
    items,
    predicate,
    { hiddenClass = "is-filtered-out", activeClass = "is-filtered-in" } = {}
  ) {
    items.forEach((item) => {
      const visible = Boolean(predicate(item));
      item.style.display = visible ? "" : "none";
      api.toggleClass?.(item, hiddenClass, !visible);
      api.toggleClass?.(item, activeClass, visible);
    });
  };

  global.AppAnimations = api;
})(window);
