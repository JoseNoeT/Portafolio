# Decisiones de Arquitectura

Este documento registra únicamente decisiones importantes del proyecto.

---

## DA-001

Fecha:

2026-07-21

Título:

Cloudinary será opcional.

Motivo:

El proyecto debe poder ejecutarse correctamente tanto en desarrollo local como en distintos proveedores de hosting.

Consecuencia:

El almacenamiento utilizará:

- Cloudinary cuando exista CLOUDINARY_URL.
- FileSystemStorage cuando no exista.

No se permitirá que un proveedor determine la arquitectura del proyecto.

Estado:

Aprobada.