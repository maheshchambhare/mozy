# MOZY Brand Memory Rule

Whenever making changes to the MOZY codebase:
1. Always preserve the visual identity defined in `BRAND_DESIGN_LANGUAGE.md`.
2. Keep the cute, friendly, motivational character MOZ prominent and true to his design (round sprout with two leaves, backpack, playful expressions).
   On the landing page Moz is the SVG in `src/components/story/Moz.tsx`, approved by Mahesh on 11 October 2026 (variation 2, reference board in `docs/mascot-2026-10-11/round2-v2/`). It is drawn from the store screenshots in `public/assets/v2/`: a soft cream onion-dumpling body, a short green stem with two big puffy rounded leaves (left one bigger and higher), big glossy dark eyes, pink blush, a small open smile, small hands that peek out from behind the body sides, a raised pink-padded paw for "stop", stub feet, no backpack. Moods: happy, stern, cheer, wave, wink, walk (3/4 turn). Check new art against `public/assets/v2/hero-phone.png`, not the old 3D renders.
3. Use the defined CSS design tokens (`src/design-system/tokens.css`):
   - Sprout Green: `#22C55E`
   - Sprout Mint: `#E8F7ED`
   - Dark Cards: `#11141B`
   - Light Cards: `#F5F5F0`
   - Coral Pain: `#EF4444`
   - Border Radius: `28px` for bento cards, `9999px` for pills.
4. Typography stack:
   - **Logo**: `Baloo 2 ExtraBold, 800`
   - **Headlines (Hero, H1, H2)**: `Fredoka Bold, 700`
   - **Buttons & Action Pills**: `Fredoka SemiBold, 600`
   - **Body & Subtitles**: `Nunito / Nunito Sans Regular, 400–500`
   - **Handwritten notes**: `Caveat SemiBold, 600`
5. The landing page is the responsive scroll story in `docs/SCROLL_STORY_REDESIGN.md` (desktop and mobile; story tokens in `src/story.css`). Keep its chapter order, `st-` class prefix and reduced-motion behaviour. The old 2-column bento grid is retired (October 2026).
6. Product claims come from `src/data/productFacts.ts` only. Never show anything marked `verified: false`, never promise a free trial, and never call Mozy free without the iPhone subscription caveat.
