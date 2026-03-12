# INFORME TÉCNICO BACKEND – ADMINPANEL

---

## 1. Resumen general

`adminpanel` es un módulo Django que implementa un panel de administración personalizado para gestionar los proyectos del portafolio. Su responsabilidad principal es ofrecer un dashboard autenticado donde el propietario del sitio puede ver estadísticas de proyectos y acceder a acciones CRUD (crear, editar, eliminar).

**Componentes backend que lo conforman:**

| Componente | Ubicación |
|---|---|
| App Django | `adminpanel/` |
| Vistas CRUD de proyectos | `projects/views.py` |
| Modelo de datos | `projects/models.py` |
| Formulario inline | `projects/views.py` (clase `ProjectForm`) |
| Templates admin | `templates/adminpanel/dashboard.html` |
| Templates CRUD | `templates/projects/create.html`, `edit.html`, `delete.html` |

**Estado general:** Funcional pero con deficiencias críticas de seguridad. Las vistas de creación, edición y eliminación de proyectos no tienen ninguna protección de autenticación ni permisos. La arquitectura es mínima y viable para un MVP, pero no está lista para producción.

---

## 2. Estructura encontrada

### Archivos del módulo `adminpanel/`

| Archivo | Rol |
|---|---|
| `__init__.py` | Archivo vacío, marca el directorio como paquete Python |
| `apps.py` | Configuración estándar de la app (`AdminPanelConfig`) |
| `urls.py` | Define 1 ruta: `/adminpanel/dashboard/` → `DashboardView` |
| `views.py` | Define `DashboardView` (única vista del módulo) |

### Archivos que NO existen en `adminpanel/`

- `models.py` — No existe. El módulo depende directamente de `projects.models.Project`
- `forms.py` — No existe. El formulario está definido inline en `projects/views.py`
- `admin.py` — No existe
- `mixins.py` — No existe
- `decorators.py` — No existe
- `serializers.py` — No existe
- `tests.py` — No existe

### Archivos relacionados fuera de `adminpanel/`

| Archivo | Rol en el panel |
|---|---|
| `projects/views.py` | Contiene `create_project`, `edit_project`, `delete_project` (sin protección) |
| `projects/urls.py` | Expone las rutas CRUD bajo `/projects/` |
| `projects/models.py` | Modelo `Project` con campos, validación de imagen y slug automático |
| `templates/adminpanel/dashboard.html` | Template del dashboard |
| `templates/projects/create.html` | Formulario de creación |
| `templates/projects/edit.html` | Formulario de edición |
| `templates/projects/delete.html` | Confirmación de eliminación |

### Relación entre componentes

```
/adminpanel/dashboard/
    → DashboardView (LoginRequiredMixin + TemplateView)
        → Consulta Project.objects.all()
        → Renderiza adminpanel/dashboard.html
            → Enlaces a project_create, project_edit, project_delete

/projects/create/
    → create_project() [SIN PROTECCIÓN]
        → ProjectForm (inline en views.py)
        → Renderiza projects/create.html

/projects/<slug>/edit/
    → edit_project() [SIN PROTECCIÓN]

/projects/<slug>/delete/
    → delete_project() [SIN PROTECCIÓN]
```

---

## 3. Análisis de rutas

### Rutas de `adminpanel/urls.py`

| Ruta | Vista | Name | Protección |
|---|---|---|---|
| `adminpanel/dashboard/` | `DashboardView` | `dashboard` | `LoginRequiredMixin` |

### Rutas CRUD en `projects/urls.py`

| Ruta | Vista | Name | Protección |
|---|---|---|---|
| `projects/` | `list_projects` | `projects_list` | Ninguna (pública, correcto) |
| `projects/create/` | `create_project` | `project_create` | **Ninguna** |
| `projects/<slug>/edit/` | `edit_project` | `project_edit` | **Ninguna** |
| `projects/<slug>/delete/` | `delete_project` | `project_delete` | **Ninguna** |
| `projects/<slug>/` | `project_detail` | `project_detail` | Ninguna (pública, correcto) |

