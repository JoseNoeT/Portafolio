(() => {
  const slider = document.querySelector("[data-methodology-slider]");
  if (!slider) return;

  const slides = [...slider.querySelectorAll("[data-methodology-slide]")];
  const dots = [...slider.querySelectorAll("[data-methodology-dot]")];
  const steps = [...document.querySelectorAll("#methodology .methodology-step")];

  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const interval = 4200;

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);

      if (active) {
        const image = slide.querySelector("img");
        if (image && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          image.style.animation = "none";
          void image.offsetWidth;
          image.style.animation = "";
        }
      }
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
    steps.forEach((step, i) => step.classList.toggle("is-active", i === current));

    const section = document.getElementById("methodology");
    const backgrounds = section ? [...section.querySelectorAll(".methodology-scene__bg")] : [];
    backgrounds.forEach((background, i) => {
      const active = i === current;
      background.classList.toggle("is-active", active);

      if (active && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        background.style.animation = "none";
        void background.offsetWidth;
        background.style.animation = "";
      }
    });
  };

  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(timer);
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

  slider.addEventListener("mouseenter", () => window.clearInterval(timer));
  slider.addEventListener("mouseleave", start);

  show(0);
  start();
})();
