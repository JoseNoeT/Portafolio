import { createProjectModal } from "./controller.js";

export function initProjectModal() {
  const dialog = document.getElementById("project-modal");
  const inner = document.getElementById("project-modal-content");
  if (!dialog || !inner) return;

  const modal = createProjectModal(dialog, inner);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) modal.close();
  });

  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-modal-url]");
    if (!link) return;
    event.preventDefault();
    modal.openFrom(link);
  });
}
