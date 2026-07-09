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

  var trigger = null; // element that opened the modal, for focus return
  var cache   = {};   // url → html cache

  function renderLoadingState() {
    var loading = document.createElement("div");
    loading.className = "pm-loading";
    loading.setAttribute("aria-label", "Cargando");

    var spinner = document.createElement("span");
    spinner.className = "pm-spinner";
    loading.appendChild(spinner);

    inner.replaceChildren(loading);
  }

  function sanitizeAndInject(html) {
    var template = document.createElement("template");
    template.innerHTML = html;

    // Defensive cleanup for injected fragments.
    var scripts = template.content.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      scripts[i].remove();
    }

    var nodesWithHandlers = template.content.querySelectorAll("*");
    for (var j = 0; j < nodesWithHandlers.length; j++) {
      var node = nodesWithHandlers[j];
      var attrs = Array.from(node.attributes || []);
      for (var k = 0; k < attrs.length; k++) {
        var attrName = attrs[k].name.toLowerCase();
        var attrValue = attrs[k].value;
        if (attrName.indexOf("on") === 0) {
          node.removeAttribute(attrs[k].name);
        }
        if ((attrName === "href" || attrName === "src") && /^\s*javascript:/i.test(attrValue)) {
          node.removeAttribute(attrs[k].name);
        }
      }
    }

    inner.replaceChildren(template.content.cloneNode(true));
  }

  // ── Open ──────────────────────────────────────

  function open(url) {
    // Sync theme from <html> so ::backdrop selectors work in top-layer
    var theme = document.documentElement.getAttribute("data-theme") || "dark";
    dialog.setAttribute("data-theme", theme);

    renderLoadingState();
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
    sanitizeAndInject(html);
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
