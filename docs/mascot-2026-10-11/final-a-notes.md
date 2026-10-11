# Moz · final-a — design notes

Merge of the three lab candidates: **v2-blob** body, proportions and sprout idea (base), **expressive-rig** rig
(brows, lids, pupils + gaze, morphable mouth, shoulder-pivot arms, `surprised`), **icon-mochi** soft fur-halo edge,
and the squash-and-stretch idea from jelly-squish for the walk and the cheer hop.

## Files
- `sheet.html` / `sheet.png` — contact sheet (1500×1750): night row, meadow row (8 moods at 170 px), scale row
  (40 / 96 / 400 px plus 40 px on navy and meadow, 96 px stern, walkSide static), walkSide in `div.is-walking`
  paused at 0 %, 25 %, 62 % (plus the frontal walk at 50 %).
- `live.html` — animated page for the owner: happy 360 px idling (pupils follow the pointer, mood buttons swap the big
  one), walkSide 260 px walking across a grass strip at a foot-matched ground speed ("Walk in place" and "Slow motion"
  buttons), stern / cheer / wave 180 px on night navy. Open at http://127.0.0.1:5180/final-a/live.html
- `hero.png` (1200×700, stern 340 px beside a 220×440 phone on a night card), `walk.png` (1200×420, walkSide 300 px
  mid-stride on a meadow path), `cycle.html` (QA strip: 8 phases of walkSide and walk).
- `round1..7.png` review renders; `zoom/` inspection crops.
- `src/` — single source of truth: `moz-kit.js` (`moz(mood, opts)`), `moz-kit.css` (idle + mood loops + walk cycles),
  `*.src.html` page templates, `build.py` (inlines the kit so every page stays self-contained). Edit src, run
  `python3 src/build.py`.

## API
`moz(mood, opts)` returns SVG markup, viewBox `0 0 240 260`. Moods: `happy stern cheer wave walk walkSide wink surprised`.
`opts.prefix` (prefix of every id; required for several instances), `opts.title` (adds `<title>`, role=img),
`opts.gaze` `[dx, dy]` pupil offset (walkSide defaults to `[2.5, 0]`). Hooks: `.moz-bob .moz-shadow .moz-sprout
.moz-leaf-l/-r .moz-face .moz-eyes .moz-eye-l/-r .moz-pupil .moz-lid-l/-r .moz-brow-l/-r .moz-mouth .moz-arm-l/-r
.moz-leg-l/-r .moz-stance` — every mood emits every hook (unused brows/lids/pupils are present with opacity 0 so they can
be faded in). Animated groups never carry a `transform` attribute; their `transform-origin` is inline in viewBox units
(`transform-box: view-box`), static poses live on inner groups. Static stride offsets sit on `.moz-stance` groups and
`.is-walking .moz-stance { transform: none }` resets them, so the walk cycle always starts from neutral (no doubled
stride). `--phase` on the `.is-walking` wrapper offsets the cycle, `--moz-cycle` (0.72 s) sets its speed, `.is-paused`
freezes it. `prefers-reduced-motion` stops everything.

## Decisions
- **Body**: v2-blob path unchanged (176 × 170, a touch wider than tall, flatter base), feet outside `.moz-bob` so they
  stay planted while the body breathes.
