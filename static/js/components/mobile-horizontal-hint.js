(() => {
  "use strict";

  const media = window.matchMedia("(max-width: 768px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!media.matches) return;

  const rails = [
    document.querySelector("#services .feature-grid"),
    document.querySelector("#about .profile-v2__grid")
  ].filter(Boolean);

  if (!rails.length) return;

  rails.forEach((rail) => {
    rail.classList.add("mobile-horizontal-hint");

    let hasHinted = false;
    let cancelled = false;
    let hintTimer = null;
    let returnTimer = null;

    const cancelHint = () => {
      cancelled = true;
      window.clearTimeout(hintTimer);
      window.clearTimeout(returnTimer);
      rail.classList.remove("is-hint-visible");
      rail.classList.add("is-hint-done");
    };

    ["touchstart", "pointerdown", "wheel", "keydown"].forEach((eventName) => {
      rail.addEventListener(eventName, cancelHint, { once: true, passive: eventName !== "keydown" });
    });

    const runHint = () => {
      if (hasHinted || cancelled) return;
      hasHinted = true;

      rail.classList.add("is-hint-visible");

      if (reduced.matches || rail.scrollWidth <= rail.clientWidth + 8) {
        hintTimer = window.setTimeout(() => {
          rail.classList.remove("is-hint-visible");
          rail.classList.add("is-hint-done");
        }, 1400);
        return;
      }

      const maxScroll = rail.scrollWidth - rail.clientWidth;
      const nudge = Math.min(42, Math.max(24, rail.clientWidth * 0.11), maxScroll);

      hintTimer = window.setTimeout(() => {
        if (cancelled) return;
        rail.scrollTo({ left: nudge, behavior: "smooth" });

        returnTimer = window.setTimeout(() => {
          if (cancelled) return;
          rail.scrollTo({ left: 0, behavior: "smooth" });
          rail.classList.remove("is-hint-visible");

          window.setTimeout(() => {
            rail.classList.add("is-hint-done");
          }, 320);
        }, 620);
      }, 260);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry], currentObserver) => {
          if (!entry.isIntersecting) return;
          runHint();
          currentObserver.unobserve(rail);
        },
        {
          threshold: 0.4,
          rootMargin: "0px 0px -8% 0px"
        }
      );
      observer.observe(rail);
    } else {
      runHint();
    }
  });
})();
