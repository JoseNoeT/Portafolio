from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.db import transaction
from django.conf import settings
import os
import shutil

from projects.models import Project


REPOS = [
    {
        'title': 'Portafolio',
        'github_url': 'https://github.com/JoseNoeT/Portafolio',
        'short_description': 'Portfolio personal con casos de estudio y presentación de trabajos.',
        'description': 'Repositorio del portafolio personal: este sitio Django (portafolio) desplegado en Render que muestra casos de estudio y trabajos.',
        'category': 'personal',
        'technologies': 'Python, Django, HTML, CSS, JavaScript',
        'live_url': '',
        'image_filename': 'portafolio.png',
    },
    {
        'title': 'Ferramas',
        'github_url': 'https://github.com/JoseNoeT/Ferramas',
        'short_description': 'Proyecto académico/comercial tipo e-commerce o sistema para ferretería.',
        'description': 'Ferramas: sistema orientado a gestión y comercio para ferreterías (e-commerce / catálogo), desarrollo académico con enfoque práctico y comercial.',
        'category': 'academic',
        'technologies': 'Python, Django, HTML, CSS, JavaScript',
        'live_url': '',
        'image_filename': 'ferramas.jpg',
    },
    {
        'title': 'Campus360',
        'github_url': 'https://github.com/JoseNoeT/Campus360',
        'short_description': 'Plataforma educativa / proyecto académico.',
        'description': 'Campus360: proyecto orientado a experiencias educativas y campus virtual.',
        'category': 'academic',
        'technologies': 'Python, Web',
        'live_url': '',
        'image_filename': 'campus360.jpg',
    },
    {
        'title': 'bot-trading-cuantitativo',
        'github_url': 'https://github.com/JoseNoeT/bot-trading-cuantitativo',
        'short_description': 'Bot de trading cuantitativo (algoritmos y backtesting).',
        'description': 'Repositorio con código de algoritmos de trading cuantitativo y utilidades en Python.',
        'category': 'engineering',
        'technologies': 'Python',
        'live_url': '',
        'image_filename': 'bot-trading-cuantitativo.jpg',
    },
    {
        'title': 'TiendaBot',
        'github_url': 'https://github.com/JoseNoeT/TiendaBot',
        'short_description': 'Proyecto personal orientado a comercio automatizado.',
        'description': 'TiendaBot: código relacionado con automatización y bots para comercio/servicios.',
        'category': 'personal',
        'technologies': 'Python, Web',
        'live_url': '',
        'image_filename': 'tiendabot.jpg',
    },
    {
        'title': 'VoxyLibro',
        'github_url': 'https://github.com/JoseNoeT/VoxyLibro',
        'short_description': 'Proyecto personal orientado a lectura/educación.',
        'description': 'VoxyLibro: herramientas y utilidades enfocadas en contenidos educativos.',
        'category': 'personal',
        'technologies': 'Python, Web',
        'live_url': '',
        'image_filename': 'voxylibro.jpg',
    },
]


class Command(BaseCommand):
    help = 'Idempotent seed of projects from predefined GitHub repos (creates or updates).'

    def handle(self, *args, **options):
        created = 0
        updated = 0
        failed = 0

        for repo in REPOS:
            title = repo.get('title')
            github_url = repo.get('github_url')
            short_description = repo.get('short_description')
            description = repo.get('description')
            category = repo.get('category')
            technologies = repo.get('technologies')
            live_url = repo.get('live_url') or ''

            expected_slug = slugify(title) or None

            try:
                with transaction.atomic():
                    project = None
                    if github_url:
                        project = Project.objects.filter(github_url=github_url).first()

                    if not project and expected_slug:
                        project = Project.objects.filter(slug=expected_slug).first()

                    if project:
                        project.title = title
                        project.short_description = short_description
                        project.description = description
                        project.category = category
                        project.technologies = technologies
                        project.github_url = github_url
                        project.live_url = live_url
                        project.save()
                        updated += 1
                        self.stdout.write(self.style.SUCCESS(f'Updated project: {title}'))
                    else:
                        project = Project.objects.create(
                            title=title,
                            short_description=short_description,
                            description=description,
                            category=category,
                            technologies=technologies,
                            github_url=github_url,
                            live_url=live_url,
                        )
                        created += 1
                        self.stdout.write(self.style.SUCCESS(f'Created project: {title}'))
                    # NOTE: images for seeded projects are served from static files (static/img/projects/).
                    # Do NOT copy into MEDIA_ROOT or assign to ImageField to avoid /media/ dependency in production.
                    # If an admin uploads a custom image via the admin, it will still be used because templates
                    # prefer the static fallback and then the ImageField.
                    pass
            except Exception as exc:
                failed += 1
                self.stderr.write(self.style.ERROR(f'Failed project {title}: {exc}'))

        total = created + updated
        self.stdout.write('---')
        self.stdout.write(self.style.SUCCESS(f'Total created: {created}'))
        self.stdout.write(self.style.SUCCESS(f'Total updated: {updated}'))
        if failed:
            self.stderr.write(self.style.ERROR(f'Total failed: {failed}'))
        else:
            self.stdout.write(self.style.SUCCESS('No failures reported.'))
