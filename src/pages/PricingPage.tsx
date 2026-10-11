import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'wouter';
import { COMPANY, FOUNDER } from '../data/company';
import { applicationSchema, placementName, storeLink } from '../data/landing';
import { PRODUCT_FACTS } from '../data/productFacts';
import { FinalCta } from '../components/story/FinalCta';
import { Moz } from '../components/story/Moz';
import {
  ArrowRight, Ban, Card, Chart, Clock, Footprints, Heart, Lock, Mail, Plus, Shield, Smartphone, UserOff, XMark,
} from '../components/story/icons';
import '../landing.css';
import '../story.css';
import '../story-qa.css';
import '../story-pricing.css';

type Icon = (props: { size?: number }) => ReactNode;

const usd = (value: number) => `$${value.toFixed(2)}`;
const { ios, android } = PRODUCT_FACTS.platforms;
const { monthlyUsd, yearlyUsd } = ios.pricing as { monthlyUsd: number; yearlyUsd: number };
const [lowestUsd, highestUsd] = android.pricing.inAppPurchaseRangeUsd ?? [4.99, 34.99];
const stepsPerMinute = PRODUCT_FACTS.stepExchangeRatio.stepsPerMinute;

const features: [Icon, string, string, string][] = [
  [Lock, 'is-sky', 'Lock the apps you pick', 'Instagram, TikTok, YouTube, games or anything else.'],
  [Footprints as Icon, 'is-sun', 'Walk to earn minutes', `On iPhone, ${stepsPerMinute} steps buy one minute of screen time.`],
  [Clock, 'is-rose', 'Locks again at zero', 'Locked apps reopen while you have minutes, and lock again when they run out.'],
  [Heart, 'is-leaf', 'A companion that levels up', 'And worlds that unlock as you keep your streak.'],
  [Chart, 'is-sky', 'Analytics and widgets', 'Your steps and minutes at a glance, plus home-screen widgets.'],
  [UserOff, 'is-leaf', 'No account. No GPS.', 'Nothing to sign up for. Steps come from your phone’s own sensors.'],
];

const permissionIcons: Record<string, Icon> = {
  'Screen Time': Lock,
  'Motion & Fitness': Footprints as Icon,
  'Accessibility Service': Shield,
  'Display Over Other Apps': Smartphone,
  'Physical Activity': Footprints as Icon,
};

const faqs: [string, string][] = [
  ['How much does Mozy cost?', `Mozy is a free download on both stores. On iPhone, the features need Mozy Premium: ${usd(monthlyUsd)} a month or ${usd(yearlyUsd)} a year in the US. On Android, Mozy is a free download with in-app purchases from ${usd(lowestUsd)} to ${usd(highestUsd)} per item. Prices in other countries may differ.`],
  ['How do I cancel a subscription?', 'On iPhone, open Settings, tap your name, then Subscriptions, and choose Mozy. On Android, open Google Play, tap your profile, then Payments & subscriptions, then Subscriptions. You keep access until the end of the period you’ve already paid for.'],
  ['Why does Mozy charge for the app?', 'Mozy is made by one indie developer. Charging for it keeps the app independent: there’s no account to create, no GPS tracking, no ads, and your data is never sold.'],
  ['Why is the price different in my country?', 'The prices on this page are the US prices. The App Store and Google Play show the price for your country, so yours may differ.'],
  ['Which phones does Mozy work on?', `iPhone with ${ios.minOs}, and Android phones with ${android.minOs}.`],
];

/** The hero's "receipt": what Mozy costs in dollars, and what your apps cost in steps. */
function Receipt() {
  const minutes = 30;
  return (
    <div className="st-pr-receipt">
      <div className="st-pr-receipt-head">
        <img src="/assets/story/app-icon-96.webp" width="44" height="44" alt="" />
        <div><p className="st-pr-receipt-brand">Mozy</p><p className="st-pr-receipt-meta">US prices</p></div>
        <span className="st-pr-receipt-stamp">Receipt</span>
      </div>
      <dl className="st-pr-receipt-rows">
        <div><dt>Download<small>iPhone and Android</small></dt><dd>$0.00</dd></div>
        <div><dt>Mozy Premium<small>iPhone, monthly</small></dt><dd>{usd(monthlyUsd)}</dd></div>
        <div><dt>Mozy Premium<small>iPhone, yearly</small></dt><dd>{usd(yearlyUsd)}</dd></div>
        <div><dt>In-app purchases<small>Android, per item</small></dt><dd>{usd(lowestUsd)}–{highestUsd.toFixed(2)}</dd></div>
      </dl>
      <p className="st-pr-receipt-cut"><span>Your other currency</span></p>
      <div className="st-pr-receipt-steps">
        <Footprints size={24} color="#FF9A4D" />
        <p><strong>{stepsPerMinute} steps</strong> = 1 minute<small>On iPhone</small></p>
      </div>
      <div className="st-pr-receipt-total"><span>{minutes} min of Instagram</span><strong>{(minutes * stepsPerMinute).toLocaleString('en-US')} steps</strong></div>
    </div>
  );
}

