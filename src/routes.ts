/** Lazy page loaders, shared by the router (App) and the link prefetcher (PageTransitions). */
export const pageLoaders = {
  blog: () => import('./pages/BlogIndex'),
  post: () => import('./pages/BlogPost'),
  privacy: () => import('./pages/PrivacyPage'),
  pricing: () => import('./pages/PricingPage'),
  get: () => import('./pages/GetPage'),
  leaderboard: () => import('./pages/LeaderboardPage'),
};

/** Starts downloading a page's code as soon as a visitor shows intent (hover, focus, tap), so transitions don't wait. */
export function prefetchRoute(pathname: string) {
  const load = pathname === '/pricing' ? pageLoaders.pricing
    : pathname === '/privacy' ? pageLoaders.privacy
    : pathname === '/blog' ? pageLoaders.blog
    : pathname.startsWith('/blog/') ? pageLoaders.post
    : pathname === '/get' ? pageLoaders.get
    : pathname === '/leaderboard' || pathname.startsWith('/leaderboard/') ? pageLoaders.leaderboard
    : null;
  load?.().catch(() => { /* the router retries on navigation */ });
}
