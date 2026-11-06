import { sanitizeFragment } from "./sanitize.js";

export function createProjectModal(dialog, inner) {
  let trigger = null;
  const cache = new Map();

  function renderLoading() {
    const loading = document.createElement("div");
    loading.className = "pm-loading";
    loading.setAttribute("aria-label", "Cargando");
    const spinner = document.createElement("span");
    spinner.className = "pm-spinner";
    loading.appendChild(spinner);
    inner.replaceChildren(loading);
  }

  function close() {
    dialog.close();
    document.body.style.overflow = "";
    trigger?.focus();
    trigger = null;
  }

  function inject(html) {
    inner.replaceChildren(sanitizeFragment(html));
    inner.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", close);
    });
    const title = inner.querySelector(".pm-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus();
    }
  }

  async function open(url) {
    dialog.dataset.theme = document.documentElement.getAttribute("data-theme") || "dark";
    renderLoading();
    dialog.showModal();
    document.body.style.overflow = "hidden";

    if (cache.has(url)) {
      inject(cache.get(url));
      return;
    }

    try {
      const response = await fetch(url, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (!response.ok) throw new Error(String(response.status));
      const html = await response.text();
      cache.set(url, html);
      inject(html);
    } catch (_) {
      const fallback = trigger?.href;
      close();
      if (fallback) window.location.href = fallback;
    }
  }

  return {
    close,
    openFrom(link) {
      trigger = link;
      open(link.getAttribute("data-modal-url"));
    },
  };
}
