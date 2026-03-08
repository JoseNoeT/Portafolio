(function (global) {
  "use strict";

  const AppAnimations = global.AppAnimations || {};

  if (!AppAnimations.onReady) {
    return;
  }

  AppAnimations.onReady(() => {
    const exploreBtn = document.getElementById("btn-explore");
    const controls = document.getElementById("projects-controls");
    const pills = document.querySelectorAll(".filter-pill");
    const cards = Array.from(document.querySelectorAll(".project-card"));
    const grid = document.getElementById("projects-grid");

    if (exploreBtn && controls && AppAnimations.smoothScrollTo) {
      exploreBtn.addEventListener("click", () => {
        AppAnimations.smoothScrollTo(controls, { behavior: "smooth", block: "start" });
      });
    }

    function matchesFilter(card, filterKey) {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const category = (card.getAttribute("data-category") || "").toLowerCase();

      if (filterKey === "all") return true;
      if (filterKey === "backend") return tags.includes("django") || tags.includes("python") || tags.includes("api");
      if (filterKey === "fullstack") return tags.includes("react") || tags.includes("react native") || tags.includes("ionic");
      if (filterKey === "django") return tags.includes("django");
      if (filterKey === "experimental") return category === "engineering" || tags.includes("bot") || tags.includes("trading");

      return true;
    }

    function applyFilter(filterKey) {
      if (AppAnimations.animateFilterTransition) {
        AppAnimations.animateFilterTransition(grid, cards, (card) => matchesFilter(card, filterKey));
        return;
      }

      cards.forEach((card) => {
        card.style.display = matchesFilter(card, filterKey) ? "" : "none";
      });
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        applyFilter((pill.dataset.filter || "all").toLowerCase());
      });
    });
  });
})(window);