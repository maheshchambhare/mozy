# Mozy site audit, 11 October 2026

Scope: the local scroll-story landing page (`MOZY/`, served at http://localhost:5173), its secondary pages (pricing, privacy, get, journal), the 31 journal articles, technical SEO, GSO (AI search), ASO (App Store and Google Play) and the code behind it. The live https://mozy.mcrudra.com was also checked because it is what users and crawlers see today.

161 distinct issues after merging duplicates: 6 critical, 37 high, 67 medium, 51 low.

## How this audit was made

- Six specialist reviews ran in parallel: desktop visual design, copy truth, technical SEO, GSO, blog and ASO. A seventh review covered code, accessibility, performance and dead code. I reviewed the mobile screenshots and the main desktop frames myself.
- TypeScript and lint both pass with no errors. The production build was measured in a scratch folder.
- Evidence: 21 desktop frames at 1440x900, 16 phone frames at 390x844, the secondary pages, a fresh production build, `npm run test:content`, and live fetches of the site and both store listings on 11 October.
- Every critical finding and most high ones were re-checked against the code or the live site. Those are marked "re-checked". The rest carry the reviewer's evidence but were not independently re-run. Anything a reviewer was unsure about is marked "unverified".
- Product claims were checked against `src/data/productFacts.ts` and the two store listings only.

## The short version

1. **The live site is not this site.** mozy.mcrudra.com is still served by the Next.js app in `mcrudra-web`. It says "iOS coming soon" and "It's free", and it shows two testimonials that do not come from real users. This new site has no git history and no deploy path yet. Nothing below reaches users until that is fixed.
2. **The privacy page publishes two features that are not verified.** It describes a midnight reset and an emergency bypass, which `productFacts.ts` marks as unconfirmed. It also names the wrong iOS step source (CoreMotion instead of HealthKit).
3. **17 unfinished outline articles are indexable.** Test posts promise 12 or 15 questions and show none. How-to posts promise 7 to 10 methods and show one, the Mozy step. The publishing gate only checks the editorial hold, not the article status.
4. **The mascot reads as a glossy egg with a moustache.** It does not look like the app icon or the store screenshots. A redesign is in progress and needs your approval first.
5. **The walk chapter has broken layering and weak drawings.** The deer stands on Moz's head and the signpost runs through the deer. The headline goes to about 1.6:1 contrast mid-sunrise and clouds drift behind it. The mountains, deer, windmill and trees are crude next to the island scene.
6. **The blog has no trust signals.** The 12 published neuroscience posts cite nothing, some statistics are wrongly attributed to Pew and DataReportal, and there are no authors or update dates. These are the signals Google and AI engines weigh most for health-adjacent topics.
7. **SEO and GSO basics are missing.** There is no FAQPage schema, no 404 page, no Smart App Banner and no llms.txt (the live site has one, so deploying would remove it). Most sitemap entries have no lastmod, and the Organization entity is split between "MCRUDRAX" and "mcrudra".
8. **Two code bugs break the story for some visitors.** On a phone with Reduce Motion turned on, none of the scroll-story setup runs. The walk never reaches the gate, the How steps cannot be switched and the step bar never appears. Links like /#faq or /#download land at the top of the page, because the app scrolls to the top on load.
9. **ASO leaks.** Apple campaign links lack the provider token, so installs are not attributed. The Play listing's website and privacy links go to the dead moxstudio.tech. The two stores use different names, and the Play screenshots show a third mascot style.

## Top 15 fixes, in order

| # | Severity | Fix | Where |
|---|---|---|---|
| 1 | Critical | Decide hosting, put `MOZY/` under git, deploy `dist/` to mozy.mcrudra.com and remove the mozy rewrite from `mcrudra-web/middleware.ts`. Do not share the QR code until then. | `../mcrudra-web/middleware.ts:18` |
| 2 | Critical | Delete privacy section 05 (midnight reset, emergency bypass) and change CoreMotion to HealthKit. | `src/pages/PrivacyPage.tsx:54,69-80` |
| 3 | Critical | Publish only `status === 'published'` articles in `articles.ts` and `prerender.mjs`, and make `check-blog-content.mjs` fail on outline sections. | `scripts/prerender.mjs:19`, `src/data/articles.ts:8` |
| 4 | Critical | Hold or finish the two test posts and the five how-to posts that ship empty sections. Drafted bodies already exist in `plans/blog-repairs-last19.json`. | `src/data/mozy-articles.json` |
| 5 | High | Add GSAP's always-true condition so the scroll story also sets up on phones with Reduce Motion on, then show all three How steps in that mode. | `src/hooks/useScene.ts:27`, `src/hooks/useLandingMotion.ts:22`, `src/story.css:449` |
| 6 | High | Replace Moz with the approved mascot everywhere: hero, How phone, walk, world, final, widget chip and nav icon. | `src/components/story/Moz.tsx` |
| 7 | High | Rebuild the walk scene. Put the deer and windmill on layers that cannot cross Moz, and redraw the mountains, deer and trees. Switch the copy colour in one step so it stays readable, and keep clouds out of the title band. | `src/components/story/WalkChapter.tsx:199-203`, `src/story.css:280-336` |
| 8 | High | Keep the scroll position when the URL has a hash, then scroll to the section after the first ScrollTrigger refresh. | `src/App.tsx:16-18` |
| 9 | High | Say "34 steps = 1 minute on iPhone" until the Android ratio is confirmed. | `Hero.tsx:125`, `WalkChapter.tsx:306,349`, `landing.ts:25` |
| 10 | High | Add FAQPage JSON-LD (landing, pricing, articles), one Organization entity with the correct sameAs, a Person author for Mahesh, and real datePublished and dateModified values. | `src/data/landing.ts`, `src/pages/BlogPost.tsx:112-122` |
| 11 | High | Port `llms.txt`, `llms-full.txt` and the AI-crawler robots rules from the live site before deploying, rewritten from verified facts only. | `public/` |
| 12 | High | Add the `apple-itunes-app` Smart App Banner and the App Store provider token (`pt=`) to campaign links. | `index.html`, `src/data/landing.ts:13` |
| 13 | High | Fix the Play Console website and privacy URLs (moxstudio.tech is dead) and align the two store names. | Play Console |
| 14 | High | Add sources to the 12 published posts, fix the Pew and DataReportal numbers, and retitle "Block Shorts & Reels" (Mozy blocks whole apps). | `src/data/mozy-articles.json` |
| 15 | High | Write the missing buyer content: Mozy vs Opal, one sec, ScreenZen and Forest; walk to unlock apps; iPhone setup and permissions; "can I bypass it". | new articles |

## Fix plan

- **Phase A: mascot and walk scene.** Approve the mascot first. The candidates are in `docs/mascot-2026-10-11/`: `board.png` compares them, and `final-a-live.html` shows the recommended one animated. Then swap it in everywhere and rebuild the walk chapter around it.
- **Phase B: truth, SEO and GSO quick wins.** Reduce Motion bug, hash links, privacy page, 34-steps qualifier, publishing gate, schema, Smart App Banner, llms.txt, 404 page, sitemap lastmod. About a day of work.
- **Phase C: blog programme.** Hold the outlines, apply the drafted repairs, add citations and authors, merge the eight posts that compete for the same dopamine keywords, then write the comparison and iPhone posts. One solid post a week is sustainable.
- **Phase D: deploy and clean up.** Put the site under git, deploy it, and fix the store listings. Then delete the 15 MB of unused images and the legacy components and CSS.

## All findings by area

Severity: CRITICAL breaks the page, misleads users or blocks indexing. High clearly hurts conversion, ranking or trust. Medium and Low are polish.

## Live site and deployment

1. **CRITICAL · The live mozy.mcrudra.com is NOT this repo: it is the Next.js mcrudra-web app, and this Vite site has no deploy path, no git and no CI** (`../mcrudra-web/middleware.ts:18` · re-checked)  
   Problem: curl -I https://mozy.mcrudra.com/ -> `x-powered-by: Next.js`, `vary: rsc, next-router-state-tree…`, `server: cloudflare`; live <title> = "Mozy: Walk to Unlock Apps | Screen Time App for Android | mcrudra", live h1 = "Doomscrolling is a physical problem. Unlock it with steps.", live HTML contains /_next/ and no /assets/index-*.js. mcrudra-web/middleware.ts:18-20 rewrites host mozy.mcrudra.com -> /apps/mozy/*;  
   Fix: Decide the hosting target now and wire it: (1) `git init` MOZY (or add it to the parent repo untracked -> tracked) and push to GitHub; (2) create a Cloudflare Workers static-assets project for MOZY with a wrangler.jsonc like `{"name":"mozy-site","compatibility_date":"2026-10-01","assets":{"directory":"dist","html_handling":"drop-trailing-slash","not_found_handling":"404-page"}}` and attach the custom domain mozy.mcrudra.com;  
   Also reported by: code-audit, truth-copy

2. **CRITICAL · Deployed mozy.mcrudra.com is still the old Next.js site: 'iOS coming soon', 'It's free', invented testimonials, /get and /pricing 404** (`../mcrudra-web/middleware.ts:18` · re-checked)  
   Problem: Live HTML (curl https://mozy.mcrudra.com/, saved at scratchpad/aso/fetch/live-home.html) contains: title 'Mozy: Walk to Unlock Apps | Screen Time App for Android | mcrudra', 'Android available · iOS coming soon' (mcrudra-web/components/layout/Nav.tsx:515), 'Download now.  
   Fix: Deploy this repo's dist/ to the mozy.mcrudra.com host (Cloudflare Pages/Workers static assets with SPA fallback for /get) and remove the mozy branch from mcrudra-web/middleware.ts, or keep the rewrite and proxy to the new build; until then do not print or post the QR code.  
   Also reported by: aso, seo-technical

## Mascot (Moz)

3. **High · Moz SVG reads as a glossy vector egg/garlic, not the fluffy icon** (`src/components/story/Moz.tsx:150` · re-checked)  
   Problem: Crops hero-moz.png, walk-moz-3601.png, final-moz-9212.png vs public/assets/mozy-icon-original.webp. Body is one smooth path (line 38) with a 4-stop radial gradient (87-92) ending in tan #ead6b8, plus a hard rotated specular ellipse at (82,94) rx44 ry24 (line 150) that reads as a balloon highlight. Sampled body colour on the page (254,252,247)/(251,245,235) with yellow-tan shadows;  
   Fix: Rebuild the body as a fur ball: keep the circle but (a) remove the specular ellipse and use a broad soft top light (radial, 0.35 alpha), (b) shade the lower half warm pink-grey (#f3dcd2 to #e8cfc6) instead of tan, (c) add a fuzzy rim via an SVG filter (feTurbulence baseFrequency 0.9 + feDisplacementMap scale 3) applied to the body outline or a ring of 60 short tapered strokes, (d) add a faint inner shadow where leaves meet the crown.

4. **High · Leaves are flat, pointed boomerangs and the bud sits on top instead of between them** (`src/components/story/Moz.tsx:24` · re-checked)  
   Problem: iconLeaf trace (line 24) is scaled 1.18 and tilted -20deg (27-32); on screen the pair reads as a moustache/bat with drooping pointed tips (crops hero-moz.png, walk-moz-cheer-5500.png). Width:height of a drawn leaf ~3.3:1 vs ~2.2:1 in the icon, whose tips are rounded and whose leaves have visible thickness. Bud is a plain r=13 circle at (120,54) (line 163) placed above the leaf bases;  
   Fix: Redraw each leaf as a plump teardrop (base width ~40% of leaf length, rounded tip), gradient #8fc93a top to #4f8a1e underside with a lighter mid-rib; set the bud as a 16-unit sphere whose bottom overlaps both leaf bases; drop the rim stroke; keep the sway animation on the same group.

5. **Medium · Three Moz renderings coexist: raster icon in the nav, SVG Moz in chapters, a flat mini-Moz in the widget mock** (`src/components/SiteChrome.tsx:15`)  
   Problem: desktop-00000.png: nav logo (app-icon-96.webp, fur, olive leaves) sits 500px above the lime-leafed vector Moz (Hero.tsx:135). WorldChips.tsx:30-36 draws a third style (flat circle face, dot eyes) for the Widgets chip (desktop-06400.png).  
   Fix: One Moz system: either use rendered WebP/Rive poses everywhere (nav, hero, walk, world, final, widget chip) or make the SVG match the icon closely enough that the nav can use the SVG too; replace the WidgetMock face with <Moz> scaled to 28px.

6. **Medium · Raised arm reads as a thumb/sausage; limbs are outlined while the body is not** (`src/components/story/Moz.tsx:68`)  
   Problem: raisedHand (68-81) draws a 26-unit straight stroke from (42,170) to (21,128) with a r=16 ball and a white dot; in hero-moz.png and hero-phone-moz.png the stern 'no' pose looks like a thumbs-up/fist, and in final-moz-9212.png the wave looks like a sausage. The arm has an #e6d0ae outline (lines 74,76) but the body path (147) has none;  
   Fix: Model arms as short rounded nubs that emerge from the body silhouette (same gradient, no outline); for stern use a flat palm (rounded rect 22x26 with three finger bumps) held beside the face; for wave/cheer keep nubs with a slight taper. Unify: either all parts outlined (2px #d9c3b0) or none.

7. **Medium · Feet are flat pancake ellipses** (`src/components/story/Moz.tsx:143`)  
   Problem: Two ellipses rx20 ry12 at cy=239 (143-144) with a top-dark foot gradient (115-119); in walk-moz-3601.png they read as two cream discs under the body. v2 hero-phone.png shows small rounded feet with volume tucked under the body.  
   Fix: Bean-shaped feet (path with a rounded heel and a slight toe notch), 60% hidden under the body, a darker contact shadow between body and foot, and keep the moz-step keyframes.

8. **Medium · Face layout: mouth touches the eye line, blush sits at mouth level** (`src/components/story/Moz.tsx:56`)  
   Problem: Eyes r=18.5 at cy=158 (line 41) end at y=176.5; mouth path starts at y=176 (line 56), so there is no gap; blush ellipses at (56,183)/(184,183) rx17 (167-168) sit below and outside the eyes at mouth height. In the icon the blush sits just under the outer half of each eye and the mouth starts ~0.4 eye-diameters below the eyes.  
   Fix: Eyes cy 150; mouth y 184-206 (keep width ~40); blush at (62,170)/(178,170) rx15 ry9, alpha 0.6; eye highlight r 9 top-outer plus a 3-unit lower-inner dot; eye gradient to #2a1810 (not #4b2a17) so eyes stay glossy black with an amber glint.

9. **Medium · The mascot is 'Moz' on the site but 'Mozy' inside the app and store screenshots** (`src/components/story/Phone.tsx:65`)  
   Problem: Site: "Instagram can wait. Walk with Moz first." (Phone.tsx:65), "it's 2:17 AM. Moz says no." (Hero.tsx:136), "Moz holds up a hand" (HowChapter.tsx:10), "Moz's world grows back" (WorldChapter.tsx:180). App creative: public/assets/v2/hero-phone.png lock screen "Instagram can wait. Walk with Mozy first." and "Mozy is cheering you on!"; companion-worlds.png "A little walk. A happier Mozy.";  
   Fix: Pick one. If the app keeps calling the companion Mozy, use "Mozy" on the site too ("Walk with Mozy first.", "Mozy says no.", "Mozy's world grows back."). If the owner wants 'Moz' (as the brief states), rename him in the next app build and store screenshots, and add one FAQ line meanwhile: "Moz is the companion you keep healthy inside Mozy."

10. **Low · Current Moz rating: 4/10 against the icon and v2 screenshots** (`src/components/story/Moz.tsx:38`)  
   Problem: Amateur tells, each visible in the crops: hard specular highlight (150); tan shadow palette #ead6b8/#e8d2b0/#d9bd97 (91,109,116); lime leaves with a rim stroke (120-124,160); limbs drawn as separate primitives with their own outline (74-77); no edge softness; eye gradient to brown (133); blush as a 0.95-alpha radial sticker (136); feet as discs (143).  
   Fix: Address items in order: palette and shading, leaves, limbs/feet, face spacing, fur edge; then re-shoot at 190px (hero), 157px (walk) and 73px (island) to confirm it reads at all three sizes.

## Walk chapter (mountains, path, animals)

11. **High · Walk copy drops to 1.4-1.8:1 contrast mid-sunrise** (`src/components/story/WalkChapter.tsx:203` · re-checked)  
   Problem: GSAP tweens --walk-ink from #fff7ec to #15314b over progress 0.18-0.58 (line 203); story.css:330-336 paints eyebrow, h2, counter and lede from it. Measured at desktop-04500.png: digits (94,110,125) on sky (118,152,191) = 1.75:1; h2 1.60:1; eyebrow 'THE WALK' 1.41:1; lede 1.83:1 (walk-grey-copy-4500.png). WCAG needs 4.5:1 (3:1 for large).  
   Fix: Do not tween colour. Toggle a class at the sky's mid-luminance point (progress ~0.45) that flips ink in one step, and give the counter block a backdrop that works on both skies (the existing .st-walk-pill frosted style behind the whole copy block, or a 1px text-stroke/halo). Keep the eyebrow and lede at >= 4.5:1 on both end states.  
   Also reported by: code-audit

12. **High · Clouds drift behind the title at the title's height** (`src/story.css:280` · re-checked)  
   Problem: Cloud tops are 5%/11%/18%/25%/33% (story.css:280-284) at z-index 2, while the copy block starts at top clamp(84px,11vh,112px) (330). desktop-04000.png and walk-cloud-title-4000.png: 'a minute.' (242,236,227) over cloud (156,152,162) = 2.41:1; cloud also behind the h2 at 4500, 5000, 5500 and in my own capture at 3950. Positions are time-based (st-cloud-drift, 64-130s), so the collision is random per visit.  
   Fix: Move cloud bands out of the copy zone (tops 42%-55%, behind the far mountains at z-index 2 is fine) or constrain their x-range to the outer 20% of the stage; alternatively give the copy block a frosted backdrop.

13. **High · Deer stands on Moz's head and is impaled by the signpost as layers parallax** (`src/components/story/WalkChapter.tsx:261` · re-checked)  
   Problem: Deer lives on the hills layer (translate(860 724), depth 0.4, z-index 6) while Moz is fixed at left 30% (story.css:324, z 9) and the signpost rides the meadow (translate(1900 860), depth 1, z 8). walk-deer-over-moz-4500.png: deer's hooves rest on Moz's leaves. walk-deer-signpost-5000.png: the signpost post runs between the deer's legs.  
   Fix: Place hills-layer props where their screen path (x*unit - travel*0.4) never crosses Moz's column (x 0.3*width +- 120px) during travel: put the deer at hills x >= 1900 (right of the windmill) or on the meadow beyond the gate; move the signpost to meadow x ~1500 and verify no hills prop crosses it between progress 0 and 0.93.

14. **Medium · On wide screens the walk's back layers are scaled up to 35% too large and the mountains rise into the copy** (`src/components/story/WalkChapter.tsx:WalkChapter.tsx:173,240,247,252`)  
   Problem: Layer width = max(data-width*unit, width + travel*depth + 40) with preserveAspectRatio 'xMinYMax slice'. When the second term wins, the SVG scales by width rather than height. Measured scale (getScreenCTM().a) against the meadow: 2560x1080 gives far 1.455, mid 1.249 and hills 1.219 against unit 1.08, and the far peak sits 382px from the top instead of 562.  
   Fix: Keep each layer at scale = unit: extend the paths and data-width so data-width*unit always covers width + travel*depth (far >= 3600, mid >= 3400, hills >= 3800 units covers 3440x1440). Or set the viewBox width dynamically to layerWidth/unit with 'xMinYMax meet' and generate the ridge paths to that width.

15. **Medium · Deer is anatomically wrong and tree-sized** (`src/components/story/WalkChapter.tsx:262` · re-checked)  
   Problem: Ellipse torso (262), four identical straight 5-unit legs with no joints or hooves (263), a parallelogram neck as long as the body plus an ellipse head and three-stroke antlers (264); walk-deer-3601.png shows a dog/giraffe hybrid. Height ~70 units vs hillTrees canopies ~55-80 units (line 100, size 26), so the deer equals a tree.  
   Fix: Redraw: deeper chest than rump, neck rising from the chest at ~60deg, legs with a knee bend and dark hooves, two ears, a short tail; height ~45% of a tree; add a ground shadow ellipse; keep st-graze on a head group hinged at the neck base.

16. **Medium · Windmill reads as a cross/telegraph pole and sits under the unlock pill** (`src/components/story/WalkChapter.tsx:256` · re-checked)  
   Problem: Tower is a 20-unit tapered rect with a 12-unit red cap (257); blades are four thin triangles with no sails or lattice (258); no door, base or shadow (walk-windmill-3601.png). At 5500 it sits directly behind 'Unlocked · +100 min' and the gate (walk-unlocked-windmill-5500.png); story.css:337 places the pill at calc(--gate-x + 8.8svh).  
   Fix: Dutch-style body (wider base, a door, dark band and shadow), blades as lattice sails (framed rects with diagonals), larger hub; move to hills x ~2300 so it is left of the gate's final position and never under the pill.

17. **Medium · Mobile walk scene: copy fills the top half, scenery is squeezed into the bottom third, signpost cut off** (`src/story.css:324` · re-checked)  
   Problem: mobile-04200.png and mobile-04900.png: title, counter, pill and lede occupy y 0-780 of 1688 while mountains, Moz and the path sit in the last 35%; the signpost shows only 'min' at the left edge; the deer is as tall as Moz and stands on his leaves.  
   Fix: On phones shorten the copy block (hide the lede as the max-height:720px rule already does, smaller counter), raise the horizon to about 55% height, move the signpost into the visible range for narrow stages (place it relative to the gate, not at a fixed meadow x), and scale animals relative to Moz.

18. **Medium · The gate unlocks before Moz reaches it; the meadow keeps sliding about 150px and the 'Unlocked' pill floats beside the gate** (`src/components/story/WalkChapter.tsx; src/story.css:WalkChapter.tsx:17,180,196-197,212; story.css:337`)  
   Problem: UNLOCK_AT = 0.93 sets is-unlocked (confetti, cheer, pill), but the meadow tween runs to progress 1 (duration 1). At 1440x900 the gate is 670-828 at progress 0.95 and 560-719 at 1.0, while the pill is centred on the final position (533-736). On mobile 375x667 at 0.95 the gate centre is 340 and the pill centre 243.  
   Fix: End the travel when the gate unlocks: give the meadow and back-layer tweens duration UNLOCK_AT (or compute x as -travel * min(1, p/UNLOCK_AT)). Then the gate is at --gate-x exactly when is-unlocked fires.

19. **Medium · Mountains: flat blue triangles, odd shade wedges, snow on only 4 of 7 peaks** (`src/components/story/WalkChapter.tsx:242` · re-checked)  
   Problem: Far body is one #a8b8da polygon (241); st-far-shade triangles hang below six peaks (242) and read as dark wedges; st-far-snow zigzags exist for peaks at 250, 560, 1180, 1480 but not 860, 1780 or the 1000 dip (243); far pines #93a7cb, mid hills #82a2c3 and far body are the same hue so ridges merge (walk-mountains-3601.png).  
   Fix: Three tonal steps with haze (far #b9c6e3, mid #8ea3cc, near #6c87b7); a lit and a shaded face per peak; slope-following snow caps on every peak; a soft gradient haze band between far and mid.

20. **Medium · Two step counters disagree on screen during the walk** (`src/hooks/useLandingMotion.ts:33`)  
   Problem: desktop-03601.png: walk counter '0 steps -> 0 min' while the HUD says '3,779 steps scrolled -> 111 min'; desktop-05500.png: 3,400 vs 5,772; handoff/d-03950.png: 644 vs 4,145. Walk counter WalkChapter.tsx:176-181; HUD StepHud.tsx:10 fed by useLandingMotion.ts:33-36.  
   Fix: Tuck the HUD (existing is-tucked class, story.css:395) while the walk stage is pinned, or make the HUD mirror the walk counter during that chapter.  
   Also reported by: code-audit

21. **Medium · Three different tree styles on one page; walk trees are flat lollipops** (`src/components/story/WalkChapter.tsx:40`)  
   Problem: roundTrees (40-55) = three flat circles + 8-unit trunk in a single #4e9c66 (story.css:300) with no highlight or shadow; WorldIsland.tsx:168 and FinalScene.tsx:57 use radial-gradient canopies with highlights and ground shadows (compare desktop-04500.png vs desktop-09212.png).  
   Fix: Reuse the FinalScene Tree component (gradient canopy, highlight, shadow) for the hills layer; same for the pine shapes.

22. **Low · Moz 'moonwalks' when scrolling back: legs step forward while the scene moves backward** (`src/components/story/WalkChapter.tsx; src/components/story/WorldChapter.tsx:WalkChapter.tsx:212-216; WorldChapter.tsx:62-66`)  
   Problem: Both is-walking heuristics use Math.abs(progress - last), so scrolling up adds is-walking and the forward walk cycle plays while the meadow slides right (walk) or the walker's xPercent decreases (world).  
   Fix: Track the sign of (progress - last). On reverse, add `is-reverse` to flip the walker (`transform: scaleX(-1)` on .st-walk-moz .is-walker / .st-world-moz), or pause the legs.

23. **Low · Footprint trail reads as pebbles** (`src/components/story/WalkChapter.tsx:89`)  
   Problem: Trail is alternating rx9 ry5.2 ellipses (89-96) in #c4a46f at 0.85 (story.css:310); walk-trail-3601.png shows brown beans on the path.  
   Fix: Use the Footprints sole shape (icons.tsx:20-22) scaled, alternating left/right with a +-12deg rotation, 0.5 opacity.

24. **Low · Signpost repeats the headline and pill; white text on tan is 2.6:1** (`src/components/story/WalkChapter.tsx:306`)  
   Problem: desktop-04000.png shows '34 steps = 1 min' (signpost), 'Every 34 steps buys you a minute.' (h2) and 'steps -> 21 min earned' (pill) in one viewport; signpost text #fff8ec on #c98f5f (story.css:316) ~2.6:1 (walk-signpost-5000.png).  
   Fix: Make the signpost scenic ('Gate ->' with an arrow) or remove its text; if kept, use ink text (#3b2a1a) on the board.  
   Also reported by: code-audit

25. **Low · Gate ivy is a necklace of identical beans; stones are three strokes per side** (`src/components/story/WalkChapter.tsx:322`)  
   Problem: 13 identical rx11 ry6 ellipses on a 90-unit arc (322-327), five more at the sides (328); keystone is a 20-unit trapezoid (319); masonry is six short strokes (318); walk-gate-5000.png.  
   Fix: Continuous vine path with alternating leaf pairs and 3-4 flowers, visible block joints across the arch, a larger keystone, and a doorstep shadow.

26. **Low · Night clouds look like grey smoke over the pre-dawn sky** (`src/story.css:278`)  
   Problem: desktop-03601.png: clouds #fffaf3 at 0.94 (278) with #e8dff0 shade (279) under the night tint render as opaque grey-lilac blobs; birds (#3d4a63, 304) fly at 20% height in the dark at 3601 as specks.  
   Fix: Drive cloud opacity from the same timeline (0.35 at night to 0.94 by day) and delay the bird flock until .st-walk-day opacity > 0.5.

## World chapter (floating island)

27. **Medium · Walk to World handoff is a hard horizontal cut** (`src/story-world.css:36` · re-checked)  
   Problem: world-handoff-6000.png: the meadow's green ends in a straight line at y~480 against a flat white band, then the cream cloud bank. .st-walk-stage is overflow hidden (story.css:267); the top bank (story-world.css:36) starts at top -1px inside the world section and fades out on entry (WorldChapter.tsx:141).  
   Fix: Let the top cloud bank overlap the walk stage's last ~60px (margin-top: -60px on .st-world with z-index above the walk) or give .st-walk a scalloped bottom mask; optionally continue the path into the island.

28. **Medium · Moz is tiny on the island** (`src/story-world.css:94`)  
   Problem: .st-world-moz width 13.5% of a ~540px box = ~73px (94) vs 157px in the walk and ~150px in the final; world-moz-desert-6400.png shows him as a dot on the left rim; desert surface right two-thirds is empty sand.  
   Fix: Width 18-20%, keep the walk path inside the top ellipse (adjust WALK in WorldChapter.tsx:17), scale the shadow; add one more desert prop on the right third (rock pile) so the sand does not read as unfinished.

29. **Medium · World names and levels do not match the app's own store creative** (`src/components/story/WorldChapter.tsx:11`)  
   Problem: WORLDS = "Desert · Level 1", "Abandoned City · Level 5", "The Park · Level 9"; WorldChips.tsx:37 widget mock "Lv 9". The store screenshot public/assets/v2/companion-worlds.png labels them "Desert Oasis LV 1", "Abandoned City LV 5", "Green Park LV 10"; public/assets/v2/steps-currency.png shows "THE PARK · LV 8" with a bar "Lv 8 → Lv 9". The site matches neither.  
   Fix: Take the world names and unlock levels from the current builds (and reconcile the two store screenshots, which also disagree). Then set WORLDS to those values, e.g. "Desert Oasis · Lv 1", "Abandoned City · Lv 5", "Green Park · Lv 10", and update the widget mock's "Lv 9". If levels differ per platform, drop the numbers: "Desert Oasis", "Abandoned City", "Green Park".

30. **Low · Widgets chip draws a fourth face style and chips are low-impact** (`src/components/story/world/WorldChips.tsx:30`)  
   Problem: WidgetMock face (30-36): flat circle with dot eyes and a 1.4px smile; chips are 13.5px text with 70px/50px art (story-world.css:58-60), desktop-06400.png.  
   Fix: Use <Moz> at 28px in the widget mock; enlarge chip art to 96px and body to 15px, or convert chips to two short bullet lines under the lede.

31. **Low · City ruins: stub building hidden, vines are single strokes** (`src/components/story/world/WorldIsland.tsx:54`)  
   Problem: BUILDINGS[1] (x 330, h 86, line 54) is mostly hidden behind BUILDINGS[2] in world-city-7300.png; vines are 3.2px strokes with circle leaves (105-106); windows are 10x13 rects.  
   Fix: Shift BUILDINGS[1] to x ~380 or raise h to 120; draw vines with a 2-stroke twist and leaf pairs; add a shaded window reveal.

## Hero, How it works, FAQ, final CTA and layout

32. **High · On phones the How chapter's eyebrow and heading slide under the fixed header** (`src/story.css:183` · re-checked)  
   Problem: mobile-02800.png: 'HOW IT WORKS' is half hidden behind the nav pill once step 3 expands. .st-how-stage is a 100svh sticky flex box with align-items:center and 96px top padding (lines 183-186); when the heading, the expanded step and the 640px phone are taller than the viewport, the centred block overflows upward under the 77px header.  
   Fix: On max-width 860px, align the stage to flex-start, set padding-top to the header height plus 16px (about 96px), and scale the phone with the existing --phone-scale from the remaining height so the block never exceeds 100svh.

33. **High · Landing FAQ leaves the top pre-install objections unanswered** (`src/data/landing.ts:24`)  
   Problem: The seven FAQs (landing.ts:25-31) cover ratio, which apps, vs. a timer, GPS, price, phones, maker. Nothing on the page answers: what if I need a locked app urgently; can I fake steps by shaking the phone; can I just delete Mozy or change Screen Time to get around it; battery drain (the Play listing itself says "minimal battery usage"); do unused minutes carry over; do Apple Watch steps count (iOS uses HealthKit);  
   Fix: After confirming each in the build, add: "What if I need a locked app right now?" (answer from the real bypass/unlock-list behaviour); "Can I cheat by shaking my phone?" → "Mozy reads the same step counter your phone's health app uses, so a shake does not register as a walk." (verify); "Can I just uninstall it?" → honest answer per platform; "Does it drain the battery?" → "It uses the phone's built-in step sensor, not GPS, so battery use is minimal.";

34. **Medium · Mobile How chapter hides steps 2 and 3 with display:none, so they can't be reached without scroll-driving** (`src/story.css; src/components/story/HowChapter.tsx:story.css:449; HowChapter.tsx:67-85`)  
   Problem: @media (max-width:860px) { .st-how-step:not(.is-active) { display: none; } }. Probe at 390x844 with reduced motion: steps[1] and steps[2] report display 'none' and their buttons are not visible. The section isn't pinned in that mode, so scrolling never changes the step either.  
   Fix: Limit the hiding rule to motion: wrap story.css:449-450 in @media (prefers-reduced-motion: no-preference). Under reduced motion, show all three steps as a static list with the button switching the phone, which HowChapter already supports via setStep.

35. **Medium · Sticky step bar covers content all the way down on phones and duplicates the header CTA** (`src/story.css:394` · re-checked)  
   Problem: mobile-07700.png covers the privacy card text, mobile-08400.png covers an FAQ row, mobile-10224.png covers the footer copyright. The header 'Get Mozy' and the bar's 'Get Mozy' are both on screen in every frame.  
   Fix: Add bottom padding equal to the bar height to .st-qa and the footer on phones, hide the bar inside the FAQ and footer (extend the existing is-tucked logic in useLandingMotion.ts), and drop the header CTA on phones while the bar is visible.  
   Also reported by: visual-desktop

36. **Medium · On small phones (<=667px tall) the How phone mock is pushed offscreen and under the HUD** (`src/components/story/HowChapter.tsx:HowChapter.tsx:56-57`)  
   Problem: room = stage.clientHeight - copy.offsetHeight - 190, clamped to a minimum scale of 0.52. 375x667 gives the phone at 352-685 (18px offscreen) with the HUD over 593-655. 360x640 gives the phone at 352-685, 45px offscreen. 390x844 fits (354-754).  
   Fix: Subtract the HUD height (~74px) in `room` and lower the floor to ~0.42, or tuck the HUD while How is pinned on mobile. Re-run fit after fonts load (see the separate finding).

37. **Medium · Two identical stern Mozes 100px apart in the hero** (`src/components/story/Hero.tsx:135`)  
   Problem: hero-two-moz.png: Moz stern on the phone lock sheet (Phone.tsx:84, 124px) and again beside the phone (Hero.tsx:135, 190px) overlapping the phone's bottom-left bezel, both with the same raised hand.  
   Fix: Keep the in-app Moz; change the outside one to a different beat (peeking over the phone's top edge, or waving) and move it so it does not overlap the bezel, or drop it and let the Caveat note point at the phone.

38. **Medium · The 2:17 AM device has no explanation on phones** (`src/components/story/Hero.tsx:123`)  
   Problem: Eyebrow "2:17 AM · Walk to earn screen time" (Hero.tsx:123) and phone status bar "2:17" (Phone.tsx:13) render on mobile (mobile-00000.png), but the lines that give the time its meaning, "it's 2:17 AM. Moz says no." (Hero.tsx:136) and "you opened Instagram for one reel… now it's 2:17 AM" (HowChapter.tsx:103), are `display: none` below 860px (story.css:439, :447).  
   Fix: On mobile, make the eyebrow carry the story itself: "2:17 AM · one more reel…" (keep "Walk to earn screen time" as the h1's visually-hidden prefix or in the lede), or show the How-chapter note on mobile at 18px under the h2 instead of hiding it.

39. **Medium · No FAQPage JSON-LD on the landing page, pricing page or any article, although all three render FAQs and every article already carries an unused schema.faqPage block** (`src/pages/LandingPage.tsx:21`)  
   Problem: LandingPage.tsx:21 emits only applicationSchema; the 7 Q/As in landing.ts:24-32 are rendered as <details> (QuestionsChapter.tsx:31) with no schema. PricingPage.tsx:30 emits applicationSchema only, pricingFaqs (lines 19-24) unmarked. BlogPost.tsx:107-121 emits BlogPosting + BreadcrumbList;  
   Fix: In landing.ts export `faqSchema = {"@context":"https://schema.org","@type":"FAQPage","@id":"https://mozy.mcrudra.com/#faq","mainEntity": faqs.map(([q,a]) => ({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}` and emit it from LandingPage.tsx (and the pricing equivalent from PricingPage.tsx).  
   Also reported by: seo-technical

40. **Medium · Sticky step bar on mobile shows bare numbers with no noun** (`src/story.css:460`)  
   Problem: `.st-hud-label { display: none; }` under the mobile media query hides "steps scrolled", so mobile-08400.png reads "8,380 → 246 min Get Mozy". On desktop (desktop-05000.png) it reads "5,247 steps scrolled → 154 min", which still invites the reading that the site measured real steps.  
   Fix: Keep a two-word label on mobile: "steps" before the arrow (`.st-hud-label { display:inline }` with shorter text via a second span) and add `title="Your scroll, counted as a walk: 34 steps = 1 minute"` plus a visually hidden sentence for screen readers. On desktop change "steps scrolled" to "steps (this scroll)".

41. **Medium · 'At 00:00, they lock.' reads as midnight, not a zero balance** (`src/components/story/HowChapter.tsx:10`)  
   Problem: Step 3 title "At 00:00, they lock." follows the note "now it's 2:17 AM" two lines above (HowChapter.tsx:103) and the hero's "2:17 AM" clock; the intended meaning is the balance shown as "00:00" on the phone (Phone.tsx:97).  
   Fix: "When your balance hits zero, they lock." (body copy already says "When the balance runs out"). Keep "00:00" on the phone screen where the "Screen time balance" label disambiguates it.

42. **Medium · How chapter at scrollY 901 renders correctly; the 'empty' feel comes from dead space and a static first 540px of the pinned track** (`src/components/story/HowChapter.tsx; src/story.css; src/components/story/Hero.tsx:HowChapter.tsx:13; story.css:183,186; Hero.tsx:101`)  
   Problem: Three fresh captures at 901 (smooth and jump) show the eyebrow, title, three steps and phone (code-audit/shots/jump-00901.png). The probe at 1440x900 puts the How top at 901 and the stage pinned from 901 to 2701. STEP_STARTS = [0, 0.3, 0.68], so the active step stays 0 from 901 to 1440: desktop-00901.png and desktop-01400.png are identical.  
   Fix: Start step 2 earlier (STEP_STARTS = [0, 0.18, 0.55], DRAIN = [0.22, 0.5]) or shorten .st-how to 240vh. Reduce the stage's top padding to clamp(72px, 9vh, 96px) and align the grid to the top on desktop. Or give the How copy a short entrance (fade or slide in over 'top 80%' to 'top top') so something moves while it enters.  
   Also reported by: visual-desktop

43. **Low · Large blank gaps between chapters on phones** (`src/story.css:369` · re-checked)  
   Problem: mobile-09100.png: about 250px of empty cream between the last FAQ row and the final chapter's sky; desktop-08461.png shows the same gap above the final chapter.  
   Fix: Reduce .st-qa bottom padding on phones (72px to 32px) and start the final chapter's sky gradient inside the FAQ's last 120px.  
   Also reported by: visual-desktop

44. **Low · On phones the seven FAQ questions sit below two cards, about 1.5 screens after the heading** (`src/components/story/QuestionsChapter.tsx:1` · re-checked)  
   Problem: mobile-07700.png to mobile-09100.png: heading, privacy card and founder card come first; the first question appears at the bottom of mobile-08400.png.  
   Fix: On phones put the question list directly under the heading and move the privacy and founder cards after it (CSS order or a reordered grid).

45. **Low · H2 weight, size and alignment vary across chapters** (`src/story.css:332`)  
   Problem: Walk h2 Fredoka 600 clamp(26-42px) centred (332); world/FAQ .st-h2 700 clamp(36-60px) left (54); final 700 clamp(40-84px) centred (story-world.css:184); how 700 clamp(32-52px) left (189). Visible across desktop-03601/06400/08461/09212.png.  
   Fix: One H2 scale (700, clamp(36px,4.4vw,60px)); let the walk number be the only outsized element; keep walk and final centred as the two 'full-bleed' chapters and say so in the CSS comment.

46. **Low · Dark nav pill stays on light chapters** (`src/story.css:61`)  
   Problem: .st-nav background rgba(16,20,38,0.82) with blur (61) on every chapter; on desktop-07300.png and 08461.png it is the heaviest element on a cream/lilac page.  
   Fix: Toggle a .is-day class on .st-header when the walk unlocks (or at the world chapter start) that switches to rgba(255,250,240,0.86) with ink text and a green CTA.

47. **Low · Founder card uses an 'MC' monogram placeholder** (`src/components/story/QuestionsChapter.tsx:22`)  
   Problem: st-founder-mark 'MC' in a green circle (22; story.css:366) next to 'Made by one indie developer.' (desktop-09212.png precursor at 08461).  
   Fix: Use a 52px photo of Mahesh (or Moz if he prefers not to show a face) with the same round mask.

48. **Low · 'Next: walk them back' is an idiom for retracting, not earning** (`src/components/story/HowChapter.tsx:115`)  
   Problem: "Next: walk them back ↓" links to #walk after step 3 ("At 00:00, they lock.").  
   Fix: "Next: earn them back ↓" (mirrors FinalCta.tsx:37 "Earn them back, one walk at a time.").

49. **Low · 'Payment declined' reads as a billing error on a subscription app** (`src/components/story/Phone.tsx:100`)  
   Problem: Lock screen "Payment declined. Go walk." (Phone.tsx:100) and step copy "Moz holds up a hand: payment declined, go walk." (HowChapter.tsx:10), on a page that also says "Mozy Premium, $4.99 a month" (FinalCta.tsx:45).  
   Fix: "Out of minutes. Go walk." on the phone; step 3 body: "Moz holds up a hand: no minutes, no feed. Go walk." Keep the headline's 'charges you in steps', which lands because it is clearly figurative.

50. **Low · Headline 'charges you in steps' needs the lede to be understood; keep it, but protect the 5-second read** (`src/components/story/Hero.tsx:124` · unverified)  
   Problem: h1 "Your phone now charges you in steps."; the literal proposition lives in the eyebrow "Walk to earn screen time" (:123) and the lede "Mozy locks the apps you pick… Every 34 steps buys one minute." (:125). 'charges' can be read as battery or billing until the lede is read; on desktop-00000.png the full stack is visible, so it works there.  
   Fix: Keep the h1. Make sure the eyebrow's literal line survives on mobile (see the 2:17 AM finding) and consider the lede opening with the category word for search and AI readers: "Mozy is an app blocker and step counter: it locks the apps you pick…" (the same sentence productFacts and the store use).

## Copy truth and persuasion

51. **CRITICAL · Privacy page publishes the unverified midnight reset and emergency bypass** (`src/pages/PrivacyPage.tsx:77` · re-checked)  
   Problem: Lines 71-78: heading "05 · On-Device Reset & Emergency Bypass"; "Midnight Balance Reset: Screen-time balances reset to 00:00 every midnight…"; "Emergency Bypass: The 3 daily sessions of 10-minute emergency bypass access…". src/data/productFacts.ts:97-109 marks both `verified: false` ("Not on either store listing; confirm before showing publicly").  
   Fix: Delete section 05 or reduce it to the verified sentence: "All balance and locking logic runs on your phone; Mozy makes no network requests to decide when an app locks or unlocks." If the midnight reset and the 3×10-minute bypass really exist in the current builds, verify them, flip `verified: true` in productFacts.ts, and then surface them on the landing FAQ (they answer real objections) rather than only in the privacy policy.  
   Also reported by: gso

52. **High · 'Block Shorts & Reels' title implies feature-level blocking Mozy cannot do** (`src/data/mozy-articles.json:2547` · re-checked)  
   Problem: short-form-video record (slug line 2547) titleTag 'Block Shorts & Reels: Stopping Micro-Content Decay', primaryKeyword 'block youtube shorts instagram reels app', gso.aiAnchorSentence (2586) 'surgical feature blocking via Mozy'.  
   Fix: Retitle as in the rewrites finding ('How to Block Reels, Shorts and TikTok' with the whole-app caveat in the first sentence), change primaryKeyword to 'block reels and shorts', and rewrite the gso anchor to state 'locks the whole app'.  
   Also reported by: gso

53. **High · Footer 'MCRUDRAX' and 'Terms' links land on pages saying Mozy is free and iOS is coming soon** (`src/components/SiteChrome.tsx:49`)  
   Problem: Footer links `<a href="https://mcrudra.com/">MCRUDRAX</a>` and `<a href="https://mcrudra.com/terms">Terms</a>`. Fetching those pages (2026-10-11) returns header copy "Download now. It's free. Android available · iOS coming soon" on /, /apps/mozy and /terms; /terms is "Last Updated: July 2026", mentions Mozy 5 times and the word "subscription" 0 times.  
   Fix: Before this site deploys, update the mcrudra.com header ("Download now. It's free. Android available · iOS coming soon" → "Free to download on Android and iPhone; see each app's pricing") and add a subscription section to /terms (auto-renew, cancel via App Store/Google Play, no refunds through MCRUDRAX). Until that is done, point the Mozy footer 'Terms' link at a Mozy-specific terms route on this subdomain or at Apple's standard EULA the App Store listing already uses, and keep the brand link but know what it says.

54. **High · '34 steps = 1 minute' is shown as universal on the landing page but only the iOS listing states it** (`src/components/story/Hero.tsx:125` · re-checked)  
   Problem: Hero lede: "Every 34 steps buys one minute."; WalkChapter.tsx:349 h2 "Every 34 steps buys you a minute."; WalkChapter.tsx:306 signpost "34 steps = 1 min"; WalkChapter.tsx:179 and useLandingMotion.ts:6 compute minutes from 34 for every visitor; landing.ts:25 FAQ "Every 34 steps earns one minute". productFacts.ts:91-96: `statedOn: ['ios']`, "confirm the Android build uses the same ratio".  
   Fix: Preferred: open the Android build, read the real ratio, and record it in productFacts (`statedOn: ['ios','android']`). Until then, qualify every instance once, not five times: hero lede "Every 34 steps buys one minute (iPhone; Android sets its own rate)." Walk h2 keep, add to the Walk lede "On iPhone, 34 steps earn a minute." FAQ: "On iPhone, every 34 steps earns one minute;  
   Also reported by: seo-technical

55. **High · Privacy page names CoreMotion while the listing, productFacts and the FAQ card say HealthKit** (`src/pages/PrivacyPage.tsx:54` · re-checked)  
   Problem: PrivacyPage.tsx:54 "CoreMotion (CMPedometer): Reads hardware pedometer steps locally" and :53 adds "ManagedSettings & DeviceActivity". productFacts.ts:129-133 lists the iOS step source as HealthKit ("Apple Health (HealthKit) step data, processed on device") with only FamilyControls & ManagedSettings for blocking. The App Store listing (fetched 2026-10-11) says "using official iOS Apple Screen Time & HealthKit APIs".  
   Fix: Check the iOS target's entitlements/Info.plist (NSHealthShareUsageDescription vs NSMotionUsageDescription, DeviceActivity entitlement). Then make productFacts.ts the single list and render the privacy page's iOS/Android permission sections from `PRODUCT_FACTS.platforms.*.permissions` exactly as PricingPage.tsx:54 already does, so the two pages cannot drift.  
   Also reported by: truth-copy

56. **Medium · Invented feature language 'intentional unlock flow' survives in a live FAQ and 15 GSO anchors** (`src/data/mozy-articles.json:3484`)  
   Problem: how-to-stop-doomscrolling FAQ (3484-3485) 'What is an intentional unlock flow and how does it stop doomscrolling?' defines a feature then maps it to Mozy; the held best-apps record (3799) describes a '10-15 second reflection prompt' decision screen that does not exist; gso.aiAnchorSentence in 15 planned records (e.g.  
   Fix: Delete the FAQ or rewrite it as 'Why does walking work better than a timer?'; rewrite every gso.aiAnchorSentence to the verified one-liner ('Mozy is an app blocker and step counter: walking earns screen-time minutes for the apps you pick and those apps lock when the minutes run out; iOS 16.4+ and Android 8.0+'); remove 'best app' superlatives.

57. **Medium · Privacy page names the company 'mcrudra' and omits the developer of record** (`src/pages/PrivacyPage.tsx:22`)  
   Problem: "At mcrudra (mcrudra.com), we build software engineered for humans" (:22) and "Developer / Publisher: mcrudra (mcrudra.com)" (:91). Everywhere else the brand is "MCRUDRAX" (SiteChrome.tsx:45,53; landing.ts:47; productFacts.ts:85). The App Store lists the developer as "Mahesh Chambhare"; Google Play lists "mcrudra" (both fetched 2026-10-11).  
   Fix: "This policy is published by MCRUDRAX (mcrudra.com), the studio of Mahesh Chambhare, who is the developer of record on the App Store; on Google Play the publisher appears as 'mcrudra'. Contact: hello@mcrudra.com." Use `PRODUCT_FACTS.parentCompany` and `developerName` so the names cannot drift.

58. **Medium · Pricing FAQ assumes an Android subscription that productFacts does not confirm** (`src/pages/PricingPage.tsx:21`)  
   Problem: "How do I cancel a subscription? … On Android, open Google Play, tap your profile, then Payments & subscriptions, then Subscriptions." productFacts.ts:145-150: android `subscriptionRequired: null`, `inAppPurchaseRangeUsd: [4.99, 34.99]` ("per item"); the Play listing shows "In-app purchases" and no subscription.  
   Fix: Confirm in Play Console what the $4.99–$34.99 items are. Rewrite line 21: "On iPhone: Settings › your name › Subscriptions › Mozy. On Android: Google Play › profile › Payments & subscriptions (one-time purchases appear under Budget & history). You keep access until the end of the period you've paid for." Rewrite line 22: "Mozy has no ads, no account and no data to sell, so the only way it pays for itself is the price you see here. One indie developer builds and supports it."  
   Also reported by: aso

59. **Medium · Analytics and widgets are claimed for both platforms but appear only on the Play listing** (`src/components/story/world/WorldChips.tsx:51`)  
   Problem: WorldChips.tsx:51 "Analytics: Steps walked, minutes earned and minutes spent, by day, week and month." and :55 "Widgets: Home-screen widgets keep your level and streak in view."; PricingPage.tsx:15 "Analytics for steps and minutes, plus home-screen widgets." Store text fetched 2026-10-11: App Store listing contains 'analytic' 0 times and 'widget' only in other apps' names;  
   Fix: Confirm on an iPhone build. If iOS has them, keep the copy but match the listing's wording ("Analytics: steps, minutes earned and spent, and goal completion over time."). If not, scope the chips: "Analytics (Android)" / "Home-screen widgets (Android)" and change PricingPage.tsx:15 to "On Android: analytics and home-screen widgets."

60. **Medium · Privacy page makes absolute 'zero/100%' claims beyond the verified facts** (`src/pages/PrivacyPage.tsx:12`)  
   Problem: "Last Updated: October 2026 · 100% Offline & On-Device" (:12); "absolute commitment to user privacy, offline-first execution, and zero server-side storage or tracking" (:25); "Core Privacy Principle: Zero Data Collection" (:31); "Zero Data Transmission or Monetization" (:40).  
   Fix: Rewrite to the verified level: "Mozy does not collect your data. Steps, balances and your app list are stored and processed on your phone; Mozy has no account system and no server that receives them. Payments are handled by Apple or Google under their own privacy policies; Mozy does not see your payment details." Replace "Last Updated: October 2026" with a full date, name the company as MCRUDRAX (see separate finding), and drop the "curb doomscrolling / stay physically active" sentence.

61. **Low · App Store description claims feature-level blocking ('Block Reels, Shorts & TikTok', 'Block Instagram Reels') that contradicts the site and productFacts** (`src/data/productFacts.ts:181`)  
   Problem: App Store description opens 'Walk to earn your screen time! Block Reels, Shorts & TikTok with Mozy' and lists '• Block Instagram Reels: Stop losing hours to short-form video loops. • Block YouTube Shorts & TikTok'.  
   Fix: In App Store Connect edit to 'Block the apps behind Reels, Shorts and TikTok' / '• Block Instagram (and its Reels)'. Same wording in the Play long description ('Limiting Instagram Reels and YouTube Shorts') and Play screenshot 1.

62. **Low · Brand casing flips between MOZY and Mozy across pages** (`src/pages/BlogIndex.tsx:16`)  
   Problem: Prose on the landing page uses "Mozy" throughout; the blog uses "MOZY" in CTAs ("Meet MOZY ↗", BlogPost.tsx:130 "Get MOZY ↗", "MOZY turns your steps into screen time"); PrivacyPage.tsx uses "MOZY" in every sentence; metadata.ts titles use "MOZY"; the store names, JSON-LD `name` and productFacts tagline use "Mozy". Footer: "A MCRUDRAX app" (SiteChrome.tsx:45), which reads "An M-C-RUDRAX app" if the letters are spoken.  
   Fix: "Mozy" in all prose, titles and CTAs; "MOZY" only as the logotype. Decide how MCRUDRAX is pronounced and use "An MCRUDRAX app" if the letters are spelled out.

63. **Low · Android version claim inside screen-time-limits FAQ conflicts with Mozy's own minimum** (`src/data/mozy-articles.json:8211`)  
   Problem: screen-time-limits-android (slug 8211) FAQ 'Does Android have a built-in screen time limiter?': 'Digital Wellbeing suite (available on Android 9+)'; productFacts.ts android.minOs = 'Android 8.0 or later'. Readers on Android 8 are told the built-in option exists only on 9+ while being sold Mozy for 8.0+; the Digital Wellbeing availability is OEM-dependent and unsourced.  
   Fix: Source the Digital Wellbeing availability from Google's support page (link it) and state Mozy's 8.0+ requirement next to it.

64. **Low · Footer social list and JSON-LD sameAs disagree** (`src/data/landing.ts:17` · unverified)  
   Problem: socialLinks (landing.ts:17-22) = Instagram, YouTube, Threads, X; applicationSchema.publisher.sameAs (landing.ts:49-56) adds Facebook and LinkedIn. All six URLs match the verified accounts.  
   Fix: Derive sameAs from socialLinks and add ['Facebook','https://www.facebook.com/share/1eR1g5xtip/'] and ['LinkedIn','https://www.linkedin.com/in/maheshchambhare/'] to socialLinks.

## Technical SEO

65. **High · Sitemap: 21 of 33 URLs have no lastmod, and the committed public/sitemap.xml is stale, lists the two held articles and is what the dev server serves** (`scripts/prerender.mjs:43` · re-checked)  
   Problem: dist/sitemap.xml after this build: `lastmod count: 12 of 33 urls` (only the 12 published articles carry 2026-09-10; /, /pricing, /blog, /privacy and all 17 planned posts have none) because prerender.mjs:43 reads only `editorial.updatedAt || schema.article.dateModified`, which no article sets.  
   Fix: Delete public/sitemap.xml (keep it generated only in dist/). In prerender.mjs:43 compute lastmod as `editorial.updatedAt ?? schema.article.dateModified ?? schema.article.datePublished` for articles and, for /, /pricing, /blog, /privacy, a build-time constant taken from the last git commit touching their sources (or a `LASTMOD` map in metadata.ts you bump deliberately). Only emit published articles (finding #2). Add `assert(!sitemap.includes('planned-slug'))` style checks to check-blog-content.mjs.  
   Also reported by: blog, gso

66. **High · No prerendered 404 page: unknown URLs would serve the landing HTML with index,follow and canonical '/', i.e. soft-404s** (`scripts/prerender.mjs:20` · re-checked)  
   Problem: `ls dist/404.html` -> No such file or directory; routes array in prerender.mjs:20-27 has no 404 entry. The only 404 is client-side (src/App.tsx:41-51, with `<h1 className="mozy-h2">404 - Page Not Found</h1>`) and the noindex for it is set by JS only (src/components/PageMetadata.tsx:13 `robots: … 'noindex, follow'`). Dev server: curl http://localhost:5173/this-does-not-exist -> 200.  
   Fix: In prerender.mjs add a `{path:'/404', component: NotFound}` route that writes `dist/404.html` with `<meta name="robots" content="noindex">`, title 'Page not found | MOZY', no canonical, and links to / and /blog; configure the host to use it (`not_found_handling: "404-page"` on Workers; Pages uses dist/404.html automatically). Keep the App.tsx client fallback for in-app navigation only.

67. **High · Live http://mozy.mcrudra.com is served over plain HTTP with no redirect and no HSTS** (`../mcrudra-web/wrangler.jsonc:1`)  
   Problem: `curl -I http://mozy.mcrudra.com/` -> `status=200`, no `Location` header, body served (`Cache-Control: s-maxage=31536000`, `Server: cloudflare`); no `strict-transport-security` header on the https response either. wrangler.jsonc contains no redirect rule and mcrudra-web/next.config.ts has none for scheme.  
   Fix: In the Cloudflare dashboard for the mcrudra.com zone enable SSL/TLS -> Edge Certificates -> 'Always Use HTTPS' and 'HTTP Strict Transport Security' (max-age 15552000, includeSubDomains), or add a Redirect Rule `(http.request.scheme eq "http") -> https://${host}${uri} 301`. Verify with `curl -I http://mozy.mcrudra.com/` expecting 301 + Location https.

68. **High · Prerender writes every route as folder/index.html while canonicals, sitemap, og:url and breadcrumbs use no trailing slash: on Cloudflare static hosting every canonical URL would 308 to its slash twin** (`scripts/prerender.mjs:39`)  
   Problem: prerender.mjs:39-40 `const directory=route.path==='/'?'dist':`dist${route.path}`; … writeFile(`${directory}/index.html`)` -> dist/pricing/index.html, dist/blog/<slug>/index.html. src/data/metadata.ts:13 sets `url: ${siteUrl}${path}` (no slash) which feeds <link rel=canonical>, og:url and the sitemap; BlogPost.tsx:105 canonical likewise.  
   Fix: Pick one form and enforce it at the host: Workers static assets -> `"assets": {"html_handling": "drop-trailing-slash"}` (serves /pricing and 308s /pricing/ -> /pricing, matching the canonicals and the live behaviour). If using Cloudflare Pages (no html_handling), change prerender.mjs:39-40 to write `dist/pricing.html` and `dist/blog/<slug>.html` instead of folders. Add a post-build check that curls each sitemap URL and asserts 200 with no redirect.

69. **Medium · Title tags over 60 chars and descriptions over 160 chars on 8 and 13 live posts** (`src/data/mozy-articles.json:3943`)  
   Problem: Title length: digital-wellbeing-vs-mozy 80, attention-economy 75 (suffix '| mcrudra', the wrong brand), scroll-addiction-test 74, doomscrolling-addiction-help 73 ('| Doomscrolling Help' suffix), parents-guide 67, walk-to-earn 66, phone-addiction-test 66, screen-time-statistics 66, how-to-stop-doomscrolling 65, how-to-stop-checking-phone 65, plus 61-64 on 7 published posts.  
   Fix: Enforce titleTag <= 60 and metaDescription <= 155 in check-blog-content.mjs; use one suffix '| Mozy'; make H1 = title core (drop puffery like 'Only Guide That Actually Works', 'That Reveal the Truth').  
   Also reported by: seo-technical

70. **Medium · attention-economy-explained is published on both mcrudra.com and mozy.mcrudra.com with a '| mcrudra' title on the Mozy copy** (`src/data/mozy-articles.json:1`)  
   Problem: Record attention-economy-explained: domain "mcrudra.com", seo.titleTag "... | mcrudra", canonicalUrl https://mcrudra.com/blog/attention-economy-explained, breadcrumb items on mcrudra.com; metadata.ts forces canonical https://mozy.mcrudra.com/blog/attention-economy-explained and dist/blog/attention-economy-explained/index.html title is "The Attention Economy: How Big Tech Profits from Your Distraction | mcrudra".  
   Fix: Keep one copy: either hold the article on this site (editorial.hold) and link to the parent, or make the parent page canonical to the Mozy URL. Fix seo.titleTag to '... | Mozy' and set domain/subdomain fields to mozy.mcrudra.com. Add a check in check-blog-content.mjs that no titleTag ends with '| mcrudra'.

71. **Medium · Internal linking is thin: landing body links to no article, 19 of 31 articles link to no other article, blog h1 and pricing title carry no keywords** (`src/pages/BlogIndex.tsx:16`)  
   Problem: Article JSON scan: `articles with internal /blog/ links: 12, without: 19`. dist/index.html links to /blog only through the nav/footer label 'Journal' (SiteChrome.tsx:7,48). BlogIndex.tsx:16 h1 = 'A little perspective. A little more life.' and description (metadata.ts:12) is generic. metadata.ts:11 pricing title = 'Pricing | MOZY' (14 chars), privacy title 21 chars; /blog has no JSON-LD (0 blocks).  
   Fix: Add a 'From the journal' strip of three published posts above the FAQ on the landing (data from `articles` filtered to status published); in BlogIndex.tsx:16 use an h1 like 'The Mozy Journal: screen time, walking and digital habits' and emit a `CollectionPage`/`Blog` JSON-LD with `hasPart` of published posts; set pricing title to 'Mozy Pricing: Free Download, Premium $4.99/mo or $29.99/yr on iPhone' and privacy to 'Mozy Privacy Policy: Steps and App Blocking Stay on Your Phone';

72. **Medium · MobileApplication JSON-LD lacks @id/screenshots/featureList/installUrl and an Android offer, and the identical block is duplicated on /pricing with url '/'** (`src/data/landing.ts:34`)  
   Problem: dist/index.html and dist/pricing/index.html both carry the same MobileApplication object (`url: https://mozy.mcrudra.com/`, no `@id`); landing.ts:58-68 offers = free download + two iPhone subscription offers; no offer for Android in-app purchases ($4.99–$34.99 in productFacts.ts:149); no `screenshot`, `featureList`, `installUrl`, `softwareVersion`, `datePublished`; `author` is a bare Person without `url`;  
   Fix: In landing.ts add `'@id': 'https://mozy.mcrudra.com/#app'`, `publisher['@id'] = 'https://mcrudra.com/#organization'`, `author: { '@type':'Person', name, url:'https://mcrudra.com', sameAs:[linkedin, x] }`, `installUrl: [iosStoreUrl, androidStoreUrl]`, `screenshot: ['https://mozy.mcrudra.com/assets/v2/hero-phone.png', …]`, `featureList: ['Lock Instagram, TikTok, YouTube or any app', 'Earn minutes by walking (34 steps = 1 minute on iPhone)', 'No account, no GPS']`, and an Android `AggregateOffer { lowPrice:'4.99', hig…

73. **Low · Visible breadcrumb says 'Article' while BreadcrumbList schema uses the H1** (`src/pages/BlogPost.tsx:130`)  
   Problem: BlogPost.tsx:130 renders <span>Article</span> as the third crumb (screenshot post-00000.png: 'Home / Journal / Article'); the BreadcrumbList schema (line ~124) sets position 3 name = article.seo.h1.  
   Fix: Render the article H1 (truncated with CSS) as the third crumb.

74. **Low · Verified OK (no action): canonicals, og/twitter tags, one h1 per page, lang=en, noindex on /get, prerendered full landing text, tracked store links and socials all resolve** (`src/data/metadata.ts:13`)  
   Problem: All 34 prerendered pages: exactly one <h1>, `<html lang="en">`, canonical == og:url == sitemap URL (no trailing slash), description/og/twitter populated, `content="undefined"` count 0; /get has `noindex, follow` and is excluded from the sitemap (prerender.mjs:25 `unlisted`). dist/index.html visible text = 765 words and contains '34 steps', 'iOS 16.4', 'Android 8.0', '$4.99', 'Premium' with no JS;  
   Fix: Keep these invariants in check-blog-content.mjs (already covers title/description/canonical for articles) and extend the same assertions to /, /pricing, /blog, /privacy and /get.

75. **Low · Journal index has no structured data, a keyword-less H1 and filters that return 1-3 results** (`src/pages/BlogIndex.tsx:10`)  
   Problem: dist/blog/index.html contains 0 ld+json blocks; H1 is 'A little perspective. A little more life.' (BlogIndex.tsx:16, screenshot blog-00000.png); topics at line 10 are matched by substring on h1+meta+secondaryKeywords: 'Sleep' matches 1 article, 'Habits' 3, while 12 of 29 cards show the eyebrow 'Screen Addiction' (blog-00800.png); search ignores body text.  
   Fix: Add a Blog + ItemList JSON-LD on /blog, an H1 like 'The Mozy Journal: screen time, walking and phone habits', derive filters from an explicit `topic` field (Setup, Compare, Why apps hook you, Routines, Sleep) and show counts; include content.answer in the search haystack.

76. **Low · Static index.html OG/Twitter copy is stale and makes a willpower claim** (`index.html:18`)  
   Problem: og:title "Mozy: Your Phone Now Charges You in Steps" and og:description/twitter:description "Earn your scroll. Walk → earn minutes → use your apps. Stop relying on willpower." (index.html:18-24). metadata.ts:11-12 defines different title/description, and both the prerender (dist/index.html) and PageMetadata.tsx overwrite the tags;  
   Fix: Make index.html's OG/Twitter tags identical to `pageMeta('/')` (title "MOZY: Walk to Earn Screen Time | App Blocker for Android & iPhone", the metadata.ts description), or have scripts/prerender.mjs be the only writer and strip them from index.html.

77. **Low · 'Journal' label hides the blog from people and crawlers looking for a blog** (`src/components/SiteChrome.tsx:7` · unverified)  
   Problem: Nav and footer label "Journal" (SiteChrome.tsx:7, :48); metadata.ts:11 "The MOZY Journal | Screen Time, Walking & Digital Habits"; BlogIndex.tsx:16 "THE MOZY JOURNAL" and "stories"; the route is /blog and BlogPost.tsx:130 breadcrumb says "Journal".  
   Fix: Nav/footer: "Blog"; page title "Blog: The Mozy Journal | …" if the brand name is wanted; breadcrumb "Blog"; keep "stories" only in the hero line.

## GSO (AI search: ChatGPT, Perplexity, Google AI Overviews)

78. **High · Articles carry no author, no dates and an Organization author in schema** (`src/pages/BlogPost.tsx:119` · re-checked)  
   Problem: BlogPost.tsx:119 author = {'@type':'Organization', name:'MOZY Journal'}; :117 datePublished only when schema.article.datePublished exists (the 19 planned records have none); dateModified only from editorial.updatedAt, which no record sets (grep '"updatedAt"' returns nothing), so no 'Updated' line renders (reader-meta in dist shows only 'MOZY Journal · 10 min read'); :115 every article shares image=og-banner.png.  
   Fix: Add visible byline 'Mahesh Chambhare, maker of Mozy' with a Person schema (sameAs = the correct socials from the brief), set editorial.updatedAt on every real revision, set datePublished when an article is actually published, and generate a per-article OG image (title on brand background) instead of one banner.  
   Also reported by: gso, seo-technical

79. **High · Organization entity is split between 'MCRUDRAX' (this site) and 'mcrudra' (parent site) and the publisher @id dangles** (`src/pages/BlogPost.tsx:120` · re-checked)  
   Problem: BlogPost.tsx:120 emits publisher `{"@id":"https://mcrudra.com/#organization","name":"MCRUDRAX"}`; landing.ts:45-56 emits publisher name "MCRUDRAX". Live mcrudra.com (curl) emits Organization `name: "mcrudra"`, alternateName ["mcrudra apps","mcrudra digital wellness"], NO @id, sameAs [twitter.com/mcrudra, instagram.com/mcrudra, linkedin.com/company/mcrudra, play.google.com/store/search?q=mcrudra] (the accounts the bri…  
   Fix: Decide the canonical name (brand memory says MCRUDRAX) and apply it on both sites. In this repo: add a shared `src/data/graph.ts` exporting one Organization node `{"@type":"Organization","@id":"https://mcrudra.com/#organization","name":"MCRUDRAX","alternateName":["mcrudra","MCRUDRAX apps"],"url":"https://mcrudra.com","logo":...,"founder":{"@id":"https://mcrudra.com/#mahesh"},"sameAs":[the six correct accounts from landing.ts:49-55]}` and reuse it from landing.ts and BlogPost.tsx.  
   Also reported by: gso

80. **High · gso.aiAnchorSentence / entityMentions carry false product claims and copy-pasted Pozy/Doovi entities, and the live llms-full.txt was generated from them** (`src/data/mozy-articles.json:1`)  
   Problem: gso.aiAnchorSentence (12 published): "automated curfew locks via Mozy" (bedtime-revenge), "automated notification batching via Mozy" (phantom-vibration), "automated task isolation via Mozy" (continuous-partial-attention), "surgical feature blocking via Mozy" (short-form-video; productFacts.ts:181 says it blocks entire apps), "guided breathwork ... automated via Mozy" (somatic-friction), "cold-exposure resets ...  
   Fix: Rewrite aiAnchorSentence per article to the first two sentences of the (already corrected) tldr_block, e.g. for short-form-video: "Short-form feeds deliver a new stimulus every few seconds, which makes slower activities feel dull. Mozy puts TikTok, Instagram and YouTube behind minutes you earn by walking; it locks the whole app, not individual features." Set entityMentions to real page entities (e.g. ["Mozy","MCRUDRAX","variable ratio reinforcement","B.F. Skinner","Instagram Reels","TikTok","YouTube Shorts"]).

81. **High · Deploying this repo removes the llms.txt, llms-full.txt, AI-crawler robots stanzas and home FAQPage that the live site serves today** (`public/robots.txt:5` · re-checked)  
   Problem: Live (curl, 2026-10-11): https://mozy.mcrudra.com/llms.txt 200, /llms-full.txt 200 (282,296 bytes), robots.txt with explicit stanzas for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot, Applebot-Extended, Meta-ExternalAgent, cohere-ai, Bytespider, CCBot plus an "# LLM Manifests" pointer, and a FAQPage JSON-LD on the home page.  
   Fix: Generate public/llms.txt from productFacts.ts + landing.ts faqs inside scripts/prerender.mjs so it can never drift: "# Mozy\n> Mozy is an app blocker and step counter by MCRUDRAX (Mahesh Chambhare): walking earns screen-time minutes for the apps you pick, and those apps lock when the minutes run out.\n\n## Facts\n- Platforms: iPhone iOS 16.4+, Android 8.0+\n- Price: free download on both stores; iPhone features need Mozy Premium, $4.99/month or $29.99/year (US);

82. **Medium · JSON-LD offers lead with a $0 'free download' and the category is wrong for the App Store** (`src/data/landing.ts:58`)  
   Problem: offers[0] = `{ price: '0', name: 'Free download on the App Store and Google Play' }` before the two Premium offers; `applicationCategory: 'HealthApplication'` while the App Store lists Mozy under Productivity and Play under Health & Fitness; `name: 'Mozy', alternateName: 'MOZY'` with neither store name ("Mozy: Walk to Earn Screen Time", "Mozy: Walk to Unlock Apps");  
   Fix: Order offers Premium monthly, Premium yearly, then the $0 offer with `description: 'Free to download; iPhone features require Mozy Premium. Android has in-app purchases from $4.99.'`; set `applicationCategory: 'ProductivityApplication'` with `applicationSubCategory: 'Health & Fitness'` (or list both); `alternateName: ['MOZY','Mozy: Walk to Earn Screen Time','Mozy: Walk to Unlock Apps']`; extend `description` with the pricing sentence from the FAQ.

83. **Low · 'Moz' is an undefined entity on the page and the brand name appears in three forms** (`src/components/story/Hero.tsx:136`)  
   Problem: Hero.tsx:136 'it's 2:17 AM. Moz says no.', HowChapter.tsx:10 'Moz holds up a hand', WorldChapter.tsx:179 'Keep walking, and Moz's world grows back.' Nothing on the page says who or what Moz is; Moz.tsx:84 renders the SVG aria-hidden unless a title prop is passed, so the mascot has no accessible or crawlable name. 'MOZY' appears 69 times and 'Mozy' 64 times in src (title tag and og:site_name use MOZY;  
   Fix: Add one visible sentence in WorldChapter.tsx:180: 'Moz is the companion inside Mozy; he levels up as you walk.' and pass `title="Moz, the Mozy companion"` to the hero Moz. Standardise prose and schema on 'Mozy' (keep 'MOZY' only as the logotype), list both store names in WebSite/MobileApplication alternateName, and raise aligning the two store names with the owner (already an MCX open question).

84. **Low · No RSS feed, no llms.txt on the subdomain, and robots.txt lists only two AI crawlers; live robots.txt even points AI agents at mcrudra.com/llms.txt** (`public/robots.txt:4`)  
   Problem: public/robots.txt allows `*`, OAI-SearchBot, PerplexityBot, Googlebot, Bingbot and references only the sitemap; index.html has no `<link rel="alternate" type="application/rss+xml">`; no dist/feed.xml; no public/llms.txt.  
   Fix: Generate dist/feed.xml (RSS 2.0, published articles only, with `<pubDate>`) in prerender.mjs and link it from index.html; add public/llms.txt built from src/data/productFacts.ts (one paragraph of what Mozy is, platforms, prices, the 34-steps rule with its iOS caveat, store URLs, support email, and a list of published article URLs);

## Blog (journal)

85. **CRITICAL · Two live 'test' articles promise 15 and 12 questions and render zero questions** (`src/data/mozy-articles.json:7371` · re-checked)  
   Problem: phone-addiction-test h1 (line 7371) = 'Take This Phone Addiction Test: 15 Questions That Reveal the Truth'; sections [3] 'The Test: Answer Each Question Honestly', [4] 'Scoring' and all four score bands are empty objects (11 of 14 sections have no body, scratchpad/blog/metrics.json outline=11). scroll-addiction-test titleTag (line 7946) '(12 Questions)';  
   Fix: Either unpublish both (set editorial.hold until written) or write one honest 'phone habits self-check' (10 reflection questions, no clinical scoring, explicit 'not a diagnosis' line) at /blog/phone-addiction-test and 301 scroll-addiction-test to it. Change scripts/prerender.mjs:21 and src/data/articles.ts:8 to also exclude status==='planned' so outlines can never ship again.

86. **CRITICAL · Five numbered how-to guides ship with only the Mozy step filled in** (`src/data/mozy-articles.json:6777` · re-checked)  
   Problem: how-to-reduce-screen-time-android titleTag (6777) '10 Proven Methods': Methods 1,2,4-10 are empty; dist/blog/how-to-reduce-screen-time-android/index.html h2 list is exactly 'TL;DR, Introduction, Method 3: Use Mozy's Walk-to-Earn..., Questions & answers'. Same pattern: how-to-stop-checking-phone (7635) '9-Step Protocol' renders only 'Step 5: Use Mozy';  
   Fix: Hold all five until each promised step has 80-150 words with a concrete Android/iOS settings path. Use the already-drafted bodies in plans/blog-repairs-last19.json as the base (how-to-reduce 'How to Reduce Screen Time on Android' etc. are written, sourced, ~380 words). Merge how-to-reduce-screen-time-android INTO screen-time-limits-android (same intent) and 301 the former.

87. **CRITICAL · 17 unfinished "planned" outline articles (71–439 body words) are prerendered, listed on /blog, put in the sitemap and marked index,follow** (`scripts/prerender.mjs:19` · re-checked)  
   Problem: prerender.mjs:19 filters only `!article.editorial?.hold`; src/data/articles.ts:8 does the same. Status breakdown of src/data/mozy-articles.json: published=12, planned(no hold)=17, planned(hold)=2. Body word counts of shipped planned pages: screen-time-statistics-2026=71, screen-addiction-behavioral-science=89 (its outline is just h1 / TL;DR / Questions & answers / References), tiktok-screen-time-limit-android=171, do…  
   Fix: Gate on status everywhere: in scripts/prerender.mjs:19 use `.filter(a => a.status === 'published' && !a.editorial?.hold)`, same predicate in src/data/articles.ts:8 (so /blog, related cards and client routing agree), and make scripts/check-blog-content.mjs:6 assert that no rendered article has `status !== 'published'` and that each rendered article has >= 600 body words and a datePublished.  
   Also reported by: blog, gso, truth-copy

88. **High · Eight 'TL;DR' boxes are a visible template string that restates the H1** (`src/data/mozy-articles.json:6834` · re-checked)  
   Problem: Line 6834 (how-to-reduce), 6234 (doomscrolling-addiction-help), 6523 (held), 7137 (walk-to-earn), 7426 (phone-addiction-test), 7705 (how-to-stop-checking-phone), 8002 (scroll-addiction-test), 8281 (screen-time-limits-android): tldr_block.text = 'Compulsive scrolling and screen time damage your attention.  
   Fix: Replace each with a 2-3 sentence answer-first summary that names the concrete steps the article actually delivers (reuse content.answer, which is already decent for these slugs), and delete the 'damage your attention' sentence.  
   Also reported by: gso

89. **High · The 19 planned posts have no contextual internal links at all** (`src/data/mozy-articles.json:3621`)  
   Problem: analysis2.py: body_links=0 for every planned record; only the 12 published posts contain [label](/blog/...) links and those all point at the same 3 slugs. `internalLinks.linksTo` (e.g. line 3621, 6747, 8490) is never rendered by BlogPost.tsx and contains dead targets: https://mozy.mcrudra.com/compare/digital-wellbeing-vs-mozy (no route, x2), /features (no route), truncated 'https://mozy.mcrudra' (5284, 5878), non-exi…  
   Fix: Add 2-4 contextual Markdown links per article inside paragraphs (BlogPost's parser already supports [text](/blog/slug)); clean internalLinks.linksTo (fix the two truncated URLs, replace screen-time-data-2026 with screen-time-statistics-2026, drop /compare and /features, drop held slugs) and change relatedApp.downloadUrl to /get; add a check in check-blog-content.mjs that every linksTo target resolves to a published route.  
   Also reported by: gso

90. **High · No iPhone content anywhere although iOS is the paid platform** (`src/data/mozy-articles.json:4206`)  
   Problem: Every BOFU/how-to slug is Android-scoped: instagram-time-limit-android (4206), tiktok-screen-time-limit-android, screen-time-limits-android, how-to-reduce-screen-time-android, digital-wellbeing-vs-mozy, parents-guide...-android.  
   Fix: Point all ctaUrl values to /get (the existing platform chooser) or use useStoreHref; write iPhone twins of the two highest-fit guides: /blog/block-instagram-on-iphone and /blog/limit-tiktok-on-iphone (Screen Time Downtime/App Limits vs walk-earned minutes, HealthKit + Screen Time permissions, subscription stated up front), plus /blog/screen-time-passcode-workaround-problem.  
   Also reported by: aso

91. **High · Statistics attributed to Pew, DataReportal and Common Sense Media are wrong** (`src/data/mozy-articles.json:5156`)  
   Problem: screen-time-statistics-2026 FAQ (5156): 'A Pew Research Center survey found that 73% of teens say they spend too much time on social media'; parents-guide stats block (5676) '73% ... Pew'. Pew 2018 (fetched): 54% say too much time on their cellphone, 41% on social media. Citations (3324, 3644) 'DataReportal 2024: 4.2 hours average daily social media usage';  
   Fix: Rebuild screen-time-statistics-2026 and the parents-guide stats block from primary sources with URL + year on every figure (DataReportal Digital 2025 for 2026 copy, Pew 2023/2024 teen reports, Common Sense 2021 census), delete any figure that cannot be linked, and add a `url` to every citations[] entry (Citation type already supports it; BlogPost.tsx renders it).

92. **High · Keyword cannibalisation: 8 posts target 'why scrolling is addictive / dopamine' and 6 target Android limits** (`src/data/mozy-articles.json:4702`)  
   Problem: Same intent, different slugs: algorithmic-variable-reward (0), dopamine-depletion (4), frictionless-ui (5), neurobiology (7), attention-economy-explained (12), why-apps-are-addictive (18, line 4702), screen-addiction-behavioral-science (22), doomscrolling-addiction-help (23) all explain variable rewards/dopamine;  
   Fix: Consolidate to one canonical per intent: (a) why-apps-are-addictive absorbs attention-economy, screen-addiction-behavioral-science, algorithmic-variable-reward, dopamine-depletion, frictionless-ui, neurobiology (301 the rest); (b) screen-time-limits-android absorbs how-to-reduce-screen-time-android; (c) how-to-stop-doomscrolling absorbs doomscrolling-addiction-help;

93. **High · No branded/support content: 'how Mozy works', setup, permissions, pricing, bypass** (`plans/001-discovery-and-content-plan.md:63`)  
   Problem: The plan's own intent map (lines 63-74) lists P0/P1 branded questions (what is Mozy, is it free, what permissions, why are steps not counting, can I bypass it) with 'None' as the existing destination for iPhone setup, help and bypass. The journal has no article for any of them;  
   Fix: Create /blog/how-mozy-works (34 steps = 1 minute on iOS, what 'lock' means, whole-app not Reels-only, iOS subscription vs Android IAP, permissions per platform from productFacts.ts, no account) and link the boilerplate block in every article to it; add /help FAQ-style page for 'steps not counting', 'app still locked', 'restore purchase'. Mark unverified items (reset time, emergency bypass) as 'not published until confirmed'.

94. **High · Missing the high-intent comparison and 'walk to unlock' topics Mozy's buyers actually search** (`plans/live-research.md:80`)  
   Problem: No article targets: 'Mozy vs Opal / one sec / ScreenZen / Forest / Freedom', 'app blocker you can't bypass', 'walk to unlock apps' / 'apps that make you walk to unlock', 'step-based screen time', 'Android app blocker without root', 'screen time for adults', 'YouTube Shorts blocker', or the direct walk-to-unlock competitors StepBloc and Walkgate named in plans/live-research.md (Reddit threads quoted at lines ~80-90).  
   Fix: Add 8 pages in this order: /blog/walk-to-unlock-apps (category explainer + honest table: Mozy, StepBloc, Walkgate, Steppin; sources = store listings), /blog/mozy-vs-opal, /blog/mozy-vs-one-sec, /blog/mozy-vs-screenzen, /blog/mozy-vs-forest, /blog/mozy-vs-freedom (each: mechanism, platforms, price from listings, what each cannot do, 'we make Mozy' disclosure), /blog/app-blocker-you-cant-bypass (honest: every blocker can be removed;  
   Also reported by: gso

95. **High · Two doomscrolling citations are misattributed or paraphrased titles** (`src/data/mozy-articles.json:6434`)  
   Problem: Line 6434: 'Price, M. et al (2022) Brief exposure to negative news reduces optimism, Journal of Experimental Psychology' - Crossref returns Price et al. 'Doomscrolling during COVID-19: The negative association between daily social and traditional media consumption and mental health symptoms' (preprint 2021), a different title and topic.  
   Fix: Correct the three entries to exact titles/journals and add DOIs (10.1016/j.chbr.2024.100438 for Shabahang; verify Price via doi.org and Satici 10.1007/s11482-022-10110-7); run a one-off script that refuses any citations[] entry without a url.

96. **High · The 12 published neuroscience articles cite nothing; the 12 citations in planned articles have no URL/DOI and several are misattributed** (`src/data/mozy-articles.json:1`)  
   Problem: jq: `citations` is [] for all 12 status:published articles, yet their quotable TL;DR blocks assert "striatal D2/D3 receptor downregulation", "attention residue ... up to 23 minutes" (gso anchor), "in less than 300 milliseconds", "micro-stimuli every 7 to 15 seconds", "Some neuroimaging studies link heavy consumption to reduced prefrontal grey matter volume".  
   Fix: Add `url` (DOI or publisher page) to every existing citation and correct the four flagged attributions after checking the originals. For each published article add 3-5 real references that back the specific numbers it uses (e.g. Skinner 1957 'Schedules of Reinforcement'; Schultz, Dayan & Montague 1997 Science for dopamine prediction error; Mark, Gudith & Klocke 2008 CHI for the ~23-minute attention-residue figure; Bowen & Marlatt 2009 for urge surfing; Drouin, Kaiser & Miller 2012 for phantom vibrations;  
   Also reported by: blog

97. **Medium · Read-time labels are inflated 2x to 5x** (`src/data/mozy-articles.json:4`)  
   Problem: seo.readTime is a stored string, not computed: '11 min read' for 1,315 words incl. FAQs (algorithmic, ~6 min at 230 wpm); '10 min read' for 438 words (phone-addiction-test, ~2 min); '10 min read' for 385 words (doomscrolling-addiction-help). Rendered on every card (ArticleCard.tsx) and in reader-meta.  
   Fix: Compute readTime at build time from rendered body words / 230 in articles.ts (or prerender.mjs) and drop the stored field.

98. **Medium · Boilerplate Mozy block and Pozy/Doovi plug duplicated across 20 and 12 articles** (`src/data/mozy-articles.json:260`)  
   Problem: analysis2.py identical-paragraph scan: '**Walk to earn minutes:** your steps turn into screen time... On iPhone, every 34 steps earns 1 minute' appears verbatim in 20 records, '**Apps lock at zero:**' in 19, '**Pick your apps:**' in 16, the 'From the same studio, for Android only: [Pozy]... [Doovi]' line in 12, and the same three related-reading links in 11.  
   Fix: Keep the 4-bullet mechanism once on /blog/how-mozy-works and replace in-article copies with one sentence plus a link; move the studio cross-promo to the site footer; vary the related-reading list per article (see curated related field).

99. **Medium · 25 honest, sourced rewrites already exist in plans/ but were never applied** (`plans/blog-repairs-first12.json:1`)  
   Problem: plans/blog-repairs-first12.json (12 records) and plans/blog-repairs-last19.json (13 records) each contain a new title (32-69 chars), description (114-150 chars), answer, 4-5 full sections (~380-400 words), 2 FAQs and 1-3 citations WITH urls. Diff against src/data/mozy-articles.json: title_applied=False, desc_applied=False, answer_applied=False for all 25 (checked by script).  
   Fix: Merge the repairs in: take title/description/answer/citations from the repair files, keep the live FAQs where they are accurate, then expand each to 800-1200 words with the product block linked rather than pasted. Six slugs have no repair (walk-to-earn, phone-addiction-test, how-to-stop-checking-phone, scroll-addiction-test, screen-time-limits-android, how-to-reduce) and need writing.

100. **Medium · Readability is college-level across the corpus (Flesch 24-57)** (`src/data/mozy-articles.json:5896`)  
   Problem: Flesch Reading Ease (metrics.json): screen-addiction-behavioral-science 23.9 (slug line 5896), screen-time-app-that-actually-works 31.8, scroll-addiction-test 32.4, doomscrolling-addiction-help 33.2, screen-time-statistics 35.6, how-to-stop-checking-phone 36.3, dopamine-detox 36.4, neurobiology 36.8, why-apps-are-addictive 37.6; best is digital-wellbeing-vs-mozy at 70.0.  
   Fix: Target Flesch 60+: one idea per sentence, max 20 words, plain terms with the technical word in parentheses once; add a Flesch check to check-blog-content.mjs that warns below 50.

101. **Medium · Title rewrites for the 12 published posts (keyword-first, <=60 chars, honest)** (`src/data/mozy-articles.json:4`)  
   Problem: Current titles are jargon-first ('Dopamine Baseline vs Phasic Spikes: Screen Burnout Fix', 'Interoception'...) and target invented keywords; primaryKeyword fields such as 'vagus nerve screen addiction breathing app' and 'continuous partial attention app' (lines ~20-40 of each record) have no plausible demand.  
   Fix: 0 algorithmic -> 'Why You Can't Stop Scrolling: Variable Rewards Explained' / meta 'Infinite feeds work like slot machines. The psychology of variable rewards, and one physical brake: walking for your minutes.' 1 bedtime -> 'Stop Scrolling in Bed: Fix Revenge Bedtime Procrastination' / 'Up at 1am again? Why tired brains chase late-night feeds, a 4-step evening routine, and how walk-earned minutes keep apps locked at bedtime.' 2 breathwork -> 'Breathing Exercises to Stop Compulsive Phone Checking' / 'The physiologic…

102. **Medium · Which outlines to finish first, which to merge or prune** (`src/data/mozy-articles.json:7067`)  
   Problem: Product-fit vs state: walk-to-earn-screen-time (7067) BOFU, 338 words, 9/13 empty; instagram-time-limit-android 217 words, 1/5 empty, best-structured; digital-wellbeing-vs-mozy 282 words, Flesch 70, 2/6 empty; how-to-stop-doomscrolling vol 22000, 5/10 empty; dopamine-detox has the only fully-written step protocol among planned posts (866 words incl. FAQ).  
   Fix: Finish in this order (one per week): 1 walk-to-earn-screen-time, 2 instagram-time-limit-android (+ iPhone twin), 3 digital-wellbeing-vs-mozy, 4 how-to-stop-doomscrolling (absorb doomscrolling-addiction-help), 5 screen-time-limits-android (absorb how-to-reduce), 6 how-to-stop-checking-phone (absorb breathwork + urge-surfing), 7 why-apps-are-addictive (absorb attention-economy + behavioral-science + algorithmic + dopamine-depletion + frictionless + neurobiology), 8 dopamine-detox, 9 tiktok-screen-time-limit-android,…

103. **Medium · Instagram built-in limit path is outdated and uncited settings paths will drift** (`src/data/mozy-articles.json:4327`)  
   Problem: instagram-time-limit-android FAQ (line ~4323, 'How do I set a time limit on Instagram on Android?'): 'Go to your profile -> Menu -> Settings -> Insights -> Daily time reminder'. Instagram moved this to 'Your activity -> Time spent' in 2022 and 'Insights' is a creator-account feature. The same FAQ cites Hunt et al. 2018 (4327) correctly but the article's citations[] is empty.  
   Fix: Re-verify on a current Instagram build and write the path as 'Profile -> menu -> Your activity -> Time spent -> Set daily limit', date the check ('checked October 2026'), and add Hunt 2018 (doi 10.1521/jscp.2018.37.10.751) to citations[].

104. **Low · Planning metadata is fabricated and template-copied from other apps** (`src/data/mozy-articles.json:53`)  
   Problem: gso.entityMentions for all 12 published posts (line 53 etc.) include 'Craniovertebral Angle' and '20-20-20 Rule' (Pozy/Doovi concepts, irrelevant to Mozy); seo.estimatedMonthlyVolume is 1800 for all 12 (line 35...), difficultyRating 'Medium' for all, priorityScore 1; attention-economy canonicalUrl (3076) points at mcrudra.com and digital-wellbeing (3943) at /compare/.  
   Fix: Strip entityMentions to real entities, remove estimatedMonthlyVolume/difficultyRating/priorityScore until measured (or mark them 'unmeasured'), and set canonicalUrl/fullUrl to https://mozy.mcrudra.com/blog/<slug> for all 31 or delete the fields since metadata.ts derives canonicals.

105. **Low · Unused schema/seo fields in the article data point at non-existent assets, wrong domains and a different author name** (`src/data/mozy-articles.json:1`)  
   Problem: schema.article (published): image https://mcrudra.com/og/<slug>.jpg, author 'Mahesh Baburao Chambhare' at https://mcrudra.com/about, publisher 'mcrudra', mainEntityOfPage https://mcrudra.com/blog/<slug>; seo.ogImage https://mozy.mcrudra.com/og/<slug>.png (no public/og directory exists); relatedApp.downloadUrl https://mozy.mcrudra.com/download (the new build has no /download route;  
   Fix: Either delete schema, internalLinks, relatedApp, fullUrl and seo.ogImage from the records, or regenerate them from siteUrl/productFacts in a script and assert in check-blog-content.mjs that every URL in the record starts with https://mozy.mcrudra.com and resolves to a route.

106. **Low · Editorial cadence that one indie dev can sustain** (`plans/001-discovery-and-content-plan.md:272`)  
   Problem: The plan proposes a 5-day/30-day sprint (lines 272-274) but no ongoing rhythm; 31 records were generated in bulk (12 share datePublished 2026-09-10, 19 have none), which is how the outline backlog happened.  
   Fix: Cadence: weeks 1-6 publish nothing new, repair/merge the existing corpus one article per 3 days in the order above; then 2 articles/month (one BOFU comparison or setup guide, one problem/routine guide), each with a Person byline, updatedAt, 1-3 primary-source URLs and 3 curated related links; quarterly: refresh screen-time stats, re-verify store prices/ratios in every product block, run check-blog-content.mjs with the stricter gates; monthly: 404/redirect check of all internal links.

107. **Low · Two articles carry a wrong seo.canonicalUrl/ogImage in the dataset (points to mcrudra.com/blog and /compare/), which mcrudra-web reads as the canonical** (`src/data/mozy-articles.json:1`)  
   Problem: Dataset scan: attention-economy-explained `seo.canonicalUrl` = https://mcrudra.com/blog/attention-economy-explained and `seo.ogImage` = https://mcrudra.com/og/attention-economy.jpg; digital-wellbeing-vs-mozy `seo.canonicalUrl` = https://mozy.mcrudra.com/compare/digital-wellbeing-vs-mozy. This repo ignores the field (BlogPost.tsx:105 builds canonical from the slug;  
   Fix: Set both to `https://mozy.mcrudra.com/blog/<slug>` and the ogImage to a mozy.mcrudra.com asset, and add `assert.equal(article.seo.canonicalUrl, canonical)` in check-blog-content.mjs so the field can never drift again.

## ASO and store conversion

108. **High · Play listing website and privacy URLs point to dead moxstudio.tech (also in Play's JSON-LD author url)** (`scratchpad/aso/fetch/play.html:1`)  
   Problem: Play HTML: `<meta name="appstore:developer_url" content="https://moxstudio.tech/">`, link 'Website https://moxstudio.tech/', 'Privacy Policy https://moxstudio.tech/mozy-privacy', ld+json author {name:'mcrudra', url:'https://moxstudio.tech/'}. curl https://moxstudio.tech/ and /mozy-privacy → HTTP 000; dig returns no A record. The App Store listing correctly uses https://mozy.mcrudra.com/ and /privacy.  
   Fix: Play Console → Store settings → Store listing contact details: Website = https://mozy.mcrudra.com/?utm_source=play&utm_medium=listing&utm_campaign=mcx; App content → Privacy policy = https://mozy.mcrudra.com/privacy. Do the same for Pozy and Doovi (same dead domain, same developer account).

109. **High · Play screenshots are an off-brand, off-truth set (photographic art, 'Reels & Shorts lock', '34 steps = 1 minute', typo 'time spend')** (`scratchpad/aso/fetch/play-shot-kuVQ-u.png:1`)  
   Problem: Play has 5 screenshots (1080x1920, saved as scratchpad/aso/fetch/play-shot-*.png). Captions: (1) 'The doomscroll ends here / When your minutes run out, Reels & Shorts lock.' with a photographic man in smoke and a flat line-art icon that is a third mascot style; (2) 'Walk to earn your screen time. 34 steps = 1 minute. Move first, then scroll.'; (3) 'Meet Mozy. Walk, and it thrives.';  
   Fix: Re-export the five iOS v2 compositions for Play at 1080x1920 with Android status bar and 'APPS ON YOUR PHONE', reuse the iOS captions, replace 'Reels & Shorts lock' with 'Instagram, YouTube and TikTok lock', remove '34 steps = 1 minute' until the Android ratio is confirmed, fix 'time spend' → 'time spent'. Keep the icon/mascot identical to the App Store set.

110. **High · App Store campaign links have no pt= provider token, so ct= placements are never attributed** (`src/data/landing.ts:13` · re-checked)  
   Problem: storeLink builds `https://apps.apple.com/app/apple-store/id6792097497?ct=website-mcx-${placement}&mt=8`. Apple's App Store Connect help (manage-campaigns) says 'Ensure your campaign includes both a provider token and a campaign token' and 'You must generate a campaign link in App Store Connect first to obtain your provider token.  
   Fix: In App Store Connect → App Analytics → Acquisition → Campaigns, create one campaign link and copy its pt value; add `appStoreProviderToken` to PRODUCT_FACTS and emit `?pt=${pt}&ct=${token}&mt=8`. Shorten tokens to ≤30 chars: web-nav, web-hero, web-sticky, web-final, web-price, web-price2, web-get, web-get-qr, web-get-<src ≤12>. Keep mt=8.  
   Also reported by: truth-copy

111. **High · Inbound channel (utm_source from MCX web links) is dropped before the store click, so social installs all report as 'website'** (`src/hooks/usePlatform.ts:24`)  
   Problem: MCX 'web' tracked links append utm_source/utm_medium/utm_campaign to https://mozy.mcrudra.com/ (mcx.py:283-289). Nothing in the site reads them: useStoreHref/storeLink only know the placement; GetPage.tsx:15 reads only `?src=`. Every store link then carries ct=website-mcx-<placement> and Play referrer utm_source=website&utm_medium=referral&utm_campaign=mcx&utm_content=<placement> (landing.ts:14).  
   Fix: On first load, read utm_source (or src) from location.search, persist in sessionStorage, and fold it into both tokens: iOS ct=`web-${src}-${placement}` (≤30 chars), Play referrer utm_source=${src||'website'}&utm_medium=referral&utm_campaign=mcx-${placement}. Make GetPage accept utm_source as a fallback for src. Move the placement from utm_content into utm_campaign, because Play Console's acquisition report breaks down by utm_source/utm_campaign, not utm_content.

112. **High · index.html has no Smart App Banner (apple-itunes-app) although the old live site had one** (`index.html:12` · re-checked)  
   Problem: index.html head (lines 6-26) has title/description/canonical/OG only; grep for apple-itunes-app in src and index.html returns nothing; the currently deployed Next page outputs `<meta name="apple-itunes-app" content="app-id=6792097497"/>` (live HTML). scripts/prerender.mjs:30-36 copies the head to every route, so one tag would cover the 31 blog posts too.  
   Fix: Add to index.html after line 12: `<meta name="apple-itunes-app" content="app-id=6792097497, app-argument=https://mozy.mcrudra.com/, affiliate-data=pt=<PROVIDER_TOKEN>&ct=web-banner" />` (drop affiliate-data until pt exists). Exact affiliate-data syntax could not be verified from Apple's page (fetch returned only the title); confirm against developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners.

113. **High · Store names differ (iOS 'Walk to Earn Screen Time' vs Play 'Walk to Unlock Apps') and the site/Product Hunt each pick a different one** (`src/data/productFacts.ts:113`)  
   Problem: App Store: 'Mozy: Walk to Earn Screen Time', subtitle 'App blocker & focus companion'. Play: 'Mozy: Walk to Unlock Apps', short description 'App blocker that turns steps into screen time. Walk more, scroll less.' Site <title> and og:site_name use the iOS wording (index.html:6, metadata.ts:11); Product Hunt product is 'Mozy: Walk to Unlock Apps'; live site JSON-LD name 'Mozy - Walk to Unlock Apps'.  
   Fix: Unify to 'Mozy: Walk to Earn Screen Time' (exactly 30 characters, the Play title limit, and it contains the two highest-intent phrases on both listings: 'screen time' and 'walk'). Keep 'Walk more, scroll less' / 'unlock apps' inside the Play short description and the iOS subtitle. Then update PRODUCT_FACTS.platforms.android.storeName, the Product Hunt product name and the OG image.

114. **Medium · Developer identity differs across App Store, Play, site and JSON-LD (Mahesh Chambhare / mcrudra / MCRUDRAX / moxstudio, three emails)** (`src/data/landing.ts:44`)  
   Problem: App Store: seller 'Mahesh Chambhare', copyright '© 2026 mcrudra', developer page id6792097500. Play: developer 'mcrudra' (dev?id=5321286926935344473), legal name 'MAHESH BABURAO CHAMBHARE', public emails chambharem1@gmail.com and moxappstudio@gmail.com with a postal address, package com.moxstudio.mozy.  
   Fix: Play Console → Developer page: rename to 'MCRUDRAX' (or 'Mahesh Chambhare' to match iOS) and set the public developer email to hello@mcrudra.com; App Store Connect: copyright '© 2026 MCRUDRAX'. Keep the site as is.

115. **Medium · Play icon is a different crop from the App Store icon, and the hero Moz is a third face** (`src/components/story/Hero.tsx:135`)  
   Problem: Play icon (play-icon.png, 512x512): face zoomed so the leaves touch/clip the top edge and the eyes sit at ~55% height. App Store icon (ios-icon-mozy.webp): same fluffy face with margin inside the rounded square, leaves fully visible (matches public/assets/story/app-icon-96.webp used in the nav and /get).  
   Fix: Re-upload the Play icon from the same 1024 master as iOS (public/assets/mozy-icon-original.webp, 1254x1254, has the right margin). For the site, have the mascot redesign take the icon's face proportions as canonical and show the happy icon face at least once above the fold (e.g. the nav logo already does; add it to the hero phone screen).

116. **Medium · Pricing is honest on the site but the stores never explain the paywall: Play lists $4.99–$34.99 items with no description, iOS buries 'requires an active paid subscription' at the end** (`src/components/story/FinalCta.tsx:45`)  
   Problem: Site: 'Free download. iPhone: Mozy Premium, $4.99 a month or $29.99 a year (US). Android: in-app purchases.' (FinalCta.tsx:45, desktop-09212.png) and PricingCards. App Store description (2,249 chars) mentions the subscription only in the penultimate line 'Note: Mozy requires an active paid subscription to access app features.'; IAP: Mozy Yearly Premium $29.99, Mozy Monthly Premium $4.99; no promotional text.  
   Fix: iOS: use the Promotional Text field (170 chars, editable without a build) for 'Free to download. Mozy Premium ($4.99/mo or $29.99/yr) unlocks blocking.' and move the subscription note above 'MEET MOZY'. Play: add one line after the opening pitch 'Free to download; some features are in-app purchases' and list what each tier unlocks (currently unknown, see productFacts.ts:149). Keep the site copy.

117. **Medium · Product Hunt link in the founder card sends traffic to a weak listing whose 'website' is the Play URL** (`src/components/story/QuestionsChapter.tsx:26`)  
   Problem: QuestionsChapter.tsx:26 links 'Mozy on Product Hunt' → https://www.producthunt.com/products/mozy-walk-to-unlock-apps (no rel=noopener). Fetched PH page: tagline 'Walk More. Scroll Less. Unlock Apps with Movement.', two launches (Jul 4 2026: 5 upvotes/14 comments;  
   Fix: On PH: set website to https://mozy.mcrudra.com/get?src=ph, add the App Store link, product name to the unified store name, pricing label 'Free (iOS subscription)'. On the site: move the link to the footer Follow column as 'Product Hunt' with rel="noopener", or drop it until the listing has reviews.

118. **Medium · Zero ratings on both stores and no review prompt strategy; legacy fake-review components still in the repo** (`src/components/ReviewsSection.tsx:40`)  
   Problem: App Store serialized data: ratingAverage 0, totalNumberOfRatings 0, status 'This app hasn't received enough ratings or reviews to display an overview.' Play: no 'Ratings and reviews' section rendered, header shows '50+ Downloads' and 'Everyone' only. The site correctly shows no social proof. src/components/ReviewsSection.tsx:40 ('★★★★★') and desktop/cards/TestimonialsCard.tsx:3 contain invented testimonials;  
   Fix: App side: trigger SKStoreReviewController / Play In-App Review after a success moment (first world unlocked, 7-day streak), never at launch. Site: add a small 'Already walking with Mozy? Leave a review' footer link using https://apps.apple.com/app/id6792097497?action=write-review (iOS) and market://details?id=com.moxstudio.mozy (Android). Delete src/components/ReviewsSection.tsx and src/components/desktop/cards/TestimonialsCard.tsx.

119. **Medium · Category split: App Store Productivity (no secondary) vs Play Health & Fitness; site JSON-LD says HealthApplication** (`src/data/landing.ts:40`)  
   Problem: App Store Information: Category 'Productivity', no secondary category shown. Play chip: 'Health & Fitness' (ld+json applicationCategory HEALTH_AND_FITNESS). landing.ts:40 applicationCategory 'HealthApplication'. The iOS 'You might also like' row is all app blockers (ScrollMint 'App Blocker for Dopamine Detox', 'App Blocker & Focus Timer', 'Block apps with Apple Watch'), i.e. Apple already clusters Mozy with blockers.  
   Fix: App Store Connect: keep Productivity primary and add Health & Fitness as the secondary category. Play: keep Health & Fitness. In landing.ts emit two MobileApplication nodes (one per OS) so applicationCategory can be 'ProductivityApplication' for iOS and 'HealthApplication' for Android, each with its own name, offers and downloadUrl.

120. **Medium · Play referrer uses a constant utm_campaign=mcx; placements live in utm_content which Play Console does not break down** (`src/data/landing.ts:14`)  
   Problem: landing.ts:14 → referrer=utm_source%3Dwebsite%26utm_medium%3Dreferral%26utm_campaign%3Dmcx%26utm_content%3D<placement> (encoding is correct for the Play Install Referrer format). Play Console's acquisition/UTM report groups by utm_source and utm_campaign.  
   Fix: Emit utm_campaign=web-<placement> (e.g. web-hero, web-get-qr) and reserve utm_content for the inbound channel or A/B variant; keep utm_medium=referral. Keep encodeURIComponent on the whole referrer value.

121. **Medium · Keyword coverage gaps: iOS title+subtitle lack 'step counter'; Play short description lacks 'step counter' and 'earn'** (`src/data/productFacts.ts:113`)  
   Problem: iOS visible text: 'Mozy: Walk to Earn Screen Time' + 'App blocker & focus companion' (covers walk, earn, screen time, app blocker, focus). Play: 'Mozy: Walk to Unlock Apps' + 'App blocker that turns steps into screen time. Walk more, scroll less.' (walk, unlock apps, app blocker, steps, screen time).  
   Fix: iOS subtitle: 'App blocker & step counter' (27 chars). iOS keyword field (100 chars, no words already in title/subtitle): 'pedometer,digital wellbeing,focus,doomscrolling,instagram,tiktok,youtube,reels,shorts,detox,limit,lock'. Play short description (≤80): 'App blocker & step counter. Walk to earn screen time. Walk more, scroll less.' (77 chars). Add 'digital wellbeing' and 'screen time limit' once each to both long descriptions.

122. **Medium · No web manifest with related_applications; the google-play-app meta is obsolete so Android gets no native-app install prompt** (`index.html:14`)  
   Problem: index.html has no `<link rel="manifest">`; public/ contains no manifest (ls public). Chromium moved native app banners from meta tags to the manifest `related_applications` / `prefer_related_applications` fields in 2015 (codereview.chromium.org/1092193004); MDN lists `related_applications` with platform 'play' + package id.  
   Fix: Add public/manifest.webmanifest: {"name":"Mozy: Walk to Earn Screen Time","short_name":"Mozy","start_url":"/","display":"browser","theme_color":"#0b0e1a","background_color":"#FAF9F5","icons":[{"src":"/assets/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/assets/icon-512.png","sizes":"512x512","type":"image/png"}],"prefer_related_applications":true,"related_applications":[{"platform":"play","id":"com.moxstudio.mozy","url":"https://play.google.com/store/apps/details?id=com.moxstudio.mozy"},{"platform":"…

123. **Low · /get platform detection is sound; edge cases: Android 'Desktop site', Apple-silicon Macs, dropped query params** (`src/pages/GetPage.tsx:15`)  
   Problem: detectPlatform (usePlatform.ts:7-13): android regex, then iphone/ipad/ipod or (macintosh && maxTouchPoints>1). iPhone/iPad Safari with 'Request Desktop Website' send a Macintosh UA with maxTouchPoints 5 → 'ios' (correct). Android Chrome 'Desktop site' removes 'Android' from the UA → 'other' → no redirect, badges shown (acceptable).  
   Fix: Accept utm_source as a fallback for src in GetPage; optionally treat `macintosh && navigator.platform==='MacIntel' && maxTouchPoints===0` on Apple silicon as 'ios' with a 'Mac App Store' note; keep the rest. Add a `<noscript>` line 'Pick your store below' is already covered by the prerender.

124. **Low · App Store 'Support' link is the home page; no support/contact page exists** (`src/pages/PricingPage.tsx:65`)  
   Problem: App Store developerLinks: Website → https://mozy.mcrudra.com/, Support → https://mozy.mcrudra.com/ (identical). The only support affordances on the site are mailto:hello@mcrudra.com in the pricing FAQ (PricingPage.tsx:65) and the founder card (QuestionsChapter.tsx:26); the site routes are /, /pricing, /blog, /privacy, /get.  
   Fix: Set the App Store support URL to https://mozy.mcrudra.com/#faq now, and add a short /support route (prerendered, indexable) with the FAQ, permission troubleshooting and mailto:hello@mcrudra.com; also use it as the Play 'support' contact.

125. **Low · No .well-known/apple-app-site-association or assetlinks.json (locally, in dist, or live); only needed once the app declares associated domains** (`public:1`)  
   Problem: `ls public/.well-known` → No such file or directory; dist/.well-known absent; live https://mozy.mcrudra.com/.well-known/apple-app-site-association and /.well-known/assetlinks.json → 404 (mcrudra-web/public has no .well-known either). The App Store serialized data requests customDeepLink but none is present; neither listing advertises deep links.  
   Fix: When the app adds Associated Domains (applinks:mozy.mcrudra.com) and Android App Links: public/.well-known/apple-app-site-association (no extension, served as application/json): {"applinks":{"details":[{"appIDs":["<TEAMID>.com.mcrudra.mozy.app"],"components":[{"/":"/get","exclude":true},{"/":"/*"}]}]}} and public/.well-known/assetlinks.json: [{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"com.moxstudio.mozy","sha256_cert_fingerprints":["<from Play Cons…

126. **Low · Both store badges always render on phones; the off-platform badge is a dead end** (`src/components/story/StoreBadges.tsx:13`)  
   Problem: StoreBadges.tsx:13-20 orders by platform but renders both badges everywhere (mobile-00000.png shows App Store + Google Play side by side on a 390px viewport).  
   Fix: When usePlatform() is 'ios' or 'android', render one full-width badge for that store and a text link 'Also on Google Play / the App Store' underneath; keep both badges for 'other'.

127. **Low · What's-new text is identical on both stores and introduces 'Debt & Penalty System' that the site never explains** (`src/data/landing.ts:24`)  
   Problem: iOS 2.0.4 (Sep 3 2026) and Android 2.0.2 (Sep 2 2026) release notes: 'Precision Time Engine… Smarter Debt & Penalty System: Fairer penalty handling and clearer progress toward your next minute… Enhanced Companion & Worlds… Bug fixes.' The site FAQ (landing.ts:24-32) has no entry on debt/penalties; productFacts.ts marks midnight reset and bypass as unverified.  
   Fix: Next release notes: lead with the product line ('Walk to earn screen time: faster step-to-minute updates') and plain language ('if you overspend minutes, your next walk pays them back first'); add a FAQ 'What happens if I run out of minutes mid-session?' once the behaviour is verified on both builds.

128. **Low · applicationSchema lacks screenshots, version and per-platform split; image is the 396 KB icon.png** (`src/data/landing.ts:34`)  
   Problem: landing.ts:34-70: one MobileApplication with operatingSystem 'iOS 16.4+, Android 8.0+', image /assets/icon.png (500x500, 396,687 bytes), no screenshot, softwareVersion, availability or applicationSubCategory; offers[0] has no availability.  
   Fix: Emit two nodes (iOS: name 'Mozy: Walk to Earn Screen Time', operatingSystem 'iOS 16.4 or later', applicationCategory ProductivityApplication, softwareVersion '2.0.4', offers monthly/yearly; Android: Play name, 'Android 8.0 or later', HealthApplication, '2.0.2', offer price 0 + 'in-app purchases'), each with downloadUrl, installUrl, screenshot: [five v2 URLs], image: a 512x512 PNG of the icon, availability InStock.

## Code defects

129. **High · Related-articles block funnels almost every internal link to the same three posts** (`src/pages/BlogPost.tsx:104` · re-checked)  
   Problem: BlogPost.tsx:104 sorts by `pillarType === article.pillarType` then array order and slices 3. Computed result (analysis2.py): algorithmic-variable-reward receives related links from 28 of 29 pages, bedtime-revenge 19, breathwork 17; walk-to-earn-screen-time, digital-wellbeing-vs-mozy, how-to-stop-doomscrolling, instagram-time-limit-android get 0-2.  
   Fix: Add a curated `related: string[]` field (3 slugs) per article and fall back to a topic-cluster match (map pillarType groups: setup/Android, comparison, why-addictive, routines) with a deterministic rotation; never pick by array order.

130. **High · On phones with Reduce Motion turned on, none of the scroll-story setup code runs** (`src/hooks/useScene.ts; src/hooks/useLandingMotion.ts:useScene.ts:27; useLandingMotion.ts:22` · re-checked)  
   Problem: media.add({ desktop: '(min-width: 861px)', motion: '(prefers-reduced-motion: no-preference)' }, ...). GSAP only runs the callback if at least one query matches (node_modules/gsap/gsap-core.js:4069-4083, `(cond[p] = mq.matches) && (active = 1)`).  
   Fix: Add GSAP's always-true key so the callback runs for every combination: media.add({ desktop: '(min-width: 861px)', motion: '(prefers-reduced-motion: no-preference)', all: 'all' }, ...) in both files. Then test the 4 combinations (desktop or mobile, with or without motion).

131. **High · Hash deep links (/#how, /#worlds, /#faq, /#get, /#download) land at the top of the page** (`src/App.tsx; src/main.tsx; src/components/SiteChrome.tsx:App.tsx:16-18; main.tsx:6; SiteChrome.tsx:7,48` · re-checked)  
   Problem: useEffect(() => { window.scrollTo(0, 0); }, [location]) runs on first mount, and createRoot() rebuilds the prerendered DOM. Loading the prerendered build (repo dist served read-only) at /#faq gave scrollY 2 after load plus 1.8s, with the #faq target at 8461. /#download gave scrollY 2 with the target at 9212.  
   Fix: In App.tsx, skip the scroll reset when window.location.hash is set and on the first mount. Once the landing page has mounted and ScrollTrigger has refreshed (after document.fonts.ready in useLandingMotion), call document.getElementById(hash.slice(1))?.scrollIntoView(). The section offsets don't depend on GSAP pins (CSS sticky), so this is safe.

132. **Medium · check-blog-content.mjs reports a false green: it counts planned outlines as 'published' and checks no status, word count, title length or dates** (`scripts/check-blog-content.mjs:31`)  
   Problem: Output of `npm run test:content`: 'Verified 29 published articles (2 held back): complete sections (94 unrendered outline placeholders in planned articles) …' with exit 0. Line 6 `articles = allArticles.filter(a => !a.editorial?.hold)`; line 31 explicitly allows empty sections when `status === 'planned'`; line 71 `assert.equal(schema.dateModified, article.editorial?.updatedAt)` passes with undefined === undefined;  
   Fix: Add assertions: every rendered article has `status === 'published'`; >= 600 words across sections; `seo.titleTag.length <= 60`; `seo.metaDescription.length <= 155`; `schema.article.datePublished` present and ISO; at least 2 internal `/blog/` links; FAQPage present when `faqs.length`; and fail (not warn) if the sitemap or /blog lists a non-published slug. Print a per-article table so the owner sees word counts.

133. **Medium · Layout read inside the walk's onUpdate after DOM writes forces a synchronous reflow every scrub frame** (`src/components/story/WalkChapter.tsx:WalkChapter.tsx:175,178-179,210-211`)  
   Problem: onUpdate calls renderCounters (writes textContent at 178-179), then renderTrail, which reads `moz.clientWidth` (line 175), then classList.add('is-walking') (213).  
   Fix: Cache the walker width in layout(): `mozWidth = moz.clientWidth` next to mozLeft, and use it in renderTrail. Also skip the textContent writes when the rounded value hasn't changed.

134. **Medium · iOS: sticky stages are 100svh, so a band of section background shows under them when the toolbar collapses** (`src/story.css; src/story-world.css:story.css:183,186,266-267; story-world.css:15-17`)  
   Problem: .st-walk-stage { height: 100vh; height: 100svh } is sticky inside .st-walk { background: #1b1f45 }. .st-world-stage is 100svh inside a #fbe6cc section. When Safari's toolbar collapses on scroll-down, the viewport is 100lvh, taller than the stage by lvh minus svh (roughly 50-90px). (Not reproducible in desktop Chrome emulation; inferred from CSS.)  
   Fix: Use `height: 100lvh` (or 100dvh) for the sticky stages, or set each section's background to the colour at the stage's bottom edge (.st-walk { background: #7abd5c }, .st-world { background: var(--st-cream) }).

135. **Low · Landing-page JSON-LD is not escaped and no speakable hint is set** (`src/pages/LandingPage.tsx:21`)  
   Problem: LandingPage.tsx:21 and PricingPage.tsx:30 use `JSON.stringify(applicationSchema)` raw, while BlogPost.tsx:130 escapes '<' as <. No page sets `speakable`.  
   Fix: Share one `jsonLd(obj)` helper that applies `.replaceAll('<','\\u003c')`; add `speakable: {"@type":"SpeakableSpecification","cssSelector":[".st-hero-lede",".reader-answer"]}` to the WebSite node and BlogPosting.

136. **Low · How phone scale is computed once before webfonts load and never recomputed after layout changes** (`src/components/story/HowChapter.tsx:HowChapter.tsx:55-60`)  
   Problem: fit() runs at setup and on window 'resize' only. On mobile it subtracts `.st-how-copy` offsetHeight, which changes when Fredoka and Nunito replace the fallback font. The ScrollTrigger.refresh after document.fonts.ready (useLandingMotion.ts:71) doesn't call fit.  
   Fix: Also run fit on ScrollTrigger 'refresh' (ScrollTrigger.addEventListener('refresh', fit), removed on cleanup), or observe .st-how-copy with a ResizeObserver.

## Accessibility

137. **Medium · Pricing page heading outline skips h2 and repeats 'Free download' twice as h3** (`src/components/story/PricingCards.tsx:15`)  
   Problem: dist/pricing/index.html outline: [h1] Know the price before you tap install. -> [h3] Free download -> [h3] Free download -> [h2] Walk first. Scroll later. … PricingCards.tsx:15 and :24 both render `<h3>Free download</h3>`; the platform name is a `<p className="st-price-platform">`. The same component is used on the landing final chapter.  
   Fix: Make the platform the heading (`<h3>iPhone</h3>` / `<h3>Android</h3>`), turn 'Free download' into the first `<p>`, and wrap the cards in a section with an h2 such as 'What each store charges' so the outline is h1 > h2 > h3.

138. **Medium · Focus ring #63d586 has 1.5-1.8:1 contrast on the light sections (needs 3:1)** (`src/story.css:story.css:35`)  
   Problem: .st :focus-visible { outline: 3px solid var(--st-sprout) }. Computed: 1.75:1 on cream #fbf9f2 (FAQ summaries, founder links), 1.84 on white cards, 1.50 on the final section #d3ebfa (store badges, Pricing details), 1.48 on world #fbe3c4. 10.4:1 on night.  
   Fix: Use a deep-green ring on light sections: `.st-qa :focus-visible, .st-world :focus-visible, .st-final :focus-visible { outline-color: var(--st-green-deep) }` (#1c5a2e is about 7.5:1 on cream). Or use a two-tone ring (outline #1c5a2e plus box-shadow 0 0 0 6px #fff) everywhere.

139. **Medium · Short viewports (landscape phones, a 1440x900 desktop at 200% zoom = 720x450) break the How and Walk pins** (`src/story.css; src/components/story/HowChapter.tsx:story.css:183-187,267-271; HowChapter.tsx:56-57`)  
   Problem: At 720x450 the How phone sits at 335-668px in a 450px viewport (scale clamped to 0.52) and the HUD covers 370-432. The walk stage has min-height 540px, so it is taller than the viewport: Moz sits at 389-484 (bottom cut) and fully under the HUD (x 162-558 against Moz 172-260) for the whole walk. The world chapter already guards its pin with (min-height: 520px) (story-world.css:18).  
   Fix: Mirror the world guard: enable the How and Walk sticky tracks only under @media (prefers-reduced-motion: no-preference) and (min-height: 600px). In the scenes, use a pinned() check like WorldChapter.tsx:41 for start and end. Remove the walk's 540px min-height. Hide the HUD when innerHeight < 520.

140. **Low · Walk eyebrow 'THE WALK' fails AA contrast in the day state** (`src/story.css:story.css:330-331`)  
   Problem: --walk-soft rgba(21,49,75,.78) at 13px/800 over the day sky: sampled 3.96-4.18:1 in desktop-05500.png (computed 4.24:1). Needs 4.5:1 (13px bold isn't large text). The lede passes at 5.10:1.  
   Fix: Use --walk-ink (#15314b, about 7.2:1) for the eyebrow, or set --walk-soft's day alpha to 0.92.

141. **Low · Mobile nav menu (<details>) doesn't close on Escape or on outside click** (`src/components/SiteChrome.tsx:SiteChrome.tsx:26-31`)  
   Problem: Only link clicks close the panel (onClick removes the 'open' attribute). There is no keydown or outside-pointer handling.  
   Fix: Add an Escape keydown handler on the details element (remove 'open', focus the summary) and a document pointerdown listener that closes it when the target is outside.

142. **Low · World track's inactive stop glyphs are below 3:1** (`src/story-world.css:story-world.css:81`)  
   Problem: .st-world-stop .st-world-glyph color #9aa094 on #fff = 2.68:1.  
   Fix: Use #6f766a (about 4.8:1) for inactive glyphs.

143. **Low · Store-badge accessible names don't contain the badge's visible text (WCAG 2.5.3 Label in Name)** (`src/components/story/StoreBadges.tsx:StoreBadges.tsx:6-7,17`)  
   Problem: aria-label 'Get Mozy on Google Play' overrides an image whose visible text is 'GET IT ON Google Play'. 'Download Mozy on the App Store' overrides 'Download on the App Store'.  
   Fix: Remove the aria-label so the img alt is the name, or start the label with the visible text: 'Get it on Google Play: Mozy' and 'Download on the App Store: Mozy'.

144. **Low · Keyboard focus is dropped on mobile when the active How step changes** (`src/story.css; src/components/story/HowChapter.tsx:story.css:449; HowChapter.tsx:29-41`)  
   Problem: On mobile with motion, setStep toggles is-active and story.css:449 sets display:none on the previously active <li>. If its button had focus (a keyboard user scrolling with Space or the arrow keys), focus falls back to <body>.  
   Fix: In setStep, if document.activeElement is inside a step that is being hidden, move focus to the newly active step's button. Or collapse inactive steps visually (height:0; overflow:hidden) instead of display:none.

## Performance

145. **Medium · Continuous CSS animations run everywhere, offscreen included, and cost layout and paint every frame while idle** (`src/story.css; src/story-world.css:story.css:112-113,121,138-140,159,167,278-285,302-305,312-315; story-world.css:104-121`)  
   Problem: document.getAnimations(): 123 infinite animations running (29 st-twinkle, 26 st-flicker, 7 moz-sway, 6 moz-blink, 3 moz-hop on the hidden cheer Moz, 5 cloud drifts, world flutters and birds...). A 2s trace idle at the FAQ (scrollY 8600) recorded 121 Layout, 121 UpdateLayoutTree and 1089 Paint events (~110ms/s of main thread). The same trace with reduced motion recorded 0 Layout and 0 Paint.  
   Fix: Pause offscreen chapters: an IntersectionObserver on each section toggles .is-offscreen, with `.is-offscreen * { animation-play-state: paused !important }`. Stop animating hidden Moz variants (`.st-walk-moz .is-cheer` is opacity 0 but hops; give it display:none until is-unlocked, as the world chapter already does).

146. **Medium · About 60% of the single CSS bundle is dead legacy CSS, loaded render-blocking on every page** (`src/main.tsx; src/pages/LandingPage.tsx; src/index.css; src/landing.css; vite.config.ts:main.tsx:3; LandingPage.tsx:3; vite.config.ts:7`)  
   Problem: Build: style-*.css 115.69 kB (25.17 kB gzip), one file because cssCodeSplit:false. index.css (39.4 KB source): 248 classes, 245 unused by live components (only the reset and body rules at lines 9-45 matter). landing.css (32.6 KB): 103 classes, 97 unused (only lp, lp-wrap, lp-button and lp-eyebrow are used, by the subpages).  
   Fix: Move the reset (index.css:9-45), tokens.css, the 4 used .lp rules and landing.css's reduced-motion `html{scroll-behavior:auto!important}` rule into a small base.css. Delete the rest together with the dead components. Re-check /pricing, /blog, /privacy and /get visually.  
   Also reported by: seo-technical

147. **Medium · Render-blocking Google Fonts: four families (Baloo 2, Caveat, Fredoka, Nunito, 13 weights) via a cross-origin stylesheet, no font preload, and two more families referenced but never loaded** (`index.html:31`)  
   Problem: index.html:31 `<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Caveat:wght@500;600;700&family=Fredoka:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">` sits before the app CSS in dist/index.html. Fetching that CSS with a Chrome UA yields 54 @font-face rules (all `font-display: swap`);  
   Fix: Self-host two or three subset variable fonts in /assets/fonts (Fredoka, Nunito, optionally Caveat), declare them with `@font-face { font-display: swap; unicode-range: U+0000-00FF… }` in story.css, add `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/fredoka-latin.woff2">` (and Nunito 400) in index.html, drop the Google Fonts link and preconnects, render the wordmark in Fredoka 800 instead of Baloo 2, and remove the Inter/Plus Jakarta declarations from index.css/landing.css.  
   Also reported by: code-audit, visual-desktop

148. **Medium · Prerendered landing HTML is 363 KB of mostly SVG, then createRoot throws it away and rebuilds 3,154 nodes** (`src/main.tsx; scripts/prerender.mjs; src/components/story/WalkChapter.tsx:main.tsx:6; prerender.mjs:34-35; WalkChapter.tsx:80-86,287-295`)  
   Problem: dist/index.html is 363,491 B (85,755 B gzip) with 93 <svg> and 931 <circle>. The live DOM has 3,154 elements, 2,683 of them inside SVG (walk 1,343, world 639, hero 510, final 247). 140 meadow flowers x 7 nodes = 980 nodes. createRoot().render (not hydrateRoot) replaces the prerendered tree after the 148.77 kB gzip JS loads.  
   Fix: Collapse the flowers into one path per colour (like the trail and tufts), plus the stems, which takes about 980 nodes down to about 10. Do the same for hero stars and skyline windows. Then either prerender the same tree the client renders (App inside Router ssrPath) and use hydrateRoot, or render decorative SVG client-only after first paint.  
   Also reported by: seo-technical

149. **Medium · Walk parallax layers are promoted with will-change but re-rasterized every frame** (`src/story.css; src/components/story/WalkChapter.tsx:story.css:286,302-305,312-315,322-323; WalkChapter.tsx:175,256-266,278-285,296-312`)  
   Problem: will-change: transform on 4 SVG layers (1710 to 4500px wide at 1440x900). Inside them, CSS animations run (windmill st-spin and deer st-graze in .st-walk-hills; rabbit ears, butterflies and gate confetti in .st-walk-meadow), and renderTrail rewrites the clipPath rect width every update. Trace of 2s scrolling 600px through the walk: 55,819 RasterTask events, 34.5s summed across raster threads.  
   Fix: Move the animated pieces (windmill blades, deer, rabbit, butterflies, gate locks and confetti) into small separate SVGs positioned over the layers and moved by the same x tween. Draw the footprint trail as its own element revealed with transform: scaleX() instead of a clip-rect attribute. Keep the big static layers free of animated content.

150. **Low · Every <details> toggle triggers a full ScrollTrigger.refresh, including the header menu** (`src/hooks/useLandingMotion.ts:useLandingMotion.ts:79`)  
   Problem: element.addEventListener('toggle', refresh, true) on the .st root catches the header's .st-menu <details> (inside .st) as well as the FAQ items. The menu panel is absolutely positioned and changes no section heights.  
   Fix: Ignore toggles from .st-menu: `if ((event.target as Element).closest('.st-menu')) return;`. FAQ toggles are already covered by the ResizeObserver on the root, so the toggle listener can probably be dropped entirely.

151. **Low · No cache-header or host config for the static build, and .DS_Store files are copied into dist/** (`vite.config.ts:7`)  
   Problem: `find dist -name .DS_Store` -> dist/.DS_Store, dist/assets/.DS_Store (public/.DS_Store and public/assets/.DS_Store are copied verbatim by Vite). No public/_headers, wrangler.jsonc or vercel.json exists, so hashed assets (/assets/index-B1MhQLJS.js, style-CeXMyr7y.css) would get the host default (Cloudflare Pages: `max-age=0, must-revalidate`) instead of immutable caching, while HTML would get whatever the host picks.  
   Fix: Add public/_headers (Pages) or an assets headers config: `/assets/* Cache-Control: public, max-age=31536000, immutable` and `/*.html Cache-Control: public, max-age=0, must-revalidate`; delete .DS_Store (`find public -name .DS_Store -delete`) and exclude it in the build (`vite.config.ts`: `publicDir` copy filter or a postbuild `find dist -name .DS_Store -delete`).  
   Also reported by: code-audit

152. **Low · React SSR preloads the below-the-fold store badges and QR code in <head>, competing with the hero for bandwidth** (`src/components/story/FinalCta.tsx:41`)  
   Problem: dist/index.html head contains `<link rel="preload" as="image" href="/assets/story/app-icon-96.webp">`, `…/assets/app-store-badge.svg`, `…/assets/google-play-badge.svg`, `…/assets/story/mozy-qr.svg` (React 19 renderToString emits preloads for eager `<img>` elements). The QR (FinalCta.tsx:41) and the second badge pair (StoreBadges in FinalCta) are ~9,200 px down the page;  
   Fix: Add `loading="lazy" decoding="async"` to the QR `<img>` and to StoreBadges when `placement` is not the hero (React skips preloads for lazy images); keep the hero badges eager.

153. **Low · Expensive filters sit on scroll-animated or always-animating layers** (`src/story.css; src/components/story/Hero.tsx:story.css:61,164,171,174,334,394; Hero.tsx:99-100`)  
   Problem: Computed: .st-hero-moz filter drop-shadow(0 18px 24px) on an SVG whose eyes and sprout animate forever. .st-feed filter blur(1.2px) saturate brightness and .st-shield-sheet backdrop-filter blur(12px) (with an animated Moz inside) sit within .st-hero-phone, which GSAP rotates on every scroll frame. .st-walk-pill backdrop-filter blur(8px) sits over drifting clouds during the scrub.  
   Fix: Replace the hero Moz drop-shadow with a static blurred ellipse under him. Replace .st-feed's blur with pre-softened gradients. Drop backdrop-filter on .st-shield-sheet (already rgba .9) and .st-walk-pill (use opaque rgba(255,255,255,.85)). Keep the blur only on nav and HUD.

154. **Low · Landing JS bundle is 448 KB (149 KB gz) with gsap+ScrollTrigger+Flip and no route chunk preloading; client blog navigation pulls a 404 KB articles chunk just to set meta tags** (`src/components/PageMetadata.tsx:10` · unverified)  
   Problem: Build output: dist/assets/index-B1MhQLJS.js 447.82 kB (gzip 148.77 kB), articles-BIQofBLn.js 404.29 kB (gzip 81.52 kB). The main chunk contains 'ScrollTrigger' (5 refs) and 'Flip' (3 refs); `grep -c modulepreload dist/index.html` = 0.  
   Fix: Split the article bodies out of the client bundle: keep a small `articles-index.json` (slug, title, description, pillar, readTime, faqs) for BlogIndex/related cards and PageMetadata, and let BlogPost import `articles/<slug>.json` lazily (or rely on the prerendered HTML and hydrate only the interactive bits). Check whether Flip is needed (`gsap/Flip` is 3 refs); add `<link rel="modulepreload">` for BlogIndex/BlogPost chunks on /blog pages.

## Assets, dead code and repo hygiene

155. **Medium · 30 component files are dead, including fake 5-star testimonials ready to be re-imported** (`src/components/*.tsx; src/components/desktop/**:ReviewsSection.tsx:2-21`)  
   Problem: Import-graph reachability from main.tsx and scripts/*.mjs shows these as unreachable. Top level (13 files, 1,066 lines): ComparisonSection, CurrencyLedger, FinalCTA, Footer, HeroSection, MechanismSection, MozCompanion, Navbar, PainSection, PrivacySection, ProductShowcase, ReframeSection, ReviewsSection.  
   Fix: Delete the 30 files, plus App.css and src/assets/{hero.png, react.svg, vite.svg}. Re-run tsc and oxlint (both currently pass with 0 issues).

156. **Medium · 16.3 MB of the 17.5 MB in public/ is unreferenced and ships in dist, including duplicates and badly named files** (`public/`)  
   Problem: Only 1.2 MB is referenced (badges, icon.png, og-banner.png, story/*, favicon-rounded.svg, sitemap/robots). md5 duplicates: hero-phone.png = v2/hero-phone.png = v2/media_1789815269478.png, and the same triplets for choose-block, companion-worlds, progress-streak and steps-currency (about 700 KB each). 'home2 copy.avif' = home2.avif and 'home3 copy.avif' = home3.avif. 'hero image.png' is 2.29 MB and unused.  
   Fix: Move the reference art (mozy-icon-original.webp, v2 screenshots, mascot_emotions, the mascots-* folders) to a non-served folder such as design-refs/. Delete the duplicates, the 'copy' files, 'hero image.png' and 'heromobileand tablet'. Keep only files referenced by live code, metadata and blog JSON in public/.  
   Also reported by: seo-technical

157. **Medium · Local v2 screenshot captions do not match what is live on the App Store, files are low-res and duplicated three times in public/** (`public/assets/v2/hero-phone.png:1`)  
   Problem: Live App Store captions (ios-shot-*.webp): 'Lock Distracting Apps. Walk to Unlock.', 'Choose Apps to Block.', 'Your Steps Unlock Freedom.', 'Your Progress Lives on Your Home Screen.', 'Walk More. Unlock New Worlds.' Local public/assets/v2: 'Walk first. Scroll later.', 'Choose what to block.', 'Turn steps into screen time.', 'Your progress. At a glance.', 'A little walk.  
   Fix: Pick one caption set (recommend the local v2 lines), upload at full resolution to App Store Connect and Play, store the masters outside public/ (or keep one 473x1024 set for the site), and delete the media_* and root duplicates.

158. **Medium · OG banner carries the old brand name and a headline that matches nothing on the page** (`index.html:20`)  
   Problem: og:image = /assets/og-banner.png; the image text reads "mcrudra digital wellness / Mozy / Break the Doomscroll Reflex / Walk to unlock apps • The screen time app that moves you / Hard Limits · Step Pedometer · Privacy-First". The page headline is "Your phone now charges you in steps.", the brand is MCRUDRAX, and "Break the Doomscroll Reflex" is the kind of outcome promise the brief excludes.  
   Fix: Regenerate a 1200×630 banner from the new mascot: "Mozy · Walk to earn screen time", one line "Lock Instagram, TikTok or YouTube. Earn minutes by walking.", both store badges, MCRUDRAX mark; export under 300 KB; make og:image:alt describe it. Update the MCX asset link (mcrudra.com/assets/mozy/og-banner.png) to the same file.  
   Also reported by: aso

159. **Medium · Social/preview images are heavy and icons incomplete: 773 KB og-banner.png, 397 KB 500x500 PNG as apple-touch-icon, no favicon.ico/PNG fallback, no manifest, no og:image:width/height** (`index.html:15`)  
   Problem: `sips` public/assets/og-banner.png = 1200x630 png, 773,279 B (correct ratio, 5–6x heavier than needed); public/assets/icon.png = 500x500 png 396,687 B used at index.html:15 `<link rel="apple-touch-icon" sizes="500x500" href="/assets/icon.png">` (iOS wants 180x180). index.html:14 only `<link rel="icon" type="image/svg+xml" href="/favicon-rounded.svg?v=2">` (55,725 B SVG, fetched on every page);  
   Fix: Export og-banner as JPEG q80 (~120 KB) or an optimised PNG (pngquant) at 1200x630 and add `<meta property="og:image:width" content="1200">`, `og:image:height 630`, `og:image:type`, `og:locale en_US`, `twitter:site @resilientmahesh`; add public/apple-touch-icon.png 180x180 (~10 KB), public/favicon.ico (32 px) and favicon-96.png, a minimal site.webmanifest (name, icons 192/512, theme_color #0b0e1a, background_color #FAF9F5) linked from index.html; keep the SVG favicon but optimise it with svgo (< 10 KB).  
   Also reported by: aso, code-audit

160. **Low · Design docs contradict the current site and the owner's mascot direction** (`BRAND_DESIGN_LANGUAGE.md; docs/LANDING_PAGE_PLAN.md; README.md:BRAND_DESIGN_LANGUAGE.md:3,17-24,32-33,75-99`)  
   Problem: BRAND_DESIGN_LANGUAGE.md says changes 'must strictly adhere', describes Moz as 'pear-shaped' and 'Wears a miniature adventurer's backpack' (the owner rejected the backpack), sets Sprout Green #22C55E (the site uses #63d586 and #28763e), and still lists the retired bento hierarchy, including 'TestimonialsCard (Light 3-column user quotes)'.  
   Fix: Update BRAND_DESIGN_LANGUAGE.md (blob Moz without a backpack, current tokens, no testimonials). Move LANDING_PAGE_PLAN.md to docs/archive/. Replace the README with real run, build and deploy notes.

161. **Low · rive/moz-bodyfix is a 10 MB near-duplicate of rive/moz** (`rive/`)  
   Problem: diff -rq: scene.rml, rive.yaml and tools are identical in substance, and build/moz.riv is the same size (25,990 B). They differ only in build shots and logs. 18 MB of PNG renders sit in build/shots. Nothing in src/ references a .riv.  
   Fix: Keep one folder (merge any bodyfix-only notes into rive/moz). Move the shots to scratch or ignore them.
