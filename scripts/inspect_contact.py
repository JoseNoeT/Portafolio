import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'JosePortafolio.settings')
import django
django.setup()
from django.test import Client
from django.urls import reverse

c = Client()
url = reverse('contact')
resp = c.get(url)
print('URL:', url)
print('Status:', resp.status_code)
print('Location:', resp.get('Location'))
print('Content-Type:', resp.get('Content-Type'))
print('Headers:', dict(resp.items()))
print('Cookies:', resp.cookies)
