# MCS (MCRUDRA Search) skill: implementation plan

11 October 2026 · Phase 1 was built the same day: repo `~/Desktop/Projects/mcs`, linked as `~/.claude/skills/mcs`, with the first Mozy report in `docs/mcs/`. Phases 2 and 3 below are still plans.
Scope: our own skill for SEO, GSO (AI search) and ASO, written from scratch. No code is imported from claude-seo. Version 1 targets the local Mozy landing page in this repo. Live sites are not audited.

## 1. Verdict: do we need it?

**7.5 out of 10. Yes, as a focused skill.** A full copy of claude-seo's 26 sub-skills would score about 4 out of 10 for us: too broad, too much risk, and mostly irrelevant (maps, e-commerce, backlink APIs).

Why it earns 7.5:
- Today's audit found dozens of SEO, GSO and speed issues on this landing page by hand. The same mistakes will come back on every new page (Pozy, Doovi, VEIL, future apps) unless the checks run automatically.
- A pre-deploy gate catches broken titles, schema, sitemaps, crawler rules, false claims and heavy pages in seconds, before anything ships.
- A page blueprint makes every new landing page start right: search intent, structure, facts AI can quote, schema and a speed budget.
- It is the only practical way to measure the "AI recommends our app" goal over time.

Why it isn't higher:
- Rankings are mostly won outside the code: content people want, real mentions and reviews, and, for apps, installs, ratings and retention. A skill can check and guide those, not create them.
- No tool can make ChatGPT, Claude or Gemini recommend Mozy every time. AI answers vary by run, user and model. MCS can raise the odds and measure them.
- Search rules change often. FAQ rich results were retired for all sites on 7 May 2026. Lighthouse added an "agentic browsing" check in 2026. The rules need a refresh every quarter, or the skill starts giving stale advice.

## 2. What MCS would catch on the landing page today

This is a quick read-only check of the current local build (`dist/`, 34 prerendered pages). It shows the kind of report MCS would produce automatically.

**Already good**
- Every page has a title, meta description, canonical URL and exactly one H1.
- Structured data is broad: Organization, Person (author), BlogPosting, BreadcrumbList, MobileApplication, WebSite and FAQPage.
- robots.txt allows all crawlers and declares the sitemap.
- Analytics loads after the page, so it doesn't slow the first view.

**Would be flagged**

| Area | Finding | Why it matters |
|---|---|---|
| Speed | The home page is 469 KB of HTML (107 KB compressed) with 3,180 elements, 80% of them inside the drawn SVG scenery. | Heavy first load and main-thread work on phones. Performance tools treat pages over about 1,500 elements as heavy. |
| Speed | A 3.1 MB `hero image.png` ships in the build but is only used by an old component that no page renders. Two identical 832 KB copies of `companion-worlds.png` also ship. | Wasted deploy size and a cleanup signal. |
| Speed | The main JavaScript bundle is 161 KB compressed. The analytics chunk (98 KB) loads only after the page is idle. | Within reason, but needs a budget so it doesn't creep up. |
| Crawling | No `404.html`, so unknown URLs would serve the home page (a "soft 404"). | Google treats soft 404s as low quality. |
| Crawling | 21 of 33 sitemap URLs have no `lastmod` date. | Search engines get no signal when pages change. |
| GSO | No `llms.txt` or `llms-full.txt`. The live site serves both, so deploying this build would remove them. | Low ranking value, but cheap to keep and now checked by Lighthouse. |
| GSO | robots.txt names only a few bots, and there is no explicit decision on AI training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot). | Everything is allowed today; an explicit policy documents intent. |
| ASO | No Smart App Banner (`apple-itunes-app` meta) on the landing page. | iPhone visitors miss the one-tap App Store bar. |
| Blog | No RSS feed. | Feed readers and some AI tools discover new articles through feeds. |

## 3. Goals, and what MCS can and can't do

| Goal | What MCS does | What it can't do |
|---|---|---|
| Rank on Google | Catches technical and on-page errors, keeps pages fast, generates correct schema, suggests internal links, writes content briefs. | Create authority or guarantee positions. Content quality and real links still decide. |
| Rank on Bing | Checks Bing access, IndexNow readiness and Bing Webmaster data after launch. | Same as Google. This matters extra because ChatGPT and Copilot draw on Bing. |
| Rank the blog | Pre-publish gate (no outlines, byline, dates, citations, internal links), briefs, duplicate-topic checks, freshness reminders. | Write great articles by itself. |
| AI assistants recommend our apps | Makes pages easy to fetch and quote, plans honest comparison and alternatives pages, keeps facts identical everywhere, and tracks how often each AI mentions or cites us and which sources it cites instead. | Guarantee recommendations. It raises the odds and makes progress measurable. |
| Rank in the app stores (ASO) | Audits listings against limits and the keyword plan, and keeps the store, the site and the schema saying the same thing. | Change the biggest store signals: installs, ratings and retention. |
| Better future landing pages | The blueprint starts each page right, and the gate stops regressions before deploy. | Design the page. |

