
export default function PrivacySection() {
  return (
    <section className="mozy-section privacy-section" id="privacy">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· PRIVACY FIRST ·</span>
          <h2 className="mozy-h2">
            Your phone. Your steps. <br />
            <span className="text-highlight">Zero data leaves your device.</span>
          </h2>
          <p className="mozy-subtext">
            Digital wellness should never require giving up your personal data.
          </p>
        </div>

        <div className="privacy-grid">
          <div className="privacy-card">
            <div className="privacy-icon">🔒</div>
            <h3>100% Offline & On-Device</h3>
            <p>
              Zero accounts, zero email signups, zero cloud databases. Your steps, app usage, and balances stay completely on your phone. We cannot see your data.
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">🛰️</div>
            <h3>Zero GPS or Location Tracking</h3>
            <p>
              Mozy reads built-in motion hardware steps only. We never access your GPS, map your routes, or track where you walk.
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">🛡️</div>
            <h3>Transparent Accessibility Service</h3>
            <p>
              Used exclusively to detect when a locked app opens and show the balance overlay. Never reads keystrokes, personal chats, or passwords.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
