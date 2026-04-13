/**
 * project-modal.js
 * Progressive-enhancement modal for project detail.
 * Falls back to normal link navigation if JS fails.
 */
(function () {
  "use strict";

  var dialog = document.getElementById("project-modal");
  var inner  = document.getElementById("project-modal-content");
  if (!dialog || !inner) return;

  var loadingHTML =
    '<div class="pm-loading" aria-label="Cargando"><span class="pm-spinner"></span></div>';
  var trigger = null; // element that opened the modal, for focus return
  var cache   = {};   // url → html cache

  // ── Open ──────────────────────────────────────

  function open(url) {
    // Sync theme from <html> so ::backdrop selectors work in top-layer
    var theme = document.documentElement.getAttribute("data-theme") || "dark";
    dialog.setAttribute("data-theme", theme);

    inner.innerHTML = loadingHTML;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    if (cache[url]) {
      inject(cache[url]);
      return;
    }

    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then(function (html) {
        cache[url] = html;
        inject(html);
      })
      .catch(function () {
        close();
        // fallback: navigate to the full detail page
        if (trigger && trigger.href) {
          window.location.href = trigger.href;
        }
      });
  }

  function inject(html) {
    inner.innerHTML = html;
    // Wire close buttons inside the injected content
    var closeBtns = inner.querySelectorAll("[data-close-modal]");
    for (var i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener("click", close);
    }
    // Move focus to the modal title
    var title = inner.querySelector(".pm-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus();
    }
  }

  // ── Close ─────────────────────────────────────

  function close() {
    dialog.close();
    document.body.style.overflow = "";
    if (trigger) {
      trigger.focus();
      trigger = null;
    }
  }

  // ── Event: click on backdrop (::backdrop) ─────

  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) {
      close();
    }
  });

  // ── Event: native dialog close (ESC or close()) ─

  dialog.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (trigger) {
      trigger.focus();
      trigger = null;
    }
  });

  // ── Event: intercept card links ───────────────

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-modal-url]");
    if (!link) return;

    e.preventDefault();
    trigger = link;
    open(link.getAttribute("data-modal-url"));
  });
})();
