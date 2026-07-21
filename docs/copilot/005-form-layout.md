# Sprint 2 - Formulario profesional de proyectos

## Contexto

Actualmente las plantillas `templates/projects/create.html` y `templates/projects/edit.html` utilizan `{{ form.as_p }}`.

El proyecto seguirá creciendo con galería, videos, SEO y nuevas funcionalidades, por lo que se necesita un formulario manual y organizado.

## Objetivo

Modificar únicamente:

- projects/forms.py
- templates/projects/create.html
- templates/projects/edit.html

## Requerimientos

Eliminar `{{ form.as_p }}`.

Renderizar manualmente todos los campos del formulario.

Organizar el formulario en bloques claramente identificados.

### Información general

- title
- short_description
- description
- category
- technologies

### Enlaces

- github_url
- live_url
- demo_video_url

La etiqueta del último campo debe decir:

**Demostración en video**

Agregar un texto de ayuda:

"Admite enlaces de YouTube, Vimeo o Loom."

### Imagen principal

Mostrar:

- image

Si se está editando un proyecto y existe imagen, mostrar una vista previa encima del selector.

### Botones

Mantener:

Guardar

Cancelar

## Restricciones

No modificar:

- modelos
- vistas
- urls
- estilos globales

No agregar JavaScript.

No implementar todavía galería.

No implementar todavía modal.

No implementar todavía reproductor.

## Resultado esperado

El formulario debe quedar preparado para crecer durante los próximos sprints, manteniendo una estructura limpia, profesional y fácil de mantener.