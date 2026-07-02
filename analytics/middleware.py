import logging

from analytics.services import track_page_view


logger = logging.getLogger(__name__)


class AnalyticsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            resolver_match = getattr(request, 'resolver_match', None)
            page_title = resolver_match.view_name if resolver_match else ''
            track_page_view(request, page_title=page_title or '')
        except Exception:
            logger.exception('Analytics middleware failed')
        return response
