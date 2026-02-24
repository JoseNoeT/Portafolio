// static/js/navbar.js
// Lightweight toggle for mobile navbar
document.addEventListener('DOMContentLoaded', function () {
  var menuToggle = document.getElementById('mobile-menu');
  var navLinks = document.querySelector('.nav-links');
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', function () {
    var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('nav-open');
  });

  // Close the menu when a link is clicked (mobile)
  var links = navLinks.querySelectorAll('a');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinks.classList.contains('active')) {
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  });
});
