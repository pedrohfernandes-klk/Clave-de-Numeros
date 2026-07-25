from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree
from urllib.parse import unquote, urlsplit
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HOME_PAGES = {
    "pt": ROOT / "pt" / "index.html",
    "en": ROOT / "en" / "index.html",
}
EXPECTED_LAYERS = {
    "documents",
    "frame",
    "rows",
    "connectors",
    "validation",
    "signals",
}
EXPECTED_CLUSTERS = {
    "pt": (
        "Serviços 01 a 03",
        "Serviços 04 a 06",
        "Serviços 07 a 09",
    ),
    "en": (
        "Services 01 to 03",
        "Services 04 to 06",
        "Services 07 to 09",
    ),
}
EXPECTED_HERO_LABELS = {
    "pt": "Registos contabilísticos que se organizam num sistema claro e validado.",
    "en": "Accounting records organising into a clear, validated system.",
}
EXPECTED_SERVICE_CARDS = {
    "pt": (
        ("servicos.html#contabilidade-certificada", "01 Contabilidade Certificada Organização e tratamento da informação contabilística, reconciliação de contas e cumprimento das obrigações declarativas, com leitura regular da atividade. Ver ficha"),
        ("servicos.html#consultoria-fiscal", "02 Consultoria fiscal Análise do enquadramento e das implicações fiscais de decisões, alterações de atividade e operações relevantes, dentro da legislação aplicável. Ver ficha"),
        ("servicos.html#consultoria-gestao", "03 Consultoria de gestão Interpretação da informação contabilística, dos resultados, dos custos e da tesouraria para apoiar decisões de gestão mais informadas. Ver ficha"),
        ("servicos.html#acompanhamento-fiscal", "04 Acompanhamento fiscal e obrigações Acompanhamento de declarações, prazos e obrigações fiscais, com comunicação atempada dos elementos necessários. Ver ficha"),
        ("servicos.html#gestao-pessoal", "05 Processamento salarial e gestão administrativa de pessoal Processamento de vencimentos, recibos, declarações de remunerações e organização das obrigações administrativas associadas aos colaboradores. Ver ficha"),
        ("servicos.html#eni-irs", "06 ENI, trabalhadores independentes e IRS Acompanhamento da atividade, do enquadramento aplicável e das respetivas obrigações fiscais e declarações de IRS. Ver ficha"),
        ("servicos.html#negocios-online", "07 Negócios online Serviços contabilísticos e fiscais adaptados a plataformas digitais, diferentes meios de pagamento e prestação remota de serviços. Ver ficha"),
        ("servicos.html#projetos-investimento", "08 Projetos de investimento Recolha e organização de elementos, definição de pressupostos e preparação da informação necessária à análise de viabilidade. Ver ficha"),
        ("servicos.html#gestao-bens", "09 Gestão administrativa de bens e património Organização documental e acompanhamento administrativo de bens e património, com atenção às obrigações associadas. Ver ficha"),
    ),
    "en": (
        ("services.html#certified-accounting", "01 Certified Accounting Organisation and processing of accounting information, reconciliations and statutory obligations. See details"),
        ("services.html#tax-advisory", "02 Tax advisory Analysis of tax implications before decisions, changes or significant transactions. See details"),
        ("services.html#management-consulting", "03 Management consulting Interpretation of results, costs and cash flow to support decisions. See details"),
        ("services.html#tax-compliance", "04 Tax compliance and obligations Returns, deadlines and recurring tax obligations monitored throughout the year. See details"),
        ("services.html#payroll", "05 Payroll and HR administration Salary processing, payslips and related administrative obligations. See details"),
        ("services.html#sole-traders-irs", "06 Sole traders, freelancers and IRS Activity registration, tax framework and personal income tax obligations. See details"),
        ("services.html#online-businesses", "07 Online businesses Accounting and tax support for platforms, digital payments and remote services. See details"),
        ("services.html#investment-projects", "08 Investment projects Organisation of information and assumptions for feasibility analysis. See details"),
        ("services.html#asset-management", "09 Asset and property administration Document organisation and administrative monitoring of assets and property. See details"),
    ),
}


class HomepageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.objects = []
        self.links = []
        self.hrefs = []
        self.ids = set()
        self.scripts = []
        self.service_cards = []
        self.cluster_labels = []
        self._service_depth = 0
        self._service_text = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.add(attributes["id"])
        if tag == "object" and "data-homepage-hero-art" in attributes:
            self.objects.append(attributes)
        if tag == "link" and attributes.get("rel") == "stylesheet":
            self.links.append(attributes.get("href", ""))
        if tag == "script" and attributes.get("src"):
            self.scripts.append(attributes["src"])
        if tag == "a" and attributes.get("href"):
            self.hrefs.append(attributes["href"])
        if "service-cluster" in attributes.get("class", "").split():
            self.cluster_labels.append(attributes.get("aria-label", ""))
        if tag == "a" and "service-card" in attributes.get("class", "").split():
            self._service_depth = 1
            self._service_text = []
        elif self._service_depth:
            self._service_depth += 1

    def handle_endtag(self, tag):
        if self._service_depth:
            self._service_depth -= 1
            if tag == "a" and self._service_depth == 0:
                self.service_cards.append(" ".join("".join(self._service_text).split()))

    def handle_data(self, data):
        if self._service_depth:
            self._service_text.append(data)


