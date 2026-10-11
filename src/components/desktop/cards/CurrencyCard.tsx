
export default function CurrencyCard() {
  return (
    <div className="bento-card bento-card-dark currency-card">
      <div className="currency-card-header">
        <h2 className="currency-title">Your screen time, now a currency.</h2>
        <p className="currency-subtitle">
          See your balance, earn minutes, and use them on the apps you choose.
        </p>
      </div>

      <div className="currency-mockup-wrapper">
        {/* Callouts Left */}
        <div className="callout-group callouts-left">
          <div className="callout-item callout-top-left">
            <span className="callout-badge">Pick the apps you want to control</span>
            <div className="callout-line line-top-left"></div>
          </div>
          <div className="callout-item callout-bottom-left">
            <span className="callout-badge">Track your progress</span>
            <div className="callout-line line-bottom-left"></div>
          </div>
        </div>

        {/* Center Phone Mockup */}
        <div className="currency-phone-device">
          <div className="phone-inner-screen">
            <div className="app-status-bar">
              <span className="status-time">9:41</span>
              <div className="status-icons">
                <span className="signal-icon">•••</span>
                <span className="battery-icon">🔋</span>
              </div>
            </div>

            <div className="currency-app-header">
              <span className="currency-app-logo">MOZY</span>
            </div>

            <div className="currency-balance-box">
              <span className="balance-label">Screen Time Balance</span>
              <div className="balance-value">42:30</div>
              <span className="balance-hint">Earn more by walking</span>
            </div>

            {/* Apps row with lock indicators */}
            <div className="currency-apps-selection">
              <div className="app-pill-icon app-ig">
                <span>📸</span>
                <span className="mini-lock">🔒</span>
              </div>
              <div className="app-pill-icon app-tt">
                <span>🎵</span>
                <span className="mini-lock">🔒</span>
              </div>
              <div className="app-pill-icon app-yt">
                <span>▶️</span>
                <span className="mini-lock">🔒</span>
              </div>
              <div className="app-pill-icon app-rd">
                <span>👾</span>
                <span className="mini-lock">🔒</span>
              </div>
              <div className="app-pill-icon app-sc">
                <span>👻</span>
                <span className="mini-lock">🔒</span>
              </div>
            </div>

            {/* Today Steps Card */}
            <div className="currency-steps-card">
              <div className="steps-stat-left">
                <div className="steps-stat-label">Today</div>
                <div className="steps-stat-val">
                  <span className="steps-bolt">⚡</span>
                  <strong>8,420</strong> steps
                </div>
                <div className="steps-stat-earned">+42 min earned</div>
              </div>
              {/* Mini Bar Chart */}
              <div className="steps-mini-chart">
                <div className="chart-bar" style={{ height: "45%" }}></div>
                <div className="chart-bar" style={{ height: "65%" }}></div>
                <div className="chart-bar" style={{ height: "40%" }}></div>
                <div className="chart-bar active-bar" style={{ height: "85%" }}></div>
                <div className="chart-bar" style={{ height: "55%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Callouts Right */}
        <div className="callout-group callouts-right">
          <div className="callout-item callout-top-right">
            <div className="callout-line line-top-right"></div>
            <span className="callout-badge">Clear balance and time limits</span>
          </div>
          <div className="callout-item callout-bottom-right">
            <div className="callout-line line-bottom-right"></div>
            <span className="callout-badge">Walk and earn more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
