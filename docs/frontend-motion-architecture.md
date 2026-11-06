# Arquitectura Frontend de Movimiento — Portafolio

## Objetivo
Evitar que múltiples CSS/JS controlen simultáneamente la misma animación, pseudo-elemento o transform. Cada efecto debe tener un único propietario.

## Regla de propiedad
- `components/motion.css`: tokens y primitivas reutilizables.
- `components/hero.css`: movimiento específico del Hero.
- `components/project-carousel.css` + `project-carousel.js`: carrusel y microinteracción de proyectos.
- `components/methodology-slider.css` + `methodology-slider.js`: estado visual y transición de Metodología.
- `pages/home.css`: decide qué superficies de Home usan una primitiva; no redefine primitivas globales.
- `pages/home-responsive.css`: cambia composición por viewport; no crea un segundo sistema de animación.

## Jerarquía de movimiento
1. Ambiente de sección: máximo un efecto dominante.
2. Componente: slider/carrusel.
3. Entrada: reveal una sola vez.
4. Microinteracción: hover/focus en interacción real.

No deben competir dos efectos dominantes sobre el mismo elemento.

## Inventario actual
| Área | Efecto | Propietario |
|---|---|---|
| Global | tokens, Ken Burns compartido, edge reutilizable | `motion.css` |
| Hero | partículas, borde y narrativa | `hero.css` / `home.js` |
| Proyectos | coverflow y tilt | `project-carousel.css/js` |
| Metodología | slider, fondo activo, borde local | `methodology-slider.css/js` |
| Home | selección de fondos que usan Ken Burns compartido | `home.css` |
| Reveal | entrada al viewport | `scroll-animations.js` |

## Reglas
- No usar `transform` desde CSS y JS sobre el mismo estado sin una capa explícita.
- No reutilizar el mismo `::before`/`::after` para dos responsabilidades.
- Evitar `!important` como mecanismo de coordinación entre animaciones.
- `prefers-reduced-motion` debe detener todo movimiento no esencial.
- Sliders/autoplay deben pausarse fuera del viewport y con la pestaña oculta.
- En móvil, priorizar interacción y lectura sobre movimiento ambiental.

## Cambio 3.0
- Ken Burns compartido movido a `motion.css`.
- Se retiraron del sistema global los componentes que ya poseen borde local.
- Metodología dejó de definir dos Ken Burns distintos para el mismo estado.
- El JS de Metodología dejó de escribir `style.animation` y ahora solo controla estado.
- Autoplay de Metodología se pausa fuera de viewport y cuando la pestaña está oculta.

## Siguiente auditoría
Revisar `project-carousel.css/js` porque el tilt de JS escribe `transform` directamente sobre `.panorama-card`. Debe verificarse contra los transforms definidos por Swiper y CSS antes de simplificarlo.
