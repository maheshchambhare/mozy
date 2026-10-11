import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { COMPANY, FOUNDER } from "../data/company";
import { analyticsOptedOut, optInToAnalytics, optOutOfAnalytics } from "../lib/analytics";
import { Moz } from "../components/story/Moz";
import { PhoneFrame } from "../components/story/Phone";
import {
  ArrowRight, Ban, Card, Chart, Check, Clock, Footprints, Globe, Heart, Info, Lock, Mail, MapPinOff, Shield, Smartphone, Toggle, User, UserOff, XMark,
} from "../components/story/icons";
import "../landing.css";
import "../story.css";
import "../story-privacy.css";

/*
 * Every statement here was checked against the Mozy app source (react-native/stepscroll, 11 Oct 2026):
 * Firebase Analytics events carry no name, step counts or blocked apps; the onboarding name is stored only in
 * MMKV on the device; Android's AccessibilityService reads only the foreground package name; iOS asks only for
 * Motion & Fitness and Screen Time; RevenueCat runs in observer mode with an anonymous ID. Re-check before
 * adding SDKs or events, and keep the App Store privacy label and Play Data safety form in step with this page.
 */

type Icon = (props: { size?: number }) => ReactNode;
const out = { target: "_blank", rel: "noopener noreferrer" } as const;

const promises: [Icon, string, string, string][] = [
  [UserOff, "is-sky", "No account, ever.", "Mozy never asks for your email, phone number, contacts, photos or location."],
  [Smartphone, "is-leaf", "Your steps stay on your phone.", "Your step counts, the apps you lock, your screen-time history and your name never leave it."],
  [Chart, "is-sun", "Analytics only make Mozy better.", "The app and this website record anonymous usage, like which screens open and which features get used. It isn't linked to who you are."],
  [Ban, "is-rose", "No selling. No ads.", "We don't sell your data, we don't show ads, and we don't use your data for advertising."],
];

const staysOnPhone = [
  "Your step counts and the minutes you earn",
  "The apps you lock, your limits and your reset time",
  "Your daily stats, history and settings",
  "The first name you type during setup",
];

const sharedAnonymously: [string, string][] = [
  ["Screens opened and features used", "Firebase"],
  ["App version, phone model and approximate country", "Firebase"],
  ["Purchase receipts, to confirm Premium", "App Store, Google Play, RevenueCat"],
  ["Visits to this website", "PostHog"],
];

const neverCollected = ["Your name or email", "Contacts", "GPS location", "Photos, camera or microphone", "Messages or what you type"];

