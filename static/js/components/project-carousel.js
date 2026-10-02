document.addEventListener("DOMContentLoaded", function () {

    const slider = document.querySelector(".portfolio-swiper");

    if (!slider || typeof Swiper === "undefined") {
        return;
    }

    new Swiper(".portfolio-swiper", {

        slidesPerView: "auto",

        centeredSlides: true,

        spaceBetween: 24,

        loop: true,

        speed: 900,

        grabCursor: true,

        watchSlidesProgress: true,

        effect: "coverflow",

        coverflowEffect: {
            rotate: 14,
            stretch: 0,
            depth: 160,
            modifier: 1.15,
            scale: 0.93,
            slideShadows: false
        },

        autoplay: {
            delay: 2600,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        navigation: {
            nextEl: ".portfolio-swiper .swiper-button-next",
            prevEl: ".portfolio-swiper .swiper-button-prev"
        },

        pagination: {
            el: ".portfolio-swiper .swiper-pagination",
            clickable: true,
            dynamicBullets: true
        },

        keyboard: {
            enabled: true
        },

        breakpoints: {

            0: {
                spaceBetween: 14
            },

            700: {
                spaceBetween: 20
            },

            1100: {
                spaceBetween: 28
            }

        }

    });

});