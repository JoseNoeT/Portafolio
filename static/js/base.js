// base.js
// Global page interactions that rely on shared animation utilities.

(function (global) {
    "use strict";

    /* ── Theme persistence ── */
    const THEME_KEY = 'portfolio-theme';

    function getStoredTheme() {
        return localStorage.getItem(THEME_KEY) || 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        return next;
    }

    // Expose for page-level toggle buttons
    global.PortfolioTheme = { toggle: toggleTheme, apply: applyTheme, get: getStoredTheme };

    // Ensure theme is applied (belt-and-suspenders with inline script)
    applyTheme(getStoredTheme());

    const AppAnimations = global.AppAnimations || {};

    if (!AppAnimations.onReady || !AppAnimations.initMobileDrawer) {
        return;
    }

    AppAnimations.onReady(() => {
        AppAnimations.initMobileDrawer({
            toggleSelector: "#mobile-menu-toggle",
            panelSelector: ".nav-links",
            overlaySelector: "#nav-overlay",
            linkSelector: ".nav-links a",
            bodyOpenClass: "nav-open",
            panelOpenClass: "active",
            overlayOpenClass: "active",
            closeOnEsc: true,
            closeOnResize: true,
            desktopBreakpoint: 1024,
        });


    });
})(window);