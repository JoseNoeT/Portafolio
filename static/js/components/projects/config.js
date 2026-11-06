export function getCarouselConfig(isMobile, reducedMotion) {
  return {
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: isMobile ? 14 : 24,
    loop: true,
    slidesPerGroup: 1,
    loopAddBlankSlides: false,
    speed: isMobile ? 520 : 900,
    grabCursor: !isMobile,
    watchSlidesProgress: true,
    effect: "coverflow",
    coverflowEffect: {
      rotate: isMobile ? 6 : 14,
      stretch: 0,
      depth: isMobile ? 80 : 160,
      modifier: isMobile ? 1 : 1.15,
      scale: isMobile ? 0.88 : 0.93,
      slideShadows: false,
    },
    autoplay: reducedMotion ? false : {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    navigation: {
      nextEl: ".portfolio-swiper .swiper-button-next",
      prevEl: ".portfolio-swiper .swiper-button-prev",
    },
    pagination: {
      el: ".portfolio-swiper .swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    keyboard: { enabled: true },
    breakpoints: {
      0: { slidesPerView: "auto", spaceBetween: 14 },
      700: { slidesPerView: "auto", spaceBetween: 20 },
      901: { slidesPerView: 3, spaceBetween: 20 },
      1100: { slidesPerView: 3, spaceBetween: 28 },
    },
  };
}