- **Skin and volume** (fix 3): one world-space radial skin gradient (centre 99,117, r 135), then only soft radial
  ellipses whose gradient reaches 0 at their own edge (the cause of expressive-rig's belly step was an ellipse that cut
  its gradient at 18 % opacity): a right-side shade, a warm core shade low on the belly (#D9B88C, max 36 %), a warm
  bounce light hugging the base (#FFF5E4), the big upper-left sheen, a crown AO under the stem. No hard tone steps at
  400 px.
- **Fur halo**: icon-mochi's trick adapted to the non-circular body: the body path scaled ×1.045 behind the body with a
  bounding-box radial that fades over the last 5 %. Soft edge at 400 px, invisible at 40 px, no filter cost.
- **Sprout** (fix 1): leaves generated from a quadratic centreline (bud → up-out → drooping tip) with a width profile
  that is already 66 % thick at the bud, full by 30 %, and closes in a round cap; the top edge is fuller (×1.1) than
  the underside (×0.86) so each leaf is the icon's fat crescent. They rise from a bud (r 10) on a very short visible
  stem (≈7 units above the crown) and open into a V, so they read as a sprout, never a bow (they never touch the head)
  or a propeller (not horizontal, not symmetric). Store-art asymmetry: left leaf ×1.06 and lifted 5°, right leaf ×0.9
  and lowered 3°. Vertical gradient (mirror-safe), a soft sheen, a faint crease, a 2.4 px 20 %-opacity same-hue fringe
  for a slightly fuzzy edge, AO under the bud.
- **Face** (fix 2): eyes r 17 (v2-blob 16) at y 148 (v2-blob 141), centres 88 / 152 = 0.364 body widths apart (icon
  0.36). Big upper-outer white highlight (0.43 R), small lower-inner one (0.15 R), amber glint at the bottom. Blush
  r 16 × 10 at 66 / 174, y 168: low, wide, its inner edge tucked under the outer half of each eye. Mouth: wide D
  (34 × 22.5, flat-ish top at eye-bottom level) with a darker top band and a clipped tongue. All mouth variants
  (smile / big / O / flat) use one M-Q-C-C-Z skeleton so `d` can be tweened.
- **Arms** (fix 4): resting nubs are drawn **in front of** the body at the flanks (13.4 × 9.9 drop ellipses at 70°)
  with a contact shadow on the body, so they are visible at every size. Raised arms (cheer, wave, surprised, frontal
  walk) are short club-shaped stubs (shoulder r 11.5 → mitten r 14) emerging from behind the silhouette (no seams).
  Every arm is a world-space path with its own gradient lit from the upper-left (no mirrored lighting). Stern: a
  palm-out mitten in front of the body: tall round palm (17.5 × 20) with a soft pink pad, a thumb drawn in front of
  the palm pointing up toward the face, short thick forearm, contact shadow on the body. Reads at 96 px and at 40 px
  as a raised hand.
- **walkSide** (fix 5): 3/4 view facing right, derived from sphere projection at ~16°: near eye at x 112 full size,
  far eye at x 172 scaled 0.8 × 0.93, mouth at x 145 at 0.9 width, far blush narrowed to 8.5, pupils gaze +2.5,
  sprout leaning back 9°, body leaning forward 5° and lifted 4 so the feet show. Near arm in front at the left flank
  (swung back in the static pose), far arm behind the right flank (swung forward, mitten peeks out). Feet share almost
  one base x so the stride dominates; near foot forward with toe up in the static pose. Under `.is-walking` it gets
  its own cycle: body bounces twice per cycle with squash on contact / stretch on passing, feet slide linearly through
  the stance (±29 units), lift and roll heel-to-toe in the swing, arms counter-swing ±28°, sprout lags. live.html moves
  the walker at the speed that keeps the planted foot still (58 units per half cycle).
- **Ground shadow** (fix 6): `.moz-shadow` is a dark core (#140A02, 50 %) over a wide warm glow (#FFF6E6, 26 % → 0),
  so on #0b0e1a it reads as a shadow on a faintly lit floor; on grass the glow is barely visible.
- **Mood loops** (CSS, opt-out with your own rules): wave wags the right stub, cheer hops with squash on landing and
  wiggling arms, stern gives the stop hand a small push every 2.6 s, surprised does a little startle.

## Rounds
- **Round 1**: first merge. Good: sprout finally reads as a sprout (stem + bud), lower body has volume, face matches the
  icon. Problems: leaf fringe read as a pale outline on paper; left leaf drooped lower than the right (wrong
  asymmetry); stern brows too high (read "sly"), stop mitten small with fist-like finger lines; raised stubs thin
  sticks; walkSide feet met at the same x at the stride extremes; surprised arms stiff horizontal sticks.
- **Round 2**: plumper, more arched leaves with drooping tips, left leaf lifted, fringe 3.4 → 2.4 px at 20 %; stern
  brows lower/steeper/thicker, lids cut deeper on the inner side, wider flat mouth; mitten rebuilt bigger with a soft
  palm pad, finger lines removed; stubs thicker and shorter (pose-specific length); surprised arms up-out; walkSide
  feet given a shared base. Remaining: walkSide stride hidden under the body, frontal-walk arm a horizontal stick,
  small O mouth, faint night shadow.
- **Round 3**: walkSide feet bigger, lower, wider stride and the body lifted 3; frontal walk arms hang and pump; O
  mouth bigger; nubs hang more (70°); ground glow stronger. Remaining: the two leaves overlapped into one tulip-like
  mass.
- **Round 4**: leaf centreline less steep so the leaves open into a clear V above the bud (like hero-phone), contact
  shadows stronger. walkSide feet still touching at full stride (too elongated).
- **Round 5**: rounder walkSide feet; built live.html, hero.html, walk.html, cycle.html. Hero check: thumb invisible,
  forearm long, so the hand read as a ball on a stick.
- **Round 6**: stop mitten taller, thumb drawn in front of the palm with a soft shadow, forearm shorter/thicker;
  walkSide stride ±29 and lift 4; live strip taller and ground speed retuned. Verified the walk cycle frame by frame
  (cycle.html) and live in the browser.
- **Round 7 / final**: sheet walk row padding + path moved under the feet; hidden pupils on closed eyes so every mood
  exposes the same hooks; live controls moved to the bottom-right (they overlapped the title on narrow screens).

## Known weaknesses
- Smooth vector, not the icon's flocked fur: the halo softens the silhouette but the surfaces read as soft vinyl
  (as in the store screenshots), not felt. Leaves have no fibre edge.
- walkSide is a 3/4 cheat on a sphere (face shift + foreshortened far eye + lean), not a true profile; at 40 px it reads
  mostly as "happy, looking right". The far arm is mostly hidden and only peeks during the forward swing.
- Resting nubs are clearly visible but at 400 px they still look like neat little balls stuck to the flanks rather
  than arms growing out of the body; a softer root blend would need a filter.
- Stern at 40 px reads from the brows and the hand bump; the palm pad and thumb only register from ~96 px up.
- The stern lid patches use the world-space skin gradient; if `.moz-face` is moved more than ~10 units (or the eyes
  are moved under the sheen) a faint lid edge could show.
- Blink squashes the whole eye group (highlights included) rather than sliding the lids; fine at page sizes.
- The leaf crease line is visible at 400 px; drop it if the owner wants the icon's plain leaves.
- The headless render tool occasionally drops a few SVG parts in one figure (seen once in a QA strip, gone on re-render
  and never in a real browser); re-render if a PNG shows a missing face.
- Per-arm gradients are emitted inline in `<defs>` per instance (fine for pages; in React use `useId` as the prefix).