## 4. How AI assistants pick what to recommend (October 2026)

| Assistant | Where its answers come from | What that means for us |
|---|---|---|
| ChatGPT | Bing's index, OpenAI's own crawler (OAI-SearchBot) and partner content. Blocking OAI-SearchBot removes a site from ChatGPT search. | Allow OAI-SearchBot and ChatGPT-User. Get indexed in Bing. |
| Claude | Brave Search's index. About 79% of Claude's citations match Brave's top 10 (vendor measurement, June 2026). Brave follows the robots rules set for Googlebot. | Ranking in Brave matters. Allow Claude-SearchBot and Claude-User, and never block Googlebot. |
| Gemini, Google AI Overviews, AI Mode | Google's index. Google's May 2026 guide says optimising for AI features is ordinary SEO, with no special files needed. | Classic SEO. Search Console's AI report (June 2026) shows AI impressions, but not clicks or queries. |
| Microsoft Copilot | Bing. | Bing Webmaster's AI Performance report (preview since February 2026) shows citations and grounding queries. CSV export only, no API. |
| Perplexity | Its own index (PerplexityBot) plus other sources. | Allow PerplexityBot and Perplexity-User. |
| AI coding tools (Claude Code, Cursor and others) | Fetch documentation directly when a developer asks. | Clean docs and `llms.txt` genuinely help here, mostly for VEIL's developer docs. |

AI assistants recommend apps mostly from "best apps for X" articles, Reddit and forum threads, review sites, YouTube, app store pages and the product's own site. MCS covers the product site and the store pages, and its tracker shows which outside pages the assistants cite, so MCX can plan honest outreach to them.

## 5. Design rules, learned from the claude-seo review

1. **Local first.** Checks run on the local build (`dist/`) or `localhost`. Live URLs only with an explicit `--live` flag, never by default.
2. **No risky installs.** No piping scripts into the shell, no global hooks, no auto-updates, no remote prompt sync. It's our own git repo, and changes go through commits.
3. **No shell-wielding agents reading web pages.** One skill, no fan-out of sub-agents. Scripts do any fetching, through a private-network guard.
4. **Read-only by default.** Anything that changes the outside world (IndexNow submissions, store listing edits) needs your confirmation every time. Never the Google Indexing API.
5. **Safe credentials.** Keys go in the macOS Keychain, never on the command line, in `settings.json` or in the chat.
6. **No invented scores.** Every check is pass, warn or fail with evidence. Any "readiness" figure is simply passed checks divided by applicable checks, shown with the counts. Estimates are labelled as estimates.
7. **Every rule cites a source.** Each rule names an official source and a last-verified date. Disputed claims are marked disputed, such as whether Apple indexes screenshot captions.
8. **Truth gate.** Product claims must match MCX's verified facts. No fake ratings or reviews, not even in examples or schema.
9. **No adverts or tracking.** No promotional footers, no telemetry.
10. **Minimal dependencies.** Python standard library for the checks. Lighthouse is pinned inside the project, not fetched as "latest".

## 6. Architecture

MCS gets its own private repo, linked into Claude's skills folder the same way MCX is.

```
mcs/                              repo at ~/Desktop/Projects/mcs, linked to ~/.claude/skills/mcs
├── SKILL.md                      router: commands, safety rules, report format (about 200 lines)
├── references/                   loaded only when that branch runs
│   ├── check.md  speed.md  schema.md  geo.md  gate.md  blueprint.md
│   ├── blog.md  aso.md  watch.md  track.md
│   └── sources.md                every rule's official source and last-verified date
├── rules/                        machine-readable checks, one JSON file per branch
├── scripts/
│   ├── mcs.py                    one command line: check, speed, schema, geo, gate, blueprint, blog, aso, watch, track, refresh
│   ├── html_scan.py              reads the built HTML: titles, meta, headings, links, images, JSON-LD
│   ├── budgets.py                page and asset weight budgets from the build folder
│   ├── lighthouse_run.py         runs the project's pinned Lighthouse against localhost
│   ├── schema_tool.py            validates JSON-LD and generates it from facts
│   ├── crawlers.py               robots.txt against the AI crawler table
│   ├── facts.py                  reads MCX's portfolio (mcx.py app --json) and the site's own facts
│   └── report.py                 Markdown report for you, JSON for the gate
├── data/
│   ├── ai_crawlers.json          name, owner, purpose (search, training or user fetch), robots token, verified date
│   └── budgets.json              default budgets (HTML, DOM, JS, CSS, images, lab LCP, CLS, TBT)
├── templates/                    blueprint.md, report.md, llms.txt
└── tests/                        good and bad fixture pages, one test per rule
```

