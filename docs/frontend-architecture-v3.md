# Arquitectura frontend por capas

La arquitectura original se conserva y se formaliza por capas para que cada parte sea transferible sin arrastrar toda la aplicación.

## Dirección de dependencias

```text
01 Foundation
      ↓
02 Layout
      ↓
03 Components
      ↓
04 Shared responsive compatibility
      ↓
Page bundle
      ↓
Page composition
```

Una capa puede depender de las anteriores. Nunca de una capa posterior.

## Capas globales

- `css/layers/01-foundation.css`: tokens, tipografía y reglas globales.
- `css/layers/02-layout.css`: shell, navbar, header y footer.
- `css/layers/03-components.css`: componentes reutilizables.
- `css/layers/04-responsive.css`: compatibilidad responsive compartida que todavía no pertenece a un componente concreto.

Cada archivo de capa es solo un **manifest de imports**. No contiene implementación.

## Bundles de página

Home usa:

`css/pages/home.bundle.css`

Este bundle importa, en orden canónico:

1. composición base de Home;
2. Hero Home;
3. Proyectos;
4. Metodología;
5. Capacidades;
6. Perfil;
7. CTA;
8. carril horizontal;
9. composición final de Home.

Eso permite mover Home a otro proyecto copiando su bundle, sus componentes y sus assets, sin perseguir reglas dispersas.

## Regla de propiedad

- Hero principal → `components/hero-home.css`
- Hero páginas internas → `components/hero.css`
- Proyectos → `components/project-carousel.css`
- Metodología → `components/methodology-slider.css`
- Capacidades → `components/capabilities.css`
- Perfil → `components/profile.css`
- CTA → `components/closing-cta.css`
- Home → `pages/home-foundation.css` + `pages/home.css`

Los entrypoints anteriores importan sus módulos pequeños. Responsive específico permanece dentro del dominio dueño.

## Tamaño

Los módulos de implementación se mantienen en torno a 100 líneas como máximo. Los manifests deben ser mucho menores.

## Seguridad del refactor

El estado visual previo está congelado en:

`snapshot-css-pre-canonical-cleanup-20261006`

No se elimina ese snapshot hasta terminar la revisión visual.
