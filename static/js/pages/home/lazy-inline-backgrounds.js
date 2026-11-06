export function initLazyInlineBackgrounds() {
  const nodes = [...document.querySelectorAll("[data-bg-src]")];
  if (!nodes.length) return;

  const load = (node) => {
    const src = node.dataset.bgSrc;
    if (!src || node.dataset.bgLoaded === "true") return;
    node.style.backgroundImage = `url("${src}")`;
    node.dataset.bgLoaded = "true";
  };

  const sections = [...new Set(nodes.map((node) => node.closest("section")).filter(Boolean))];
  if (!("IntersectionObserver" in window)) {
    nodes.forEach(load);
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll("[data-bg-src]").forEach(load);
      currentObserver.unobserve(entry.target);
    });
  }, { rootMargin: "500px 0px", threshold: 0.01 });

  sections.forEach((section) => observer.observe(section));
}