A rule looks like this:

```json
{"id": "SEO-CANONICAL-SITEMAP", "severity": "high", "check": "canonical_matches_sitemap",
 "why": "Canonical, og:url and sitemap URL must be identical", "source": "Google Search Central: canonicalization",
 "verified": "2026-10-11"}
```

How it connects:
- **MCX** stays the single source of truth for app facts, links, prices and claims. MCS reads it and never keeps its own copy.
- **MCS hands work to MCX:** content gaps, questions to answer and outreach targets.
- **Each site repo** gets one npm script, for example `"mcs:gate"`. It runs after `npm run build` and needs no global hooks.
- **Reports** are written to `docs/mcs/` in the site repo, so each one is reviewable in git.

## 7. The branches, ranked

| Branch | Command | What it does | How it helps landing pages | Rating | Phase |
|---|---|---|---|---|---|
| gate | `/mcs gate` | One pass or fail before every deploy. Runs the blocking rules from check, speed, schema and geo, and fails on blockers. | Every page ships clean, and old mistakes can't return. | 9.5 | 1 |
| check | `/mcs check` | Full technical and on-page audit of the local build. | Finds in seconds the kind of issues today's audit found by hand. | 9 | 1 |
| speed | `/mcs speed` | Weight budgets from the build, a Lighthouse lab run on localhost, and a comparison with the last baseline. | Keeps pages fast. Today it would flag the 469 KB home page. | 8.5 | 1 |
| blueprint | `/mcs blueprint` | Turns an app and a goal into a page spec (intent, sections, facts, schema, budget). | Starts every new landing page right. | 8.5 | 1 |
| schema | `/mcs schema` | Generates JSON-LD from one facts source and validates it. | No wrong prices or claims in structured data; consistent entities. | 8 | 1 |
| geo | `/mcs geo` | AI-search readiness: crawler access, quotable facts, question coverage, llms.txt from verified facts. | Pages that ChatGPT, Claude, Gemini and Perplexity can fetch and quote. | 7.5 | 1 |
| blog | `/mcs blog` | Article briefs and a pre-publish gate for the journal. | Articles that rank and feed readers to the landing page. | 7.5 | 2 |
| aso | `/mcs aso` | Store listing audit against limits, the keyword plan and the site. | Store pages that match the landing page; more search installs. | 6.5 | 2 |
| watch | `/mcs watch` | AI visibility tracking with a fixed question set per app, run monthly. | The only way to measure the AI-recommendation goal. | 7 (after launch) | 3 |
| track | `/mcs track` | Search Console and Bing data (read-only), and IndexNow with confirmation. | Measures Google and Bing results after launch. | 6 now, 8 after launch | 3 |

### What each branch checks

**check:**
- Titles and descriptions: present, unique, sensible length.
- Canonical URLs: absolute, self-referencing, identical to og:url and the sitemap entry.
- Page basics: one H1, a `lang` attribute, complete Open Graph and Twitter tags with an image that exists.
- Indexing: no stray noindex, noindex where intended (for example /get), a 404 page with noindex.
- Links and images: no broken internal links; alt text, width and height on images.
- Sitemap: every URL exists in the build, no held articles, a `lastmod` on every URL; trailing slashes consistent.
- Store links: valid IDs and tracking.
- Smart App Banner present.
- Truth gate: no claims outside MCX's verified facts, and none of its "do not claim" items.

**speed:**
- HTML size, element count, JavaScript, CSS and image weight against budgets.
- Images: modern formats, no oversized files, no unused large assets, no duplicate files.
- Loading: font preloading and swap; nothing render-blocking; third-party scripts deferred.
- Lab Lighthouse targets: LCP 2.5 s or less, CLS 0.1 or less, TBT 200 ms or less. INP needs real-user data after launch.
- Regression against the last saved baseline.

**schema:**
- Builds one JSON-LD graph from facts: Organization, WebSite, MobileApplication with an offer per platform, Person, BreadcrumbList, BlogPosting, ItemList for the blog, and FAQPage. FAQPage is kept for clarity, but rich results for it ended in May 2026.
- Validates parsing, types, required properties and unique IDs.
- Flags retired types such as HowTo, and self-serving review markup.
- Checks prices, OS versions and names against the facts.

