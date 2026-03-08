// animations-core.js
// Shared animation/UI helpers for reusable interactions.
(function (global) {
  "use strict";

  const AppAnimations = global.AppAnimations || {};

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
      return;
    }
    fn();
  }

  function toggleClass(el, className, force) {
    if (!el || !className) return false;
    if (typeof force === "boolean") {
      el.classList.toggle(className, force);
      return force;
    }
    return el.classList.toggle(className);
  }

  function setAria(el, attr, value) {
    if (!el || !attr) return;
    el.setAttribute(attr, String(value));
  }

  function smoothScrollTo(el, options = {}) {
    if (!el || typeof el.scrollIntoView !== "function") return;
    const config = {
      behavior: options.behavior || "smooth",
      block: options.block || "start",
      inline: options.inline || "nearest",
    };
    el.scrollIntoView(config);
  }

  function throttle(fn, wait = 120) {
    let lastTime = 0;
    let timeoutId = null;

    return function throttled(...args) {
      const now = Date.now();
      const remaining = wait - (now - lastTime);

      if (remaining <= 0) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        lastTime = now;
        fn.apply(this, args);
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastTime = Date.now();
          timeoutId = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  function debounce(fn, wait = 150) {
    let timeoutId = null;

    return function debounced(...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function initMobileDrawer({
    toggleSelector = "#mobile-menu-toggle",
    panelSelector = ".nav-links",
    overlaySelector = "#nav-overlay",
    linkSelector = ".nav-links a",
    bodyOpenClass = "nav-open",
    panelOpenClass = "active",
    overlayOpenClass = "active",
    closeOnEsc = true,
    closeOnResize = true,
    desktopBreakpoint = 1024,
  } = {}) {
    const toggle = document.querySelector(toggleSelector);
    const panel = document.querySelector(panelSelector);
    const overlay = document.querySelector(overlaySelector);

    if (!toggle || !panel || !overlay) return null;

    function openMenu() {
      if ("checked" in toggle) toggle.checked = true;
      setAria(overlay, "aria-hidden", "false");
      toggleClass(overlay, overlayOpenClass, true);
      toggleClass(panel, panelOpenClass, true);
      toggleClass(document.body, bodyOpenClass, true);
    }

    function closeMenu() {
      if ("checked" in toggle) toggle.checked = false;
      setAria(overlay, "aria-hidden", "true");
      toggleClass(overlay, overlayOpenClass, false);
      toggleClass(panel, panelOpenClass, false);
      toggleClass(document.body, bodyOpenClass, false);
    }

    function onToggleChange() {
      if (toggle.checked) openMenu();
      else closeMenu();
    }

    toggle.addEventListener("change", onToggleChange);
    overlay.addEventListener("click", closeMenu);

    document.querySelectorAll(linkSelector).forEach((item) => {
      item.addEventListener("click", closeMenu);
    });

    if (closeOnEsc) {
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });
    }

    if (closeOnResize) {
      const onResize = throttle(() => {
        if (window.innerWidth > desktopBreakpoint) closeMenu();
      }, 120);
      window.addEventListener("resize", onResize);
    }

    return { openMenu, closeMenu };
  }

  function applyFilterTransition(items, predicate, {
    hiddenClass = "is-filtered-out",
    activeClass = "is-filtered-in",
  } = {}) {
    items.forEach((item) => {
      const visible = Boolean(predicate(item));
      item.style.display = visible ? "" : "none";
      toggleClass(item, hiddenClass, !visible);
      toggleClass(item, activeClass, visible);
    });
  }

  AppAnimations.onReady = onReady;
  AppAnimations.toggleClass = toggleClass;
  AppAnimations.setAria = setAria;
  AppAnimations.smoothScrollTo = smoothScrollTo;
  AppAnimations.throttle = throttle;
  AppAnimations.debounce = debounce;
  AppAnimations.initMobileDrawer = initMobileDrawer;
  AppAnimations.applyFilterTransition = applyFilterTransition;

  global.AppAnimations = AppAnimations;
})(window);
