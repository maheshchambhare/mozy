# MOZY Brand Design Language & System Guidelines

This document defines the single source of truth for MOZY's visual brand identity, design tokens, typography, component layout rules, and character lore. Any current or future modifications to the MOZY web experiences must strictly adhere to these rules.

---

## 1. Brand Essence & Voice
- **Name**: MOZY
- **Motto / Tagline**: "Move more. Scroll better." / "Your phone now charges you in steps."
- **Tone**: Playful, punchy, cute, honest, and motivational. We never shame or scold with cold clinical restrictions; we turn screen time into an earned currency powered by physical movement.
- **Enforcement Principle**: Zero willpower required — the phone physically charges you in steps. Effort unlocks freedom.

---

## 2. Character Lore: MOZ
- **Identity**: MOZ is a cute, animated sprout creature who serves as your screen-time companion and debt collector.
- **Visuals** (updated 11 October 2026; the approved drawing is `src/components/story/Moz.tsx`, reference `public/assets/v2/hero-phone.png`):
  - Soft cream onion-dumpling body with a matte clay look, slightly narrower at the crown.
  - A short green stem with two big puffy rounded leaves; no pointed tips, never flat on the head.
  - Big glossy dark eyes, soft pink blush and a small open smile.
  - Small hands that peek out from the body sides, stub feet, no backpack.
  - Expressions:
    - *Stern / Crossed Arms*: When balance is 00:00 ("Payment declined. Go walk.").
    - *Holding Placard*: Proudly raising "EFFORT UNLOCKS FREEDOM".
    - *Adventurous / Walking*: Exploring lush outdoor biomes ("Small steps. Big you.").
    - *Cheering*: Celebrating when steps unlock app minutes.

---

## 3. Color Palette & Design Tokens

### Primary & Accent Colors
- **Sprout Green (`--color-sprout-green`)**: `#22C55E` (RGB: 34, 197, 94)
  - Used for: Primary actions, "charges you" headline accent, earned time, checkmarks, active states.
- **Sprout Green Hover (`--color-sprout-hover`)**: `#16A34A`
- **Sprout Mint Pastel (`--color-sprout-mint`)**: `#E8F7ED`
  - Used for: "HOW MOZY WORKS" card background, light success badges.
- **Coral Red Pain Accent (`--color-coral-red`)**: `#EF4444` / `#F87171`
  - Used for: "5 minutes..." problem headline, blocker cross marks, 2:17 AM alerts.

### Surface & Background Colors
- **Page Background (`--color-bg-page`)**: `#0A0C0F` / `#0D0F14`
- **Dark Bento Card (`--color-card-dark`)**: `#11141B` (Border: `1px solid rgba(255, 255, 255, 0.08)`)
- **Dark Inner Tile (`--color-tile-dark`)**: `#171B24` (Border: `1px solid rgba(255, 255, 255, 0.06)`)
- **Light Bento Card (`--color-card-light`)**: `#F5F5F0` / `#F8F8F6` (Border: `1px solid rgba(0, 0, 0, 0.04)`)
- **Light Inner Tile (`--color-tile-light`)**: `#FFFFFF`
- **Privacy Green Card (`--color-card-privacy`)**: `#0C2518` (Border: `1px solid rgba(34, 197, 94, 0.25)`)
- **Sunset Gradient (`--gradient-sunset`)**: `linear-gradient(180deg, #FDE6D2 0%, #F5B895 50%, #E07A5F 100%)`

### Typography Colors
- **Text On Dark Primary**: `#FFFFFF`
- **Text On Dark Secondary / Muted**: `#9CA3AF`
- **Text On Dark Tertiary**: `#6B7280`
- **Text On Light Primary**: `#111827`
- **Text On Light Secondary**: `#4B5563`
- **Text On Light Muted**: `#6B7280`

---

## 4. Typography Scale & Fonts

| Purpose | Font Family | Weights | Tracking / Line Height |
| :--- | :--- | :--- | :--- |
| **Logo / Wordmark** | `Baloo 2`, cursive, sans-serif | ExtraBold, 800 | `-0.01em` / `1.0` |
| **Headlines (Hero, H1, H2)** | `Fredoka`, cursive, sans-serif | Bold, 700 | `-0.02em` / `1.08` - `1.15` |
| **Buttons & Action Pills** | `Fredoka`, cursive, sans-serif | SemiBold, 600 | `0.02em` / `1.1` - `1.2` |
| **Body / Paragraphs & Subtitles** | `Nunito`, `Nunito Sans`, sans-serif | Regular 400, Medium 500 | `normal` / `1.5` - `1.6` |
| **Handwritten / Scribbles** | `Caveat`, cursive | SemiBold 600, Bold 700 | `normal` / `1.2` (slight rotation `-4deg` to `-12deg`) |
| **Eyebrows / Badges** | `Fredoka`, cursive, sans-serif | SemiBold 600 | `0.08em` uppercase |

---

## 5. Geometry & Layout Architecture

> **Update, October 10, 2026:** the bento grid and card hierarchy below are retired. The landing page is now a night-to-day scroll story (see `docs/SCROLL_STORY_REDESIGN.md`) that keeps this document's fonts, sprout green, coral, radii and MOZ lore, including the stern "Payment declined. Go walk." moment.

- **Card Corner Radius**:
  - Outer Bento Cards: `28px` (`border-radius: 28px;`)
  - Inner Feature Tiles: `16px` (`border-radius: 16px;`)
  - Buttons, Pills & Badges: `9999px` (`border-radius: 9999px;`)
- **Bento Desktop Grid**:
  - Two-column asymmetry: Left column ~`1.45fr` (~59%), Right column `1fr` (~41%).
  - Grid Gap: `20px` to `24px`.
  - Max Container Width: `1280px` centered.
- **Card Hierarchy**:
  - **Left Column**:
    1. `HeroCard` (Dark)
    2. `TheProblemCard` (Light)
    3. `HowItWorksCard` (Mint Sprout)
    4. `CurrencyCard` (Dark with annotated phone UI)
    5. `AppUnlockCard` (Light with locked vs unlocked dual phones)
    6. `PrivacyBanner` (Deep emerald green with shield)
  - **Right Column**:
    1. `TransformationCard` (Light with 3-step character progression)
    2. `BenefitsCard` (Dark 2x2 grid: Energy, Sleep, Focus, Progress)
    3. `MozCompanionCard` (Scenic outdoor card with worlds preview)
    4. `WhyItWorksCard` (Dark comparison: Traditional blockers vs MOZY)
    5. `TestimonialsCard` (Light 3-column user quotes)
    6. `FaqCard` (Light interactive accordion with + / - toggles)
  - **Full-Width Bottom**:
    1. `BottomCtaBanner` (Sunset skyline with guy & MOZ)
    2. `DesktopFooter` (Dark sleek footer)

---

## 6. Micro-Interactions & Motion
- Hover effects on cards: subtle `-3px` translateY with refined soft drop shadow.
- Pill buttons: scale `1.03` on hover with transition `transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)`.
- Handwritten notes: slight playful tilt (`rotate(-8deg)` or `rotate(6deg)`).
- FAQ accordion: smooth height transition with `+` rotating `45deg` into `×`.