function StoreButton({ store, placement }: { store: 'ios' | 'android'; placement: string }) {
  const badge = store === 'ios'
    ? { src: '/assets/app-store-badge.svg', alt: 'Download on the App Store', label: 'Download Mozy on the App Store' }
    : { src: '/assets/google-play-badge.svg', alt: 'Get it on Google Play', label: 'Get Mozy on Google Play' };
  return (
    <a className="st-pr-plan-cta" href={storeLink(store, placement)} aria-label={badge.label} data-store={store} data-placement={placementName(placement)}>
      <img src={badge.src} alt={badge.alt} width="176" height="52" />
    </a>
  );
}

function Question({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="st-qa-item" name="pricing-faq">
      <summary><span>{question}</span><span className="st-qa-toggle" aria-hidden="true"><Plus size={18} /></span></summary>
      <p>{answer}</p>
    </details>
  );
}

export default function PricingPage() {
  const columns = [faqs.slice(0, 3), faqs.slice(3)];
  return (
    <div className="st-page st-pr">
      <script type="application/ld+json">{JSON.stringify(applicationSchema)}</script>
      <main id="main">
        <section className="st-pr-hero" aria-labelledby="pricing-title">
          <div className="st-pr-sky" aria-hidden="true" />
          <div className="st-wrap st-pr-hero-grid">
            <div className="st-pr-hero-copy">
              <p className="st-clock"><Card size={16} /><span>Pricing</span><span className="st-pr-clock-long" aria-hidden="true">·</span><span className="st-pr-clock-long">US prices checked {PRODUCT_FACTS.pricesCheckedOn}</span></p>
              <h1 id="pricing-title">Know the price before you <span className="st-pr-accent">tap install.<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span></h1>
              <p className="st-pr-lede">Mozy is a free download on both stores. On iPhone, the features need a Mozy Premium subscription. On Android, Mozy has in-app purchases.</p>
              <div className="st-pr-hero-actions">
                <a href="#plans" className="st-pr-button">See the plans <ArrowRight size={16} /></a>
                <a href="/#how" className="st-pr-ghost">How Mozy works</a>
              </div>
            </div>
            <div className="st-pr-art" aria-hidden="true">
              <div className="st-pr-glow" />
              <svg className="st-pr-moon" viewBox="0 0 220 220">
                <defs>
                  <radialGradient id="pr-moon-glow"><stop offset="0" stopColor="#fff1c9" stopOpacity="0.42" /><stop offset="1" stopColor="#fff1c9" stopOpacity="0" /></radialGradient>
                  <mask id="pr-crescent"><rect width="220" height="220" fill="#fff" /><circle cx="136" cy="98" r="34" fill="#000" /></mask>
                </defs>
                <circle cx="110" cy="110" r="108" fill="url(#pr-moon-glow)" />
                <circle cx="110" cy="110" r="38" fill="#fff4d6" mask="url(#pr-crescent)" />
              </svg>
              <Receipt />
              <div className="st-pr-moz"><Moz mood="wink" rim className="st-pr-mozart" /></div>
              <span className="st-pr-float is-a" style={{ '--float': '5.6s' } as CSSProperties}><UserOff size={16} />No account</span>
              <span className="st-pr-float is-b" style={{ '--float': '6.4s' } as CSSProperties}><Ban size={16} />No ads</span>
              <span className="st-pr-float is-c" style={{ '--float': '4.9s' } as CSSProperties}><XMark size={16} />Cancel in Settings</span>
            </div>
          </div>
          <svg className="st-pr-bank" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
            <path className="is-back" d="M0 120V58C34 44 74 42 104 54C134 36 182 34 214 50C246 30 300 30 332 48C366 28 422 28 456 48C490 28 548 30 580 50C614 30 670 30 704 50C738 30 794 30 828 50C862 30 918 30 952 48C986 30 1042 30 1076 48C1110 32 1164 32 1196 50C1228 34 1278 36 1308 52C1338 40 1384 40 1416 52C1426 50 1434 48 1440 48V120Z" />
            <path className="is-front" d="M0 120V84C30 74 66 72 94 82C124 66 170 64 200 78C232 62 282 62 314 78C346 62 398 62 430 78C462 62 514 62 546 78C578 62 630 62 662 78C694 62 746 62 778 78C810 62 862 62 894 78C926 62 978 62 1010 78C1042 62 1094 62 1126 78C1158 64 1206 64 1236 80C1266 68 1312 68 1340 80C1370 70 1410 70 1440 78V120Z" />
          </svg>
        </section>

        <section className="st-pr-plans st-wrap" id="plans" aria-labelledby="plans-title">
          <h2 id="plans-title" className="st-pr-sr">Plans and prices</h2>
          <div className="st-pr-plan-grid">
            <article className="st-pr-plan is-ios">
              <header className="st-pr-plan-head">
                <span className="st-pr-plan-icon"><Smartphone size={20} /></span>
                <div><h3 className="st-pr-plan-platform">iPhone</h3><p className="st-pr-plan-os">{ios.minOs}</p></div>
                <span className="st-pr-plan-tag">Free download</span>
              </header>
              <p className="st-pr-plan-lede">Mozy Premium unlocks the features:</p>
              <div className="st-pr-prices">
                <div className="st-pr-price"><span>Monthly</span><strong>{usd(monthlyUsd)}</strong><small>a month</small></div>
                <div className="st-pr-price is-yearly"><span>Yearly</span><strong>{usd(yearlyUsd)}</strong><small>a year, about {usd(yearlyUsd / 12)} a month</small></div>
              </div>
              <p className="st-pr-plan-note">An active subscription is required for the features. Cancel anytime in your iPhone’s Settings.</p>
              <StoreButton store="ios" placement="PRICING-PAGE" />
            </article>
            <article className="st-pr-plan is-android">
              <header className="st-pr-plan-head">
                <span className="st-pr-plan-icon"><Smartphone size={20} /></span>
                <div><h3 className="st-pr-plan-platform">Android</h3><p className="st-pr-plan-os">{android.minOs}</p></div>
                <span className="st-pr-plan-tag">Free download</span>
              </header>
              <p className="st-pr-plan-lede">Free to download, with in-app purchases:</p>
              <div className="st-pr-prices is-single">
                <div className="st-pr-price"><span>In-app purchases</span><strong>{usd(lowestUsd)}–{usd(highestUsd)}</strong><small>per item</small></div>
              </div>
              <p className="st-pr-plan-note">Prices as Google Play lists them for the US.</p>
              <StoreButton store="android" placement="PRICING-PAGE" />
            </article>
          </div>
          <p className="st-pr-note">US prices from the App Store and Google Play, checked {PRODUCT_FACTS.pricesCheckedOn}. Prices in other countries may differ.</p>
        </section>

        <section className="st-pr-features st-wrap" aria-labelledby="features-title">
          <div className="st-pr-features-head">
            <div>
              <p className="st-eyebrow">What Mozy does</p>
              <h2 id="features-title" className="st-pr-h2">Walk first. <span>Scroll later.</span></h2>
              <p className="st-pr-sub">Your apps cost steps instead of willpower. Here’s what you get on your phone.</p>
            </div>
            <div className="st-pr-walker is-walking" aria-hidden="true"><Moz mood="walk" className="st-pr-walker-moz" /><span className="st-pr-walker-trail" /></div>
          </div>
          <ul className="st-pr-feature-grid">
            {features.map(([FeatureIcon, tone, title, body]) => (
              <li className={`st-pr-feature ${tone}`} key={title}>
                <span className="st-pr-feature-icon"><FeatureIcon size={22} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="st-pr-perms st-wrap" aria-labelledby="perms-title">
          <p className="st-eyebrow">Built for each phone</p>
          <h2 id="perms-title" className="st-pr-h2">What Mozy asks your phone for.</h2>
          <p className="st-pr-sub">Only what it needs to count steps and lock apps, and each one works on your phone. <Link href="/privacy" className="st-pr-inline-link">Read the privacy policy</Link></p>
          <div className="st-pr-perm-grid">
            {[ios, android].map(platform => (
              <article className="st-pr-perm-card" key={platform.name}>
                <header>
                  <span className="st-pr-perm-icon"><Smartphone size={20} /></span>
                  <div><h3>{platform.name}</h3><p>Requires {platform.minOs}.</p></div>
                </header>
                <ul>
                  {platform.permissions.map(permission => {
                    const PermissionIcon = permissionIcons[permission.name] ?? Shield;
                    return (
                      <li key={permission.name}>
                        <span className="st-pr-perm-row-icon"><PermissionIcon size={18} /></span>
                        <div><strong>{permission.name}</strong><span>{permission.purpose}</span></div>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="st-qa st-pr-faq" aria-labelledby="pricing-faq-title">
          <div className="st-wrap st-qa-inner">
            <header className="st-qa-head">
              <p className="st-qa-chip"><span aria-hidden="true">?</span>Pricing questions</p>
              <h2 id="pricing-faq-title" className="st-qa-title">Quick <span className="st-qa-accent">answers.<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span></h2>
              <p className="st-qa-lede">Prices, cancelling, and which phones Mozy runs on.</p>
            </header>
            <div className="st-qa-faq">
              {columns.map((column, index) => (
                <div className="st-qa-col" key={index}>
                  {column.map(([question, answer]) => <Question key={question} question={question} answer={answer} />)}
                  {index === 1 ? (
                    <div className="st-qa-ask">
                      <span className="st-qa-ask-icon"><Mail size={22} /></span>
                      <div className="st-qa-ask-text">
                        <p className="st-qa-ask-title">Still wondering?</p>
                        <p>Questions go straight to {FOUNDER.name.split(' ')[0]}.</p>
                      </div>
                      <a className="st-qa-ask-link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCta
          eyebrow="Ready when you are"
          title="Give your thumbs a rest. Put your shoes on."
          lede="Get Mozy, pick the apps that eat your evenings, and earn them back one walk at a time."
          placement="PRICING-PAGE-BOTTOM"
          showPrice={false}
          link={{ href: '/#how', label: 'See how Mozy works' }}
        />
      </main>
    </div>
  );
}
