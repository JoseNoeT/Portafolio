export function bindProjectDrag(viewport, update, stopAutoplay) {
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener("pointerdown", (event) => {
    stopAutoplay();
    if (event.pointerType === "touch") return;
    dragging = true;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    viewport.scrollLeft = startScroll - (event.clientX - startX);
  });

  const stop = (event) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    if (event && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    update();
  };

  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);
}
