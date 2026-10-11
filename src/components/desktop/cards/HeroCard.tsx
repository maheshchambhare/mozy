
interface HeroCardProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export default function HeroCard({
  appStoreUrl = "https://apps.apple.com/app/mozy-walk-to-earn-screen-time/id6792097497",
  playStoreUrl = "https://play.google.com/store/apps/details?id=com.moxstudio.mozy",
}: HeroCardProps) {
  return (
    <div className="bento-card bento-card-dark hero-card-main">
      <div className="hero-content-col">
        {/* Main Headline */}
        <h1 className="hero-main-title">
          Your phone <br />
          now <span className="text-green-accent">charges you</span> <br />
          in steps.
        </h1>

        {/* Subtitle */}
        <p className="hero-main-subtitle">
          Walk. Earn screen time. Spend it on the apps you actually want to use.
        </p>

        {/* Store Download Buttons */}
        <div className="hero-store-buttons">
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="store-btn store-btn-apple"
            aria-label="Download on the App Store"
          >
            <svg className="store-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
            </svg>
            <div className="store-btn-text">
              <span className="store-sub">Download on the</span>
              <span className="store-title">App Store</span>
            </div>
          </a>

          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="store-btn store-btn-google"
            aria-label="Get it on Google Play"
          >
            <svg className="store-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.306-.61-.776-.61-1.319V3.133c0-.543.24-1.013.609-1.319zm11.238 11.241l2.437 2.437-12.062 6.958 9.625-9.395zm0-2.11L5.222 1.55l12.062 6.958-2.437 2.437zm1.488 1.488l3.155 1.819c.92.531.92 1.401 0 1.932l-3.155 1.819-2.073-2.073 2.073-2.097z" />
            </svg>
            <div className="store-btn-text">
              <span className="store-sub">GET IT ON</span>
              <span className="store-title">Google Play</span>
            </div>
          </a>
        </div>

        {/* Handwritten note at bottom left */}
        <div className="hero-handwritten-note">
          <span>No steps.</span>
          <span>No scroll.</span>
        </div>
      </div>

      {/* Hero Visual Composition */}
      <div className="hero-visual-col">
        {/* Late night bed scrolling scene */}
        <div className="hero-bed-scroller">
          <img
            src="/mascot_emotions/08_focused_phone.webp"
            alt="Person scrolling late at night"
            className="hero-guy-bed-img"
          />
          {/* Handwritten thought bubble */}
          <div className="hero-thought-bubble">
            <span>Just one more reel...</span>
            <svg className="thought-arrow" width="28" height="24" viewBox="0 0 28 24" fill="none">
              <path
                d="M2 2C8 6 18 10 24 22M24 22L18 20M24 22L22 14"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Floating MOZY Phone Lock Screen */}
        <div className="hero-phone-mockup">
          <div className="phone-notch"></div>
          <div className="phone-screen-content">
            <div className="phone-brand-title">MOZY</div>
            <div className="phone-balance-label">Screen Time Balance</div>
            <div className="phone-balance-digits">00:00</div>
            <div className="phone-balance-sub">Walk to earn more</div>

            {/* Locked Apps Row */}
            <div className="phone-locked-apps-row">
              <div className="locked-app-icon ig-bg">
                <span className="app-icon-symbol">📸</span>
                <span className="app-lock-badge">🔒</span>
              </div>
              <div className="locked-app-icon tt-bg">
                <span className="app-icon-symbol">🎵</span>
                <span className="app-lock-badge">🔒</span>
              </div>
              <div className="locked-app-icon yt-bg">
                <span className="app-icon-symbol">▶️</span>
                <span className="app-lock-badge">🔒</span>
              </div>
              <div className="locked-app-icon rd-bg">
                <span className="app-icon-symbol">👾</span>
                <span className="app-lock-badge">🔒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Declined Popup Card */}
        <div className="hero-declined-popup">
          <strong>Payment declined.</strong>
          <span>Go walk.</span>
        </div>

        {/* MOZ Character */}
        <div className="hero-moz-character">
          <img
            src="/mascot_emotions/01_stop_stern.webp"
            alt="MOZ character looking stern with crossed arms"
            className="moz-stern-avatar"
          />
        </div>
      </div>
    </div>
  );
}
