(() => {
  "use strict";

  const slider = document.querySelector("[data-methodology-slider]");
  const section = document.getElementById("methodology");
  if (!slider || !section) return;

  const viewport = slider.querySelector(".methodology-slider__viewport");
  const stepRail = section.querySelector(".methodology-steps");
  const slides = [...slider.querySelectorAll("[data-methodology-slide]")];
  const dots = [...slider.querySelectorAll("[data-methodology-dot]")];
  const steps = [...section.querySelectorAll(".methodology-step")];
  const backgrounds = [...section.querySelectorAll(".methodology-scene__bg")];

  if (!slides.length) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const interval = 4200;
  const swipeThreshold = 42;

  let current = 0;
  let timer = null;
  let isVisible = true;
  let railFrame = null;
  let railRestartTimer = null;
  let pointerStartX = null;
  let pointerStartY = null;

  const reducedMotion = () => reducedMotionQuery.matches;
  const isMobile = () => mobileQuery.matches;

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const restartLater = () => {
    window.clearTimeout(railRestartTimer);
    railRestartTimer = window.setTimeout(start, 900);
  };

  const scrollStepIntoView = (index) => {
    if (!isMobile() || !stepRail || !steps[index]) return;

    const step = steps[index];
    const maxScroll = Math.max(0, stepRail.scrollWidth - stepRail.clientWidth);
    const target = Math.min(
      maxScroll,
      Math.max(0, step.offsetLeft - stepRail.clientWidth * 0.08)
    );

    stepRail.scrollTo({
      left: target,
      behavior: reducedMotion() ? "auto" : "smooth"
    });
  };

  const show = (index, options = {}) => {
    const {
      syncRail = true,
      restart = false
    } = options;

    const next = (index + slides.length) % slides.length;
    const direction =
      next === current
        ? "next"
        : (
            (next > current && !(current === slides.length - 1 && next === 0)) ||
            (current === 0 && next === slides.length - 1)
          )
          ? "next"
          : "prev";

    current = next;
    slider.dataset.direction = direction;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });

    steps.forEach((step, i) => {
      const active = i === current;
      step.classList.toggle("is-active", active);
      step.setAttribute("aria-current", active ? "step" : "false");
    });

    backgrounds.forEach((background, i) => {
      background.classList.toggle("is-active", i === current);
    });

    if (syncRail) scrollStepIntoView(current);
    if (restart) start();
  };

  const start = () => {
    stop();
    if (reducedMotion() || !isVisible) return;
    timer = window.setInterval(() => show(current + 1), interval);
  };

  const nearestStepIndex = () => {
    if (!stepRail || !steps.length) return current;

    const railLeft = stepRail.getBoundingClientRect().left;
    const probe = railLeft + Math.min(stepRail.clientWidth * 0.22, 76);

    let nearest = current;
    let nearestDistance = Infinity;

    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const distance = Math.abs(rect.left - probe);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    return nearest;
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index, { syncRail: true });
      start();
    });
  });

  steps.forEach((step, index) => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");

    const activate = () => {
      show(index, { syncRail: true });
      start();
    };

    step.addEventListener("click", activate);
    step.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  });

  if (stepRail) {
    stepRail.addEventListener(
      "scroll",
      () => {
        if (!isMobile()) return;

        stop();
        if (railFrame) window.cancelAnimationFrame(railFrame);

        railFrame = window.requestAnimationFrame(() => {
          const index = nearestStepIndex();
          if (index !== current) {
            show(index, { syncRail: false });
          }
        });

        restartLater();
      },
      { passive: true }
    );

    stepRail.addEventListener("pointerdown", stop, { passive: true });
    stepRail.addEventListener("touchstart", stop, { passive: true });
  }

  if (viewport) {
    viewport.style.touchAction = "pan-y";

    viewport.addEventListener("pointerdown", (event) => {
      if (!isMobile()) return;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      stop();
      viewport.classList.add("is-dragging");
    });

    viewport.addEventListener("pointerup", (event) => {
      if (!isMobile() || pointerStartX === null || pointerStartY === null) return;

      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;

      viewport.classList.remove("is-dragging");

      if (
        Math.abs(deltaX) >= swipeThreshold &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        show(deltaX < 0 ? current + 1 : current - 1, { syncRail: true });
      }

      pointerStartX = null;
      pointerStartY = null;
      start();
    });

    viewport.addEventListener("pointercancel", () => {
      pointerStartX = null;
      pointerStartY = null;
      viewport.classList.remove("is-dragging");
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
    show(current, { syncRail: isMobile() });
  });

  reducedMotionQuery.addEventListener?.("change", () => {
    if (reducedMotion()) stop();
    else start();
  });

  show(0, { syncRail: false });
  start();
})();
