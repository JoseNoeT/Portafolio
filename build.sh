#!/usr/bin/env bash
set -euo pipefail

# Install dependencies, collect static files and run migrations.
pip install --no-cache-dir -r requirements.txt
python manage.py collectstatic --noinput
# Run migrations (do not hide errors; fail build if migrations fail).
python manage.py migrate --noinput
# Seed projects (idempotent) before admin creation
python manage.py seed_projects
# Create or update superuser from environment (optional; won't fail if vars missing)
python manage.py create_admin_from_env
