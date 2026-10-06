# Arquitectura Frontend v3 — módulos pequeños y propiedad canónica

## Regla principal

Cada archivo frontend debe tener una responsabilidad única y una ruta canónica.

**Presupuesto objetivo: máximo 100 líneas por archivo.**

Excepciones justificadas:
- tokens/datos declarativos;
- archivos generados;
- un componente que no pueda dividirse sin perder cohesión.

Una excepción debe quedar documentada. No se agregan parches al final de archivos gigantes.

## Regla de edición

Antes de modificar CSS/JS/HTML:
1. identificar el componente dueño;
2. revisar tamaño actual del archivo;
3. si supera 100 líneas, dividir antes de seguir agregando;
4. no crear una segunda capa global para corregir un componente;
5. responsive pertenece al mismo componente, en un submódulo si supera el presupuesto.

## Estructura objetivo

```text
static/
  css/
    base/
      tokens-colors.css
      tokens-spacing.css
      tokens-typography.css
      reset.css
      typography.css

    layout/
      navbar/
        base.css
        desktop.css
        mobile.css
      footer/
        base.css
        responsive.css
      shell/
        container.css
        sections.css

    components/
      hero-home/
        shell.css
        portrait.css
        story.css
        actions.css
        desktop.css
        mobile.css
        motion.css

      hero-page/
        shell.css
        panel.css
        typography.css
        responsive.css
        motion.css

      projects/
        carousel.css
        card.css
        atmosphere.css
        typography.css
        desktop.css
        mobile.css
        motion.css

      methodology/
        section.css
        story.css
        slide.css
        controls.css
        desktop.css
        mobile.css
        motion.css

      capabilities/
        section.css
        card.css
        mobile.css

      profile/
        section.css
        card.css
        mobile.css

      closing-cta/
        shell.css
        content.css
        responsive.css

    pages/
      home.css
```

`pages/home.css` solo puede contener composición entre secciones de Home. No contiene detalles internos de Hero, Proyectos, Metodología, Capacidades, Perfil o CTA.

## HTML

La misma regla aplica a templates. Un template de página compone parciales; no contiene componentes gigantes.

Objetivo Home:

```text
templates/home.html
templates/home/_hero.html
templates/home/_projects.html
templates/home/_methodology.html
templates/home/_capabilities.html
templates/home/_profile.html
templates/home/_closing_cta.html
```

## JavaScript

Cada comportamiento tiene un módulo único:

```text
static/js/components/hero-home/
static/js/components/projects/
static/js/components/methodology/
static/js/components/mobile-rail/
```

No se mantienen scripts antiguos que implementen el mismo comportamiento.

## Deuda detectada 2026-10-06

Los archivos más grandes detectados en la rama `mejoras-portafolio`:

- `pages/home.css`: 2282 líneas
- `components/methodology-slider.css`: 1693
- `components/hero.css`: 1110
- `components/project-carousel.css`: 1101
- `pages/home-responsive.css`: 805
- `components/hero-home.css`: 748
- `layout/navbar.css`: 662
- `pages/projects.css`: 601
- `components/sections.css`: 489

Esto confirma que mover bloques completos entre archivos no fue una modularización suficiente. La siguiente fase debe **consolidar, deduplicar y dividir**, no seguir anexando overrides.

## Orden de corrección

1. Hero Home.
2. Hero de páginas internas.
3. Metodología.
4. Proyectos.
5. Capacidades.
6. Perfil.
7. CTA.
8. Navbar/Footer.
9. Home composition.
10. Eliminar `home-responsive.css`.
11. Eliminar CSS y JS obsoletos.
12. Activar control estricto de 100 líneas.

## Criterio de terminado

Un componente está terminado cuando:
- no tiene reglas duplicadas en otra ruta;
- ningún submódulo supera 100 líneas salvo excepción documentada;
- desktop y responsive viven bajo la carpeta del componente;
- sus scripts tienen un único dueño;
- la página solo lo compone;
- pasa revisión visual 360, 390, 768, 1024 y 1440.
