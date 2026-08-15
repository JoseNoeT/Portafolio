import hashlib

from django.db.models import Q

from analytics.models import PageView, ProjectView


IGNORED_ANALYTICS_PREFIXES = (
    '/static/',
    '/media/',
    '/admin/',
    '/adminpanel/',
    '/login/',
    '/logout/',
    '/api/',
)

IGNORED_ANALYTICS_PATHS = (
    '/favicon.ico',
    '/robots.txt',
)

IGNORED_ANALYTICS_EXTENSIONS = (
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.ico',
    '.map',
)

BOT_USER_AGENT_MARKERS = (
    'bot',
    'crawler',
    'spider',
    'slurp',
    'bingpreview',
    'facebookexternalhit',
    'linkedinbot',
    'twitterbot',
    'discordbot',
    'whatsapp',
    'telegrambot',
    'headlesschrome',
    'python-requests',
    'curl/',
    'wget/',
)


def get_client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()

    return request.META.get('REMOTE_ADDR', '')


def hash_value(value):
    normalized = (value or '').strip().encode('utf-8')
    return hashlib.sha256(normalized).hexdigest()


def is_bot_request(request):
    user_agent = (
        request.META.get('HTTP_USER_AGENT', '') or ''
    ).lower().strip()

    if not user_agent:
        return False

    return any(
        marker in user_agent
        for marker in BOT_USER_AGENT_MARKERS
    )


def is_ignored_analytics_path(path):
    normalized_path = (path or '').lower().strip()

    if normalized_path in IGNORED_ANALYTICS_PATHS:
        return True

    if normalized_path.endswith(IGNORED_ANALYTICS_EXTENSIONS):
        return True

    for prefix in IGNORED_ANALYTICS_PREFIXES:
        prefix_without_slash = prefix.rstrip('/')

        if normalized_path == prefix_without_slash:
            return True

        if normalized_path.startswith(prefix):
            return True

    return False


def ignored_pageview_filter():
    query = Q()

    for path in IGNORED_ANALYTICS_PATHS:
        query |= Q(path__iexact=path)

    for extension in IGNORED_ANALYTICS_EXTENSIONS:
        query |= Q(path__iendswith=extension)

    for prefix in IGNORED_ANALYTICS_PREFIXES:
        prefix_without_slash = prefix.rstrip('/')

        query |= Q(path__iexact=prefix_without_slash)
        query |= Q(path__istartswith=prefix)

    return query


def get_visible_pageviews_queryset():
    return PageView.objects.exclude(
        ignored_pageview_filter()
    )


def should_track_request(request):
    if request.method != 'GET':
        return False

    user = getattr(request, 'user', None)

    if user and user.is_authenticated and user.is_staff:
        return False

    if is_ignored_analytics_path(request.path or ''):
        return False

    if is_bot_request(request):
        return False

    return True


def track_page_view(request, page_title=''):
    if not should_track_request(request):
        return

    PageView.objects.create(
        path=(request.path or '')[:255],
        page_title=(page_title or '')[:255],
        method=request.method,
        referrer=(
            request.META.get('HTTP_REFERER', '') or ''
        )[:500],
        user_agent_hash=hash_value(
            request.META.get('HTTP_USER_AGENT', '')
        ),
        ip_hash=hash_value(get_client_ip(request)),
    )


def track_project_view(request, project):
    if not should_track_request(request):
        return

    ProjectView.objects.create(
        project=project,
        ip_hash=hash_value(get_client_ip(request)),
        user_agent_hash=hash_value(
            request.META.get('HTTP_USER_AGENT', '')
        ),
    )

