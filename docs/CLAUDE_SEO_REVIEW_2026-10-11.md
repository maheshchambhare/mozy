# claude-seo review: is it safe and worth installing? (11 October 2026)

Repository: github.com/AgriciDaniel/claude-seo, version 2.4.2 (commit 4b99de2, 5 October 2026).
Nothing was installed or run. The code was cloned read-only into a scratch folder and every one of its 469 files (about 79,000 lines) was read by eight parallel reviews, plus repository-wide scans and a check of its GitHub history. Key claims below were re-checked by hand.

## The short answer

- **It is not malware.** No hidden code, no encoded payloads, no telemetry, no tracking, no data sent anywhere except the services each feature names (Google APIs, the paid SEO APIs you configure, and the sites you audit). The core installer does not use sudo, edit your shell, or change Claude Code's settings or permissions.
- **It is authentic and actively maintained.** One maintainer (Agrici Daniel), real outside contributors, 58 different people filing issues and fixes in the last two months, and reported security bugs fixed quickly.
- **It is not "install and forget" safe.** There are about twenty medium-severity problems: supply-chain exposure, a hook that runs on every file edit in every project, Google sign-in that asks for far more access than needed, a command that can ask Google to drop your pages from its index with no confirmation, paid-API spending guards the AI can switch off, and a promotional footer added to client reports.
- **Its advice is mostly current but not fully reliable.** Core Web Vitals, FAQ and HowTo changes, and llms.txt are described correctly. But it also outputs invented scores, unsourced statistics, some wrong advice, and a handful of numbers that are simply calculated wrong.
- **For the Mozy landing page, you don't need it now.** The site isn't deployed, our own audit (docs/SITE_AUDIT_2026-10-11.md) already covers the same ground, and the free Google tools it wraps can be used directly. If you want it later, use the safe setup in the last section.

## Can we trust it?