### Problemas encontrados

1. **Las rutas CRUD están bajo `/projects/`**, no bajo `/adminpanel/`. Esto significa que las URLs de administración son públicamente predecibles: `/projects/create/`, `/projects/<slug>/edit/`, `/projects/<slug>/delete/`.
2. **No hay namespace** en ninguno de los `include()`. Si el proyecto crece, podría haber colisiones de nombres.
3. El nombre `dashboard` es genérico y no tiene prefijo de app (debería ser `adminpanel:dashboard` con namespace).

---

## 4. Análisis de vistas

### 4.1 `DashboardView`

| Atributo | Valor |
|---|---|
| **Nombre** | `DashboardView` |
| **Tipo** | `TemplateView` con `LoginRequiredMixin` |
| **Responsabilidad** | Mostrar estadísticas del panel: total de proyectos, últimos 5, fecha del último |
| **Modelo** | `Project` |
| **Formulario** | Ninguno |
| **Template** | `adminpanel/dashboard.html` |
| **Protección** | `LoginRequiredMixin` con `login_url = "/admin/login/"` |

**Observaciones:**
- Implementación correcta de la lógica de contexto.
- Consulta duplicada: `projects.count()` y `projects.first()` hacen 2 queries cuando podrían resolverse en 1 con la queryset ya evaluada.
- No valida si el usuario es staff o superusuario. Cualquier usuario autenticado (incluyendo cuentas comunes si existieran) puede acceder al dashboard.
- `login_url` está hardcodeado como string absoluto en vez de usar `settings.LOGIN_URL` o `reverse_lazy`.

### 4.2 `create_project`

| Atributo | Valor |
|---|---|
| **Nombre** | `create_project` |
| **Tipo** | Function-based view |
| **Responsabilidad** | Crear un nuevo proyecto |
| **Modelo** | `Project` |
| **Formulario** | `ProjectForm` (inline, `ModelForm`) |
| **Template** | `projects/create.html` |
| **Protección** | **Ninguna** |

**Problemas críticos:**
- Sin `@login_required` ni ningún decorador de protección.
- Cualquier visitante anónimo puede acceder a `/projects/create/` y crear proyectos.
- El formulario `ProjectForm` solo incluye `['title', 'short_description', 'description', 'category', 'technologies']` — falta `image`, `github_url`, `live_url`.
- Usa `slugify()` manualmente en la vista, pero **no importa `slugify`** desde `django.utils.text`. Esto provocaría un `NameError` en runtime si el modelo no lo maneja internamente (el modelo sí lo maneja en `save()`, lo que hace redundante el código de la vista).
- No usa `messages` para informar al usuario del resultado.
- Redirige a `projects_list` en vez de `dashboard`.

### 4.3 `edit_project`

| Atributo | Valor |
|---|---|
| **Nombre** | `edit_project` |
| **Tipo** | Function-based view |
| **Responsabilidad** | Editar un proyecto existente |
| **Modelo** | `Project` |
| **Formulario** | `ProjectForm` (inline) |
| **Template** | `projects/edit.html` |
| **Protección** | **Ninguna** |

**Problemas críticos:**
- Sin protección de autenticación.
- Cualquier visitante puede modificar cualquier proyecto conociendo el slug.
- Redirige a `dashboard` después de guardar, pero no verifica que el usuario tenga acceso al dashboard.
- No usa `messages`.

### 4.4 `delete_project`

| Atributo | Valor |
|---|---|
| **Nombre** | `delete_project` |
| **Tipo** | Function-based view |
| **Responsabilidad** | Eliminar un proyecto |
| **Modelo** | `Project` |
| **Template** | `projects/delete.html` |
| **Protección** | **Ninguna** |

**Problemas críticos:**
- Sin protección de autenticación.
- Cualquier visitante puede eliminar cualquier proyecto con un POST a `/projects/<slug>/delete/`.
- No usa `messages`.
- No hay confirmación adicional ni doble verificación.

---

## 5. Autenticación y control de acceso

