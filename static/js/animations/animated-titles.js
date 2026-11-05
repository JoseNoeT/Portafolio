(function (global) {
  "use strict";
  const api = global.AppAnimations || {};

  api.initAnimatedTitles = function initAnimatedTitles(
    selector = "main h1, main h2, .hero h1, .hero h2",
    threshold = 0.1,
    rootMargin = "0px 0px -24px 0px",
    once = true
  ) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)) return;
    const titles = [...document.querySelectorAll(selector)]
      .filter((title) => !title.dataset.wordsPrepared && !title.closest(".hero-page"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("words-visible");
        if (once) observer.unobserve(entry.target);
      });
    }, { threshold, rootMargin });

    titles.forEach((title) => {
      // Replace text nodes only: preserve emphasis, line breaks and whitespace.
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const count = nodes.reduce((sum, node) => sum + (node.textContent.match(/\S+/g) || []).length, 0);
      const step = Math.min(50, 600 / Math.max(1, count - 1));
      let index = 0;
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
          else {
            const word = document.createElement("span");
            word.className = "title-word";
            word.textContent = part;
            word.style.setProperty("--word-delay", `${index++ * step}ms`);
            fragment.append(word);
          }
        });
        node.replaceWith(fragment);
      });
      title.dataset.wordsPrepared = "true";
      title.classList.add("title-reveal");
      observer.observe(title);
    });
  };

  global.AppAnimations = api;
})(window);