**geo:**
- AI crawler table: search bots allowed; training bots per your policy.
- An answer-first opening that says what the app does in the first two or three sentences.
- Key facts present in the HTML text, not only in images or scripts.
- Pages readable without JavaScript.
- The top questions per app answered on the page.
- The name, maker, platforms and price identical across the page, schema, llms.txt and stores.
- Honest comparison and alternatives pages planned.
- A visible "updated" date where it matters.

**gate:**
- Runs every rule marked "blocking" and exits with failure when one fails.
- Offers a warn-only mode while the backlog is cleared.

**blueprint:**
- From an app, an audience and a goal: primary query and intent, title, H1 and description options, and a section outline (answer-first hero, how it works, proof, FAQ, comparison, final CTA).
- Questions to answer, a facts block for AI, the schema graph, internal links, performance budgets, and the ASO wording to mirror.
- Output is a Markdown spec in `docs/mcs/`, ready to design from.

**blog:**
- Briefs: intent, questions to answer, an answer-first outline, the sources needed, internal links and the CTA.
- Pre-publish gate: no outline placeholders, a Person byline, published and updated dates, a citation for every statistic, at least two internal links, no unverified claims, and no duplicate topic against existing articles.
- A quarterly freshness list.

**aso:**
- Character limits:
  - iOS: name 30, subtitle 30, keyword field 100.
  - Play: title 30, short description 80, full description 4,000.
- Keyword-field hygiene: no repeats of words already in the title or subtitle, no competitor names.
- One name across both stores, the site and the schema.
- Screenshot captions: planned as a conversion lever (whether Apple indexes them is disputed); first three frames reviewed.
- Apple specifics: custom product page keyword map, and an App Store tags review checklist (Apple generates tags from metadata, and you can deselect wrong ones).
- Play policy-safe claims, such as avoiding medical wording for Pozy.
- Version 1 works from listing text you paste or from MCX's ASO kit; fetching our own public listing happens only when you ask. Proposed copy goes through MCX's truth gate.

**watch (after launch):**
- A question bank per app, for example "best app to stop doomscrolling" and "app that makes you walk before Instagram".
- Each question runs three times a month through the APIs with web search: OpenAI, Perplexity, Gemini and Claude, plus Brave Search rank as a proxy for Claude.
- Logs: mentioned or not, position, whether our URL is cited, and which other URLs are cited.
- Imports the Bing AI Performance and Search Console AI report exports.
- Hard monthly budget cap.
- Caveat: API answers can differ from the consumer apps, so it tracks trends, not single answers.

**track (after launch):**
- Search Console with the read-only scope only, plus Bing Webmaster with the key in the Keychain.
- IndexNow (Bing and others, not Google) only after you confirm.
- Weekly summary of queries, pages, CTR, positions and AI impressions, with alerts on sharp drops.

**refresh:**
- A quarterly checklist to re-verify every rule against the official docs and update the verified dates.
- Tests must pass before a rule change is committed.

## 8. What we will not build, and why

- **Backlink and keyword APIs (DataForSEO, Moz, Ahrefs):** paid, low value at our size. The claude-seo review found cost guards that the AI can lift itself.
- **Local SEO, maps, e-commerce and multi-language hreflang:** not our business today.
- **Programmatic SEO page generators and mass blog writing:** risk Google's scaled-content-abuse policy.
- **"Humanizer" text rewriting and image generation:** the first is ethically shaky and damaged text in claude-seo. Images belong to MCX and MCV.
- **Google Indexing API submissions:** only allowed for job and livestream pages.
- **Remote prompt syncing, global hooks, promotional footers and 17-agent audits:** the main safety problems in claude-seo.

## 9. How it fits a landing-page project

1. **Before design:** `/mcs blueprint <app> "<goal>"` produces the page spec.
2. **While building:** `/mcs check` and `/mcs speed` on the local build after each major change.
3. **Before deploy:** `npm run mcs:gate` must pass.
4. **After deploy:** `/mcs track` weekly, `/mcs watch` monthly, then content gaps go to MCX.
5. **Every quarter:** `/mcs refresh` keeps the rules current.

## 10. Build phases and effort

Effort is rough and counted in focused working sessions.