### Cómo funciona actualmente

| Aspecto | Estado |
|---|---|
| Acceso al dashboard | Protegido con `LoginRequiredMixin` |
| Login | Redirige a `/admin/login/` (Django admin) |
| Logout | No implementado en `adminpanel` (depende de Django admin) |
| Crear proyecto | **Sin protección** |
| Editar proyecto | **Sin protección** |
| Eliminar proyecto | **Sin protección** |
| Control por roles | **No existe** |
| Control por permisos | **No existe** |
| `LOGIN_URL` en settings | **No definido** |
| `LOGIN_REDIRECT_URL` en settings | **No definido** |

### Flujo de acceso actual

1. Usuario accede a `/adminpanel/dashboard/`
2. `LoginRequiredMixin` verifica `request.user.is_authenticated`
3. Si no está autenticado → redirige a `/admin/login/?next=/adminpanel/dashboard/`
4. Si está autenticado → muestra el dashboard (sin verificar si es staff/superuser)
5. Desde el dashboard, los enlaces a crear/editar/eliminar van a rutas bajo `/projects/` que **no tienen ninguna protección**

### Debilidades de seguridad

1. **Las vistas CRUD son completamente públicas.** Un atacante puede crear, modificar o eliminar proyectos sin autenticarse.
2. **No hay verificación de roles.** Si el proyecto tuviera múltiples usuarios, cualquier usuario autenticado accedería al dashboard.
3. **No hay vista propia de login/logout.** Depende del admin de Django, lo que acopla la autenticación del panel personalizado al admin de Django.
4. **No hay `LOGIN_URL` global.** Si se agrega otra vista protegida sin `login_url` explícito, Django usaría el default `/accounts/login/` que no existe.

---

## 6. Modelos y lógica de datos

### Modelo `Project`

```
Project
├── title          CharField(200)
├── slug           SlugField(unique, auto-generado)
├── short_description  CharField(300)
├── description    TextField
├── category       CharField(20, choices)
├── technologies   CharField(255, comma-separated)
├── github_url     URLField(blank)
├── live_url       URLField(blank)
├── image          ImageField(validators)
├── created_at     DateTimeField(auto_now_add)
└── updated_at     DateTimeField(auto_now)
```

**Observaciones:**
- El modelo está bien estructurado para un portafolio.
- Validación de imagen (tamaño max 5MB, extensiones permitidas) correctamente implementada.
- `slug` se auto-genera en `save()` a partir de `title` — correcto.
- `technologies` como `CharField` con valores separados por coma es funcional pero no normalizado. Adecuado para el alcance del proyecto.
- `ordering = ['-created_at']` en `Meta` — correcto.
- No existe un campo `tech_list` — se calcula en las vistas al vuelo. Esto es lógica de presentación que debería estar en el modelo como `@property`.

**Interacción modelo-vistas:**
- `DashboardView` consulta `Project.objects.all().order_by('-created_at')` — el `order_by` es redundante porque `Meta.ordering` ya lo define.
- Las vistas CRUD usan `get_object_or_404(Project, slug=slug)` — correcto.
- `create_project` hace `form.save(commit=False)` y luego asigna slug manualmente, pero `Project.save()` ya genera el slug. Código redundante con riesgo de `NameError` si `slugify` no está importado.

---

## 7. Formularios y validaciones

### `ProjectForm` (definido inline en `projects/views.py`)

```python
class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'short_description', 'description', 'category', 'technologies']
```

**Problemas:**

1. **Campos incompletos.** Faltan `image`, `github_url`, `live_url`. No se pueden subir imágenes ni agregar enlaces desde el formulario.
2. **Definido inline en views.py.** No sigue la convención Django de tener un `forms.py` separado. Dificulta reutilización y testing.
3. **Sin validaciones custom.** No hay `clean_title()`, `clean_technologies()` ni validaciones adicionales.
4. **Sin widgets personalizados.** Los campos se renderizan con `{{ form.as_p }}`, sin control sobre la presentación.
5. **`create_project` no pasa `request.FILES`.** Al crear un proyecto, `ProjectForm(request.POST)` no incluye archivos. Aunque el campo `image` no está en el formulario actualmente, si se agrega, no funcionará sin `request.FILES`.

