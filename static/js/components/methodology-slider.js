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
  const swipeThreshold = 42;

  let current = 0;
  let timer = null;
  let isVisible = true;
  let pointerStartX = null;
  let pointerStartY = null;

  const isMobile = () => mobileQuery.matches;
  const reducedMotion = () => reducedMotionQuery.matches;

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const markActive = (items, index) => {
    items.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  const moveMobileStory = (index) => {
    if (!story || !storyTrack || !storySlides.length) return;

    story.style.setProperty("--methodology-story-offset", `${index * -100}%`);
    story.dataset.index = String(index);

    storySlides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    markActive(storyDots, index);
  };

  const show = (index, options = {}) => {
    const { restart = false } = options;
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
    moveMobileStory(current);

    backgrounds.forEach((background, i) => {
      background.classList.toggle("is-active", i === current);
    });

    if (restart) start();
  };

  const start = () => {
    stop();
    if (reducedMotion() || !isVisible) return;

    timer = window.setInterval(() => {
      show(current + 1);
    }, interval);
  };

  desktopDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      start();
    });
  });

  desktopSteps.forEach((step, index) => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");

    const activate = () => {
      show(index);
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
      show(index);
      start();
    });
  });

  if (storyTrack) {
    storyTrack.style.touchAction = "pan-y";

    storyTrack.addEventListener("pointerdown", (event) => {
      if (!isMobile()) return;

      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      stop();
      story.classList.add("is-dragging");

      if (storyTrack.setPointerCapture && event.pointerId !== undefined) {
        try {
          storyTrack.setPointerCapture(event.pointerId);
        } catch (_) {
          // Some browsers reject capture for synthetic/non-primary pointers.
        }
      }
    });

    storyTrack.addEventListener("pointerup", (event) => {
      if (!isMobile() || pointerStartX === null || pointerStartY === null) return;

      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;

      story.classList.remove("is-dragging");

      if (
        Math.abs(deltaX) >= swipeThreshold &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        show(deltaX < 0 ? current + 1 : current - 1);
      }

      pointerStartX = null;
      pointerStartY = null;
      start();
    });

    storyTrack.addEventListener("pointercancel", () => {
      pointerStartX = null;
      pointerStartY = null;
      story.classList.remove("is-dragging");
      start();
    });
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

      if (Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        show(deltaX < 0 ? current + 1 : current - 1);
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

  if (story) {
    story.addEventListener("mouseenter", stop);
    story.addEventListener("mouseleave", start);
    story.addEventListener("focusin", stop);
    story.addEventListener("focusout", start);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
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
    show(current);
    start();
  });

  reducedMotionQuery.addEventListener?.("change", () => {
    if (reducedMotion()) stop();
    else start();
  });

  show(0);
  start();
})();
