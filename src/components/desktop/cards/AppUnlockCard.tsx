
export default function AppUnlockCard() {
  const apps = [
    { name: "Instagram", color: "#E1306C", icon: "📸" },
    { name: "TikTok", color: "#000000", icon: "🎵" },
    { name: "YouTube", color: "#FF0000", icon: "▶️" },
    { name: "Reddit", color: "#FF4500", icon: "👾" },
    { name: "X", color: "#111111", icon: "𝕏" },
    { name: "Snapchat", color: "#FFFC00", icon: "👻" },
  ];

  return (
    <div className="bento-card bento-card-light app-unlock-card">
      <div className="app-unlock-content">
        <h2 className="app-unlock-title">Same apps. Just earned differently.</h2>
        <p className="app-unlock-subtitle">
          Use Instagram, TikTok, YouTube, Reddit and more &mdash; but only with the screen time you earn.
        </p>

        {/* App Icons Row */}
        <div className="app-badges-row">
          {apps.map((app) => (
            <div
              key={app.name}
              className="app-badge-item"
              title={app.name}
              style={{ "--app-color": app.color } as React.CSSProperties}
            >
              <span className="app-badge-symbol">{app.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dual Phone Comparison: Locked -> Unlocked */}
      <div className="app-unlock-visual">
        <div className="dual-phone-comparison">
          <div className="mini-phone-card phone-locked">
            <div className="mini-phone-notch"></div>
            <div className="mini-phone-app-icon ig-gradient">📸</div>
            <span className="mini-phone-status">Screen time locked</span>
            <span className="mini-phone-hint">Walk to earn more</span>
            <div className="mini-phone-lock-badge">🔒</div>
          </div>
          <div className="dual-phone-arrow">&rarr;</div>
          <div className="mini-phone-card phone-unlocked">
            <div className="mini-phone-notch"></div>
            <div className="mini-phone-check">✓</div>
            <div className="mini-phone-app-icon ig-gradient">📸</div>
            <span className="mini-phone-status text-green">You earned it!</span>
            <span className="mini-phone-hint">Instagram is unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
