# Portafolio - Django Project

Personal portfolio web application built with Django.

## Tech Stack

- Python 3.13
- Django 5.2.4
- SQLite (default local database)
- HTML templates + static CSS/JS

## Project Structure

- `JosePortafolio/`: Main Django project settings and global URLs.
- `core/`: Public pages (home, about, services, contact, metodologia).
- `projects/`: Project model, public listing/detail, and staff CRUD.
- `adminpanel/`: Staff dashboard.
- `templates/`: All HTML templates.
- `static/`: CSS, JS, and image assets.
- `media/`: Uploaded media files (project images).

## Requirements

- Python 3.11+ (tested with 3.13)
- pip

## Quick Start (Windows)

1. Create and activate virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run migrations:

```powershell
python manage.py migrate
```

4. Create admin user (optional but recommended):

```powershell
python manage.py createsuperuser
```

5. Start server:

```powershell
python manage.py runserver
```

6. Open in browser:

- `http://127.0.0.1:8000/`

## Quick Start (macOS/Linux)

1. Create and activate virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run migrations:

```bash
python manage.py migrate
```

4. Start server:

```bash
python manage.py runserver
```

## Useful Commands

- Django checks:

```bash
python manage.py check
```

- Show migrations state:

```bash
python manage.py showmigrations
```

- Collect static files (production):

```bash
python manage.py collectstatic
```

## Environment Variables

Configured in `JosePortafolio/settings.py`:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `SECURE_HSTS_SECONDS`
- `SECURE_HSTS_INCLUDE_SUBDOMAINS`
- `SECURE_HSTS_PRELOAD`
- `SECURE_SSL_REDIRECT`
- `SESSION_COOKIE_SECURE`
- `CSRF_COOKIE_SECURE`

Defaults are set for local development.

Important:
- `.env` is not loaded automatically by Django when using `os.getenv`.
- Use `.env.example` as the template of required variables.
- For PythonAnywhere, load `.env` from the WSGI file using `python-dotenv`.

## GitHub Hygiene

- Do not commit `.env`.
- Do commit `.env.example`.
- Do not commit `db.sqlite3`, `media/`, or `staticfiles/`.
- Keep virtual environments and cache folders out of Git.

## Deploy on PythonAnywhere

### 1) Create virtual environment and install dependencies

```bash
python3.13 -m venv ~/.virtualenvs/portafolio
source ~/.virtualenvs/portafolio/bin/activate
pip install -r /home/tuusuario/Portafolio/requirements.txt
```

### 2) Configure environment variables in `.env`

Create `/home/tuusuario/Portafolio/.env` (do not commit it) based on `.env.example`.

Example values for production:

```env
SECRET_KEY=una-clave-larga-y-segura
DEBUG=False
ALLOWED_HOSTS=tuusuario.pythonanywhere.com
CSRF_TRUSTED_ORIGINS=https://tuusuario.pythonanywhere.com
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=False
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 3) WSGI example for PythonAnywhere (with `python-dotenv`)

Edit your PythonAnywhere WSGI file (for example: `/var/www/tuusuario_pythonanywhere_com_wsgi.py`):

```python
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

project_home = Path('/home/tuusuario/Portafolio')
if str(project_home) not in sys.path:
	sys.path.insert(0, str(project_home))

load_dotenv(project_home / '.env')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'JosePortafolio.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 4) Run management commands on PythonAnywhere

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 5) Static files mapping in PythonAnywhere Web tab

- URL: `/static/` -> Directory: `/home/tuusuario/Portafolio/staticfiles`
- URL: `/media/` -> Directory: `/home/tuusuario/Portafolio/media`

## Authentication and Admin

- Login URL: `/login/`
- Django admin: `/admin/`
- Staff dashboard: `/adminpanel/dashboard/`

## Notes

- Local DB file: `db.sqlite3`
- Uploaded files are stored under `media/projects/`
- Do not use `runserver` in production.
