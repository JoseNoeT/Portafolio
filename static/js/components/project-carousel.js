import { initProjectCarousel } from "./projects/index.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectCarousel, { once: true });
} else {
  initProjectCarousel();
}
