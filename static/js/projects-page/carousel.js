export function createProjectsCarousel(dom) {
  const visibleCards = () => dom.cards.filter((card) => card.style.display !== "none");

  function cardStep() {
    const visible = visibleCards();
    if (!visible.length) return dom.viewport.clientWidth;

    const gap = parseFloat(
      getComputedStyle(dom.track).columnGap ||
      getComputedStyle(dom.track).gap ||
      "0"
    );
    return visible[0].getBoundingClientRect().width + gap;
  }

  function currentIndex() {
    const visible = visibleCards();
    if (!visible.length) return 0;
    const step = cardStep();
    if (!step) return 0;
    return Math.min(
      visible.length - 1,
      Math.max(0, Math.round(dom.viewport.scrollLeft / step))
    );
  }

  function update() {
    const visible = visibleCards();
    if (!visible.length) {
      dom.prevButton.disabled = true;
      dom.nextButton.disabled = true;
      if (dom.status) dom.status.textContent = "Sin proyectos";
      return;
    }

    const maxScroll = dom.viewport.scrollWidth - dom.viewport.clientWidth;
    dom.prevButton.disabled = dom.viewport.scrollLeft <= 4;
    dom.nextButton.disabled = dom.viewport.scrollLeft >= maxScroll - 4;
    if (dom.status) dom.status.textContent = `${currentIndex() + 1} / ${visible.length}`;
  }

  function move(direction) {
    dom.viewport.scrollBy({ left: cardStep() * direction, behavior: "smooth" });
  }

  return { visibleCards, update, move };
}
