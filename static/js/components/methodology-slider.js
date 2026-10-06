(() => {
  const slider = document.querySelector("[data-methodology-slider]");
  const section = document.getElementById("methodology");
  if (!slider || !section) return;

  const slides = [...slider.querySelectorAll("[data-methodology-slide]")];
  const dots = [...slider.querySelectorAll("[data-methodology-dot]")];
  const steps = [...section.querySelectorAll(".methodology-step")];
  const backgrounds = [...section.querySelectorAll(".methodology-scene__bg")];

  if (!slides.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const interval = 4200;

  let current = 0;
  let timer = null;
  let isVisible = true;

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === current);
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });

    steps.forEach((step, i) => {
      step.classList.toggle("is-active", i === current);
    });

    backgrounds.forEach((background, i) => {
      background.classList.toggle("is-active", i === current);
    });
  };

  const start = () => {
    stop();
    if (reducedMotion || !isVisible) return;
    timer = window.setInterval(() => show(current + 1), interval);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      start();
    });
  });

  steps.forEach((step, index) => {
    step.addEventListener("click", () => {
      show(index);
      start();
    });
  });

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

  show(0);
  start();
})();
