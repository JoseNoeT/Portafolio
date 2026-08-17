(function (global) {
  "use strict";

  const AppAnimations = global.AppAnimations || {};

  if (!AppAnimations.onReady) {
    return;
  }

  AppAnimations.onReady(() => {
    const exploreBtn = document.getElementById("btn-explore");
    const controls = document.getElementById("projects-controls");

    const pills = Array.from(
      document.querySelectorAll(".filter-pill")
    );

    const cards = Array.from(
      document.querySelectorAll(".project-card")
    );

    const grid = document.getElementById("projects-grid");

    const viewport = document.querySelector(
      "[data-carousel-viewport]"
    );

    const track = document.querySelector(
      "[data-carousel-track]"
    );

    const prevButton = document.querySelector(
      "[data-carousel-prev]"
    );

    const nextButton = document.querySelector(
      "[data-carousel-next]"
    );

    const status = document.querySelector(
      "[data-carousel-status]"
    );


    /* ======================================================
       Navegaci?n hacia proyectos
       ====================================================== */

    if (
      exploreBtn &&
      controls &&
      AppAnimations.smoothScrollTo
    ) {
      exploreBtn.addEventListener("click", () => {
        AppAnimations.smoothScrollTo(
          controls,
          {
            behavior: "smooth",
            block: "start",
          }
        );
      });
    }


    /* ======================================================
       Filtros
       ====================================================== */

    function matchesFilter(card, filterKey) {
      const tags = (
        card.getAttribute("data-tags") || ""
      ).toLowerCase();

      const category = (
        card.getAttribute("data-category") || ""
      ).toLowerCase();

      if (filterKey === "all") {
        return true;
      }

      if (filterKey === "backend") {
        return (
          tags.includes("django") ||
          tags.includes("python") ||
          tags.includes("api")
        );
      }

      if (filterKey === "fullstack") {
        return (
          tags.includes("react") ||
          tags.includes("react native") ||
          tags.includes("ionic")
        );
      }

      if (filterKey === "django") {
        return tags.includes("django");
      }

      if (filterKey === "experimental") {
        return (
          category === "engineering" ||
          tags.includes("bot") ||
          tags.includes("trading")
        );
      }

      return true;
    }


    function visibleCards() {
      return cards.filter(
        (card) => card.style.display !== "none"
      );
    }


    function applyFilter(filterKey) {

      cards.forEach((card) => {
        const visible = matchesFilter(
          card,
          filterKey
        );

        card.style.display = visible
          ? ""
          : "none";
      });

      if (viewport) {
        viewport.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }

      window.requestAnimationFrame(
        updateCarousel
      );
    }


    pills.forEach((pill) => {
      pill.addEventListener("click", () => {

        pills.forEach((item) => {
          item.classList.remove("is-active");
        });

        pill.classList.add("is-active");

        applyFilter(
          (
            pill.dataset.filter || "all"
          ).toLowerCase()
        );
      });
    });


    /* ======================================================
       Carrusel
       ====================================================== */

    if (
      !viewport ||
      !track ||
      !prevButton ||
      !nextButton
    ) {
      return;
    }


    function cardStep() {
      const visible = visibleCards();

      if (!visible.length) {
        return viewport.clientWidth;
      }

      const card = visible[0];

      const style = window.getComputedStyle(
        track
      );

      const gap = parseFloat(
        style.columnGap || style.gap || "0"
      );

      return card.getBoundingClientRect().width
        + gap;
    }


    function currentIndex() {
      const visible = visibleCards();

      if (!visible.length) {
        return 0;
      }

      const step = cardStep();

      if (!step) {
        return 0;
      }

      return Math.min(
        visible.length - 1,
        Math.max(
          0,
          Math.round(
            viewport.scrollLeft / step
          )
        )
      );
    }


    function updateCarousel() {
      const visible = visibleCards();

      if (!visible.length) {
        prevButton.disabled = true;
        nextButton.disabled = true;

        if (status) {
          status.textContent =
            "Sin proyectos";
        }

        return;
      }

      const maxScroll =
        viewport.scrollWidth -
        viewport.clientWidth;

      prevButton.disabled =
        viewport.scrollLeft <= 4;

      nextButton.disabled =
        viewport.scrollLeft >=
        maxScroll - 4;

      if (status) {
        status.textContent =
          `${currentIndex() + 1} / ${visible.length}`;
      }
    }


    function move(direction) {
      viewport.scrollBy({
        left: cardStep() * direction,
        behavior: "smooth",
      });
    }


    prevButton.addEventListener(
      "click",
      () => move(-1)
    );

    nextButton.addEventListener(
      "click",
      () => move(1)
    );


    /* ======================================================
       Drag con mouse
       ====================================================== */

    let dragging = false;
    let startX = 0;
    let startScroll = 0;


    viewport.addEventListener(
      "pointerdown",
      (event) => {

        if (event.pointerType === "touch") {
          return;
        }

        dragging = true;

        startX = event.clientX;
        startScroll = viewport.scrollLeft;

        viewport.classList.add(
          "is-dragging"
        );

        viewport.setPointerCapture(
          event.pointerId
        );
      }
    );


    viewport.addEventListener(
      "pointermove",
      (event) => {

        if (!dragging) {
          return;
        }

        const distance =
          event.clientX - startX;

        viewport.scrollLeft =
          startScroll - distance;
      }
    );


    function stopDragging(event) {

      if (!dragging) {
        return;
      }

      dragging = false;

      viewport.classList.remove(
        "is-dragging"
      );

      if (
        event &&
        viewport.hasPointerCapture(
          event.pointerId
        )
      ) {
        viewport.releasePointerCapture(
          event.pointerId
        );
      }

      updateCarousel();
    }


    viewport.addEventListener(
      "pointerup",
      stopDragging
    );

    viewport.addEventListener(
      "pointercancel",
      stopDragging
    );


    /* ======================================================
       Actualizaci?n de estado
       ====================================================== */

    let scrollTimer = null;

    viewport.addEventListener(
      "scroll",
      () => {

        window.clearTimeout(
          scrollTimer
        );

        scrollTimer = window.setTimeout(
          updateCarousel,
          80
        );
      },
      { passive: true }
    );


    window.addEventListener(
      "resize",
      updateCarousel
    );


    /* ======================================================
       Autoplay
       ====================================================== */

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    let autoplay = null;


    function stopAutoplay() {

      if (!autoplay) {
        return;
      }

      window.clearInterval(
        autoplay
      );

      autoplay = null;
    }


    function startAutoplay() {

      if (
        reducedMotion ||
        visibleCards().length <= 1
      ) {
        return;
      }

      stopAutoplay();

      autoplay = window.setInterval(
        () => {

          const maxScroll =
            viewport.scrollWidth -
            viewport.clientWidth;

          if (
            viewport.scrollLeft >=
            maxScroll - 5
          ) {
            viewport.scrollTo({
              left: 0,
              behavior: "smooth",
            });

            return;
          }

          move(1);

        },
        5500
      );
    }


    viewport.addEventListener(
      "mouseenter",
      stopAutoplay
    );

    viewport.addEventListener(
      "mouseleave",
      startAutoplay
    );

    viewport.addEventListener(
      "pointerdown",
      stopAutoplay
    );

    viewport.addEventListener(
      "focusin",
      stopAutoplay
    );


    updateCarousel();
    startAutoplay();
  });
})(window);
