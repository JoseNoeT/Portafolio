// base.js
// Global page interactions that rely on shared animation utilities.

(function (global) {
    "use strict";

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