import { initProjectCarousel } from "./projects/index.js?v=3";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectCarousel, { once: true });
} else {
  initProjectCarousel();
}
