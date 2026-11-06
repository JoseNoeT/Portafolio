export function initLazyBackgrounds() {
  const sections = [...document.querySelectorAll("[data-lazy-bg]")];
  if (!sections.length) return;

  const load = (section) => {
    const src = section.dataset.lazyBg;
    if (!src || section.dataset.bgLoaded === "true") return;
    section.style.setProperty("--section-bg-image", `url("${src}")`);
    section.dataset.bgLoaded = "true";
  };

  if (!("IntersectionObserver" in window)) {
    sections.forEach(load);
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      load(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { rootMargin: "500px 0px", threshold: 0.01 });

  sections.forEach((section) => observer.observe(section));
}
