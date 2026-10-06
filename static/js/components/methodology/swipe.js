const THRESHOLD = 42;

function isHorizontalSwipe(startX, startY, event) {
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  return Math.abs(dx) >= THRESHOLD && Math.abs(dx) > Math.abs(dy) ? dx : 0;
}

export function bindStorySwipe(dom, media, state, show, autoplay) {
  if (!dom.storyTrack || !dom.story) return;

  let startX = null;
  let startY = null;
  dom.storyTrack.style.touchAction = "pan-y";

  dom.storyTrack.addEventListener("pointerdown", (event) => {
    if (!media.mobileQuery.matches) return;
    startX = event.clientX;
    startY = event.clientY;
    autoplay.stop();
    dom.story.classList.add("is-dragging");
    try { dom.storyTrack.setPointerCapture?.(event.pointerId); } catch (_) {}
  });

  dom.storyTrack.addEventListener("pointerup", (event) => {
    if (startX === null || startY === null) return;
    const dx = isHorizontalSwipe(startX, startY, event);
    dom.story.classList.remove("is-dragging");
    if (dx) show(dx < 0 ? state.current + 1 : state.current - 1);
    startX = startY = null;
    autoplay.start();
  });

  dom.storyTrack.addEventListener("pointercancel", () => {
    startX = startY = null;
    dom.story.classList.remove("is-dragging");
    autoplay.start();
  });
}

export function bindDesktopSwipe(dom, media, state, show, autoplay) {
  if (!dom.desktopViewport) return;
  let startX = null;
  let startY = null;

  dom.desktopViewport.addEventListener("pointerdown", (event) => {
    if (media.mobileQuery.matches) return;
    startX = event.clientX;
    startY = event.clientY;
    autoplay.stop();
  });

  dom.desktopViewport.addEventListener("pointerup", (event) => {
    if (startX === null || startY === null) return;
    const dx = isHorizontalSwipe(startX, startY, event);
    if (dx) show(dx < 0 ? state.current + 1 : state.current - 1);
    startX = startY = null;
    autoplay.start();
  });

  dom.desktopViewport.addEventListener("pointercancel", () => {
    startX = startY = null;
    autoplay.start();
  });
}
