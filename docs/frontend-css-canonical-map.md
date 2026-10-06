# Arquitectura CSS canónica — Home / Portafolio

## Objetivo
Eliminar `static/css/pages/home-responsive.css` y reducir `static/css/pages/home.css` a composición de página. Cada componente será dueño de su estilo base, responsive y efectos propios.

## Principio
Un selector debe tener un propietario claro. Responsive no es una capa separada: forma parte del componente.

## Rutas canónicas

| Dominio | Ruta canónica | Responsabilidad |
|---|---|---|
| Tokens | `static/css/base/design-tokens.css` | colores, spacing, radios, tipografía, breakpoints/tokens compartidos |
| Tipografía global | `static/css/base/typography.css` | escala y estilos tipográficos reutilizables |
| Layout global | `static/css/layout/layout.css` | contenedores y estructura global |
| Navbar | `static/css/layout/navbar.css` | navbar desktop/mobile |
| Footer | `static/css/layout/footer.css` | footer desktop/mobile |
| Motion compartido | `static/css/components/motion.css` | tokens y primitivas reutilizables de movimiento |
| Hero Home | `static/css/components/hero-home.css` | Hero de Home completo, incluido responsive |
| Proyectos | `static/css/components/project-carousel.css` | carrusel, cards y responsive |
| Metodología | `static/css/components/methodology-slider.css` | sección/slider/pasos y responsive |
| Carril horizontal móvil | `static/css/components/horizontal-rail.css` | scroll-snap, affordance y comportamiento común |
| Capacidades | `static/css/components/capabilities.css` | feature cards y responsive |
| Perfil profesional | `static/css/components/profile.css` | intro, cards, fondo y responsive |
| CTA final | `static/css/components/closing-cta.css` | cierre, acciones y responsive |
| Home | `static/css/pages/home.css` | composición y continuidad entre secciones, sin detalles internos |
| Home responsive actual | `static/css/pages/home-responsive.css` | TEMPORAL: será eliminado al finalizar la migración |

## Qué NO debe vivir en home.css
- tamaños internos del Hero
- reglas del carrusel
- estilos de tarjetas de Capacidades
- estilos de Perfil
- estilos del slider de Metodología
- media queries específicas de componentes
- keyframes propios de componentes
- hover/focus propios de componentes

## Qué SÍ puede vivir en home.css
- orden narrativo de las secciones
- ancho general del canvas de Home
- continuidad/fondo entre capítulos
- reglas estrictamente relacionadas con la página completa
- comportamiento de capítulo por viewport si afecta a varias secciones por igual

## Migración desde home-responsive.css

### 1. Hero
Mover todos los selectores que empiecen por:
- `.hero.hero--home`
- `.hero-content` cuando sean exclusivos de Home
- `.hero-wrapper`
- `.hero-image`
- `.hero-title`
- `.hero-story*`
- `.hero-tags`
- `.hero-buttons`

Destino: `components/hero-home.css`.

### 2. Proyectos
Mover:
- `#projects ...`
- `.projects-showcase ...`
- `.project-slide ...`
- `.panorama-card ...`
- `.portfolio-swiper ...`

Destino: `components/project-carousel.css`.

### 3. Metodología
Mover:
- `#methodology ...`
- `.methodology-* ...`

Destino: `components/methodology-slider.css`.

### 4. Carriles horizontales compartidos
Extraer comportamiento común de:
- `.methodology-steps`
- `.feature-grid`
- `.profile-v2__grid`

Solo lo común: `display:flex`, `overflow-x`, `scroll-snap`, scrollbar, affordance.

Destino: `components/horizontal-rail.css`.

Las dimensiones específicas de cada card permanecen en su componente.

### 5. Capacidades
Mover:
- `#services ...`
- `.feature-card ...`
- `.feature-card__* ...`
- `.services-* ...`

Destino: `components/capabilities.css`.

### 6. Perfil
Mover:
- `#about.profile-v2 ...`
- `.profile-v2__* ...`

Destino: `components/profile.css`.

### 7. CTA
Mover:
- `.closing-cta ...`
- `.closing-cta__* ...`
- reglas de `.cta-band` que solo pertenezcan al cierre Home

Destino: `components/closing-cta.css`.

### 8. Reglas realmente globales de Home
Lo que quede y afecte simultáneamente a varias secciones se consolida en `pages/home.css`.

### 9. Eliminación
Cuando `home-responsive.css` quede sin reglas:
1. eliminar su `<link>` de `templates/home.html`;
2. borrar `static/css/pages/home-responsive.css`;
3. revisar duplicados en `home.css`;
4. probar 360x800, 390x844, 768, 1024 y 1440.

## Orden de carga final esperado en home.html

```html
<link rel="stylesheet" href=".../components/hero-home.css">
<link rel="stylesheet" href=".../components/motion.css">
<link rel="stylesheet" href=".../components/horizontal-rail.css">
<link rel="stylesheet" href=".../components/project-carousel.css">
<link rel="stylesheet" href=".../components/methodology-slider.css">
<link rel="stylesheet" href=".../components/capabilities.css">
<link rel="stylesheet" href=".../components/profile.css">
<link rel="stylesheet" href=".../components/closing-cta.css">
<link rel="stylesheet" href=".../pages/home.css">
```

Nota: los estilos globales/base/layout siguen cargándose desde `base.html`. El orden exacto puede ajustarse durante la migración para evitar cambios visuales, pero no debe usarse como sustituto de una propiedad clara del selector.

## Regla de calidad
Antes de mover una regla:
1. identificar qué componente representa;
2. revisar si ya existe una regla equivalente en el archivo destino;
3. fusionar, no copiar y dejar duplicado;
4. eliminar la regla original;
5. verificar visualmente antes de pasar al siguiente componente.

## Estrategia de migración
Migrar una sección por commit:
1. Hero
2. Proyectos
3. Metodología
4. Carril horizontal común
5. Capacidades
6. Perfil
7. CTA
8. Limpieza de Home
9. Eliminación de `home-responsive.css`

Esto mantiene cada paso reversible y evita que una refactorización estructural cambie el diseño aprobado.


## Estado de migración
- [x] Hero Home → `components/hero-home.css`
- [x] Proyectos → `components/project-carousel.css`
- [x] Metodología → `components/methodology-slider.css`
- [ ] Carril horizontal compartido → `components/horizontal-rail.css`
- [ ] Capacidades → `components/capabilities.css`
- [ ] Perfil profesional → `components/profile.css`
- [ ] CTA final → `components/closing-cta.css`
- [ ] Limpieza final de `pages/home.css`
- [ ] Eliminar `pages/home-responsive.css`
