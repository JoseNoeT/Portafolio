const P5_URL = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js";

function loadP5() {
  if (window.p5) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("p5-runtime");
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "p5-runtime";
    script.src = P5_URL;
    script.async = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

export function initHomeHeroParticles() {
  const api = window.AppAnimations || {};
  if (!api.onReady || !api.initHeroParticles) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  api.onReady(() => {
    const start = async () => {
      if (!document.querySelector(".hero-canvas")) return;
      try {
        await loadP5();
        api.initHeroParticles(".hero-canvas", {
          tickSpeed: 8,
          baseHue: 180,
          numPoints: 8,
          maxTicks: 2200,
          strokeWeight: 1.35,
          lineAlpha: 0.01,
        });
      } catch (_) {
        document.documentElement.classList.add("hero-particles-unavailable");
      }
    };

    if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 1800 });
    else setTimeout(start, 500);
  });
}
