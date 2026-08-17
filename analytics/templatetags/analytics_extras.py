from urllib.parse import urlparse

from django import template

from projects.models import Project


register = template.Library()


def _page_name(path):
    normalized_path = (path or '').strip()

    page_names = {
        '/': 'Inicio',
        '/projects': 'Proyectos',
        '/projects/': 'Proyectos',
        '/about/': 'Sobre mí',
        '/contact/': 'Contacto',
        '/servicios/': 'Servicios',
        '/metodologia/': 'Metodología',
    }

    if normalized_path in page_names:
        return page_names[normalized_path]

    if normalized_path.startswith('/projects/'):
        parts = normalized_path.strip('/').split('/')

        if len(parts) >= 2:
            slug = parts[1]

            project = (
                Project.objects
                .filter(slug=slug)
                .only('title')
                .first()
            )

            if project:
                return f'Proyecto: {project.title}'

        return 'Proyecto'

    return 'Otra página'


@register.filter
def analytics_page_name(path):
    """Muestra nombres comprensibles en vez de rutas internas."""
    return _page_name(path)


@register.filter
def analytics_source_name(referrer):
    """Traduce la página de origen a una descripción comprensible."""
    if not referrer:
        return 'Acceso directo'

    try:
        parsed = urlparse(referrer)
        hostname = (parsed.hostname or '').lower()
        path = parsed.path or '/'

        own_hosts = {
            '127.0.0.1',
            'localhost',
            'josemnoedev.pythonanywhere.com',
        }

        if hostname in own_hosts:
            return _page_name(path)

        if 'google.' in hostname:
            return 'Google'

        if 'linkedin.com' in hostname:
            return 'LinkedIn'

        if 'github.com' in hostname:
            return 'GitHub'

        if 'bing.com' in hostname:
            return 'Bing'

        if hostname:
            return hostname

    except (TypeError, ValueError):
        pass

    return 'Origen externo'
