// base.js
// Global navigation logic (mobile menu, overlay, scroll lock)

document.addEventListener('DOMContentLoaded', function () {
    const menuCheckbox = document.getElementById('mobile-menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelector('.nav-links');

    if (!menuCheckbox || !navOverlay || !navLinks) return;

    function openMenu() {
        navOverlay.setAttribute('aria-hidden', 'false');
        navOverlay.classList.add('active');
        navLinks.classList.add('active');
        document.body.classList.add('nav-open');
    }

    function closeMenu() {
        menuCheckbox.checked = false;
        navOverlay.setAttribute('aria-hidden', 'true');
        navOverlay.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    menuCheckbox.addEventListener('change', function () {
        if (this.checked) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    navOverlay.addEventListener('click', closeMenu);

    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });
});