import { placementName, storeLink } from '../../data/landing';
import type { Store } from '../../data/landing';
import { usePlatform } from '../../hooks/usePlatform';

const badges = {
  ios: { src: '/assets/app-store-badge.svg', alt: 'Download on the App Store', label: 'Download Mozy on the App Store' },
  android: { src: '/assets/google-play-badge.svg', alt: 'Get it on Google Play', label: 'Get Mozy on Google Play' },
};

/** Official store badges with tracked links; the visitor's own store comes first. */
export function StoreBadges({ placement, className = '' }: { placement: string; className?: string }) {
  const platform = usePlatform();
  const order: Store[] = platform === 'android' ? ['android', 'ios'] : ['ios', 'android'];
  return (
    <div className={`st-badges ${className}`}>
      {order.map(store => (
        <a key={store} className="st-badge" href={storeLink(store, placement)} aria-label={badges[store].label} data-store={store} data-placement={placementName(placement)}>
          <img src={badges[store].src} alt={badges[store].alt} width="176" height="52" />
        </a>
      ))}
    </div>
  );
}
