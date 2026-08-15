from django.http import Http404
from django.shortcuts import get_object_or_404, redirect

from analytics.models import AnalyticsEvent
from analytics.services import (
    get_request_identity,
    get_session_hash,
    is_bot_request,
)
from projects.models import Project


ALLOWED_OUTBOUND_EVENTS = {
    'github_click': 'github_url',
    'demo_click': 'live_url',
}


def outbound_event(request, event_type, slug):
    if event_type not in ALLOWED_OUTBOUND_EVENTS:
        raise Http404

    project = get_object_or_404(Project, slug=slug)

    destination_field = ALLOWED_OUTBOUND_EVENTS[event_type]
    destination = getattr(project, destination_field, '')

    if not destination:
        raise Http404

    user = getattr(request, 'user', None)

    should_record = not (
        user
        and user.is_authenticated
        and user.is_staff
    )

    if should_record and not is_bot_request(request):
        ip_hash, user_agent_hash, visitor_hash = get_request_identity(
            request
        )

        session_hash = get_session_hash(visitor_hash)

        AnalyticsEvent.objects.create(
            event_type=event_type,
            path=request.path[:255],
            project=project,
            referrer=(
                request.META.get('HTTP_REFERER', '') or ''
            )[:500],
            ip_hash=ip_hash,
            user_agent_hash=user_agent_hash,
            visitor_hash=visitor_hash,
            session_hash=session_hash,
        )

    return redirect(destination)
