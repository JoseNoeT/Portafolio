(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.onReady = function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  api.toggleClass = function toggleClass(el, className, force) {
    if (!el || !className) return false;
    if (typeof force === "boolean") {
      el.classList.toggle(className, force);
      return force;
    }
    return el.classList.toggle(className);
  };

  api.setAria = function setAria(el, attr, value) {
    if (el && attr) el.setAttribute(attr, String(value));
  };

  api.smoothScrollTo = function smoothScrollTo(el, options = {}) {
    if (!el?.scrollIntoView) return;
    el.scrollIntoView({
      behavior: options.behavior || "smooth",
      block: options.block || "start",
      inline: options.inline || "nearest",
    });
  };

  api.throttle = function throttle(fn, wait = 120) {
    let last = 0;
    let timer = null;
    return function throttled(...args) {
      const remaining = wait - (Date.now() - last);
      if (remaining <= 0) {
        clearTimeout(timer);
        timer = null;
        last = Date.now();
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  };

  api.debounce = function debounce(fn, wait = 150) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  global.AppAnimations = api;
})(window);
