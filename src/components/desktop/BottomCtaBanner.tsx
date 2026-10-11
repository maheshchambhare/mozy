
interface BottomCtaBannerProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export default function BottomCtaBanner({
  appStoreUrl = "https://apps.apple.com/app/mozy-walk-to-earn-screen-time/id6792097497",
  playStoreUrl = "https://play.google.com/store/apps/details?id=com.moxstudio.mozy",
}: BottomCtaBannerProps) {
  return (
    <section className="mozy-bottom-cta-wrap" id="download">
      <div className="bottom-cta-card">
        {/* Sunset Skyline Background Image & Mascot */}
        <div className="bottom-cta-bg-wrap">
          <div className="bottom-cta-sunset-gradient"></div>
          <div className="bottom-cta-mascot-scene">
            <img
              src="/mascot_emotions/34_waving_goodbye_backpack.webp"
              alt="MOZ with backpack looking at the horizon"
              className="bottom-cta-mascot-img"
            />
          </div>
        </div>

        {/* Handwritten Note */}
        <div className="bottom-cta-handwritten-note">
          <span>A better tomorrow is a few steps away.</span>
        </div>

        {/* Content Box */}
        <div className="bottom-cta-content">
          <h2 className="bottom-cta-title">Start earning a better you.</h2>
          <p className="bottom-cta-subtitle">It&apos;s time to take back your time.</p>

          {/* App Store & Google Play Badges (Official) */}
          <div className="bottom-cta-badges">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-store-link"
              aria-label="Download on the App Store"
            >
              <img
                src="/assets/app-store-badge.svg"
                alt="Download on the App Store"
                className="store-badge-img"
              />
            </a>

            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-store-link"
              aria-label="Get it on Google Play"
            >
              <img
                src="/assets/google-play-badge.svg"
                alt="Get it on Google Play"
                className="store-badge-img"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