def parse_homepage(path):
    parser = HomepageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


class HomepageExperienceTests(unittest.TestCase):
    def test_bilingual_homepages_share_the_homepage_assets_and_localized_art_label(self):
        for language, page in HOME_PAGES.items():
            with self.subTest(language=language):
                parser = parse_homepage(page)
                self.assertEqual(parser.links.count("../assets/homepage.css"), 1)
                self.assertEqual(parser.scripts.count("../assets/homepage-hero.js"), 1)
                self.assertEqual(len(parser.objects), 1)
                art = parser.objects[0]
                self.assertEqual(art.get("data"), "../assets/hero-dossier.svg")
                self.assertEqual(art.get("type"), "image/svg+xml")
                self.assertEqual(art.get("width"), "560")
                self.assertEqual(art.get("height"), "440")
                self.assertEqual(art.get("role"), "img")
                self.assertEqual(art.get("aria-label"), EXPECTED_HERO_LABELS[language])

    def test_bilingual_homepages_keep_nine_services_in_three_ordered_clusters(self):
        expected_markers = ("01–03", "04–06", "07–09")
        for language, page in HOME_PAGES.items():
            with self.subTest(language=language):
                html = page.read_text(encoding="utf-8")
                parser = parse_homepage(page)
                self.assertEqual(len(parser.service_cards), 9)
                self.assertEqual(tuple(parser.cluster_labels), EXPECTED_CLUSTERS[language])
                clusters = re.findall(
                    r'<section class="service-cluster" aria-label="([^"]+)">(.*?)</section>',
                    html,
                    re.DOTALL,
                )
                self.assertEqual(len(clusters), 3)
                cards = []
                for index, ((label, body), expected_label) in enumerate(
                    zip(clusters, EXPECTED_CLUSTERS[language])
                ):
                    self.assertEqual(label, expected_label)
                    marker = re.search(
                        r'<p class="service-cluster-label" aria-hidden="true"><span>([^<]+)</span></p>',
                        body,
                    )
                    self.assertIsNotNone(marker)
                    self.assertEqual(marker.group(1), expected_markers[index])
                    cluster_cards = re.findall(
                        r'<a class="service-card reveal" href="([^"]+)">(.*?)</a>',
                        body,
                        re.DOTALL,
                    )
                    self.assertEqual(len(cluster_cards), 3)
                    cards.extend(
                        (href, " ".join(re.sub(r"<[^>]+>", " ", card).split()))
                        for href, card in cluster_cards
                    )
                self.assertEqual(tuple(cards), EXPECTED_SERVICE_CARDS[language])

    def test_svg_has_six_semantic_layers_and_no_embedded_text(self):
        svg_path = ROOT / "assets" / "hero-dossier.svg"
        root = ElementTree.fromstring(svg_path.read_text(encoding="utf-8"))
        animated_layers = [
            element for element in root.iter() if "data-hero-layer" in element.attrib
        ]
        layers = {element.attrib["data-hero-layer"] for element in animated_layers}
        text_nodes = [element for element in root.iter() if element.tag.endswith("text")]
        self.assertEqual(layers, EXPECTED_LAYERS)
        self.assertEqual(text_nodes, [])
        self.assertTrue(all("transform" not in element.attrib for element in animated_layers))
        self.assertEqual(root.attrib.get("viewBox"), "0 0 560 440")

    def test_every_local_homepage_link_and_fragment_resolves(self):
        for language, page in HOME_PAGES.items():
            parser = parse_homepage(page)
            for href in parser.hrefs:
                split = urlsplit(href)
                if split.scheme in {"http", "https", "mailto", "tel"} or split.netloc:
                    continue
                if split.path.startswith("/"):
                    destination = (ROOT / split.path.lstrip("/")).resolve()
                elif split.path:
                    destination = (page.parent / split.path).resolve()
                else:
                    destination = page.resolve()
                if destination.is_dir() or split.path.endswith("/"):
                    destination /= "index.html"
                with self.subTest(language=language, href=href):
                    destination.relative_to(ROOT)
                    self.assertTrue(destination.is_file(), destination)
                    if split.fragment:
                        target = parse_homepage(destination)
                        self.assertIn(unquote(split.fragment), target.ids)

    def test_homepage_css_contains_responsive_and_reduced_motion_modes(self):
        css = (ROOT / "assets" / "homepage.css").read_text(encoding="utf-8")
        self.assertIn("@media (max-width: 980px)", css)
        self.assertIn("@media (max-width: 760px)", css)
        self.assertIn("@media (prefers-reduced-motion: reduce)", css)
        self.assertIn("--home-surface-primary", css)
        self.assertNotRegex(css, re.compile(r"gold|glassmorphism|backdrop-filter", re.I))

    def test_homepage_css_defines_the_approved_hero_surface_contract(self):
        css = (ROOT / "assets" / "homepage.css").read_text(encoding="utf-8")
        required = (
            "--home-surface-primary: #fbfcff",
            "--home-surface-mineral: #f4f7fb",
            "--home-surface-paper: rgba(255, 255, 255, .82)",
            "--home-ink-structural: #14213d",
            "--home-ink-secondary: #526078",
            "--home-signal-blue: #3569b8",
            "--home-signal-teal: #2fb5c4",
            "--home-signal-pink: #e0508f",
            "--home-rule: rgba(20, 33, 61, .14)",
            "--home-rule-soft: rgba(20, 33, 61, .075)",
            "--home-paper-shadow: 0 18px 44px rgba(20, 33, 61, .09)",
            "--hero-progress: 1",
            "contain: layout",
            "aspect-ratio: 14 / 11",
            "transform: scaleX(var(--hero-progress))",
            "max-width: 12ch",
            "max-width: 61ch",
            "min-height: 440px",
            "min-height: 360px",
            "min-height: 250px",
            "width: min(94vw, 430px)",
            "transition: none !important",
        )
        for declaration in required:
            with self.subTest(declaration=declaration):
                self.assertIn(declaration, css)
        self.assertNotIn("contain: paint", css)
        self.assertNotRegex(css, re.compile(r"\.has-js|opacity\s*:\s*0\s*;"))

    def test_homepage_css_defines_service_clusters_and_section_hierarchy(self):
        css = (ROOT / "assets" / "homepage.css").read_text(encoding="utf-8")
        required = (
            ".page-home .service-clusters",
            "gap: clamp(28px, 4vw, 48px)",
            ".page-home .service-cluster",
            "border-top: 1px solid var(--home-rule)",
            "grid-template-columns: repeat(3, minmax(0, 1fr))",
            "grid-template-columns: repeat(2, minmax(0, 1fr))",
            "grid-template-columns: 1fr",
            "padding-top: clamp(88px, 11vw, 132px)",
            "gap: clamp(18px, 2.2vw, 28px)",
            "align-items: start",
            "max-width: 14ch",
            "border-left: 2px solid var(--home-signal-pink)",
            "background: var(--home-surface-primary)",
            "var(--home-surface-mineral)",
            ".page-home .closing",
            "border-top: 1px solid var(--home-rule-soft)",
        )
        for declaration in required:
            with self.subTest(declaration=declaration):
                self.assertIn(declaration, css)

    def test_hero_progressive_enhancement_preserves_exact_copy_and_never_hides_it(self):
        expected_copy = {
            "pt": "Atividade iniciada em 2011 · Montijo Contas claras. Decisões simples. A Clave de Números presta serviços de contabilidade, consultoria fiscal e gestão a empresas, Empresários em Nome Individual, trabalhadores independentes e negócios online. Organizamos a atividade e acompanhamos as obrigações contabilísticas e fiscais com rigor e dentro dos prazos, para que cada cliente possa tomar decisões com maior clareza. Conhecer os serviços Fale-nos da sua atividade Atividade desde 2011 Montijo e todo o país Equipa próxima e dedicada",
            "en": "In business since 2011 · Montijo, Portugal Clear accounts. Simple decisions. Clave de Números provides accounting, tax advisory and management services to companies, sole traders, freelancers and online businesses. We organise the activity and monitor accounting and tax obligations rigorously and on time, so every client can make decisions with greater clarity. Explore our services Tell us about your activity In business since 2011 Montijo and all of Portugal A close, dedicated team",
        }
        for language, page in HOME_PAGES.items():
            with self.subTest(language=language):
                html = page.read_text(encoding="utf-8")
                hero = re.search(r'<section class="hero".*?</section>', html, re.DOTALL)
                self.assertIsNotNone(hero)
                hero_html = hero.group(0)
                hero_text = " ".join(re.sub(r"<[^>]+>", " ", hero_html).split())
                self.assertEqual(hero_text, expected_copy[language])
                self.assertNotRegex(hero_html, r'class="[^"]*\breveal\b')
                self.assertNotIn("data-hero-copy-hidden", hero_html)
                self.assertNotIn('aria-hidden="true" class="hero-copy', hero_html)


if __name__ == "__main__":
    unittest.main()
