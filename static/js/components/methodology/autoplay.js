export function createAutoplay({ state, show, reducedMotion, interval = 4200 }) {
  let timer = null;
  let visible = true;

  function stop() {
    window.clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (reducedMotion() || !visible) return;
    timer = window.setInterval(() => show(state.current + 1), interval);
  }

  function setVisible(value) {
    visible = value;
    if (visible) start();
    else stop();
  }

  return { start, stop, setVisible };
}
