# Estado del proyecto Portafolio

## Objetivo

Convertir el proyecto Django en un portafolio profesional, administrable, seguro, responsive y desplegable, orientado a reclutadores y clientes.

---

## Entornos

- Desarrollo local: Windows + VSCode
- Producción actual: PythonAnywhere
- URL pública: https://josemnoedev.pythonanywhere.com
- Rama principal: main
- Commit estable inicial: b694e85

---

## Forma de trabajo

### Equipo

- **Usuario (José):** toma decisiones, programa, prueba y valida visualmente.
- **ChatGPT:** arquitecto del proyecto, revisión técnica, planificación, prompts, control de calidad y documentación.
- **GitHub Copilot:** implementa cambios concretos en archivos específicos.
- **PowerShell:** diagnóstico, pruebas, Git, migraciones y despliegues.

---

## Reglas del proyecto

1. Trabajar un solo objetivo por vez.
2. No modificar archivos fuera del alcance definido.
3. No eliminar funcionalidades existentes.
4. Antes de modificar código identificar exactamente los archivos involucrados.
5. Revisar siempre el `git diff` antes de hacer commit.
6. Ejecutar pruebas antes de cada commit.
7. Actualizar este documento al finalizar cada etapa.
8. No agregar funcionalidades nuevas mientras una implementación esté en curso.
9. Copilot no debe tomar decisiones de arquitectura.
10. Las decisiones de arquitectura las define ChatGPT junto con el usuario antes de escribir código.
11. Los prompts para Copilot deben ser cortos, precisos y ahorrar tokens.
12. Todo cambio debe ser compatible con el despliegue en producción.
13. No romper compatibilidad con proyectos existentes.
14. Siempre privilegiar soluciones simples, mantenibles y profesionales.

---

## Estado actual

### Repositorio

- Estado limpio.
- Rama: `main`.
- Sin cambios pendientes.
- Commit base: `b694e85`.

### Dashboard

Actualmente permite:

- Crear proyectos.
- Editar proyectos.
- Eliminar proyectos.
- Administrar contenido.

### Multimedia actual

- Una imagen principal.
- Validación de tamaño.
- Validación de formato.
- Soporta JPG, JPEG, PNG y GIF.
- Límite actual: 5 MB.

### Almacenamiento

Actualmente existe soporte para:

- Cloudinary.
- FileSystemStorage.

El problema actual es que:

- Cloudinary funciona correctamente en Render.
- PythonAnywhere bloquea la subida hacia Cloudinary.
- El proyecto obliga a utilizar Cloudinary en producción mediante una excepción en `settings.py`.

---

## Etapa activa

# Sistema multimedia profesional

### Objetivo

Convertir el sistema de imágenes del portafolio en un sistema profesional y fácil de administrar.

### Alcance aprobado

- Mantener una imagen principal.
- Permitir hasta tres imágenes adicionales.
- Optimizar automáticamente todas las imágenes.
- Convertir imágenes a WebP.
- Mantener la proporción original.
- Redimensionar automáticamente cuando sea necesario.
- Peso objetivo inferior a 1 MB.
- Aceptar imágenes grandes y optimizarlas automáticamente.
- Incorporar un video demo mediante URL opcional.
- No almacenar videos dentro del servidor.
- Utilizar almacenamiento local en PythonAnywhere.
- Mantener Cloudinary como opción, no como requisito.
- No romper compatibilidad con proyectos existentes.

---

## Fuera de alcance

Por ahora NO se trabajará en:

- SEO.
- Rediseño general.
- Branding.
- Nuevos módulos.
- Analíticas avanzadas.
- Migración de datos entre servidores.

---

## Próxima etapa

### SEO profesional

Cuando termine la parte multimedia se implementará:

- Meta Title.
- Meta Description.
- Canonical.
- Sitemap.
- Robots.txt.
- Open Graph.
- Twitter Cards.
- JSON-LD.
- Alt automáticos para imágenes.
- Datos estructurados.
- Google Search Console.
- Bing Webmaster Tools.

---

## Decisiones de arquitectura

### Regla 1

El modelo `Project` no debe seguir creciendo indefinidamente.

Las funcionalidades multimedia deberán separarse cuando corresponda mediante modelos relacionados y servicios reutilizables.

### Regla 2

La lógica de procesamiento de imágenes no pertenece al modelo.

Debe vivir en un servicio independiente.

Ejemplo:

```
projects/
    services/
        image_optimizer.py
```

### Regla 3

Cloudinary será una opción.

Nunca más será un requisito obligatorio para ejecutar el proyecto.

### Regla 4

Todo cambio debe funcionar correctamente tanto en desarrollo local como en producción.

---

## Próximo paso

Modificar `settings.py` para eliminar la dependencia obligatoria de Cloudinary y permitir el uso de `FileSystemStorage` en producción cuando no exista `CLOUDINARY_URL`.

---

## Registro de avances

### Estado inicial

- Repositorio limpio.
- Dashboard operativo.
- CRUD funcional.
- Despliegue correcto en PythonAnywhere.
- Problema identificado únicamente en la subida de imágenes mediante Cloudinary.