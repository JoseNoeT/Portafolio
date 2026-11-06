const grid = document.querySelector("[data-catalog-grid]");
if (grid) {
  const cards = [...grid.querySelectorAll("[data-catalog-card]")];
  const filters = [...document.querySelectorAll("[data-category-filter]")];
  const technology = document.getElementById("catalog-technology");
  const count = document.querySelector("[data-catalog-count]");
  const empty = document.querySelector("[data-catalog-empty]");
  const position = document.querySelector("[data-catalog-position]");
  const previous = document.querySelector("[data-catalog-prev]");
  const next = document.querySelector("[data-catalog-next]");
  const clear = document.querySelector(".catalog-toolbar [data-catalog-reset]");
  const hint = document.querySelector(".catalog-swipe-hint");
  const mobile = matchMedia("(max-width: 768px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let category = "all";
  const visibleCards = () => cards.filter((card) => !card.hidden);
  function currentIndex() {
    const visible = visibleCards();
    if (!visible.length) return 0;
    const step = visible[0].offsetWidth + 16;
    return Math.min(visible.length - 1, Math.round(grid.scrollLeft / step));
  }
  function updateNavigation() {
    const visible = visibleCards();
    previous.disabled = grid.scrollLeft <= 2 || visible.length === 0;
    next.disabled = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 2 || visible.length === 0;
    position.textContent = visible.length ? `${currentIndex() + 1} / ${visible.length}` : "";
    document.querySelector(".catalog-navigation").hidden = visible.length < 2;
    hint.hidden = visible.length < 2;
  }
  function applyFilters() {
    cards.forEach((card) => {
      const tags = card.dataset.technologies.split("|").map((tag) => tag.trim());
      card.hidden = (category !== "all" && card.dataset.category !== category) ||
        (technology.value !== "all" && !tags.includes(technology.value));
    });
    const total = visibleCards().length;
    count.textContent = `${total} ${total === 1 ? "proyecto" : "proyectos"}`;
    empty.hidden = total > 0;
    grid.hidden = total === 0;
    clear.hidden = category === "all" && technology.value === "all";
    filters.forEach((filter) => {
      const active = filter.dataset.categoryFilter === category;
      filter.classList.toggle("is-active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    grid.scrollLeft = 0;
    requestAnimationFrame(updateNavigation);
  }
  filters.forEach((filter) => filter.addEventListener("click", () => {
    category = filter.dataset.categoryFilter;
    applyFilters();
  }));
  technology.addEventListener("change", applyFilters);
  document.querySelectorAll("[data-catalog-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      category = "all";
      technology.value = "all";
      applyFilters();
    });
  });
  function move(direction) {
    const card = visibleCards()[0];
    if (!card || !mobile.matches) return;
    grid.scrollBy({ left: (card.offsetWidth + 16) * direction,
      behavior: reduced.matches ? "auto" : "smooth" });
  }
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  let frame = null;
  grid.addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { updateNavigation(); frame = null; });
  }, { passive: true });
  window.addEventListener("resize", updateNavigation);
  applyFilters();
}