| Signal | What we found |
|---|---|
| Popularity | 18,681 stars and 2,739 forks. Stars couldn't be audited (GitHub now needs a login to list them), but issue and pull-request activity looks organic. |
| People | One maintainer owns every file. Outside contributors include Nordalux, Tim Peters, xiaolai and others. |
| History | 383 commits since February 2026. About 288 (75%) are co-authored by Claude, so most of the code is AI-written, though it is coherent and tested. |
| Author | Account created July 2025. Runs a paid "AI Marketing Hub" community on Skool, which gets features early. |
| Security process | A written threat model and a private reporting channel. Past real bugs (installer code injection, SSRF bypasses, an installer that wiped Claude's config file) were fixed and have regression tests. |
| Tests | About 735 test functions. The network-safety tests are excellent; about a quarter of the test files only check that the right text is present. |
| Current bugs | Open issues include: Claude Desktop skips the plugin since 2.4.2; `/seo` drops the command word; Google scripts can silently use another site's Search Console property; 16 files call DataForSEO tools that no longer exist. |

## What installing would change on your Mac

The manual install (`install.sh`, pinned to tag v2.4.2):
- Copies 35 skills into `~/.claude/skills/` and 22 agents into `~/.claude/agents/`. That includes nine extension skills even if you never use them, and all of them load into every Claude session.
- Creates a Python environment inside `~/.claude/skills/seo/`, installs 18 packages from PyPI (version ranges, not locked), and downloads Chromium for Playwright. There is no prompt, despite what the README says.
- Does not touch `~/.claude/settings.json`, `~/.claude.json`, permissions, PATH or shell profiles.

The plugin install (`/plugin marketplace add` and `/plugin install`):
- Always pulls the newest code on the main branch, not a reviewed release.
- Activates a hook that runs Node and Python after every Edit or Write in every project. It can't approve or block tool calls, but it can block an edit that contains retired schema types. Your Node comes from nvm, which the desktop app may not find, so the hook could error after every edit.

Later, when you configure features:
- Credentials go to `~/.config/claude-seo/`, as plaintext JSON with owner-only permissions, not the macOS Keychain.
- Three extensions (Bing Webmaster, Profound, SE Ranking) put API keys into the global `env` block of `~/.claude/settings.json`, so every session, hook and command can see them.
- MCP-based extensions register at user level in `~/.claude.json`, so they start in every project.

Uninstall leaves behind:
- your credentials folder
- MCP and settings.json entries
- caches and generated images

It also deletes any of your own skills or agents whose names start with `seo-`.

## Main findings

### Medium severity

| # | Area | Finding |
|---|---|---|
| 1 | Supply chain | The documented install is `curl … /main/install.sh \| bash`, and the plugin route installs whatever is on main. Neither checks downloaded code for integrity. The security policy says verification is "tracked for v2.3"; it is still missing in 2.4.2. |
| 2 | Supply chain | `/seo flow sync` downloads instruction files from the author's second repository (`AgriciDaniel/flow`, newest version by default) and overwrites the skill's prompts with them. The integrity lockfile is rebuilt from whatever was downloaded, so it protects nothing. If rate-limited, it uses your GitHub login token. |
| 3 | Agent safety | 17 of 19 sub-agents have shell and file-write access while reading content from websites you audit. The only defence is a "treat as untrusted" sentence, and some agents and skills lack even that. A booby-trapped page could try to make Claude run commands. Permission prompts are the real safeguard, so never run audits in auto or bypass mode (this session runs in auto mode). |
| 4 | Google access | Google sign-in always requests full Search Console write access plus the Indexing API, even for read-only reports. The docs tell you to make a service account an Owner of your property. |
| 5 | Side effects | `indexing_notify` sends URL_UPDATED or URL_DELETED to Google's Indexing API immediately, in batches of up to 200, with no confirmation or dry run. Google limits that API to job-posting and livestream pages. A prompt-injected agent could ask Google to drop pages. |
| 6 | Browser safety | Headless Chromium loads arbitrary sites with JavaScript on and without Chromium's sandbox (Playwright's default). Its private-network guard can be bypassed by redirects, pop-ups and service workers, so a hostile page could reach your home network or localhost. Plain HTTP fetching, by contrast, is very well protected. |
| 7 | Reports | Search terms, URLs and Lighthouse titles go into report HTML without escaping. A title like "Document doesn't have a `<title>` element" can cut off the rest of the PDF. A crafted value could, in theory, embed a local file such as your Google token into a PDF you send to a client. |
| 8 | Money | The DataForSEO shopping tool spends with no budget check. The spending guard can be lifted by the AI itself (reset, config change, or a negative or NaN entry that disables the daily cap). The DataForSEO agent can't run the cost check at all. |
| 9 | Third-party code | The image-generation extension runs a community npm package (`@ycse/nanobanana-mcp`, not Google's) that holds your paid Gemini key, starts in every session, and can upload any local file to Google. |
| 10 | Credentials | Bing, Profound and SE Ranking keys go into the global settings `env`. The Profound and SE Ranking "extensions" contain no code: they tell Claude to read settings.json (pulling every secret into the chat) and hand-write API calls, while labelling results "live". |
| 11 | Marketing | The main skill appends "Built by agricidaniel. Join the AI Marketing Hub community" with two Skool links as the last output of 17 commands, including audits and reports you might send to clients (skills/seo/SKILL.md lines 152-195). |
| 12 | File safety | The image skill runs `exiftool -overwrite_original` on every image in the folder. The cluster workflow writes 5-21 blog posts and edits or recreates existing files with no review step. |
| 13 | Fake results | The visual audit reports "touch targets OK" and "readable" without measuring them. Common Crawl lookups can report a false "not found" and cache it for 90 days. Without paid data, the planning skill is told to "estimate" domain authority and traffic with no "estimate" label. |

### Low severity, in brief

- **Wrong numbers:**
  - Spreadsheet CTR is 100 times too high.
  - GA4 "total users" adds up daily users.
  - "Not indexed" counts miss excluded pages.
  - Very low CLS values can read 100 times too high.
  - Keyword Planner can never work with its own sign-in.
- **Leaky credentials:**
  - The YouTube tool can print your API key in an error message.
  - Some scripts take API keys on the command line, which shows them in the process list and shell history.
  - Google sign-in silently falls back to your gcloud login.
- **Broken text tools:** `content_humanize` damages text. "A game-changer" becomes "a important", it rewrites URL slugs and breaks links, and it flattens Markdown indentation.
- **False alarms:** parasite-risk, GBP and e-commerce schema checks raise them. One invents a schema property (`energyEfficiencyClass`). Another marks still-valid types such as Course as Critical.
- **Unpinned runtime code:** `npx lighthouse@latest`, a global `pip install playwright`, and unpinned MCP servers in the docs.
- **Fragile uninstallers:**
  - Three of them rewrite `~/.claude.json` non-atomically.
  - The DataForSEO installer's path search is broken.
  - Most extension commands break in manual installs.
- **Cost:** a full audit spawns about 17 agents, five of them on Opus with 30-45 turns each. There is no token-cost warning.

## How accurate is the SEO and GEO advice?

Correct and up to date:
- Core Web Vitals thresholds, INP instead of FID.
- FAQ rich results retired for all sites on 7 May 2026, and HowTo removed. The reviewer confirmed the FAQ change against current news.
- llms.txt described honestly: Google Search ignores it, and no AI engine is confirmed to use it.
- E-E-A-T not treated as a direct ranking score.
- AI training crawlers kept separate from AI search crawlers.
- Warnings against scaled content and doorway pages.
- The backlink skill refuses to score data it didn't measure.

Wrong or risky:
- **Pagination:** it advises rel=next/prev, which Google stopped using in 2019, and pointing page 2+ canonicals at page 1, which can drop deep products from Google.
- **Self-serving reviews:** it recommends self-serving `aggregateRating` markup, which risks a manual action.
- **Invented rules:** minimum word counts presented as requirements; invented score weights shown as "73/100"; made-up thresholds (for example "30-40% unique content"); backlink myths (".edu/.gov = high authority").
- **Unsourced statistics:** for example "mentions matter 3x more than backlinks for AI citations", with figures that even disagree between skills.
- **Off-site tactics:** advice to "build Wikipedia presence" and "build presence on Reddit", with no conflict-of-interest or astroturfing caveat.
- **Copied claims:** example copy that models invented proof ("4.8/5 from 2,300 reviews", "SOC 2 certified").
- **Hollow prompts:** 38 of the "41 FLOW prompts" are the same template with different titles.

## Would it help the Mozy landing page?

SEO:
- We already did this work: prerendered pages, the JSON-LD graph, sitemap, metadata, journal structure, and the earlier audit.
- claude-seo would mostly re-check it, and its audits need a live URL. Local addresses are blocked unless you allow them.

GEO (AI search):
- Its useful guidance (crawler access, llms.txt honesty, entity consistency, citable facts) matches what we already applied.
- The risky parts (unsourced statistics, Wikipedia and Reddit "presence building") we would not follow.

Page speed:
- It measures speed through PageSpeed Insights, CrUX and Lighthouse, but it doesn't make the site faster.
- The same data comes free from PageSpeed Insights, Search Console and Lighthouse directly.

Conclusion:
- Installing it now adds risk and clutter for little gain.
- The best time to look again is after the site is deployed and has a few weeks of Search Console data. Even then, the free Google tools plus our own checks cover most needs.

## If you install it anyway: safe setup

1. **Pick a reviewed release.** Install from the tag after reading `install.sh`. Don't use `curl … | bash` from main or the plugin marketplace with auto-update.
2. **Remove the promo footer.** Delete the Skool footer section in `~/.claude/skills/seo/SKILL.md` before producing anything for clients.
3. **Skip `/seo flow sync`,** or only use it with `--ref <commit>` after reading the files.
4. **Skip the risky extensions:** image generation (banana), Profound, SE Ranking and Bing. Add DataForSEO only together with the seo-cockpit spend guard, and keep it in threshold mode.
5. **Limit Google access.** Use a Google API key for PageSpeed and CrUX only. Don't run the OAuth sign-in (full write plus Indexing). Never make a service account an Owner. Never run `index` or `index-batch`.
6. **Keep permission prompts on.** Don't run audits in auto or bypass permission mode.
7. **Use a scratch folder.** Run cluster and image commands only in a copy, never in the site repo (they can overwrite `sitemap.xml`, images and posts).
8. **Verify the numbers.** Treat every score, domain authority, volume and statistic as unverified until checked.
9. **Expect setup hiccups.** On this Mac, Python is 3.14 (some Google packages may lack builds for it), and PDF reports need Pango from Homebrew.
10. **Clean up fully if you remove it.** Delete `~/.config/claude-seo`, `~/.cache/claude-seo`, `~/.banana`, any MCP entries in `~/.claude.json`, and any keys added to `settings.json`.

## How this review was done

- **Copy:** the repository was cloned with git hooks disabled into an isolated scratch folder. No file from it was executed, imported or installed, and no URL from it was visited.
- **Line-by-line review:** eight reviews read every line and reported coverage file by file:
  - installer, hooks, CI and docs (43 files)
  - Google and page-fetching scripts (15)
  - third-party API scripts (18)
  - analysis and agent-readiness scripts (24)
  - main skills (110)
  - remaining skills (59)
  - extensions, seo-cockpit and agents (115)
  - tests and docs (79)
- **Repository-wide scans:** every external host referenced; risky code patterns (eval, exec, shell strings, pickle, os.system; none outside tests); encoded payloads (none); telemetry (none); edits to Claude settings.
- **GitHub checks:** releases, open issues, issue-author diversity, and the status of past security reports.
- **Hand checks:** the promo footer, flow sync behaviour, the hook, installer pinning, Chromium launch flags, OAuth scopes, agent permissions, indexing without confirmation, and the pagination advice.
