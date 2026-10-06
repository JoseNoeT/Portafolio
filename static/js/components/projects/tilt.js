function resetCard(card) {
  card.style.transform = "";
  card.style.removeProperty("--glare-x");
  card.style.removeProperty("--glare-y");
}

export function bindProjectTilt(slider, swiper, reducedMotion) {
  const cards = [...slider.querySelectorAll(".panorama-card")];
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover && !reducedMotion) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const slide = card.closest(".swiper-slide");
        if (!slide?.classList.contains("swiper-slide-active")) return;

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
      card.addEventListener("pointerleave", () => resetCard(card));
    });
  }

  swiper.on("slideChangeTransitionStart", () => cards.forEach(resetCard));
}
