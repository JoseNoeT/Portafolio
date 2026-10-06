import { createAutoplay } from "./autoplay.js";
import { bindControls } from "./controls.js";
import { getMethodologyDom, getMethodologyMedia } from "./dom.js";
import { bindLifecycle } from "./lifecycle.js";
import { createRenderer } from "./render.js";
import { bindDesktopSwipe, bindStorySwipe } from "./swipe.js";

export function initMethodology() {
  const dom = getMethodologyDom();
  if (!dom) return;

  const media = getMethodologyMedia();
  const state = { current: 0 };
  const { show } = createRenderer(dom, state);
  const autoplay = createAutoplay({
    state,
    show,
    reducedMotion: () => media.reducedMotionQuery.matches,
  });

  bindControls(dom, show, autoplay);
  bindStorySwipe(dom, media, state, show, autoplay);
  bindDesktopSwipe(dom, media, state, show, autoplay);
  bindLifecycle(dom, media, state, show, autoplay);

  show(0);
  autoplay.start();
}
