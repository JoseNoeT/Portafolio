import { bindCarouselLifecycle } from "./carousel-lifecycle.js";

export function initMobileSectionCarousels() {
  const media = matchMedia("(max-width: 768px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const records = [];
  const selectors = ["#services .feature-grid", "#about .profile-v2__grid", "[data-methodology-story]"];
  function mount(el) {
    if (el.swiper) return;
    const story = el.matches("[data-methodology-story]");
    const wrapper = story ? el.querySelector("[data-methodology-story-track]") : document.createElement("div");
    const cards = [...(story ? wrapper : el).children];
    if (!story) {
      cards.forEach((card) => wrapper.appendChild(card));
      el.appendChild(wrapper);
    }
    wrapper.classList.add("swiper-wrapper");
    cards.forEach((card) => { card.classList.add("swiper-slide"); card.removeAttribute("aria-hidden"); });
    el.classList.add("mobile-card-carousel", "swiper");
    const dots = story ? [...el.querySelectorAll("[data-methodology-story-dot]")] : [];
    const swiper = new window.Swiper(el, {
      slidesPerView: 1.12, spaceBetween: 14, loop: true,
      speed: 600, loopAddBlankSlides: false,
      autoplay: reduced.matches ? false : { delay: 4500, disableOnInteraction: false },
      a11y: { enabled: true },
      on: { slideChange(instance) {
        cards.forEach((card) => card.classList.toggle("is-active", card === instance.slides[instance.activeIndex]));
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === instance.realIndex);
          dot.setAttribute("aria-current", String(index === instance.realIndex));
        });
      } },
    });
    bindCarouselLifecycle(swiper, el.closest("section"));
    records.push({ el, swiper, wrapper, cards, story });
  }
  function sync() {
    if (media.matches) selectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) mount(el);
    });
    else records.splice(0).forEach(({ el, swiper, wrapper, cards, story }) => {
      swiper.destroy(true, true);
      el.classList.remove("mobile-card-carousel", "swiper");
      wrapper.classList.remove("swiper-wrapper");
      cards.forEach((card) => card.classList.remove("swiper-slide"));
      if (!story) { cards.forEach((card) => el.appendChild(card)); wrapper.remove(); }
    });
  }
  sync();
  media.addEventListener("change", sync);
}
