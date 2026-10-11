
export default function ReframeSection() {
  return (
    <section className="mozy-section reframe-section">
      <div className="container">
        <div className="reframe-box">
          <span className="mozy-eyebrow" style={{ color: "#FFAA00" }}>· THE REFRAME ·</span>
          <h2 className="reframe-headline">
            You don&apos;t need another screen-time warning. <br />
            <span className="text-gradient">You need scrolling to cost something.</span>
          </h2>
          <p className="reframe-subtext">
            Willpower fails because tapping &ldquo;Ignore Limit&rdquo; is effortless. MOZY replaces willpower with an economic law:
          </p>

          <div className="reframe-comparison-grid">
            <div className="reframe-col old-way">
              <div className="reframe-col-header">
                <span className="col-status-pill bad">THE OLD WAY</span>
                <h3>Timers & Willpower</h3>
              </div>
              <div className="reframe-flow-item">
                <span className="flow-step">1</span>
                <p>&ldquo;You have 5 minutes left on Instagram&rdquo;</p>
              </div>
              <div className="reframe-flow-item">
                <span className="flow-step">2</span>
                <p>Tap &ldquo;Ignore Limit for 15 minutes&rdquo;</p>
              </div>
              <div className="reframe-flow-item">
                <span className="flow-step">3</span>
                <p>Lose another 45 minutes, feel guilty, repeat</p>
              </div>
              <div className="reframe-cost-tag zero-cost">Cost in the moment: $0 / 0 steps</div>
            </div>

            <div className="reframe-col mozy-way">
              <div className="reframe-col-header">
                <span className="col-status-pill good">THE MOZY WAY</span>
                <h3>Screen Time Currency</h3>
              </div>
              <div className="reframe-flow-item">
                <span className="flow-step mozy-step">1</span>
                <p>Screen time balance hits <strong>00:00</strong></p>
              </div>
              <div className="reframe-flow-item">
                <span className="flow-step mozy-step">2</span>
                <p>Payment declined. Put shoes on & take 1,000 steps</p>
              </div>
              <div className="reframe-flow-item">
                <span className="flow-step mozy-step">3</span>
                <p>Fund 10 minutes of unlocked time. Scroll guilt-free</p>
              </div>
              <div className="reframe-cost-tag earned-cost">Cost in the moment: 1,000 steps</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
