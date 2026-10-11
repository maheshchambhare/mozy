import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import PageMetadata from "./components/PageMetadata";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import { PageTransitions } from "./components/transitions/PageTransitions";
import { MozLoader } from "./components/transitions/MozLoader";
import { isNavigating, jumpTo, waitFor } from "./lib/navigation";
import { pageLoaders } from "./routes";

const BlogIndex = lazy(pageLoaders.blog);
const BlogPost = lazy(pageLoaders.post);
const PrivacyPage = lazy(pageLoaders.privacy);
const PricingPage = lazy(pageLoaders.pricing);
const GetPage = lazy(pageLoaders.get);

export default function App() {
  const [location] = useLocation();

  // Set the scroll position for route changes the page transition didn't handle (first load, back and forward):
  // the top of the page, or the #section in the address. (Scrolling to the top unconditionally used to throw away
  // links like /#faq.)
  useEffect(() => {
    if (isNavigating()) return;
    const hash = window.location.hash;
    if (!hash) { window.scrollTo({ top: 0, behavior: "instant" }); return; }
    let cancelled = false;
    void waitFor(() => cancelled || !!document.getElementById(decodeURIComponent(hash.slice(1))), 4000).then(() => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        jumpTo(hash);
        const settled = window.scrollY;
        // Fonts and images can still move the section a little; follow it once unless the visitor has scrolled.
        setTimeout(() => { if (!cancelled && Math.abs(window.scrollY - settled) < 4) jumpTo(hash); }, 700);
      }, 120);
    });
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div className={location === "/" ? "mozy-app-container" : "lp"}>
      <PageMetadata />
      {location !== "/" && <SiteHeader />}
      <Suspense
        fallback={<div className="st-route-loading"><MozLoader className="is-day" /></div>}
      >
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/blog" component={BlogIndex} />
          <Route path="/blog/:slug"><BlogPost /></Route>
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/get" component={GetPage} />
          <Route><NotFoundPage /></Route>
        </Switch>
      </Suspense>
      {location !== "/" && <SiteFooter />}
      <PageTransitions />
    </div>
  );
}
