# Mascot quality and scroll motion update

- Replaced the eight poses used on the landing page with 1254×1254 generated WebP renders (original files were generally 100–200px tall).
- Preserved character identity, pose intent, cream body, green sprout and backpack. These are redraws, not pixel-identical enlargements.
- Used the built-in image generation tool. Exact final prompts and destination files are in MASCOT_GENERATION.json.
- The image tool returned baked checkerboards for most initial transparency requests. Those outputs were rejected. Final assets use white mattes and CSS multiply on light surfaces; these files should not be reused as transparent cutouts on dark backgrounds.
- The mood selector now uses only the eight upgraded poses. All original assets remain untouched.
- Added rounded SVG browser favicon wrapping the canonical MOZY artwork without repainting it. The screenshot request concerned the favicon, so the Open Graph social banner is unchanged.
- Added GSAP ScrollTrigger: hero recession, section entrance reveals, panel scale depth, and desktop mascot parallax. Pointer tilt uses an independent rotate property to avoid competing with GSAP transforms.
- All animations use native scroll. Mobile has smaller movement; reduced-motion disables scroll animation. MatchMedia cleanup supports route changes and React Strict Mode. Font loading, disclosure changes, and layout resizing refresh geometry.

Validation: production build and lint passed. Browser checks confirmed changing scroll transforms, the eight-mood selector, no broken loaded images, and no overflow at 390px and 768px. Original screenshots remain unchanged. Only local files/preview were updated; no deployment performed.
