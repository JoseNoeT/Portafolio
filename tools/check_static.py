#!/usr/bin/env python3
import re, urllib.request, urllib.error, sys, time

time.sleep(1)
BASE = 'http://127.0.0.1:8000'

def fetch_code(url):
    try:
        r = urllib.request.urlopen(url, timeout=6)
        return r.getcode()
    except urllib.error.HTTPError as he:
        return he.code
    except Exception as e:
        return f'ERR:{e}'

try:
    resp = urllib.request.urlopen(BASE + '/', timeout=6)
    html = resp.read().decode('utf-8', errors='ignore')
    print('HOME', resp.getcode())
    urls = set(re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html))
    static_urls = [u for u in urls if '/static/' in u]
    if not static_urls:
        print('No se encontraron recursos estáticos en la página.')
    for u in sorted(static_urls):
        if u.startswith('/'):
            url = BASE + u
        elif u.startswith('http'):
            url = u
        else:
            url = BASE + '/' + u
        print(url, fetch_code(url))
except Exception as e:
    print('ERROR al obtener home:', e)
    sys.exit(0)
