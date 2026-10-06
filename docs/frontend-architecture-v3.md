# Cumplimiento de la arquitectura frontend original

Se conserva la arquitectura original: `base/`, `layout/`, `components/` y `pages/`.
La limpieza recupera propiedad canónica; no crea una arquitectura paralela.

## Reglas aplicadas
- Un componente tiene un solo dueño de implementación.
- Las capas compartidas `base/typography`, `components/sections` y `components/motion` pueden aportar defaults semánticos, no geometría interna del componente.
- `pages/home-foundation.css` contiene composición base de Home.
- `pages/home.css` contiene composición/ajustes finales de Home.
- Responsive específico vive con su componente.
- Los entrypoints canónicos importan módulos pequeños del mismo componente.
- Límite operativo CSS: 100 líneas por archivo de implementación.
- No se agregan versiones históricas al final de un CSS.
- Código muerto se elimina en vez de conservarse como fallback.

## Estado congelado
Rama de rollback visual:
`snapshot-css-pre-canonical-cleanup-20261006`

## Dueños canónicos
- Hero principal → `components/hero-home.css`
- Hero páginas internas → `components/hero.css`
- Proyectos Home → `components/project-carousel.css`
- Metodología Home → `components/methodology-slider.css`
- Capacidades → `components/capabilities.css`
- Perfil → `components/profile.css`
- CTA → `components/closing-cta.css`
- Carril/hint horizontal → `components/horizontal-rail.css`
- Composición Home → `pages/home-foundation.css` + `pages/home.css`

El archivo `pages/home-responsive.css` fue eliminado.

## Controles automáticos
`python scripts/check_frontend_sizes.py --scope css --strict`

`python scripts/check_css_ownership.py`

Ambos se ejecutan en GitHub Actions mediante `.github/workflows/frontend-architecture.yml`.
