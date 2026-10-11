import { campaignToken, getAttribution } from '../lib/attribution';
import { PRODUCT_FACTS } from './productFacts';
import { COMPANY, FOUNDER, founderSchema, organizationSchema } from './company';

export type Store = 'ios' | 'android';

export const stores = {
  apple: PRODUCT_FACTS.platforms.ios.storeUrl,
  google: PRODUCT_FACTS.platforms.android.storeUrl,
};

// App Store Connect > Analytics > Campaigns > "Generate a campaign link" shows this number as pt=. Apple only attributes
// campaign downloads when it is present; until it is set, iPhone installs are not split by source.
const APP_STORE_PROVIDER_TOKEN = import.meta.env.VITE_APP_STORE_PROVIDER_TOKEN ?? '';

/** Short, stable names for the buttons that open a store: LANDING-HERO -> hero, PRICING-PAGE-BOTTOM -> pricing-bottom. */
export function placementName(placement: string) {
  return placement.toLowerCase().replace(/^landing-/, '').replace(/^pricing-page/, 'pricing').replace(/[^a-z0-9-]/g, '');
}

/**
 * Tracked store links. They carry where this visit came from (the visitor's UTM source and MCX post ID, or the
 * referring site) plus the button, so App Store Connect and Play Console can report installs per channel and post.
 * iOS: ct = "<source>-<post>-<button>" (30 characters at most). Android: the Play referrer keeps the UTM tags.
 */
export function storeLink(store: Store, placement: string) {
  const button = placementName(placement);
  const attribution = getAttribution();
  if (store === 'ios') {
    const pt = APP_STORE_PROVIDER_TOKEN ? `pt=${encodeURIComponent(APP_STORE_PROVIDER_TOKEN)}&` : '';
    return `https://apps.apple.com/app/apple-store/id6792097497?${pt}ct=${encodeURIComponent(campaignToken(button))}&mt=8`;
  }
  const referrer = new URLSearchParams({
    utm_source: attribution?.source && attribution.source !== 'direct' ? attribution.source : 'website',
    utm_medium: attribution?.medium && attribution.medium !== 'none' ? attribution.medium : 'referral',
    utm_campaign: attribution?.campaign || 'mcx',
    utm_content: attribution?.content || button,
    utm_term: button,
  });
  return `https://play.google.com/store/apps/details?id=com.moxstudio.mozy&referrer=${encodeURIComponent(referrer.toString())}`;
}

export const socialLinks = [
  ['Instagram', 'https://www.instagram.com/mcrudrax/'],
  ['YouTube', 'https://www.youtube.com/@mcrudrax'],
  ['Threads', 'https://www.threads.com/@mcrudrax'],
  ['X', 'https://x.com/resilientmahesh'],
] as const;

export const faqs = [
  ['How do steps become screen time?', 'Mozy counts your steps on your phone. Every 34 steps earns one minute for the apps you’ve locked. When your minutes run out, those apps lock again until you walk some more.'],
  ['Which apps can I lock?', 'Instagram, TikTok, YouTube, games, or any other app you pick from your phone’s app list.'],
  ['How is that different from a screen-time limit?', 'A timer asks for willpower at your weakest moment, and it’s easy to dismiss when you’re tired. Mozy asks for a short walk instead: you earn the minutes first, then spend them.'],
  ['Does Mozy track my location?', 'No. Mozy counts steps with your phone’s own sensors, without GPS, and you don’t need an account.'],
  ['Is Mozy free?', 'The download is free on both stores. On iPhone, the features need Mozy Premium: $4.99 a month or $29.99 a year in the US. On Android, Mozy is a free download with in-app purchases.'],
  ['Which phones does it work on?', 'iPhone with iOS 16.4 or later, and Android phones with Android 8.0 or later.'],
  ['Who makes Mozy?', `${FOUNDER.name}, an indie developer and the founder of ${COMPANY.name}. Questions and feature ideas go straight to him at ${COMPANY.email}.`],
] as const;

const appNode = {
  '@type': 'MobileApplication',
  '@id': 'https://mozy.mcrudra.com/#app',
  name: 'Mozy',
  alternateName: 'MOZY',
  operatingSystem: 'iOS 16.4+, Android 8.0+',
  applicationCategory: 'HealthApplication',
  description: 'An app blocker and step counter: walking earns screen-time minutes for the apps you pick, and those apps lock when the minutes run out.',
  url: 'https://mozy.mcrudra.com/',
  image: 'https://mozy.mcrudra.com/assets/icon.png',
  author: { '@id': FOUNDER.id },
  creator: { '@id': FOUNDER.id },
  publisher: { '@id': COMPANY.id },
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free download on the App Store and Google Play' },
    {
      '@type': 'Offer', price: '4.99', priceCurrency: 'USD', name: 'Mozy Premium, monthly (iPhone)',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '4.99', priceCurrency: 'USD', unitCode: 'MON' },
    },
    {
      '@type': 'Offer', price: '29.99', priceCurrency: 'USD', name: 'Mozy Premium, yearly (iPhone)',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '29.99', priceCurrency: 'USD', unitCode: 'ANN' },
    },
  ],
  downloadUrl: [PRODUCT_FACTS.platforms.ios.storeUrl, PRODUCT_FACTS.platforms.android.storeUrl],
};

const websiteNode = {
  '@type': 'WebSite',
  '@id': 'https://mozy.mcrudra.com/#website',
  name: 'Mozy',
  url: 'https://mozy.mcrudra.com/',
  inLanguage: 'en-US',
  publisher: { '@id': COMPANY.id },
  about: { '@id': 'https://mozy.mcrudra.com/#app' },
};

/** The app, its website, the company and its founder as one linked graph (pages without the FAQ use this). */
export const applicationSchema = {
  '@context': 'https://schema.org',
  '@graph': [appNode, websiteNode, organizationSchema, founderSchema],
};

/** The landing page adds its visible FAQ, so answer engines can quote it, including who makes Mozy. */
export const landingSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    ...applicationSchema['@graph'],
    {
      '@type': 'FAQPage',
      '@id': 'https://mozy.mcrudra.com/#faq',
      mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
  ],
};
