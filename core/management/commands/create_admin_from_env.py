from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = 'Create or update a superuser from DJANGO_SUPERUSER_* environment variables'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

        if not (username and email and password):
            missing = [k for k, v in (
                ('DJANGO_SUPERUSER_USERNAME', username),
                ('DJANGO_SUPERUSER_EMAIL', email),
                ('DJANGO_SUPERUSER_PASSWORD', password),
            ) if not v]
            self.stdout.write(self.style.NOTICE(
                f"Superuser env vars missing ({', '.join(missing)}). Skipping create/update."
            ))
            return

        User = get_user_model()
        try:
            user = User.objects.filter(username=username).first()
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f'Error accessing user model: {exc}'))
            return

        if user:
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated existing superuser "{username}".'))
        else:
            try:
                User.objects.create_superuser(username=username, email=email, password=password)
                self.stdout.write(self.style.SUCCESS(f'Created superuser "{username}".'))
            except Exception as exc:
                self.stderr.write(self.style.ERROR(f'Failed to create superuser: {exc}'))
