import tempfile
import unittest
from pathlib import Path

from scripts.build_home_css import expand, render


class HomeCSSBuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.css = Path(self.temp.name) / 'static/css'
        self.css.mkdir(parents=True)

    def write(self, name, text):
        path = self.css / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def test_nested_imports_keep_last_duplicate_in_cascade_order(self):
        self.write('entry.css', '@import url("nested/list.css?v=1");\n@import url("a.css");')
        self.write('nested/list.css', '@import url("../a.css");\n@import url("../b.css");')
        self.write('a.css', '.a {color: red}')
        self.write('b.css', '.b {color: blue}')
        sources = expand(('entry.css',), self.css)
        self.assertEqual([p.name for p, _ in sources], ['b.css', 'a.css'])
        output = render(('entry.css',), self.css / 'generated/home.css', self.css)
        self.assertNotIn('@import', output)
        self.assertEqual(output.count('.a {'), 1)

    def test_asset_urls_are_rebased_and_external_urls_preserved(self):
        image = self.css.parent / 'img/logo.svg'
        image.parent.mkdir()
        image.write_text('<svg/>')
        self.write('nested/a.css', '.a {background:url("../../img/logo.svg?v=2#icon")} '
                   '.b {src:url("https://example.com/font.woff2")}')
        result = render(('nested/a.css',), self.css / 'generated/home.css', self.css)
        self.assertIn('url("../../img/logo.svg?v=2#icon")', result)
        self.assertIn('https://example.com/font.woff2', result)

    def test_cycles_and_conditional_imports_fail(self):
        self.write('a.css', '@import url("b.css");')
        self.write('b.css', '@import url("a.css");')
        with self.assertRaisesRegex(ValueError, 'cycle'):
            expand(('a.css',), self.css)
        self.write('a.css', '@import url("b.css") screen;')
        with self.assertRaisesRegex(ValueError, 'directive'):
            expand(('a.css',), self.css)

    def test_missing_asset_fails_before_build(self):
        self.write('a.css', '.a {background:url("missing.webp")}')
        with self.assertRaisesRegex(ValueError, 'Missing'):
            render(('a.css',), self.css / 'generated/home.css', self.css)
