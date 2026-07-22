from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AboutPageConsistencyTests(unittest.TestCase):
    def test_portuguese_team_stat_matches_the_four_verified_team_cards(self):
        html = (ROOT / "pt" / "sobre.html").read_text(encoding="utf-8")

        self.assertIn('<b>4</b><span>Pessoas na equipa</span>', html)
        self.assertEqual(html.count('class="member team-profile-card'), 4)

    def test_portuguese_team_dialog_has_the_same_runtime_data_hooks_as_english(self):
        pt_html = (ROOT / "pt" / "sobre.html").read_text(encoding="utf-8")
        en_html = (ROOT / "en" / "about.html").read_text(encoding="utf-8")

        for hook in (
            "data-team-photo",
            "data-team-name",
            "data-team-role",
            "data-team-body",
            "data-team-close",
        ):
            self.assertIn(hook, pt_html)
            self.assertIn(hook, en_html)

    def test_about_pages_share_the_new_facade_and_the_verified_team(self):
        expected_people = {
            "Isabel Monteiro",
            "Gisela Oliveira",
            "Ana Fernandes",
            "Tatiana dos Santos",
        }

        for page in ("pt/sobre.html", "en/about.html"):
            html = (ROOT / page).read_text(encoding="utf-8")
            self.assertIn('../assets/fachada.jpeg?v=20260722', html)
            self.assertIn('width="400" height="300"', html)
            self.assertEqual(html.count('class="member team-profile-card'), 4)
            self.assertTrue(expected_people.issubset(set(
                person for person in expected_people if person in html
            )))
            self.assertNotIn('../assets/equipa/joana.jpg', html)
            self.assertNotIn('../assets/equipa/marta.jpg', html)
            self.assertNotIn('../assets/equipa/ritaneves.jpg', html)


if __name__ == "__main__":
    unittest.main()
