import { useEffect } from 'react';
import { Link } from 'wouter';
import { storeLink } from '../data/landing';
import { track } from '../lib/analytics';
import { usePlatform } from '../hooks/usePlatform';
import '../story.css';
import { StoreBadges } from '../components/story/StoreBadges';

const storeNames = { ios: 'the App Store', android: 'Google Play' };

/** Target of the landing-page QR code and other share links: phones are sent straight to their store. */
export default function GetPage() {
  const platform = usePlatform();
  useEffect(() => {
    if (platform === 'other') return;
    const source = new URLSearchParams(window.location.search).get('src')?.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
    track('store_click', { store: platform, placement: source ? `get-${source.toLowerCase()}` : 'get', path: window.location.pathname, redirect: true }, true);
    window.location.replace(storeLink(platform, source ? `GET-${source}` : 'GET'));
  }, [platform]);
  return (
    <main className="st-page st-get" id="main">
      <div className="st-wrap st-get-inner">
        <img src="/assets/story/app-icon-96.webp" width="96" height="96" alt="" />
        <h1>Get Mozy on your phone</h1>
        <p className="st-lede" role="status">{platform === 'other' ? 'Pick your store below.' : `Opening ${storeNames[platform]}… If nothing happens, tap your store below.`}</p>
        <StoreBadges placement="GET" />
        <p className="st-fine">On a computer? Scan the QR code on the <a href="/#get">Mozy home page</a> with your phone’s camera, or <Link href="/pricing">check the prices</Link> first.</p>
      </div>
    </main>
  );
}
