from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class MainNavigationParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self._in_menu = False
        self._menu_depth = 0
        self._in_link = False
        self._link_depth = 0
        self._current_link = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "nav" and attributes.get("id") == "menu":
            self._in_menu = True
            self._menu_depth = 1
            return
        if self._in_menu:
            self._menu_depth += 1
            if tag == "a":
                self._in_link = True
                self._link_depth = 1
                self._current_link = []
            elif self._in_link:
                self._link_depth += 1

    def handle_endtag(self, tag):
        if self._in_menu and self._in_link:
            self._link_depth -= 1
            if tag == "a" and self._link_depth == 0:
                self.links.append("".join(self._current_link).strip())
                self._in_link = False
        if self._in_menu:
            self._menu_depth -= 1
            if tag == "nav" and self._menu_depth == 0:
                self._in_menu = False

    def handle_data(self, data):
        if self._in_link:
            self._current_link.append(data)


def main_nav(path):
    parser = MainNavigationParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return [" ".join(link.split()) for link in parser.links]


class MainNavigationTests(unittest.TestCase):
    def test_portuguese_and_english_pages_keep_guides_before_about(self):
        pages = [*ROOT.joinpath("pt").rglob("*.html"), *ROOT.joinpath("en").rglob("*.html")]
        self.assertGreater(len(pages), 0)

        for page in pages:
            with self.subTest(page=page.relative_to(ROOT)):
                nav = main_nav(page)
                if nav:
                    expected_prefix = (
                        ["01Início", "02Serviços", "03Para quem", "04Guias", "05Sobre nós"]
                        if "pt" in page.parts
                        else ["01Home", "02Services", "03Who we serve", "04Guides", "05About us"]
                    )
                    self.assertEqual(nav[:5], expected_prefix)

    def test_about_pages_keep_the_guides_link(self):
        self.assertIn("04Guias", main_nav(ROOT / "pt" / "sobre.html"))
        self.assertIn("04Guides", main_nav(ROOT / "en" / "about.html"))


if __name__ == "__main__":
    unittest.main()
