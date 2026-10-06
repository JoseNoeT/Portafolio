(() => {
  "use strict";

  const section = document.getElementById("methodology");
  const slider = document.querySelector("[data-methodology-slider]");
  const story = document.querySelector("[data-methodology-story]");

  if (!section || !slider) return;

  const desktopViewport = slider.querySelector(".methodology-slider__viewport");
  const desktopSlides = [...slider.querySelectorAll("[data-methodology-slide]")];
  const desktopDots = [...slider.querySelectorAll("[data-methodology-dot]")];
  const desktopSteps = [...section.querySelectorAll(".methodology-steps .methodology-step")];

  const storyTrack = story?.querySelector("[data-methodology-story-track]") ?? null;
  const storySlides = story
    ? [...story.querySelectorAll("[data-methodology-story-slide]")]
    : [];
  const storyDots = story
    ? [...story.querySelectorAll("[data-methodology-story-dot]")]
    : [];

  const backgrounds = [...section.querySelectorAll(".methodology-scene__bg")];

  if (!desktopSlides.length) return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const interval = 4200;

  let current = 0;
  let timer = null;
  let isVisible = true;
  let storyScrollFrame = null;
  let storyRestartTimer = null;
  let storySyncTimer = null;
  let isStorySyncing = false;

  const isMobile = () => mobileQuery.matches;
  const reducedMotion = () => reducedMotionQuery.matches;

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const markActive = (items, index, className = "is-active") => {
    items.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle(className, active);
      item.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  const scrollStoryTo = (index) => {
    if (!storyTrack || !storySlides[index] || !isMobile()) return;

    isStorySyncing = true;
    window.clearTimeout(storySyncTimer);

    const slide = storySlides[index];
    const maxScroll = Math.max(0, storyTrack.scrollWidth - storyTrack.clientWidth);
    const target = Math.min(maxScroll, Math.max(0, slide.offsetLeft - 4));

    storyTrack.scrollTo({
      left: target,
      behavior: reducedMotion() ? "auto" : "smooth"
    });

    storySyncTimer = window.setTimeout(() => {
      isStorySyncing = false;
    }, reducedMotion() ? 40 : 720);
  };

  const show = (index, options = {}) => {
    const { syncStory = true, restart = false } = options;
    const next = (index + desktopSlides.length) % desktopSlides.length;

    const previous = current;
    current = next;

    const wrapsForward = previous === desktopSlides.length - 1 && next === 0;
    const wrapsBackward = previous === 0 && next === desktopSlides.length - 1;
    const direction =
      next === previous
        ? "next"
        : (next > previous && !wrapsBackward) || wrapsForward
          ? "next"
          : "prev";

    slider.dataset.direction = direction;

    desktopSlides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    desktopSteps.forEach((step, i) => {
      const active = i === current;
      step.classList.toggle("is-active", active);
      step.setAttribute("aria-current", active ? "step" : "false");
    });

    markActive(desktopDots, current);
    markActive(storySlides, current);
    markActive(storyDots, current);

    backgrounds.forEach((background, i) => {
      background.classList.toggle("is-active", i === current);
    });

    if (syncStory) scrollStoryTo(current);
    if (restart) start();
  };

  const start = () => {
    stop();
    if (reducedMotion() || !isVisible) return;

    timer = window.setInterval(() => {
      show(current + 1, { syncStory: isMobile() });
    }, interval);
  };

  const nearestStoryIndex = () => {
    if (!storyTrack || !storySlides.length) return current;

    const trackRect = storyTrack.getBoundingClientRect();
    const probe = trackRect.left + Math.min(storyTrack.clientWidth * 0.16, 58);

    let nearest = current;
    let distance = Infinity;

    storySlides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const currentDistance = Math.abs(slideRect.left - probe);

      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = index;
      }
    });

    return nearest;
  };

  desktopDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index, { syncStory: false });
      start();
    });
  });

  desktopSteps.forEach((step, index) => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");

    const activate = () => {
      show(index, { syncStory: false });
      start();
    };

    step.addEventListener("click", activate);
    step.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  });

  storyDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index, { syncStory: true });
      start();
    });
  });

  if (storyTrack) {
    const userTakesControl = () => {
      isStorySyncing = false;
      window.clearTimeout(storySyncTimer);
      stop();
    };

    storyTrack.addEventListener("pointerdown", userTakesControl, { passive: true });
    storyTrack.addEventListener("touchstart", userTakesControl, { passive: true });

    storyTrack.addEventListener(
      "scroll",
      () => {
        if (!isMobile() || isStorySyncing) return;

        stop();

        if (storyScrollFrame) {
          window.cancelAnimationFrame(storyScrollFrame);
        }

        storyScrollFrame = window.requestAnimationFrame(() => {
          const index = nearestStoryIndex();
          if (index !== current) {
            show(index, { syncStory: false });
          }
        });

        window.clearTimeout(storyRestartTimer);
        storyRestartTimer = window.setTimeout(start, 1100);
      },
      { passive: true }
    );
  }

  if (desktopViewport) {
    let startX = null;
    let startY = null;

    desktopViewport.addEventListener("pointerdown", (event) => {
      if (isMobile()) return;
      startX = event.clientX;
      startY = event.clientY;
      stop();
    });

    desktopViewport.addEventListener("pointerup", (event) => {
      if (isMobile() || startX === null || startY === null) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (Math.abs(deltaX) >= 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
        show(deltaX < 0 ? current + 1 : current - 1, { syncStory: false });
      }

      startX = null;
      startY = null;
      start();
    });

    desktopViewport.addEventListener("pointercancel", () => {
      startX = null;
      startY = null;
      start();
    });
  }

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", start);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  mobileQuery.addEventListener?.("change", () => {
    show(current, { syncStory: isMobile() });
    start();
  });

  reducedMotionQuery.addEventListener?.("change", () => {
    if (reducedMotion()) stop();
    else start();
  });

  show(0, { syncStory: false });
  start();
})();
