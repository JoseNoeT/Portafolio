// contact.js
// Smooth scroll behavior for the contact page hero CTA.
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var scrollBtn = document.getElementById("contact-scroll-btn");
    var target = document.getElementById("contact-section");

    if (!scrollBtn || !target) return;

    scrollBtn.addEventListener("click", function (event) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
