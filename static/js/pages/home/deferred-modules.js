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

function loadStyle(href, id) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
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
  observeOnce("#projects", async () => {
    loadStyle("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css", "swiper-css");
    await loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js", "swiper-js");
    await import("../../components/project-carousel.js");
  });

  observeOnce("#methodology", () => import("../../components/methodology-slider.js"));
  observeOnce("#services", () => import("../../components/mobile-horizontal-hint.js"));
}
