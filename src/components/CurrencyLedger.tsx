import { useState } from "react";

interface AppCost {
  name: string;
  icon: string;
  costSteps: number;
  minutes: number;
}

const APP_COSTS: AppCost[] = [
  { name: "Instagram", icon: "📸", costSteps: 1000, minutes: 10 },
  { name: "TikTok", icon: "🎵", costSteps: 1500, minutes: 15 },
  { name: "YouTube", icon: "▶️", costSteps: 2000, minutes: 20 },
  { name: "Reddit / X", icon: "💬", costSteps: 1000, minutes: 10 },
];

export default function CurrencyLedger() {
  const [steps, setSteps] = useState(5400);

  const earnedMinutes = Math.floor(steps / 100);
  const hours = Math.floor(earnedMinutes / 60);
  const mins = earnedMinutes % 60;
  const formattedTime = `${hours > 0 ? `${hours}h ` : ""}${mins}m`;

  const getMozRemark = (s: number) => {
    if (s === 0) return "Payment declined. Put shoes on.";
    if (s < 2000) return "Barely enough for three reels. Keep walking.";
    if (s < 5000) return "Getting there. Your scroll balance is in the black.";
    if (s < 10000) return "Solid balance. You actually earned this dopamine.";
    return "You're a legend. Scroll as long as you want, guilt-free.";
  };

  return (
    <section className="mozy-section ledger-section" id="simulator">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· LIVE CURRENCY SIMULATOR ·</span>
          <h2 className="mozy-h2">
            Your screen-time balance should be earned, <br />
            <span className="text-highlight">not unlimited.</span>
          </h2>
          <p className="mozy-subtext">
            Test the economy. Drag the slider to see how many minutes your daily walking unlocks:
          </p>
        </div>

        <div className="mozy-ledger-card">
          <div className="mozy-ledger-header">
            <div className="ledger-balance-block">
              <span className="ledger-balance-label">EARNED SCREEN TIME BALANCE</span>
              <div className="ledger-balance-value">
                {formattedTime}
                <span className="ledger-balance-status">ACTIVE</span>
              </div>
            </div>

            <div className="ledger-moz-speech">
              <img
                src="/assets/icon.png"
                alt="MOZ Mascot"
                className="ledger-moz-avatar"
              />
              <div className="ledger-moz-bubble">
                <span className="ledger-moz-name">MOZ · Debt Collector</span>
                <p className="ledger-moz-text">&ldquo;{getMozRemark(steps)}&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="mozy-ledger-slider-wrap">
            <div className="slider-meta">
              <label htmlFor="step-slider" className="slider-label">
                Simulate your daily steps:
              </label>
              <span className="slider-steps-count">
                <strong>{steps.toLocaleString()}</strong> steps
              </span>
            </div>
            <input
              id="step-slider"
              type="range"
              min={0}
              max={15000}
              step={200}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="mozy-slider"
              aria-label="Daily step count simulator"
            />
            <div className="slider-ticks">
              <span>0 steps (Locked)</span>
              <span>5,000 steps</span>
              <span>10,000 steps</span>
              <span>15,000 steps</span>
            </div>
          </div>

          <div className="mozy-ledger-breakdown">
            <span className="breakdown-title">TODAY&apos;S SAMPLE LEDGER</span>
            <div className="breakdown-grid">
              {APP_COSTS.map((app) => {
                const canAfford = steps >= app.costSteps;
                return (
                  <div
                    key={app.name}
                    className={`ledger-app-pill ${canAfford ? "unlocked" : "locked"}`}
                  >
                    <span className="ledger-app-icon">{app.icon}</span>
                    <div className="ledger-app-info">
                      <div className="ledger-app-row">
                        <span className="ledger-app-name">{app.name}</span>
                        <span className="ledger-app-cost">{app.costSteps.toLocaleString()} steps</span>
                      </div>
                      <div className="ledger-app-sub">
                        <span className="ledger-app-time">{app.minutes} min scroll</span>
                        <span className={`ledger-status-tag ${canAfford ? "paid" : "unpaid"}`}>
                          {canAfford ? "✓ Unlocked" : "🔒 Needs steps"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mozy-ledger-footer">
            <div className="ledger-rule">
              <span className="rule-badge">THE LAW</span>
              <p>
                No steps? No scroll. Your phone literally locks your chosen apps until you walk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
