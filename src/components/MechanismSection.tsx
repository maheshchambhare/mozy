
export default function MechanismSection() {
  return (
    <section className="mozy-section how-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· THE 3-STEP ECONOMY ·</span>
          <h2 className="mozy-h2">
            Walk &rarr; Earn &rarr; Scroll.
          </h2>
          <p className="mozy-subtext">
            MOZY turns your screen time into a tangible currency. Walking is earning. Scrolling is spending.
          </p>
        </div>

        <div className="mechanism-grid">
          <div className="mechanism-card">
            <div className="mechanism-num">01</div>
            <div className="mechanism-icon-box">👟</div>
            <h3 className="mechanism-title">WALK (Earning)</h3>
            <p className="mechanism-desc">
              Your phone’s hardware pedometer automatically counts your steps throughout the day. 100% offline, zero GPS tracking, ultra-low battery drain.
            </p>
            <div className="mechanism-metric">
              <span>Rate</span>
              <strong>1,000 steps = 10 min</strong>
            </div>
          </div>

          <div className="mechanism-card">
            <div className="mechanism-num">02</div>
            <div className="mechanism-icon-box">💳</div>
            <h3 className="mechanism-title">EARN (Your Wallet)</h3>
            <p className="mechanism-desc">
              Every step deposits into your live screen-time balance. You can see your remaining minutes tick up as you walk to work, pace on calls, or head to the gym.
            </p>
            <div className="mechanism-metric">
              <span>Daily Target</span>
              <strong>8,000 steps = 80 min</strong>
            </div>
          </div>

          <div className="mechanism-card">
            <div className="mechanism-num">03</div>
            <div className="mechanism-icon-box">📱</div>
            <h3 className="mechanism-title">SCROLL (Spending)</h3>
            <p className="mechanism-desc">
              Open Instagram, TikTok, YouTube, or Reddit. Your balance ticks down while you browse. When it hits 00:00, MOZY pauses access immediately until you walk again.
            </p>
            <div className="mechanism-metric">
              <span>The Law</span>
              <strong>No Steps &rarr; No Scroll</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
