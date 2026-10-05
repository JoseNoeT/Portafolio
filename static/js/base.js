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


        // CTA motion is event-driven: one entrance, then only intentional attention cues.
        document.querySelectorAll(".motion-cta").forEach((cta) => {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.remove("bounce-top");
                    void entry.target.offsetWidth;
                    entry.target.classList.add("bounce-top");
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.72 });
            observer.observe(cta);
        });

        const scrollTopButton = document.querySelector("[data-scroll-top]");
        if (scrollTopButton) {
            scrollTopButton.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

    });
})(window);