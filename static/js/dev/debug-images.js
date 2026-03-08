/**
 * debug-images.js
 * Utilidad de diagnostico visual para entorno de desarrollo.
 */
(function () {
    "use strict";

    console.log("DEBUG IMAGENES - Iniciando", new Date().toLocaleTimeString());

    const images = document.querySelectorAll("img");
    console.log("Total de imagenes en DOM:", images.length);

    images.forEach((img, idx) => {
        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);
        const isVisible = rect.width > 0 && rect.height > 0;

        console.group(`Imagen ${idx + 1}: ${img.alt || "Sin alt"}`);
        console.log("src:", img.src);
        console.log("natural:", `${img.naturalWidth}x${img.naturalHeight}`);
        console.log("visible:", isVisible);
        console.log("display:", computedStyle.display);
        console.log("opacity:", computedStyle.opacity);
        console.log("visibility:", computedStyle.visibility);
        console.log("height:", computedStyle.height);
        console.log("width:", computedStyle.width);
        console.groupEnd();
    });

    const imageCards = document.querySelectorAll(".image-card");
    console.log("Total image-card:", imageCards.length);

    imageCards.forEach((card, idx) => {
        const img = card.querySelector("img");
        const computedStyle = window.getComputedStyle(card);

        console.group(`Card ${idx + 1}`);
        console.log("imagen:", img?.src || "NO TIENE IMAGEN");
        console.log("size:", `${card.offsetWidth}x${card.offsetHeight}`);
        console.log("display:", computedStyle.display);
        console.log("aspect-ratio:", computedStyle.aspectRatio);
        console.groupEnd();
    });

    ["methodology", "about", "services", "featured"].forEach((section) => {
        const elem = document.querySelector(`.${section}`);
        if (!elem) return;

        console.group(section.toUpperCase());
        console.log("display:", window.getComputedStyle(elem).display);
        console.log("images:", elem.querySelectorAll("img").length);
        console.groupEnd();
    });

    const testImg = new Image();
    testImg.onload = function onLoad() {
        console.log("STATIC OK - imagen test cargada.");
    };
    testImg.onerror = function onError() {
        console.error("STATIC ERROR - no se puede acceder a /static/img/.");
    };
    testImg.src = `/static/img/arquitec.jpeg?${Date.now()}`;
})();
