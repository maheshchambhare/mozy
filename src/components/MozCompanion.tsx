
export default function MozCompanion() {
  return (
    <section className="mozy-section moz-section" id="companion">
      <div className="container">
        <div className="moz-card">
          <div className="moz-visual">
            <div className="moz-avatar-wrap">
              <img
                src="/assets/companion-worlds.png"
                alt="Mozy Companion Worlds - Desert Oasis, Abandoned City, Green Park"
                className="moz-worlds-img"
              />
            </div>
            <div className="moz-role-badge">SCREEN-TIME DEBT COLLECTOR</div>
          </div>

          <div className="moz-info">
            <span className="mozy-eyebrow" style={{ color: "#FFAA00" }}>· MEET YOUR COMPANION ·</span>
            <h2 className="moz-headline">
              Meet MOZ. Cute, sarcastic, and completely unimpressed by your excuses.
            </h2>
            <p className="moz-desc">
              MOZ is your personal screen-time debt collector. He doesn&apos;t care that you had a stressful day or that your friend just sent you a 40-part TikTok series. If your balance is empty, you don&apos;t scroll.
            </p>

            <div className="moz-quotes-list">
              <div className="moz-quote-item">
                <span className="moz-quote-icon">💬</span>
                <p>&ldquo;Payment declined. Go walk.&rdquo;</p>
              </div>
              <div className="moz-quote-item">
                <span className="moz-quote-icon">💬</span>
                <p>&ldquo;Your screen-time balance: 00:00. Put shoes on.&rdquo;</p>
              </div>
              <div className="moz-quote-item">
                <span className="moz-quote-icon">💬</span>
                <p>&ldquo;Bro thinks reopening Instagram changed his balance.&rdquo;</p>
              </div>
              <div className="moz-quote-item">
                <span className="moz-quote-icon">💬</span>
                <p>&ldquo;Every step makes me happier! 💚&rdquo;</p>
              </div>
            </div>

            <div className="moz-companion-note">
              <strong>Grow Together · Discover New Worlds:</strong> As you hit your daily step goals, you unlock new environments — from <em>Desert Oasis</em> to the <em>Abandoned City</em> to the blooming <em>Green Park</em>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