/** A website-analytics on/off switch for this device. */
function AnalyticsSwitch() {
  const [off, setOff] = useState(() => typeof window !== "undefined" && analyticsOptedOut());
  const toggle = () => {
    if (off) optInToAnalytics(); else optOutOfAnalytics();
    setOff(!off);
  };
  return (
    <div className="st-pv-switch">
      <div>
        <p className="st-pv-switch-title">Website analytics on this device</p>
        <p className="st-pv-switch-note" role="status">{off ? "Off. This browser no longer sends visits to PostHog." : "On. Visits are counted anonymously."}</p>
      </div>
      <button type="button" role="switch" aria-checked={!off} aria-label="Website analytics on this device" className="st-pv-toggle" onClick={toggle}>
        <span />
      </button>
    </div>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="st-pv-list">{children}</ul>;
}

const sections: { id: string; num: string; icon: Icon; short: string; title: string; body: ReactNode }[] = [
  {
    id: "who", num: "01", icon: Info, short: "Who we are", title: "Who we are and what this covers",
    body: <>
      <p>Mozy is made by <a href={COMPANY.url} {...out}>{COMPANY.name}</a>, the studio of indie developer {FOUNDER.name}. In this policy, "we" means {COMPANY.name}.</p>
      <p>This policy covers the Mozy app for iPhone and Android and this website, mozy.mcrudra.com. Mozy helps you cut back on mindless scrolling: it locks the apps you choose until you earn screen time by walking.</p>
    </>,
  },
  {
    id: "on-device", num: "02", icon: Smartphone, short: "On your phone", title: "What stays on your phone",
    body: <>
      <p>Mozy does its real work on your phone. It has no accounts and no server of ours that stores your activity. These things are kept only on your device:</p>
      <List>
        <li>Your step counts and the screen-time minutes you earn.</li>
        <li>The apps you choose to lock, your limits and your daily reset time. On iPhone, Apple doesn't even show Mozy the names of the apps you pick.</li>
        <li>Your daily stats, history and settings.</li>
        <li>The first name you type during setup, which Mozy uses to greet you.</li>
      </List>
      <p className="st-pv-callout"><Lock size={16} />None of these are sent to us, to analytics or to anyone else. Deleting the app deletes them.</p>
    </>,
  },
  {
    id: "app-analytics", num: "03", icon: Chart, short: "App analytics", title: "App analytics, used only to make Mozy better",
    body: <>
      <p>The Mozy app uses <a href="https://firebase.google.com/products/analytics" {...out}>Google Analytics for Firebase</a>, a service from Google, to understand how the app is used. We use it for one purpose: to make Mozy better. It shows us where setup gets confusing, which features people use, and when something breaks.</p>
      <p className="st-pv-label">It records</p>
      <List>
        <li>Which screens you open and which features you use. For example, finishing a setup step, allowing or declining a permission, opening your stats, reaching a new level or choosing a world.</li>
        <li>When the app is opened, how long sessions last, and the app version.</li>
        <li>Your phone model, system version, language and approximate country. Google works out the country from a shortened IP address and doesn't give us your IP address.</li>
        <li>Purchase and subscription events, such as which plan was bought and the store's transaction number.</li>
        <li>A random ID that Firebase creates for this app install, so it can count users without knowing who they are. On Android, Firebase also reads your phone's advertising ID. We don't use it for advertising, and you can reset or delete it in your phone's settings.</li>
      </List>
      <p className="st-pv-callout"><Shield size={16} />It never records your name, email, contacts or GPS location, your step counts, the apps you lock, or your screen-time history.</p>
      <p>This data isn't linked to your name or to an account, because Mozy has no accounts. We don't sell it and we don't share it with advertisers. Google provides the service under its <a href="https://firebase.google.com/terms/data-processing-terms" {...out}>Firebase data processing terms</a> and <a href="https://policies.google.com/technologies/partner-sites" {...out}>explains here</a> how it handles data from apps that use it. The data is encrypted in transit, may be stored on Google's servers outside your country, and is deleted automatically after no more than 14 months.</p>
    </>,
  },
  {
    id: "purchases", num: "04", icon: Card, short: "Purchases", title: "Purchases and subscriptions",
    body: <>
      <p>Mozy Premium is sold through the App Store and Google Play. Apple and Google take the payment, and we never see your card or bank details.</p>
      <p>Mozy uses <a href="https://www.revenuecat.com/privacy" {...out}>RevenueCat</a>, a subscription service, to check whether your purchase is active. RevenueCat receives the store's purchase receipt and a random ID, never your name or email.</p>
    </>,
  },
  {
    id: "permissions", num: "05", icon: Shield, short: "Permissions", title: "Permissions Mozy asks for",
    body: <>
      <p>Mozy asks only for the permissions it needs to count steps and lock apps. Each one works on your phone.</p>
      <div className="st-pv-platforms">
        <article className="st-pv-platform">
          <h3><Smartphone size={18} />On iPhone</h3>
          <dl>
            <div><dt>Screen Time (Family Controls)</dt><dd>Lets Mozy lock the apps you pick. Apple gives Mozy coded tokens instead of app names, so we can't see which apps you chose.</dd></div>
            <div><dt>Motion &amp; Fitness</dt><dd>Lets Mozy read your step count from your iPhone's motion sensor.</dd></div>
          </dl>
        </article>
        <article className="st-pv-platform">
          <h3><Smartphone size={18} />On Android</h3>
          <dl>
            <div><dt>Accessibility</dt><dd>Lets Mozy notice when a locked app comes to the front, so it can show the lock screen. Mozy only checks which app is open. It doesn't read what you type, your messages or the text on your screen.</dd></div>
            <div><dt>Display over other apps</dt><dd>Shows the lock screen on top of a locked app when your minutes run out.</dd></div>
            <div><dt>Physical activity</dt><dd>Reads your phone's built-in step counter. Mozy never uses GPS.</dd></div>
            <div><dt>Notifications, battery and start-up</dt><dd>Keep step counting running in the background, restart it after your phone reboots, and send reminders.</dd></div>
          </dl>
        </article>
      </div>
      <p>You can turn any of these off in your phone's settings, but Mozy can't count steps or lock apps without them.</p>
    </>,
  },
  {
    id: "website-analytics", num: "06", icon: Globe, short: "Website analytics", title: "Website analytics",
    body: <>
      <p>This website uses <a href="https://posthog.com" {...out}>PostHog</a>, hosted in the United States, to see how people find and use it, so we can make it clearer. It records:</p>
      <List>
        <li>The pages you view, how far you scroll, the sections you reach, and the buttons and links you tap, such as the App Store or Google Play buttons.</li>
        <li>Where your visit came from: the referring website and the campaign tags in the link you followed, such as utm_source=instagram.</li>
        <li>Your device type, browser, screen size and approximate location (country and city). Your IP address is used to find the location and is then discarded, not stored.</li>
        <li>Anonymous recordings of how the page is used, which help us spot confusing parts. Anything you type is hidden.</li>
      </List>
      <p>PostHog stores a first-party cookie with a random ID so repeat visits can be counted. We don't ask for your name or email on this website, we don't sell this data, and we don't use it for advertising. Analytics data is kept for up to one year, and recordings for 30 days.</p>
      <AnalyticsSwitch />
    </>,
  },
  {
    id: "never", num: "07", icon: Ban, short: "What we never do", title: "What we never do",
    body: <ul className="st-pv-never">
      {["Sell or rent your data.", "Show ads or add advertising networks to the app.", "Ask for your email, phone number or contacts.", "Use GPS, your camera or your microphone.", "Read your messages or what you type."].map(item => <li key={item}><span><XMark size={14} /></span>{item}</li>)}
    </ul>,
  },
  {
    id: "children", num: "08", icon: Heart, short: "Children", title: "Children",
    body: <p>Mozy isn't made for children under 13, and we don't knowingly collect data from them. If you think a child has sent us personal information, email us and we'll delete it.</p>,
  },
  {
    id: "rights", num: "09", icon: Toggle, short: "Your choices", title: "Your choices and rights",
    body: <List>
      <li><strong>Delete the app</strong> to remove everything Mozy stores on your phone and to stop app analytics.</li>
      <li><strong>Reset or delete your advertising ID</strong> on Android in your phone's privacy or Google settings.</li>
      <li><strong>Turn off website analytics</strong> with the switch in section 06.</li>
      <li><strong>Ask us about your data.</strong> Depending on where you live, for example the EU, the UK or India, you can ask to access, correct or delete data about you. Email us. Because our analytics aren't tied to your name, we usually can't pick out one person's records, but we'll tell you what we can do.</li>
    </List>,
  },
  {
    id: "changes", num: "10", icon: Clock, short: "Changes", title: "Changes to this policy",
    body: <p>When we change this policy, we update the date at the top. If a change affects what Mozy collects, we'll explain it on this page.</p>,
  },
];

const toc = [...sections.map(({ id, num, short }) => ({ id, num, short })), { id: "contact", num: "11", short: "Contact" }];

const tocIds = toc.map(item => item.id);

/** Highlights the table-of-contents entry for the section being read: the last one whose top has passed 30% of the screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    // Eleven rect reads per scroll event is cheap, and unlike requestAnimationFrame it also runs in background tabs.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [ids]);
  return active;
}

/** The hero phone: everything Mozy keeps, locked on the device. */
function VaultScreen() {
  const rows: [Icon, string, string][] = [[Footprints as Icon, "Steps today", "4,218"], [Lock, "Apps you lock", "3"], [Clock, "Screen-time history", "Saved"], [User, "Your name", "Saved"]];
  return (
    <div className="st-pv-screen">
      <p className="st-pv-screen-kicker"><Lock size={13} />Stored on this phone</p>
      <div className="st-pv-screen-moz"><span className="st-pv-screen-halo" /><Moz mood="happy" rim className="st-pv-moz" /></div>
      <ul className="st-pv-vault">
        {rows.map(([RowIcon, label, value]) => (
          <li key={label}><span className="st-pv-vault-icon"><RowIcon size={16} /></span><span>{label}</span><b>{value}</b><span className="st-pv-vault-check"><Check size={12} /></span></li>
        ))}
      </ul>
      <p className="st-pv-screen-foot"><Chart size={14} />Only anonymous app usage is shared</p>
    </div>
  );
}

export default function PrivacyPage() {
  const active = useActiveSection(tocIds);
  return (
    <div className="st-page st-pv">
      <main id="main">
        <section className="st-pv-hero" aria-labelledby="privacy-title">
          <div className="st-pv-sky" aria-hidden="true" />
          <div className="st-wrap st-pv-hero-grid">
            <div className="st-pv-hero-copy">
              <p className="st-clock"><Shield size={16} /><span className="st-pv-clock-long">Privacy policy</span><span className="st-pv-clock-long" aria-hidden="true">·</span><span>Updated 11 October 2026</span></p>
              <h1 id="privacy-title"><span className="st-pv-kicker">Mozy privacy policy</span>Your steps stay <span className="st-pv-accent">on your phone.<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span></h1>
              <p className="st-pv-lede">Mozy counts your steps and locks your apps right on your phone, with no account. All that leaves it is anonymous usage data that helps us improve Mozy, and the receipt that confirms your subscription.</p>
              <div className="st-pv-hero-actions">
                <a href="#short" className="st-pv-button">Read the short version <ArrowRight size={16} /></a>
                <a href="#policy" className="st-pv-ghost">Full policy</a>
              </div>
            </div>
            <div className="st-pv-art" aria-hidden="true">
              <div className="st-pv-glow" />
              <svg className="st-pv-moon" viewBox="0 0 220 220">
                <defs>
                  <radialGradient id="pv-moon-glow"><stop offset="0" stopColor="#fff1c9" stopOpacity="0.42" /><stop offset="1" stopColor="#fff1c9" stopOpacity="0" /></radialGradient>
                  <mask id="pv-crescent"><rect width="220" height="220" fill="#fff" /><circle cx="136" cy="98" r="34" fill="#000" /></mask>
                </defs>
                <circle cx="110" cy="110" r="108" fill="url(#pv-moon-glow)" />
                <circle cx="110" cy="110" r="38" fill="#fff4d6" mask="url(#pv-crescent)" />
              </svg>
              <div className="st-pv-phone"><PhoneFrame dark><VaultScreen /></PhoneFrame></div>
              <span className="st-pv-float is-a" style={{ "--float": "5.6s" } as CSSProperties}><UserOff size={16} />No account</span>
              <span className="st-pv-float is-b" style={{ "--float": "6.4s" } as CSSProperties}><MapPinOff size={16} />No GPS</span>
              <span className="st-pv-float is-c" style={{ "--float": "4.9s" } as CSSProperties}><Ban size={16} />No ads</span>
            </div>
          </div>
          <svg className="st-pv-bank" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
            <path className="is-back" d="M0 120V58C34 44 74 42 104 54C134 36 182 34 214 50C246 30 300 30 332 48C366 28 422 28 456 48C490 28 548 30 580 50C614 30 670 30 704 50C738 30 794 30 828 50C862 30 918 30 952 48C986 30 1042 30 1076 48C1110 32 1164 32 1196 50C1228 34 1278 36 1308 52C1338 40 1384 40 1416 52C1426 50 1434 48 1440 48V120Z" />
            <path className="is-front" d="M0 120V84C30 74 66 72 94 82C124 66 170 64 200 78C232 62 282 62 314 78C346 62 398 62 430 78C462 62 514 62 546 78C578 62 630 62 662 78C694 62 746 62 778 78C810 62 862 62 894 78C926 62 978 62 1010 78C1042 62 1094 62 1126 78C1158 64 1206 64 1236 80C1266 68 1312 68 1340 80C1370 70 1410 70 1440 78V120Z" />
          </svg>
        </section>

        <section className="st-pv-promises st-wrap" id="short" aria-labelledby="short-title">
          <h2 id="short-title" className="st-pv-sr">The short version</h2>
          {promises.map(([PromiseIcon, tone, title, text]) => (
            <article key={title} className={`st-pv-promise ${tone}`}>
              <span className="st-pv-promise-icon"><PromiseIcon size={22} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="st-pv-flow st-wrap" aria-labelledby="flow-title">
          <div className="st-pv-head">
            <p className="st-eyebrow">At a glance</p>
            <h2 id="flow-title" className="st-h2">What stays, and what’s shared.</h2>
          </div>
          <div className="st-pv-flow-grid">
            <article className="st-pv-stays">
              <span className="st-pv-flow-badge"><Lock size={14} />Stays on your phone</span>
              <h3>Everything personal.</h3>
              <ul>{staysOnPhone.map(item => <li key={item}><span><Check size={13} /></span>{item}</li>)}</ul>
              <p>Deleting the app deletes all of it.</p>
              <Moz mood="wink" rim still className="st-pv-stays-moz" />
            </article>
            <div className="st-pv-flow-arrow" aria-hidden="true"><span>only anonymous usage</span><ArrowRight size={22} /></div>
            <article className="st-pv-shared">
              <span className="st-pv-flow-badge"><Chart size={14} />Shared anonymously, to improve Mozy</span>
              <h3>Usage, never identity.</h3>
              <ul>{sharedAnonymously.map(([item, where]) => <li key={item}><span className="st-pv-shared-item">{item}</span><span className="st-pv-where"><ArrowRight size={12} />{where}</span></li>)}</ul>
            </article>
          </div>
          <div className="st-pv-never-strip">
            <p>Never collected</p>
            <ul>{neverCollected.map(item => <li key={item}><XMark size={13} />{item}</li>)}</ul>
          </div>
        </section>

        <section className="st-pv-policy" id="policy" aria-labelledby="policy-title">
          <div className="st-wrap">
            <div className="st-pv-head">
              <p className="st-eyebrow">The full policy</p>
              <h2 id="policy-title" className="st-h2">Every detail, in plain words.</h2>
            </div>
            <div className="st-pv-policy-grid">
              <nav className="st-pv-toc" aria-label="Privacy policy sections">
                <p className="st-pv-toc-title">On this page</p>
                <ol>{toc.map(item => <li key={item.id}><a href={`#${item.id}`} className={`st-pv-toc-link${active === item.id ? " is-active" : ""}`} aria-current={active === item.id ? "location" : undefined}><span>{item.num}</span>{item.short}</a></li>)}</ol>
              </nav>
              <div className="st-pv-sections">
                {sections.map(({ id, num, icon: SectionIcon, title, body }) => (
                  <section key={id} id={id} className="st-pv-section" aria-labelledby={`${id}-title`}>
                    <header>
                      <span className="st-pv-section-icon"><SectionIcon size={20} /></span>
                      <div>
                        <p className="st-pv-section-num">Section {num}</p>
                        <h2 id={`${id}-title`}>{title}</h2>
                      </div>
                    </header>
                    <div className="st-pv-section-body">{body}</div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="st-pv-contact st-wrap" id="contact" aria-labelledby="contact-title">
          <div className="st-pv-contact-card">
            <Moz mood="wave" className="st-pv-contact-moz" />
            <div className="st-pv-contact-copy">
              <p className="st-pv-section-num">Section 11 · Contact</p>
              <h2 id="contact-title">Questions about your privacy?</h2>
              <p>Email us with any question about this policy or your data.</p>
              <div className="st-pv-contact-actions">
                <a href={`mailto:${COMPANY.email}`} className="st-pv-button"><Mail size={16} />{COMPANY.email}</a>
                <span className="st-pv-maker"><img src={FOUNDER.photo} alt="" width="40" height="40" loading="lazy" decoding="async" />{FOUNDER.name}, <a href={COMPANY.url} {...out}>{COMPANY.name}</a></span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
