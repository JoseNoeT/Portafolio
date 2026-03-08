Arquitectura por Capas — Panel Administrativo del Portafolio
Introducción

Este documento define la arquitectura y las fases de desarrollo para implementar un panel administrativo personalizado en el proyecto Django JosePortafolio.

El objetivo es evolucionar el portafolio desde una aplicación estática hacia una aplicación web administrable, permitiendo gestionar proyectos, media y contenido desde un dashboard seguro.

El desarrollo se realizará por capas (layers) para mantener una arquitectura modular, escalable y fácil de mantener.

Capa 1 — Infraestructura del Panel (Fase 1)
Objetivo

Crear la estructura base del panel administrativo sin lógica de negocio.

Esta capa prepara la arquitectura necesaria para implementar funcionalidades posteriores.

Componentes a implementar
Nueva aplicación Django

Se creará una app dedicada:

adminpanel

Ubicación:

JosePortafolio/
adminpanel/
Estructura inicial de la app
adminpanel
│
├── views.py
├── urls.py
├── forms.py
├── templates/
│   └── adminpanel/
│        └── dashboard.html
Routing del panel

Se agregará un sistema de rutas para el dashboard.

Ejemplo:

/dashboard

Archivo:

adminpanel/urls.py

Será incluido en:

JosePortafolio/urls.py
Template base del panel

Se creará:

templates/adminpanel/dashboard.html

Este template extenderá el layout base del sitio:

base.html

Objetivo del dashboard inicial:

Mostrar estructura del panel sin funcionalidades.

Resultado esperado de la capa 1

Al finalizar esta fase, el sistema permitirá acceder a:

/dashboard

y mostrará un dashboard básico conectado a la arquitectura del proyecto.

No se implementará todavía:

CRUD
formularios
gestión de proyectos
Capa 2 — Autenticación y Seguridad (Fase 2)
Objetivo

Proteger el panel administrativo mediante autenticación de usuarios.

Funcionalidades

Implementar sistema de acceso:

login
logout

Rutas esperadas:

/dashboard/login
/dashboard/logout
Protección de vistas

Las vistas del panel usarán:

LoginRequiredMixin

para evitar acceso público.

Resultado esperado

Solo usuarios autenticados podrán acceder al panel.

Capa 3 — Dashboard Administrativo (Fase 3)
Objetivo

Construir un dashboard informativo con datos del sistema.

Contenido del dashboard

El panel mostrará:

Total de proyectos
Proyectos recientes
Accesos rápidos

Ejemplo de widgets:

Total Projects
Latest Projects
Create Project Button
Fuente de datos

Los datos se obtendrán del modelo:

Project

ubicado en:

projects/models.py
Capa 4 — CRUD de Proyectos (Fase 4)
Objetivo

Permitir gestionar proyectos desde el panel administrativo.

Operaciones CRUD

Se implementarán las siguientes vistas:

Listar proyectos
Crear proyecto
Editar proyecto
Eliminar proyecto
Vistas recomendadas

Se utilizarán Class Based Views (CBV).

Ejemplos:

ProjectListView
ProjectCreateView
ProjectUpdateView
ProjectDeleteView
Rutas esperadas
/dashboard/projects
/dashboard/projects/create
/dashboard/projects/edit/<id>
/dashboard/projects/delete/<id>
Capa 5 — Formularios de Gestión (Fase 5)
Objetivo

Crear formularios para manejar la creación y edición de proyectos.

Formulario principal

Archivo:

adminpanel/forms.py

Formulario:

ProjectForm

Campos gestionados:

title
description
image
category
github_url
project_url
date
Capa 6 — Gestión de Media (Fase 6)
Objetivo

Administrar imágenes y archivos asociados a proyectos.

Funcionalidades
Subida de imágenes
Vista previa de imágenes
Reemplazo de imágenes
Eliminación de imágenes
Ubicación de archivos

Los archivos se almacenarán en:

media/projects/

Configuración en:

settings.py
Capa 7 — Seguridad y Validación (Fase 7)
Objetivo

Fortalecer la seguridad del sistema administrativo.

Mejoras de seguridad

Implementar:

control de permisos
validación de archivos
limitación de tipos de imagen
protección de vistas
Validaciones recomendadas

Validar:

tipo de archivo
tamaño de imagen
extensiones permitidas
Flujo final del panel

El sistema completo funcionará así:

/dashboard/login

/dashboard
/dashboard/projects
/dashboard/projects/create
/dashboard/projects/edit/<id>
/dashboard/projects/delete/<id>
Beneficios de esta arquitectura

Este enfoque permite:

Desarrollo modular
Escalabilidad
Mantenimiento sencillo
Separación clara de responsabilidades

Además demuestra dominio de:

Arquitectura Django
Diseño por capas
CRUD profesional
Gestión de media
Seguridad web