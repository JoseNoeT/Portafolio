(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.initRevealOnScroll = function initRevealOnScroll(
    selector = ".reveal",
    threshold = 0.1,
    rootMargin = "0px 0px -100px 0px",
    once = true
  ) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;
    document.documentElement.classList.add("js-enabled");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("active"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        if (once) observer.unobserve(entry.target);
      });
    }, { threshold, rootMargin });

    elements.forEach((el) => observer.observe(el));
  };

  global.AppAnimations = api;
})(window);
