// home.js
// Reveal-on-scroll utility for .reveal elements
// Adds .active when element is close to viewport

function revealOnScroll() {
    const elements = document.querySelectorAll(".reveal");

    elements.forEach((el) => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < windowHeight - 120) {
            el.classList.add("active");
        }
    });
}

// Run on load and on scroll
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("resize", revealOnScroll);
window.addEventListener("DOMContentLoaded", revealOnScroll);
