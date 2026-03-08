// Hero System Animation - Reusable

document.addEventListener('DOMContentLoaded', function() {
    var heroes = document.querySelectorAll('.hero');
    heroes.forEach(function(hero) {
        hero.classList.add('hero-visible');
    });
});
