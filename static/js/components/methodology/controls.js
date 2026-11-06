export function bindControls(dom, show, autoplay) {
  dom.desktopDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      autoplay.start();
    });
  });

  dom.desktopSteps.forEach((step, index) => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");

    const activate = () => {
      show(index);
      autoplay.start();
    };

    step.addEventListener("click", activate);
    step.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  });

  dom.storyDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      autoplay.start();
    });
  });
}
