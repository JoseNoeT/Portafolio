import { createProjectAutoplay } from "./autoplay.js";
import { createProjectsCarousel } from "./carousel.js";
import { bindProjectDrag } from "./drag.js";
import { getProjectsDom } from "./dom.js";
import { bindProjectFilters } from "./filter.js";

export function initProjectsPage() {
  const dom = getProjectsDom();
  const api = window.AppAnimations || {};

  if (dom.exploreBtn && dom.controls && api.smoothScrollTo) {
    dom.exploreBtn.addEventListener("click", () => {
      api.smoothScrollTo(dom.controls, { behavior: "smooth", block: "start" });
    });
  }

  if (!dom.ready) return;

  const carousel = createProjectsCarousel(dom);
  const autoplay = createProjectAutoplay(dom.viewport, carousel);

  bindProjectFilters(dom, carousel);
  bindProjectDrag(dom.viewport, carousel.update, autoplay.stop);

  dom.prevButton.addEventListener("click", () => carousel.move(-1));
  dom.nextButton.addEventListener("click", () => carousel.move(1));

  let scrollTimer = null;
  dom.viewport.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(carousel.update, 80);
  }, { passive: true });
  window.addEventListener("resize", carousel.update);

  carousel.update();
  autoplay.start();
}