---

## 8. Flujo funcional del backend

```
FLUJO ACTUAL:

1. ACCESO AL DASHBOARD
   Usuario → GET /adminpanel/dashboard/
   ├── ¿Autenticado? → NO → Redirect /admin/login/?next=/adminpanel/dashboard/
   │                         → Login en Django admin
   │                         → Redirect /adminpanel/dashboard/
   └── ¿Autenticado? → SÍ → DashboardView.get_context_data()
                              → Query: Project.objects.all().order_by('-created_at')
                              → Calcula: total_projects, recent_projects[:5], last_project_date
                              → Renderiza: adminpanel/dashboard.html

2. CREAR PROYECTO
   Dashboard → Click "Crear Proyecto" → GET /projects/create/
   ⚠️ SIN VERIFICACIÓN DE AUTENTICACIÓN
   → Renderiza projects/create.html con ProjectForm vacío
   → POST /projects/create/ con datos del formulario
   → form.is_valid() → save() → Redirect /projects/ (NO al dashboard)

3. EDITAR PROYECTO
   Dashboard → Click "Editar" → GET /projects/<slug>/edit/
   ⚠️ SIN VERIFICACIÓN DE AUTENTICACIÓN
   → get_object_or_404(Project, slug=slug)
   → Renderiza projects/edit.html con ProjectForm pre-poblado
   → POST → form.is_valid() → save() → Redirect /adminpanel/dashboard/

4. ELIMINAR PROYECTO
   Dashboard → Click "Eliminar" → GET /projects/<slug>/delete/
   ⚠️ SIN VERIFICACIÓN DE AUTENTICACIÓN
   → Renderiza projects/delete.html con confirmación
   → POST → project.delete() → Redirect /adminpanel/dashboard/

5. VER PROYECTOS (público)
   Cualquier usuario → GET /projects/ → list_projects()
   → Sin restricción → Renderiza projects/list.html
```

---

## 9. Revisión de seguridad

### Hallazgos críticos

| # | Vulnerabilidad | Gravedad | Detalle |
|---|---|---|---|
| 1 | **Vistas CRUD sin autenticación** | **CRÍTICA** | `create_project`, `edit_project`, `delete_project` no tienen `@login_required` ni ningún control de acceso. Cualquier visitante anónimo puede crear, modificar o eliminar proyectos. |
| 2 | **Sin control de permisos en el dashboard** | **ALTA** | `DashboardView` usa `LoginRequiredMixin` pero no verifica `is_staff` ni `is_superuser`. Cualquier cuenta autenticada puede acceder. |
| 3 | **`SECRET_KEY` con fallback inseguro** | **ALTA** | `SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')`. Si la variable de entorno no se define en producción, se usará una clave predecible. |
| 4 | **`DEBUG` con fallback a True** | **ALTA** | `DEBUG = os.getenv('DEBUG', 'True') == 'True'`. Si la variable no se define, DEBUG queda activado en producción, exponiendo stack traces y configuración interna. |
| 5 | **Sin rate limiting** | **MEDIA** | Las rutas CRUD no tienen protección contra abuso automatizado. |

### Aspectos correctos

| Aspecto | Estado |
|---|---|
| CSRF middleware | Activo (`CsrfViewMiddleware` en `MIDDLEWARE`) |
| CSRF tokens en templates | Presentes en create.html, edit.html, delete.html (`{% csrf_token %}`) |
| Clickjacking protection | Activo (`XFrameOptionsMiddleware`) |
| Session middleware | Activo (`SessionMiddleware`) |
| Validación de imagen | Implementada en el modelo (tamaño + extensión) |
| `get_object_or_404` | Usado correctamente, evita exposición de IDs internos |

---

## 10. Calidad de arquitectura

### Organización general

