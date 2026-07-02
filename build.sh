#!/usr/bin/env bash
set -euo pipefail

# Install dependencies, collect static files and run migrations.
pip install --no-cache-dir -r requirements.txt
python manage.py collectstatic --noinput
# Run migrations (do not hide errors; fail build if migrations fail).
python manage.py migrate --noinput
