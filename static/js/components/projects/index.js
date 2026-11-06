import { getCarouselConfig } from "./config.js?v=3";
import { bindCarouselLifecycle } from "../carousel-lifecycle.js";
import { bindProjectTilt } from "./tilt.js";

export function initProjectCarousel() {
  const slider = document.querySelector(".portfolio-swiper");
  if (!slider || slider.swiper || typeof window.Swiper === "undefined") return;

  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swiper = new window.Swiper(
    ".portfolio-swiper",
    getCarouselConfig(isMobile, reducedMotion)
  );

  bindProjectTilt(slider, swiper, reducedMotion);
  bindCarouselLifecycle(swiper, slider.closest("section"));
}
