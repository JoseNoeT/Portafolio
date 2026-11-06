export function getMethodologyDom() {
  const section = document.getElementById("methodology");
  const slider = document.querySelector("[data-methodology-slider]");
  const story = document.querySelector("[data-methodology-story]");
  if (!section || !slider) return null;

  const desktopSlides = [...slider.querySelectorAll("[data-methodology-slide]")];
  if (!desktopSlides.length) return null;

  return {
    section,
    slider,
    story,
    desktopSlides,
    desktopViewport: slider.querySelector(".methodology-slider__viewport"),
    desktopDots: [...slider.querySelectorAll("[data-methodology-dot]")],
    desktopSteps: [...section.querySelectorAll(".methodology-steps .methodology-step")],
    storyTrack: story?.querySelector("[data-methodology-story-track]") ?? null,
    storySlides: story ? [...story.querySelectorAll("[data-methodology-story-slide]")] : [],
    storyDots: story ? [...story.querySelectorAll("[data-methodology-story-dot]")] : [],
    backgrounds: [...section.querySelectorAll(".methodology-scene__bg")],
  };
}

export function getMethodologyMedia() {
  return {
    mobileQuery: window.matchMedia("(max-width: 768px)"),
    reducedMotionQuery: window.matchMedia("(prefers-reduced-motion: reduce)"),
  };
}
