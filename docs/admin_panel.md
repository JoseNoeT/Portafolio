# Panel de Administración – Portafolio Profesional

## 1. Introducción

El panel de administración del portafolio tiene como objetivo permitir la gestión dinámica del contenido del sitio web sin necesidad de modificar el código fuente.

Este panel permitirá administrar proyectos, contenido técnico y datos del portafolio personal desde una interfaz privada y segura.

El sistema está diseñado para demostrar competencias profesionales en:

* Desarrollo Backend
* Gestión de Base de Datos
* Arquitectura CRUD
* Validación de datos
* Manejo de archivos
* Diseño de APIs REST
* Seguridad básica de aplicaciones web

El panel será accesible únicamente mediante autenticación.

---

# 2. Arquitectura del Sistema

El sistema del portafolio se divide en dos áreas principales:

## 2.1 Sitio Público

Visible para los visitantes.

Secciones principales:

* Home
* About
* Projects
* Services
* Contact

La información mostrada en estas páginas es administrada desde el panel de administración.

---

## 2.2 Panel Administrativo

Área privada para gestionar el contenido del sitio.

Ruta sugerida:

/admin
o
/dashboard

Acceso restringido mediante login.

---

# 3. Gestión de Proyectos

La funcionalidad principal del panel es la administración de proyectos.

El sistema utiliza el modelo `Project` definido en Django.

Cada proyecto representa un trabajo profesional, académico o personal que forma parte del portafolio.

---

# 4. Modelo de Datos: Project

El modelo `Project` representa cada proyecto del portafolio.

Campos principales:

### title

Título del proyecto.

Ejemplo:

Trading Bot
Portfolio Website
Data Analysis Platform

---

### slug

Identificador único usado en URLs.

Se genera automáticamente a partir del título mediante `slugify`.

Ejemplo:

portfolio-website
trading-bot

---

### short_description

Descripción breve del proyecto.

Se utiliza en tarjetas o listas de proyectos.

---

### description

Descripción completa del proyecto.

Permite explicar:

* Problema
* Solución
* Tecnologías utilizadas
* Resultados

---

### category

Clasificación del proyecto.

Opciones disponibles:

* Professional
* Academic
* Personal
* Engineering

Esto permite filtrar proyectos en el portafolio.

---

### technologies

Lista de tecnologías utilizadas.

Formato:

Texto separado por comas.

Ejemplo:

Django, PostgreSQL, Docker

Esto permite mostrar etiquetas tecnológicas en el sitio.

---

### github_url

Enlace al repositorio del proyecto.

Opcional.

---

### live_url

Enlace al proyecto desplegado en producción.

Opcional.

---

### image

Imagen representativa del proyecto.

Validaciones aplicadas:

* Solo formatos permitidos: jpg, jpeg, png, gif
* Tamaño máximo: 5MB

Las imágenes se almacenan en:

/media/projects/

---

### created_at

Fecha de creación del registro.

Generada automáticamente.

---

### updated_at

Fecha de última modificación.

Actualizada automáticamente.

---

# 5. Funcionalidades del Panel Administrativo

El panel administrativo debe permitir realizar las siguientes operaciones.

---

# 5.1 Crear Proyecto

Permite agregar un nuevo proyecto al portafolio.

Campos requeridos:

* Title
* Short Description
* Description
* Category
* Technologies
* Github URL
* Live URL
* Image

Una vez creado, el proyecto aparecerá automáticamente en la página de proyectos del sitio público.

---

# 5.2 Editar Proyecto

Permite modificar cualquier campo de un proyecto existente.

Esto permite actualizar:

* Descripción
* Tecnologías
* Links
* Imagen

---

# 5.3 Eliminar Proyecto

Permite eliminar proyectos del portafolio.

Debe incluir confirmación para evitar eliminaciones accidentales.

---

# 5.4 Visualizar Lista de Proyectos

El panel mostrará una tabla con todos los proyectos.

Ejemplo:

| ID | Title       | Category    | Created | Actions       |
| -- | ----------- | ----------- | ------- | ------------- |
| 1  | Trading Bot | Engineering | 2026    | Edit / Delete |

---

# 6. Validaciones del Sistema

El sistema implementa validaciones para asegurar la calidad de los datos.

Validaciones incluidas:

* Tamaño máximo de imagen (5MB)
* Extensiones de imagen permitidas
* Slug único
* Campos obligatorios

Estas validaciones se aplican tanto en backend como en formularios.

---

# 7. Seguridad

El panel administrativo debe incluir:

* Autenticación de usuario
* Acceso restringido
* Protección contra acceso no autorizado

Solo usuarios administradores podrán modificar el contenido.

---

# 8. Futuras Funcionalidades

El panel podrá ampliarse con módulos adicionales.

Posibles mejoras:

### Gestión de habilidades

Administrar tecnologías del portafolio.

### Blog técnico

Publicar artículos sobre desarrollo de software.

### Gestión de mensajes

Administrar mensajes enviados desde el formulario de contacto.

### Analytics

Visualizar estadísticas de visitas al portafolio.

### API REST

Exponer datos del portafolio mediante endpoints API.

Ejemplo:

/api/projects
/api/skills
/api/posts

---

# 9. Objetivo Profesional

Este sistema demuestra competencias clave para un desarrollador backend o fullstack:

* Diseño de modelos de datos
* Arquitectura CRUD
* Validación de archivos
* Generación automática de slugs
* Gestión de contenido dinámico
* Integración entre backend y frontend

El portafolio se convierte así en una plataforma dinámica administrable y no solo en un sitio web estático.
