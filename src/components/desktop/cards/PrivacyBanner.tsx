
export default function PrivacyBanner() {
  return (
    <div className="bento-card bento-card-privacy privacy-banner-card">
      <div className="privacy-shield-col">
        <div className="privacy-shield-icon-wrap">
          <svg className="privacy-shield-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(34, 197, 94, 0.25)" />
            <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="privacy-text-col">
        <h3 className="privacy-title">Your data stays with you.</h3>
        <p className="privacy-description">
          No creepy tracking. No data selling. <br />
          Your information stays on your device.
        </p>
      </div>

      <div className="privacy-action-col">
        <a href="/privacy" className="privacy-learn-link">
          <span>Learn more</span>
          <span className="privacy-arrow">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
