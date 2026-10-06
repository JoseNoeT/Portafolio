(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.initMobileDrawer = function initMobileDrawer({
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

    const setOpen = (open) => {
      if ("checked" in toggle) toggle.checked = open;
      api.setAria?.(overlay, "aria-hidden", String(!open));
      api.toggleClass?.(overlay, overlayOpenClass, open);
      api.toggleClass?.(panel, panelOpenClass, open);
      api.toggleClass?.(document.body, bodyOpenClass, open);
    };

    const openMenu = () => setOpen(true);
    const closeMenu = () => setOpen(false);

    toggle.addEventListener("change", () => setOpen(toggle.checked));
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
      const resize = api.throttle?.(() => {
        if (window.innerWidth > desktopBreakpoint) closeMenu();
      }, 120);
      if (resize) window.addEventListener("resize", resize);
    }

    return { openMenu, closeMenu };
  };

  global.AppAnimations = api;
})(window);
