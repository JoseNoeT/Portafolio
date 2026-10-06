# Mapa CSS canónico — estado final

La arquitectura original se mantiene: `base/`, `layout/`, `components/` y `pages/`.

## Home

| Dominio | Entrypoint canónico | Implementación |
|---|---|---|
| Hero Home | `components/hero-home.css` | `components/hero-home/` |
| Hero páginas | `components/hero.css` | `components/hero-page/` |
| Proyectos | `components/project-carousel.css` | `components/projects/` |
| Metodología | `components/methodology-slider.css` | `components/methodology/` |
| Capacidades | `components/capabilities.css` | `components/capabilities/` |
| Perfil | `components/profile.css` | `components/profile/` |
| CTA | `components/closing-cta.css` | `components/closing-cta/` |
| Carril horizontal | `components/horizontal-rail.css` | `components/horizontal-rail/` |
| Composición base Home | `pages/home-foundation.css` | `pages/home-foundation/` |
| Composición final Home | `pages/home.css` | `pages/home/` |

## Resultado de la migración
- [x] diseño previo congelado en `snapshot-css-pre-canonical-cleanup-20261006`
- [x] selectores inventariados y asignados a propietario
- [x] duplicados exactos eliminados durante reconstrucción
- [x] Hero Home separado del Hero de páginas
- [x] Proyectos en su propietario
- [x] Metodología en su propietario
- [x] Capacidades en su propietario
- [x] Perfil en su propietario
- [x] CTA en su propietario
- [x] carril horizontal extraído
- [x] código legado `.home-project-*` eliminado
- [x] reglas `.methodology-roll-image` y keyframes obsoletos eliminados
- [x] `pages/home-responsive.css` eliminado
- [x] `home-project-carousel.js` obsoleto eliminado
- [x] control automático de tamaño CSS
- [x] control automático de propiedad canónica

## Regla de mantenimiento
No se añade un bloque “versión N+1” al final de un archivo. Se edita el módulo propietario.

Los entrypoints solo importan módulos del mismo dominio. Los módulos de implementación deben mantenerse por debajo de 100 líneas salvo una excepción documentada.
