import logging

from analytics.services import track_page_view


logger = logging.getLogger(__name__)


class AnalyticsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        try:
            # Solo registrar res puestas válidas.
            # Los errores 4xx y 5xx no deben contarse como visitas.
            if 200 <= response.status_code < 400:
                resolver_match = getattr(request, 'resolver_match', None)
                page_title = resolver_match.view_name if resolver_match else ''

                track_page_view(
                    request,
                    page_title=page_title or '',
                )

        except Exception:
            # Analytics nunca debe romper la navegación del portafolio.
            logger.exception('Analytics middleware failed')

        return response