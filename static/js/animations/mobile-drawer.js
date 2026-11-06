(function (global) {
  "use strict";
  const api = global.AppAnimations || {};
  const drawers = api.mobileDrawers || new WeakMap();
  api.mobileDrawers = drawers;
  api.initMobileDrawer = function initMobileDrawer({
    toggleSelector = "#mobile-menu-toggle", panelSelector = ".nav-links",
    overlaySelector = "#nav-overlay", linkSelector = ".nav-links a",
    bodyOpenClass = "nav-open", panelOpenClass = "active",
    overlayOpenClass = "active", closeOnEsc = true,
    closeOnResize = true, desktopBreakpoint = 1024,
  } = {}) {
    const toggle = document.querySelector(toggleSelector);
    const panel = document.querySelector(panelSelector);
    const overlay = document.querySelector(overlaySelector);
    if (!toggle || !panel || !overlay) return null;
    if (drawers.has(toggle)) return drawers.get(toggle);
    let isOpen = false;
    const mobile = () => window.innerWidth <= desktopBreakpoint;
    const links = [...document.querySelectorAll(linkSelector)];
    links.forEach((link) => {
      if (new URL(link.href).pathname === location.pathname && link.closest("ul")) {
        link.setAttribute("aria-current", "page");
      }
    });
    const setOpen = (open, restoreFocus = true) => {
      isOpen = open && mobile();
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      overlay.setAttribute("aria-hidden", String(!isOpen));
      panel.inert = mobile() && !isOpen;
      if (mobile()) panel.setAttribute("aria-hidden", String(!isOpen));
      else panel.removeAttribute("aria-hidden");
      overlay.classList.toggle(overlayOpenClass, isOpen);
      panel.classList.toggle(panelOpenClass, isOpen);
      document.body.classList.toggle(bodyOpenClass, isOpen);
      if (isOpen) links[0]?.focus({ preventScroll: true });
      else if (restoreFocus && mobile()) toggle.focus({ preventScroll: true });
    };
    const closeMenu = () => setOpen(false);
    toggle.addEventListener("click", () => setOpen(!isOpen));
    overlay.addEventListener("click", closeMenu);
    links.forEach((link) => link.addEventListener("click", () => setOpen(false, false)));
    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (closeOnEsc && event.key === "Escape") { event.preventDefault(); closeMenu(); }
      if (event.key !== "Tab") return;
      const focusable = [toggle, ...links];
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault(); focusable.at(-1).focus();
      } else if (!event.shiftKey && (index === focusable.length - 1 || index < 0)) {
        event.preventDefault(); toggle.focus();
      }
    });
    if (closeOnResize) window.addEventListener("resize", () => {
      if (!mobile()) setOpen(false, false);
      else if (!isOpen) { panel.inert = true; panel.setAttribute("aria-hidden", "true"); }
    });
    setOpen(false, false);
    const controller = { openMenu: () => setOpen(true), closeMenu };
    drawers.set(toggle, controller);
    return controller;
  };
  global.AppAnimations = api;
  // Navigation must work even if unrelated page initialization fails.
  const initDrawer = api.initMobileDrawer;
  const init = () => initDrawer();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else init();
})(window);
