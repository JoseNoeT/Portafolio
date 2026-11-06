export function matchesProjectFilter(card, filterKey) {
  const tags = (card.getAttribute("data-tags") || "").toLowerCase();
  const category = (card.getAttribute("data-category") || "").toLowerCase();

  if (filterKey === "all") return true;
  if (filterKey === "backend") {
    return tags.includes("django") || tags.includes("python") || tags.includes("api");
  }
  if (filterKey === "fullstack") {
    return tags.includes("react") || tags.includes("react native") || tags.includes("ionic");
  }
  if (filterKey === "django") return tags.includes("django");
  if (filterKey === "experimental") {
    return category === "engineering" || tags.includes("bot") || tags.includes("trading");
  }
  return true;
}

export function bindProjectFilters(dom, carousel) {
  dom.pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      dom.pills.forEach((item) => item.classList.remove("is-active"));
      pill.classList.add("is-active");
      const key = (pill.dataset.filter || "all").toLowerCase();

      dom.cards.forEach((card) => {
        card.style.display = matchesProjectFilter(card, key) ? "" : "none";
      });

      dom.viewport?.scrollTo({ left: 0, behavior: "smooth" });
      window.requestAnimationFrame(carousel.update);
    });
  });
}
