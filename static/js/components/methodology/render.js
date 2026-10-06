function markActive(items, index) {
  items.forEach((item, i) => {
    const active = i === index;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-current", active ? "true" : "false");
  });
}

export function createRenderer(dom, state) {
  function moveMobileStory(index) {
    if (!dom.story || !dom.storyTrack || !dom.storySlides.length) return;
    dom.story.style.setProperty("--methodology-story-offset", `${index * -100}%`);
    dom.story.dataset.index = String(index);

    dom.storySlides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    markActive(dom.storyDots, index);
  }

  function show(index) {
    const count = dom.desktopSlides.length;
    const next = (index + count) % count;
    const previous = state.current;
    state.current = next;

    const wrapsForward = previous === count - 1 && next === 0;
    const wrapsBackward = previous === 0 && next === count - 1;
    dom.slider.dataset.direction =
      next === previous ||
      (next > previous && !wrapsBackward) ||
      wrapsForward ? "next" : "prev";

    dom.desktopSlides.forEach((slide, i) => {
      const active = i === next;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dom.desktopSteps.forEach((step, i) => {
      const active = i === next;
      step.classList.toggle("is-active", active);
      step.setAttribute("aria-current", active ? "step" : "false");
    });

    markActive(dom.desktopDots, next);
    moveMobileStory(next);
    dom.backgrounds.forEach((bg, i) => bg.classList.toggle("is-active", i === next));
  }

  return { show };
}