| Phase | What gets built | Effort | Done when |
|---|---|---|---|
| 1. Core | Repo and router, HTML scanner, rules for check, geo and schema validation, budgets, gate with npm script, blueprint template, reports, fixture tests. First run on the Mozy local build. | 3-4 sessions | The gate fails on the bad fixtures, passes on the good ones, and produces a baseline report for this landing page. |
| 2. Content and stores | Blog briefs and publish gate, ASO audit from pasted listings and the MCX kit, schema generator from facts, pinned Lighthouse lab runner. | 2-3 sessions | A real article and the Mozy listings run through it, and the generated schema matches the site's facts. |
| 3. After launch | watch (AI tracking with a budget cap), track (Search Console and Bing read-only, IndexNow with confirmation), AI report imports. | 2-3 sessions | A first monthly AI visibility report and a weekly search summary exist. |

## 11. Costs and risks

**Costs**
- Phases 1 and 2 cost nothing.
- Phase 3, AI tracking: about 20 questions × 4 assistants × 3 runs a month, likely a few dollars a month. Verify current API prices when building, and cap the budget.
- Search Console, Bing Webmaster, PageSpeed and IndexNow are free.

**Risks**
- **Stale rules:** mitigated by sources, verified dates and the quarterly refresh.
- **False confidence:** a green gate means no self-inflicted mistakes, not guaranteed rankings.
- **Maintenance time:** a few hours a quarter.
- **AI answers vary:** watch tracks trends across repeated runs.
- **Over-optimisation:** rules warn against keyword stuffing and padding, and never require word counts.

## 12. Decisions for you

1. Name and commands: MCS = MCRUDRA Search, with the branches above.
2. Repo: a new private repo at `~/Desktop/Projects/mcs`, linked like MCX.
3. Gate strictness: block deploys on high-severity failures, or warn only at first.
4. AI training policy: allow or block GPTBot, ClaudeBot, Google-Extended, Applebot-Extended and CCBot. AI search bots stay allowed either way.
5. Phase 3 budget for AI tracking, for example up to $5 a month.
6. Version 1 scope: the Mozy landing page only, as you asked. Pozy, Doovi, VEIL and future pages come later with the same checks.

## Sources (current facts checked for this plan)

- Claude search uses Brave: [Xponent21 analysis](https://xponent21.com/insights/claude-web-search-brave-turbopuffer/), [TechCrunch](https://techcrunch.com/2025/03/21/anthropic-appears-to-be-using-brave-to-power-web-searches-for-its-claude-chatbot/embed/), [cloro](https://cloro.dev/blog/brave-search-api-vs-serp-api/)
- ChatGPT search sources and OAI-SearchBot: [Webiano](https://webiano.digital/inside-the-source-choices-behind-chatgpt-search-results/), [NexterWP](https://nexterwp.com/blog/chatgpt-search-wordpress/)
- Bing AI Performance report: [Search Influence](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/), [Momentic](https://momenticmarketing.com/blog/bing-wmt-ai-performance-report)
- Search Console AI reports: [PinMeTo](https://www.pinmeto.com/news/google-search-console-generative-ai-reports-2026/), [Evolv](https://evolvagency.io/learn/generative-search/google-search-console-generative-ai-performance-reports)
- Google on AI features: [Google Search Central](https://developers.google.com/search/docs/appearance/ai-features), [Practical Ecommerce](https://practicalecommerce.com/google-says-ai-optimization-is-just-seo)
- llms.txt and Lighthouse: [PPC Land](https://ppc.land/google-adds-llms-txt-to-lighthouse-as-agentic-web-standards-heat-up/), [Pixelmojo](https://www.pixelmojo.io/blogs/google-says-you-dont-need-llms-txt), [DebugBear](https://www.debugbear.com/docs/agentic-browsing/llms-txt-does-not-follow-recommendations)
- FAQ rich results retired: [Search Engine Journal](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/)
- ASO: [Appfigures](https://appfigures.com/resources/guides/app-store-algorithm-update-2025), [App Screenshot Studio](https://appscreenshotstudio.com/blog/app-store-screenshots-vs-description-2026-aso-trade-off), [AppRadar](https://appradar.com/academy/aso-basics/app-store-ranking-factors), [TechCrunch on App Store tags](https://techcrunch.com/2025/06/11/at-wwdc-apple-says-it-will-use-ai-to-tag-apps-to-improve-discoverability-on-the-app-store), [Adapty WWDC25 summary](https://adapty.io/blog/wwdc25-what-apple-announced/)
- AI visibility tracking: [Metehan](https://metehan.ai/articles/how-to-track-brand-visibility-in-ai-search), [Clearscope](https://www.clearscope.io/blog/How-to-Track-Brand-Mentions-in-AI-Answers)
