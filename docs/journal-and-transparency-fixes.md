# Journal and mascot fixes — September 27, 2026

Replaced opaque mascot derivatives with real alpha-channel WebP cutouts in `public/assets/mascots-cutout`. Original artwork is preserved. The authorized local removal workflow is reproducible with `scripts/remove-mascot-backgrounds.py` (Pillow, NumPy, SciPy). This supersedes earlier notes about using multiply blending for white mattes.

Shared site navigation now uses MOZY consistently and includes Blog. The journal renders all 31 supplied articles in a responsive card grid with search, topic filters, empty-state recovery, animated entrances, and reduced-motion support. Article pages include readable typography, section navigation, tables, FAQs, references, related stories, and a download link.

Production builds prerender 34 pages (home, journal, privacy, 31 articles), each with unique titles, descriptions, canonical URLs and Open Graph metadata. Article pages include BlogPosting structured data. The generated sitemap includes all 34 URLs. Supplied article claims have not been independently fact-checked; technical SEO does not guarantee ranking.

Validation: production build and lint pass; all 34 generated pages checked for unique titles and expected metadata/rendered headings. Browser checks covered search, topic filtering, empty-state reset, article navigation, 390px mobile reader/journal/FAQ, 820px tablet homepage, and desktop reader. No horizontal overflow observed in these checks. All 13 rendered landing mascot images loaded from transparent assets; the hero and FAQ were visually verified without white rectangles.
