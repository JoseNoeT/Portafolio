// Hero System Animation - Reusable

(function () {
    "use strict";

    function revealHeroes() {
        var heroes = document.querySelectorAll('.hero');
        heroes.forEach(function (hero) {
            hero.classList.add('hero-visible');
        });
    }

    function buildTitleFaces(charValue) {
        var wrapper = document.createElement('span');
        wrapper.className = 'hero-char-3d char-3d';
        wrapper.setAttribute('aria-hidden', 'true');

        var ghost = document.createElement('span');
        ghost.className = 'hero-face-ghost';
        ghost.textContent = charValue;

        var faceTop = document.createElement('em');
        faceTop.className = 'hero-face face hero-face-top face-top';
        faceTop.textContent = charValue;

        var faceFront = document.createElement('em');
        faceFront.className = 'hero-face face hero-face-front face-front';
        faceFront.textContent = charValue;

        var faceBottom = document.createElement('em');
        faceBottom.className = 'hero-face face hero-face-bottom face-bottom';
        faceBottom.textContent = charValue;

        wrapper.appendChild(ghost);
        wrapper.appendChild(faceTop);
        wrapper.appendChild(faceFront);
        wrapper.appendChild(faceBottom);

        return wrapper;
    }

    function initSharedHeroTitle3D() {
        var titles = document.querySelectorAll('.hero.hero-page .hero-page__title');
        titles.forEach(function (title) {
            if (title.dataset.hero3dProcessed === 'true') {
                return;
            }

            var sourceText = title.textContent || '';
            if (!sourceText.trim()) {
                return;
            }

            title.dataset.hero3dProcessed = 'true';
            title.classList.add('hero-title-3d');
            title.setAttribute('aria-label', sourceText.trim());

            var fragment = document.createDocumentFragment();
            var visualChars = Array.from(sourceText);
            var charIndex = 0;

            visualChars.forEach(function (charValue) {
                if (charValue === ' ') {
                    fragment.appendChild(document.createTextNode(' '));
                    return;
                }

                var charNode = buildTitleFaces(charValue);
                charNode.style.setProperty('--char-index', String(charIndex));
                fragment.appendChild(charNode);
                charIndex += 1;
            });

            title.textContent = '';
            title.appendChild(fragment);

            // Trigger after layout is ready to avoid abrupt initial jump.
            window.requestAnimationFrame(function () {
                title.classList.add('hero-title-3d--animate');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        revealHeroes();
        initSharedHeroTitle3D();
    });
})();
