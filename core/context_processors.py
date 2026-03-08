from django.conf import settings


def environment_flags(request):
    return {
        "APP_DEBUG": settings.DEBUG,
    }
