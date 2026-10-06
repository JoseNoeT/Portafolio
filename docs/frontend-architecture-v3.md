# Cumplimiento de la arquitectura frontend original

La arquitectura original del proyecto se conserva: `base/`, `layout/`, `components/` y `pages/`.
La limpieza no crea una arquitectura paralela; recupera la propiedad canónica que se perdió por acumulación de overrides.

## Reglas
- Un componente tiene un solo dueño.
- `pages/home.css` coordina la página; no implementa internamente Hero, Proyectos, Metodología, Capacidades, Perfil o CTA.
- Responsive vive con el componente al que modifica.
- Los entrypoints canónicos pueden importar submódulos pequeños del mismo componente.
- Objetivo operativo: archivos de implementación de hasta 100 líneas.
- No se anexan nuevas “versiones” al final de un CSS. Se modifica o sustituye la regla canónica.
- Código muerto y selectores de componentes retirados se eliminan.

## Estado congelado
Antes de esta limpieza se creó la rama:
`snapshot-css-pre-canonical-cleanup-20261006`

Sirve como referencia visual y rollback del estado aprobado.

## Dueños canónicos de Home
- Hero principal → `components/hero-home.css`
- Hero de páginas → `components/hero.css`
- Proyectos → `components/project-carousel.css`
- Metodología → `components/methodology-slider.css`
- Capacidades → `components/capabilities.css`
- Perfil → `components/profile.css`
- CTA → `components/closing-cta.css`
- Carril/hint horizontal compartido → `components/horizontal-rail.css`
- Composición de Home → `pages/home.css`

`pages/home-responsive.css` queda eliminado.
