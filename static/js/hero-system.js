// Hero System Animation - Reusable

(function () {
    "use strict";

    function activateHero(hero) {
        if (!hero || hero.dataset.heroAnimated === 'true') {
            return;
        }

        hero.dataset.heroAnimated = 'true';
        hero.classList.add('hero-visible');
    }

    function initHeroVisibility() {
        var heroes = document.querySelectorAll('.hero');

        if (!(window.IntersectionObserver)) {
            heroes.forEach(activateHero);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                activateHero(entry.target);
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.1
        });

        heroes.forEach(function (hero) {
            observer.observe(hero);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeroVisibility();
    });
})();
