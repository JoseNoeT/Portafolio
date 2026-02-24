/**
 * Professional Mobile Navigation System
 * Features: Side drawer, overlay management, scroll blocking, accessibility
 * No external dependencies - Pure vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
  // ===== DOM Elements =====
  const menuToggle = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinksAnchors = navLinks ? navLinks.querySelectorAll('a') : [];
  
  // Exit early if elements don't exist
  if (!menuToggle || !navLinks || !navOverlay) {
    console.warn('Navigation elements not found. Mobile menu will not work.');
    return;
  }

  // ===== Utility Functions =====
  
  /**
   * Toggle mobile menu (open/close)
   */
  function toggleMenu() {
    const isOpen = navLinks.classList.contains('active');
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /**
   * Open mobile menu with overlay
   */
  function openMenu() {
    // Apply classes
    menuToggle.classList.add('open');
    navLinks.classList.add('active');
    navOverlay.classList.add('active');
    
    // Block body scroll
    document.body.classList.add('nav-open');
    
    // Update ARIA
    menuToggle.setAttribute('aria-expanded', 'true');
    navOverlay.setAttribute('aria-hidden', 'false');
  }

  /**
   * Close mobile menu with overlay
   */
  function closeMenu() {
    // Remove classes
    menuToggle.classList.remove('open');
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    
    // Allow body scroll
    document.body.classList.remove('nav-open');
    
    // Update ARIA
    menuToggle.setAttribute('aria-expanded', 'false');
    navOverlay.setAttribute('aria-hidden', 'true');
  }

  // ===== Event Listeners =====
  
  /**
   * Toggle button click handler
   */
  menuToggle.addEventListener('click', toggleMenu);

  /**
   * Overlay click handler - close menu when clicking overlay
   */
  navOverlay.addEventListener('click', closeMenu);

  /**
   * Navigation links click handler - close menu when link is clicked
   */
  navLinksAnchors.forEach(function (link) {
    link.addEventListener('click', function () {
      // Only close if menu is actually open
      if (navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  });

  /**
   * Keyboard support - Escape key to close menu
   */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
      // Return focus to menu toggle for accessibility
      menuToggle.focus();
    }
  });

  /**
   * Window resize handler - close menu on large screens
   * Prevents stuck menu when resizing from mobile to desktop
   */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });

  // ===== Initial ARIA Setup =====
  menuToggle.setAttribute('aria-expanded', 'false');
  navOverlay.setAttribute('aria-hidden', 'true');
});

