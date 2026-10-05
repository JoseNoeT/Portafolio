document.addEventListener("DOMContentLoaded", function () {

    const slider = document.querySelector(".portfolio-swiper");

    if (!slider || typeof Swiper === "undefined") {
        return;
    }

    const swiper = new Swiper(".portfolio-swiper", {

        slidesPerView: "auto",

        centeredSlides: true,

        spaceBetween: 24,

        loop: true,

        speed: 900,

        grabCursor: true,

        watchSlidesProgress: true,

        direction: "vertical",

        effect: "coverflow",

        coverflowEffect: {
            rotate: 8,
            stretch: 20,
            depth: 190,
            modifier: 1.1,
            scale: 0.91,
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

    const cards = slider.querySelectorAll(".panorama-card");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (canHover && !reducedMotion) {
        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const slide = card.closest(".swiper-slide");

                if (!slide || !slide.classList.contains("swiper-slide-active")) {
                    return;
                }

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const xRatio = x / rect.width - 0.5;
                const yRatio = y / rect.height - 0.5;

                card.style.setProperty("--glare-x", `${(x / rect.width) * 100}%`);
                card.style.setProperty("--glare-y", `${(y / rect.height) * 100}%`);
                card.style.transform =
                    `perspective(900px) rotateX(${(-yRatio * 6).toFixed(2)}deg) rotateY(${(xRatio * 8).toFixed(2)}deg) translateZ(8px)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.removeProperty("--glare-x");
                card.style.removeProperty("--glare-y");
                card.style.transform = "";
            });
        });
    }

    swiper.on("slideChangeTransitionStart", () => {
        cards.forEach((card) => {
            card.style.transform = "";
            card.style.removeProperty("--glare-x");
            card.style.removeProperty("--glare-y");
        });
    });

});