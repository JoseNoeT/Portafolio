export function createProjectAutoplay(viewport, carousel) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function start() {
    if (reducedMotion || carousel.visibleCards().length <= 1) return;
    stop();
    timer = setInterval(() => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      if (viewport.scrollLeft >= maxScroll - 5) {
        viewport.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.move(1);
      }
    }, 5500);
  }

  viewport.addEventListener("mouseenter", stop);
  viewport.addEventListener("mouseleave", start);
  viewport.addEventListener("focusin", stop);

  return { start, stop };
}
