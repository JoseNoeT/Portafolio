export function bindLifecycle(dom, media, state, show, autoplay) {
  for (const surface of [dom.slider, dom.story].filter(Boolean)) {
    surface.addEventListener("mouseenter", autoplay.stop);
    surface.addEventListener("mouseleave", autoplay.start);
    surface.addEventListener("focusin", autoplay.stop);
    surface.addEventListener("focusout", autoplay.start);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => autoplay.setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(dom.section);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) autoplay.stop();
    else autoplay.start();
  });

  media.mobileQuery.addEventListener?.("change", () => {
    show(state.current);
    autoplay.start();
  });

  media.reducedMotionQuery.addEventListener?.("change", () => {
    if (media.reducedMotionQuery.matches) autoplay.stop();
    else autoplay.start();
  });
}
