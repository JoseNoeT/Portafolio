(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.initAnimatedTitles = function initAnimatedTitles(
    selector = "main h1, main h2, .hero h1, .hero h2",
    threshold = 0.2,
    rootMargin = "0px 0px -80px 0px",
    once = true
  ) {
    const titles = [...document.querySelectorAll(selector)];
    if (!titles.length) return;

    titles.forEach((title, index) => {
      title.classList.add("title-reveal");
      title.style.setProperty("--title-delay", `${Math.min(index * 70, 420)}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      titles.forEach((title) => title.classList.add("active"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        if (once) observer.unobserve(entry.target);
      });
    }, { threshold, rootMargin });

    titles.forEach((title) => observer.observe(title));
  };

  global.AppAnimations = api;
})(window);
