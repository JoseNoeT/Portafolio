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

        // CTA text swap on scroll past hero
        const ctaBtn = document.getElementById("navbar-cta");
        const hero = document.querySelector(".hero");
        if (ctaBtn && hero) {
            let swapped = false;
            const original = ctaBtn.textContent;
            const altText = "Agenda una llamada";
            function onScroll() {
                const rect = hero.getBoundingClientRect();
                if (rect.bottom < 0 && !swapped) {
                    ctaBtn.textContent = altText;
                    swapped = true;
                } else if (rect.bottom >= 0 && swapped) {
                    ctaBtn.textContent = original;
                    swapped = false;
                }
            }
            window.addEventListener("scroll", onScroll, { passive: true });
        }
    });
})(window);