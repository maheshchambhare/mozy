# MOZY landing page: audit and implementation plan

## Audit
The original full-viewport dark hero relies on a large background composite. Fixed phone widths, two independent bento columns, and no responsive rules in the active stylesheet disrupt reading order and cause narrow-screen crowding. Fake avatar circles use app screenshots; claims about thousands of users and testimonials are not substantiated. App walkthroughs recreate UI instead of using the supplied product visuals. Generic social links lead away from the product. The entry HTML is an empty JavaScript shell with no canonical URL or crawler files.

## Design direction
Warm cream canvas, soft peach accents, sprout green calls to action, rounded Fredoka headings and Nunito body copy. Alternate open editorial sections with mint and charcoal product panels. Actual supplied screenshots remain unmodified. MOZ creates personality through meaningful reactions rather than decoration in every corner.

## Section order
1. Compact navigation, clear promise, store links, actual product screenshots and MOZ.
2. Problem/reframe strip: make the next scroll intentional.
3. Three-step app flow: select distractions, walk, spend earned minutes.
4. Interactive illustrative step-to-minute calculator, explicitly labelled as a demo.
5. Swipeable gallery with all five unique supplied app marketing screenshots.
6. Interactive companion mood selector with access to all 36 emotions.
7. On-device privacy explanation and link to full policy.
8. Native accessible FAQ disclosures.
9. Final installation CTA, useful footer, compact mobile download shortcut.

## Responsive and interaction requirements
320px upward; natural document order; wrap navigation on small screens; touch targets at least 44px; no hover-only functionality. Horizontal gallery uses scroll snap and labelled previous/next controls. Pointer-responsive hero art only on fine pointers. Respect reduced motion. Images have dimensions and below-fold images are lazy loaded.

## Search / answer engine strategy
Use descriptive title, canonical, absolute social preview URLs, MobileApplication structured data without invented ratings or prices, crawlable build-time HTML, robots.txt and sitemap. Explain app blocking and earned screen time in visible prose. Avoid fabricated reviews, guaranteed outcomes, keyword stuffing and claims of guaranteed rankings. Google says the same SEO fundamentals apply to AI search: https://developers.google.com/search/docs/appearance/ai-features

## Source boundaries
Brand markdown is reference material; the user's explicit mobile-first redesign supersedes its desktop-only composition. Product facts come from the local privacy page, supplied screenshots and the public Google Play listing. App Store URL is retained from the existing implementation; automated web verification was unavailable. Pricing and minimum OS versions are omitted because sources are insufficient. Duplicate screenshot copies are not repeated.

## Verification completed
- TypeScript and production build, including landing-page prerender: passed.
- Oxlint: passed.
- Browser inspected at desktop, 768px tablet, 390px phone and 320px narrow phone widths; no document horizontal overflow in the tested mobile/tablet sizes.
- Slider keyboard End updates to 10,000 steps; all 36 mood controls expand and selection updates; FAQ disclosure opens; gallery next control advances the gallery.
- Browser reports no broken loaded images. Screenshot aspect ratios corrected to the supplied 1080×1920 dimensions.
- Static HTML audit: one H1, unique IDs, valid section anchors, local image references present, FAQ text available before JavaScript.

## Launch follow-up
The build is local and has not been deployed. Confirm the retained App Store listing URL before launch (automated web lookup failed), confirm the production domain, deploy dist with SPA route fallback, and submit the sitemap to Search Console. Only the landing page is prerendered in this change; existing blog/privacy routes retain client rendering with route-aware metadata. The pre-existing journal needs a separate editorial/factual audit before expanding search promotion. Ranking and installation conversion require measurement after launch.
