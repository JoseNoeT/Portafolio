function observeOnce(selector, callback, rootMargin = "450px 0px") {
  const target = document.querySelector(selector);
  if (!target) return;
  if (!("IntersectionObserver" in window)) return void callback();

  const observer = new IntersectionObserver(([entry], currentObserver) => {
    if (!entry.isIntersecting) return;
    currentObserver.unobserve(target);
    callback();
  }, { rootMargin, threshold: 0.01 });
  observer.observe(target);
}

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) return existing.dataset.loaded === "true"
      ? resolve()
      : existing.addEventListener("load", resolve, { once: true });

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

export function initDeferredHomeModules() {
  let mobileSections = null;
  const startMobileSections = () => mobileSections ??= (async () => {
    await loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js", "swiper-js");
    const { initMobileSectionCarousels } = await import("../../components/mobile-section-carousels.js?v=1");
    initMobileSectionCarousels();
  })();
  observeOnce("#projects", async () => {
    // CSS is render-blocking in the template, before the custom card styles.
    // Keep only the JavaScript deferred until the section approaches the viewport.
    await loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js", "swiper-js");
    await import("../../components/project-carousel.js?v=3");
  });

  observeOnce("#methodology", async () => {
    await startMobileSections();
    await import("../../components/methodology-slider.js?v=3");
  });
  observeOnce("#services", startMobileSections);
}
