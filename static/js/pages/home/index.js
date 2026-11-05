import "../../animations/hero.js";
import "../../components/theme-toggle.js";
import { initDeferredHomeModules } from "./deferred-modules.js?v=3";
import { initLazyBackgrounds } from "./lazy-backgrounds.js";
import { initLazyInlineBackgrounds } from "./lazy-inline-backgrounds.js";
import { initHomeHeroParticles } from "./hero-particles.js";

initLazyBackgrounds();
initLazyInlineBackgrounds();
initDeferredHomeModules();
initHomeHeroParticles();