| Criterio | Evaluación |
|---|---|
| **Legibilidad** | Buena. El código es simple y directo. |
| **Modularidad** | Insuficiente. La lógica CRUD de administración vive en `projects/views.py` junto con las vistas públicas. No hay separación. |
| **Reutilización** | Baja. El formulario está inline, no en archivo propio. |
| **Separación de responsabilidades** | Débil. `adminpanel` solo tiene el dashboard; la lógica administrativa real (CRUD) está dispersa en `projects`. |
| **Escalabilidad** | Limitada. Agregar funcionalidad admin requiere modificar la app `projects`. |
| **Testing** | Inexistente. No hay tests para ninguna vista ni modelo del panel. |

### Deuda técnica identificada

1. **Formulario inline en views.py** — Debería estar en `projects/forms.py` o `adminpanel/forms.py`.
2. **Lógica `tech_list` repetida** en `list_projects` y `project_detail` — Debería ser un `@property` en el modelo.
3. **Consulta redundante en DashboardView** — `order_by('-created_at')` ya está en `Meta.ordering`.
4. **`slugify` no importado en views.py** — El código de slug manual en `create_project` tiene un import faltante (funciona porque el modelo lo resuelve en `save()`).
5. **Estilos inline en dashboard.html** — El template usa múltiples atributos `style=""` en vez de clases CSS.

---

## 11. Problemas encontrados

| # | Problema | Impacto | Gravedad | Recomendación |
|---|---|---|---|---|
| 1 | Vistas `create_project`, `edit_project`, `delete_project` sin autenticación | Cualquier visitante puede modificar datos | **CRÍTICA** | Agregar `@login_required` + `@user_passes_test(lambda u: u.is_staff)` |
| 2 | Dashboard accesible para cualquier usuario autenticado | Usuarios no autorizados pueden ver el panel | **ALTA** | Agregar `UserPassesTestMixin` con verificación `is_staff` |
| 3 | `SECRET_KEY` con fallback predecible | Firmado de sesiones y tokens comprometido en producción | **ALTA** | Eliminar fallback, fallar si no existe la env var |
| 4 | `DEBUG=True` como fallback | Exposición de información sensible en producción | **ALTA** | Cambiar default a `False` |
| 5 | `ProjectForm` sin campo `image` | No se pueden subir imágenes desde el panel | **MEDIA** | Agregar campo + `request.FILES` en la vista |
| 6 | `ProjectForm` sin campos `github_url`, `live_url` | No se pueden gestionar enlaces desde el panel | **MEDIA** | Agregar campos al formulario |
| 7 | Formulario definido inline en `views.py` | Dificulta mantenimiento y testing | **MEDIA** | Mover a `forms.py` |
| 8 | `slugify` no importado en `create_project` | Potencial `NameError` si se ejecuta el path del slug manual | **MEDIA** | Eliminar código redundante o importar |
| 9 | No se usa framework `messages` | El usuario no recibe feedback de sus acciones | **BAJA** | Agregar `messages.success()` / `messages.error()` |
| 10 | Sin `LOGIN_URL` en settings | Otras vistas protegidas usarían URL por defecto inexistente | **BAJA** | Definir `LOGIN_URL = '/admin/login/'` en settings |
| 11 | Dashboard con estilos inline | Inconsistencia con el sistema CSS del proyecto | **BAJA** | Migrar a clases CSS del design system |
| 12 | Sin tests | No hay verificación automatizada de lógica ni seguridad | **MEDIA** | Crear tests para vistas, permisos y formularios |

---

## 12. Fortalezas encontradas

| # | Fortaleza | Razón |
|---|---|---|
| 1 | Uso de `LoginRequiredMixin` en `DashboardView` | Patrón correcto de Django para protección de vistas CBV |
| 2 | Modelo `Project` bien estructurado | Campos apropiados, validación de imagen, slug automático, choices para categoría |
| 3 | CSRF correctamente implementado | Middleware activo + tokens en todos los formularios POST |
| 4 | `get_object_or_404` en vistas CRUD | Previene enumeración de objetos y maneja 404 correctamente |
| 5 | Separación de templates | Dashboard, create, edit y delete tienen templates propios |
| 6 | CBV para dashboard, FBV para CRUD | Elección pragmática adecuada para el alcance actual |
| 7 | `dj_database_url` para configuración DB | Permite cambiar base de datos por variable de entorno (deployment flexible) |
| 8 | `auto_now_add` / `auto_now` en timestamps | Auditoria de creación y modificación automática |

