
interface FinalCTAProps {
  playStoreUrl?: string;
  appStoreUrl?: string;
}

export default function FinalCTA({
  playStoreUrl = "https://play.google.com/store/apps/details?id=com.moxstudio.mozy",
  appStoreUrl = "https://apps.apple.com/app/mozy-walk-to-earn-screen-time/id6792097497",
}: FinalCTAProps) {
  return (
    <section className="final-cta-section" id="download">
      <div className="container">
        <div className="final-cta-box">
          <span className="mozy-eyebrow" style={{ color: "#FF5A00" }}>· STOP RELYING ON WILLPOWER ·</span>
          <h2 className="final-cta-headline">
            Your next 30 minutes of scrolling <br />
            <span className="text-gradient">aren&apos;t free.</span>
          </h2>
          <p className="final-cta-sub">
            Put down the excuses. Lace up your sneakers. Turn physical activity into your daily digital currency.
          </p>

          <div className="mozy-final-cta-container">
            <div className="mozy-final-cta-buttons">
              <a
                href={appStoreUrl}
                className="mozy-btn-store mozy-btn-ios"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.1.09 2.23-.58 2.95-1.39" />
                </svg>
                <div className="mozy-btn-text">
                  <span className="btn-eyebrow">Download on</span>
                  <span className="btn-main">App Store</span>
                </div>
              </a>

              <a
                href={playStoreUrl}
                className="mozy-btn-store mozy-btn-android"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.485c0 .97.777 1.564 1.635 1.084L19.75 13.1c.857-.48.857-1.72 0-2.2L4.635 2.43C3.777 1.95 3 2.545 3 3.515v16.97z" />
                </svg>
                <div className="mozy-btn-text">
                  <span className="btn-eyebrow">Get it on</span>
                  <span className="btn-main">Google Play</span>
                </div>
              </a>
            </div>

            <div className="mozy-final-badges">
              <span>⚡ Instant Setup</span>
              <span className="dot-sep">·</span>
              <span>🔒 100% On-Device</span>
              <span className="dot-sep">·</span>
              <span>🚶 Zero Willpower Needed</span>
            </div>
          </div>

          <div className="final-platform-note">
            <p>Available for iOS 15.0+ and Android 9.0+ · Instant setup · Free download</p>
          </div>
        </div>
      </div>
    </section>
  );
}
