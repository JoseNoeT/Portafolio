# Guía visual del Hero y sistema base de diseño

## Objetivo

Este documento define la línea visual base del hero principal del portafolio personal. Su función es servir como referencia de diseño para mantener consistencia en futuras mejoras del sitio, especialmente en la portada orientada a reclutadores.

## Identidad visual general

El sitio transmite una estética:

* tecnológica
* profesional
* moderna
* limpia
* premium sin exageración
* orientada a backend / fullstack

La propuesta visual combina fondo oscuro, acentos azules brillantes, superficies con glassmorphism oscuro, tipografía fuerte y componentes redondeados.

---

## Paleta general de colores

### Fondos

* `#071027` → azul noche profundo
* `#0F2549` → azul navy oscuro
* `#1A5E95` → azul petróleo / acento de profundidad
* `#10213F` → superficie oscura secundaria

### Acentos

* `#2CA8F3` → celeste eléctrico principal
* `#38BDF8` → azul brillante de gradiente
* `#2196F3` → azul fuerte para estados activos

### Texto

* `#F0F1F2` → texto principal
* `#C9D4E3` → texto secundario
* `#9B9A9B` → texto muted / soporte

### Bordes y transparencias

* `rgba(255, 255, 255, 0.10)` → borde glass suave
* `rgba(44, 168, 243, 0.55)` → borde accent glow
* `rgba(255, 255, 255, 0.06)` → fondo de chips / pills

### Gradientes clave

* `linear-gradient(135deg, #2196F3 0%, #38BDF8 100%)`
* `linear-gradient(135deg, #071027 0%, #0F2549 55%, #071027 100%)`

---

## Estilo visual principal

### 1. Fondo del hero

* oscuro
* tecnológico
* con animación abstracta azul/cian
* movimiento sutil para no competir con el contenido

### 2. Superficie central

* tarjeta glass oscura
* blur medio
* bordes suaves
* radios grandes
* sombra profunda pero controlada

### 3. Jerarquía del contenido

Orden recomendado para reclutadores:

1. etiqueta profesional superior (eyebrow)
2. titular principal
3. descripción corta y clara
4. chips tecnológicos / fortalezas
5. botones CTA

### 4. Composición

* foto circular a la izquierda
* contenido textual a la derecha
* alineación izquierda en bloque de texto
* lectura rápida en 3 segundos

---

## Modelo visual del glassmorphism

```css
.glass-card {
  background: rgba(7, 16, 39, 0.58);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(44, 168, 243, 0.06) inset;
  border-radius: 28px;
}
```

---

## Componentes visuales extraídos

### Eyebrow / badge superior

Funciona como etiqueta profesional del perfil.

```css
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 999px;
  background: rgba(44, 168, 243, 0.08);
  border: 1px solid rgba(44, 168, 243, 0.25);
  color: #2CA8F3;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
```

### Título principal

Un título fuerte, limpio y con una palabra acentuada en azul.

```css
.hero-title {
  font-size: clamp(2.6rem, 5vw, 5rem);
  line-height: 1.05;
  font-weight: 800;
  color: #F0F1F2;
  letter-spacing: -0.03em;
}

.hero-title .accent {
  color: #2CA8F3;
}
```

### Foto circular hero

```css
.profile-avatar {
  width: 100%;
  max-width: 260px;
  border-radius: 50%;
  border: 4px solid #2CA8F3;
  box-shadow:
    0 0 0 6px rgba(44, 168, 243, 0.08),
    0 18px 40px rgba(0, 0, 0, 0.35);
}
```

### Chips de stack / fortalezas

```css
.tech-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #E8EDF5;
  font-weight: 600;
}
```

### Botón primario

```css
.btn-primary-hero {
  background: linear-gradient(135deg, #2196F3 0%, #38BDF8 100%);
  color: #F0F1F2;
  border: none;
  border-radius: 18px;
  padding: 18px 34px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(44, 168, 243, 0.22);
}
```

### Botón secundario outline

```css
.btn-outline-hero {
  background: transparent;
  color: #2CA8F3;
  border: 2px solid rgba(44, 168, 243, 0.8);
  border-radius: 18px;
  padding: 18px 34px;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
}
```

---

## Modelo de composición del hero

### Estructura recomendada

* izquierda: foto perfil circular
* derecha: texto de valor

### Orden del contenido

1. Eyebrow / cargo profesional
2. H1 principal
3. Subtexto descriptivo
4. Chips tecnológicos
5. Botones CTA

### Mensaje ideal para reclutadores

* quién eres
* qué construyes
* en qué stack destacas
* qué acción deben tomar

---

## Tokens base sugeridos para CSS

```css
:root {
  --color-bg-primary: #071027;
  --color-bg-secondary: #0F2549;
  --color-bg-tertiary: #1A5E95;
  --color-surface-dark: #10213f;
  --color-surface-glass: rgba(7, 16, 39, 0.58);

  --color-accent-primary: #2CA8F3;
  --color-accent-secondary: #38BDF8;
  --color-accent-strong: #2196F3;

  --color-text-primary: #F0F1F2;
  --color-text-secondary: #C9D4E3;
  --color-text-muted: #9B9A9B;

  --color-border-soft: rgba(255, 255, 255, 0.10);
  --color-border-accent: rgba(44, 168, 243, 0.55);

  --gradient-primary: linear-gradient(135deg, #2196F3 0%, #38BDF8 100%);
  --gradient-hero: linear-gradient(135deg, #071027 0%, #0F2549 55%, #071027 100%);
}
```

---

## Criterios de consistencia para el resto del sitio

Para mantener coherencia visual en otras páginas del portafolio:

* usar fondos azul oscuro profundos
* usar el celeste eléctrico como acento principal
* aplicar glass oscuro en tarjetas y paneles
* usar bordes redondeados amplios
* evitar saturación de efectos glow
* dejar una sola palabra destacada en azul por título
* mantener CTA claros y visibles
* priorizar legibilidad sobre decoración

---

## Uso recomendado dentro del proyecto

Este documento debe servir como referencia para:

* refactor del hero principal
* diseño de tarjetas de proyectos
* sección de servicios
* sección sobre mí
* CTA finales
* futuras decisiones de UI/UX

También puede utilizarse como base para prompts dirigidos a GitHub Copilot o para documentación técnica del diseño del portafolio.