---

## 13. Recomendaciones de mejora

### Mejoras críticas (implementar inmediatamente)

1. **Proteger vistas CRUD con autenticación y permisos:**
   ```python
   from django.contrib.auth.decorators import login_required, user_passes_test

   def staff_required(view_func):
       return user_passes_test(lambda u: u.is_active and u.is_staff)(
           login_required(view_func, login_url='/admin/login/')
       )

   @staff_required
   def create_project(request): ...

   @staff_required
   def edit_project(request, slug): ...

   @staff_required
   def delete_project(request, slug): ...
   ```

2. **Agregar verificación `is_staff` al dashboard:**
   ```python
   from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

   class DashboardView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
       login_url = "/admin/login/"
       def test_func(self):
           return self.request.user.is_staff
   ```

3. **Corregir fallbacks de seguridad en settings:**
   ```python
   SECRET_KEY = os.environ['SECRET_KEY']  # Falla si no existe
   DEBUG = os.getenv('DEBUG', 'False') == 'True'  # Default seguro
   ```

### Mejoras recomendadas (prioridad alta)

4. **Crear `adminpanel/forms.py`** con `ProjectForm` completo (incluyendo `image`, `github_url`, `live_url`) y moverlo fuera de `views.py`.

5. **Agregar `request.FILES`** en las vistas de create/edit para soportar subida de imágenes.

6. **Definir `LOGIN_URL`** en settings.py:
   ```python
   LOGIN_URL = '/admin/login/'
   ```

7. **Agregar mensajes de feedback** con el framework `messages`:
   ```python
   from django.contrib import messages
   messages.success(request, "Proyecto creado correctamente.")
   ```

8. **Agregar `@property tech_list`** al modelo `Project` para eliminar lógica duplicada en vistas:
   ```python
   @property
   def tech_list(self):
       return [t.strip() for t in self.technologies.split(",")] if self.technologies else []
   ```

### Mejoras futuras (cuando el proyecto escale)

9. **Mover vistas CRUD administrativas** a `adminpanel/views.py` para separar la lógica pública de la administrativa.

10. **Implementar namespaces** en URL configs:
    ```python
    path('adminpanel/', include('adminpanel.urls', namespace='adminpanel')),
    ```

11. **Crear tests unitarios** para vistas, formularios y permisos.

12. **Implementar login/logout propio** del panel, separado del Django admin, con templates personalizados.

13. **Migrar estilos inline del dashboard** a clases del design system CSS.

---

## 14. Conclusión final

El backend del módulo `adminpanel` se encuentra en un estado funcional pero con una **vulnerabilidad de seguridad crítica**: las tres vistas de creación, edición y eliminación de proyectos están completamente expuestas sin autenticación. Esto significa que cualquier visitante del sitio puede manipular el contenido del portafolio.

La arquitectura es simple y pragmática, adecuada para un proyecto personal en desarrollo, pero necesita tres correcciones inmediatas antes de exponerlo en producción:

1. Proteger las vistas CRUD con `@login_required` + verificación `is_staff`
2. Agregar verificación de permisos en el dashboard
3. Corregir los fallbacks de `SECRET_KEY` y `DEBUG` en settings

El modelo de datos está bien diseñado, el uso de CSRF es correcto, y la estructura general del proyecto es clara. Con las correcciones de seguridad aplicadas y la reorganización del formulario, el módulo estará en condiciones sólidas para producción.

**Calificación general del backend de adminpanel:** 4/10 (funcional pero inseguro)
**Calificación proyectada tras correcciones críticas:** 7.5/10
