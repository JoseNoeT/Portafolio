// home.js
// Reveal-on-scroll utility for .reveal elements using Intersection Observer API

// Mark that JavaScript is enabled
document.documentElement.classList.add('js-enabled');

if ('IntersectionObserver' in window) {
    // Modern browsers: use Intersection Observer
    const revealElements = document.querySelectorAll(".reveal");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Only trigger once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    });
    
    revealElements.forEach((el) => observer.observe(el));
} else {
    // Fallback for older browsers: show immediately on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        const revealElements = document.querySelectorAll(".reveal");
        revealElements.forEach((el) => el.classList.add("active"));
    });
}
