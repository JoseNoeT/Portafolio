export function getProjectsDom() {
  const viewport = document.querySelector("[data-carousel-viewport]");
  const track = document.querySelector("[data-carousel-track]");
  const prevButton = document.querySelector("[data-carousel-prev]");
  const nextButton = document.querySelector("[data-carousel-next]");

  return {
    exploreBtn: document.getElementById("btn-explore"),
    controls: document.getElementById("projects-controls"),
    pills: [...document.querySelectorAll(".filter-pill")],
    cards: [...document.querySelectorAll(".project-card")],
    grid: document.getElementById("projects-grid"),
    viewport,
    track,
    prevButton,
    nextButton,
    status: document.querySelector("[data-carousel-status]"),
    ready: Boolean(viewport && track && prevButton && nextButton),
  };
}
