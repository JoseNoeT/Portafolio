from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect

from analytics.models import AnalyticsEvent
from analytics.services import (
    get_request_identity,
    get_session_hash,
    is_bot_request,
)
from core.models import SiteSettings
from projects.models import Project


ALLOWED_OUTBOUND_EVENTS = {
    'github_click': 'github_url',
    'demo_click': 'live_url',
}


ALLOWED_CONTACT_EVENTS = {
    'email_click',
    'phone_click',
    'whatsapp_click',
    'linkedin_click',
}


def _should_record_event(request):
    user = getattr(request, 'user', None)

    if user and user.is_authenticated and user.is_staff:
        return False

    if is_bot_request(request):
        return False

    return True


def _record_event(request, event_type, project=None):
    if not _should_record_event(request):
        return

    ip_hash, user_agent_hash, visitor_hash = get_request_identity(
        request
    )

    session_hash = get_session_hash(visitor_hash)

    AnalyticsEvent.objects.create(
        event_type=event_type,
        path=(request.META.get('HTTP_REFERER', '') or request.path)[:255],
        project=project,
        referrer=(request.META.get('HTTP_REFERER', '') or '')[:500],
        ip_hash=ip_hash,
        user_agent_hash=user_agent_hash,
        visitor_hash=visitor_hash,
        session_hash=session_hash,
    )


def outbound_event(request, event_type, slug):
    if event_type not in ALLOWED_OUTBOUND_EVENTS:
        raise Http404

    project = get_object_or_404(Project, slug=slug)

    destination_field = ALLOWED_OUTBOUND_EVENTS[event_type]
    destination = getattr(project, destination_field, '')

    if not destination:
        raise Http404

    _record_event(
        request,
        event_type,
        project=project,
    )

    return redirect(destination)


def contact_outbound_event(request, event_type):
    if event_type not in ALLOWED_CONTACT_EVENTS:
        raise Http404

    settings_obj = SiteSettings.get_solo()

    whatsapp_digits = ''.join(
        char
        for char in settings_obj.whatsapp_number
        if char.isdigit()
    )

    destinations = {
        'email_click': (
            f'mailto:{settings_obj.contact_email}'
            if settings_obj.contact_email
            else ''
        ),
        'phone_click': (
            f'tel:{settings_obj.contact_phone}'
            if settings_obj.contact_phone
            else ''
        ),
        'whatsapp_click': (
            f'https://wa.me/{whatsapp_digits}'
            if whatsapp_digits
            else ''
        ),
        'linkedin_click': settings_obj.linkedin_url or '',
    }

    destination = destinations[event_type]

    if not destination:
        raise Http404

    _record_event(
        request,
        event_type,
        project=None,
    )

    if event_type in {'email_click', 'phone_click'}:
        response = HttpResponse(status=302)
        response['Location'] = destination
        return response

    return redirect(destination)
