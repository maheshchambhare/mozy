export const siteUrl = 'https://mozy.mcrudra.com';
export const socialImage = `${siteUrl}/assets/og-banner.jpg`;
// `found` is false for unknown addresses (and held stories): those pages get noindex and no canonical URL.
export type PageMeta = { title: string; description: string; ogTitle: string; ogDescription: string; url: string; image: string; type: string; robots: string; found: boolean };
type ArticleSEO = { seo: { titleTag: string; metaDescription: string; ogTitle: string; ogDescription: string } };
export function pageMeta(path: string, article?: ArticleSEO): PageMeta {
  const home = path === '/';
  const blog = path === '/blog';
  const privacy = path === '/privacy';
  const pricing = path === '/pricing';
  const get = path === '/get';
  // Mozy Race preview (dummy data): reachable by link, kept out of search until real boards launch.
  const race = path === '/leaderboard' || path.startsWith('/leaderboard/');
  const title = article?.seo.titleTag ?? (home ? 'MOZY: Walk to Earn Screen Time | App Blocker for Android & iPhone' : pricing ? 'Pricing | MOZY' : blog ? 'The MOZY Journal | Screen Time, Walking & Digital Habits' : privacy ? 'Privacy Policy | MOZY' : get ? 'Get MOZY on your phone' : race ? 'Mozy Race: who owns the world? | MOZY' : 'Page not found | MOZY');
  const description = article?.seo.metaDescription ?? (home ? 'MOZY turns walking into screen time. Block distracting apps, earn minutes with your steps, and build more intentional phone habits on Android and iPhone.' : pricing ? 'MOZY pricing on iPhone and Android: a free download on both stores, Mozy Premium at $4.99 a month or $29.99 a year on iPhone (US), and in-app purchases on Android.' : blog ? 'Explore the MOZY journal: practical perspectives on screen time, walking, sleep, and more intentional digital habits.' : privacy ? 'How Mozy handles your data: no account, your steps and screen time stay on your phone, and anonymous analytics are used only to improve the app and website.' : get ? 'Opens MOZY on the App Store or Google Play, whichever fits your phone.' : race ? 'Every step claims land: the Mozy Race world map, where walkers own their country in proportion to their steps.' : 'This page could not be found. Explore the MOZY journal or return home.');
  const found = home || blog || privacy || pricing || get || race || !!article;
  return {title, description, ogTitle: article?.seo.ogTitle || title, ogDescription: article?.seo.ogDescription || description, url: `${siteUrl}${path}`, image: socialImage, type: article ? 'article' : 'website', robots: home || blog || privacy || pricing || article ? 'index, follow' : 'noindex, follow', found};
}
