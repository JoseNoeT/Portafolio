(() => {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const label = button.querySelector(".theme-toggle-label");
  const icon = button.querySelector(".theme-toggle-icon");
  const root = document.documentElement;
  const key = "portfolio-theme";

  const refresh = () => {
    const dark = (root.getAttribute("data-theme") || "dark") === "dark";
    label.textContent = dark ? "Oscuro" : "Claro";
    icon.textContent = dark ? "\u263E" : "\u2600";
    button.setAttribute(
      "aria-label",
      dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
  };

  button.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(key, next);
    refresh();
  });

  refresh();
})();
