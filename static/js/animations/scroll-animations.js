// scroll-animations.js
// Reusable reveal-on-scroll and list transition helpers.
(function (global) {
  "use strict";

  const AppAnimations = global.AppAnimations || {};

  function initRevealOnScroll(
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("active");
          if (once) observer.unobserve(entry.target);
        });
      },
      { threshold, rootMargin }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function initAnimatedTitles(
    selector = "main h1, main h2, .hero h1, .hero h2",
    threshold = 0.2,
    rootMargin = "0px 0px -80px 0px",
    once = true
  ) {
    const titles = Array.from(document.querySelectorAll(selector));
    if (!titles.length) return;

    titles.forEach((title, index) => {
      title.classList.add("title-reveal");
      title.style.setProperty("--title-delay", `${Math.min(index * 70, 420)}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      titles.forEach((title) => title.classList.add("active"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("active");
          if (once) observer.unobserve(entry.target);
        });
      },
      { threshold, rootMargin }
    );

    titles.forEach((title) => observer.observe(title));
  }

  function animateFilterTransition(container, items, predicate) {
    if (!container || !items || !items.length || typeof predicate !== "function") return;

    if (AppAnimations.applyFilterTransition) {
      AppAnimations.applyFilterTransition(items, predicate);
      return;
    }

    items.forEach((item) => {
      item.style.display = predicate(item) ? "" : "none";
    });
  }

  AppAnimations.initRevealOnScroll = initRevealOnScroll;
  AppAnimations.initAnimatedTitles = initAnimatedTitles;
  AppAnimations.animateFilterTransition = animateFilterTransition;
  global.AppAnimations = AppAnimations;

  if (AppAnimations.onReady) {
    AppAnimations.onReady(() => {
      initRevealOnScroll();
      initAnimatedTitles();
    });
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        initRevealOnScroll();
        initAnimatedTitles();
      },
      { once: true }
    );
  }
})(window);
