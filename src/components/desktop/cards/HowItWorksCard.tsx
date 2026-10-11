
export default function HowItWorksCard() {
  return (
    <div className="bento-card bento-card-mint how-it-works-card" id="features">
      <div className="how-it-works-main">
        <span className="bento-tag text-green-dark">HOW MOZY WORKS</span>
        <h2 className="how-it-works-title">Walk &rarr; Earn &rarr; Scroll</h2>

        {/* 3 Steps Row */}
        <div className="steps-flow-row">
          {/* Step 1: Walk */}
          <div className="step-flow-item">
            <div className="step-flow-icon-wrap">
              <svg className="step-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 16l4-2 3 3 5-1 4-6-2-2-4 2-3-2-5 3v5z" />
                <path d="M4 20h16" />
              </svg>
            </div>
            <div className="step-flow-text">
              <h3 className="step-flow-name">Walk</h3>
              <p className="step-flow-desc">
                Move in real life. <br />
                Your steps are detected automatically.
              </p>
            </div>
          </div>

          <div className="step-arrow-divider">&rarr;</div>

          {/* Step 2: Earn */}
          <div className="step-flow-item">
            <div className="step-flow-icon-wrap">
              <svg className="step-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(34, 197, 94, 0.2)" />
              </svg>
            </div>
            <div className="step-flow-text">
              <h3 className="step-flow-name">Earn</h3>
              <p className="step-flow-desc">
                Get screen time <br />
                minutes for your steps.
              </p>
            </div>
          </div>

          <div className="step-arrow-divider">&rarr;</div>

          {/* Step 3: Scroll */}
          <div className="step-flow-item">
            <div className="step-flow-icon-wrap">
              <svg className="step-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="step-flow-text">
              <h3 className="step-flow-name">Scroll</h3>
              <p className="step-flow-desc">
                Use the apps <br />
                you love.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MOZ Character with EFFORT UNLOCKS FREEDOM sign */}
      <div className="how-it-works-moz-col">
        <div className="effort-sign-container">
          <img
            src="/mascot_emotions/25_holding_leaf_sign.webp"
            alt="MOZ character holding EFFORT UNLOCKS FREEDOM sign"
            className="moz-effort-img"
          />
        </div>
      </div>
    </div>
  );
}
