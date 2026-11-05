export function bindCarouselLifecycle(swiper, section) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let touching = false;
  const sync = () => {
    if (swiper.destroyed) return;
    if (visible && !document.hidden && !touching && !reduced.matches) swiper.autoplay?.start();
    else swiper.autoplay?.stop();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: .35 });
  observer.observe(section);
  const down = () => { touching = true; sync(); };
  const up = () => { touching = false; sync(); };
  swiper.el.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  swiper.autoplay?.stop();
  swiper.on("destroy", () => {
    observer.disconnect();
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
    swiper.el?.removeEventListener("pointerdown", down);
  });
}
