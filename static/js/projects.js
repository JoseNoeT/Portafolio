import { initProjectsPage } from "./projects-page/index.js";

const ready = window.AppAnimations?.onReady;
if (ready) ready(initProjectsPage);
else document.addEventListener("DOMContentLoaded", initProjectsPage, { once: true });
