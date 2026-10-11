
export default function ProductShowcase() {
  return (
    <section className="mozy-section showcase-section" id="product">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· REAL PRODUCT EXPERIENCE ·</span>
          <h2 className="mozy-h2">
            Built to break the loop. <br />
            Engineered to keep you moving.
          </h2>
          <p className="mozy-subtext">
            Clean, dark-mode native interface with zero bloat. Real hardware sensors, real limits, and real results.
          </p>
        </div>

        <div className="showcase-grid">
          {/* Card 1: Walk First / Hard Limits */}
          <div className="showcase-card large-card">
            <div className="showcase-content">
              <span className="showcase-tag">HARD LIMITS</span>
              <h3>No easy bypass. No &ldquo;15 more minutes&rdquo;.</h3>
              <p>
                When your earned minutes are exhausted, MOZY puts up an impenetrable barrier. No simple dismiss buttons. If you want to scroll, you have to get on your feet.
              </p>
              <div className="showcase-quote">
                &ldquo;Payment declined. 437 more steps required.&rdquo;
              </div>
            </div>
            <div className="showcase-img-wrap">
              <img
                src="/assets/hero-phone.png"
                alt="Mozy Walk First Scroll Later Interface"
                className="showcase-screenshot"
              />
            </div>
          </div>

          {/* Card 2: Choose What to Block */}
          <div className="showcase-card">
            <div className="showcase-content">
              <span className="showcase-tag">SELECT APPS</span>
              <h3>Choose What to Block</h3>
              <p>
                You pick the apps that cost steps — Instagram, TikTok, YouTube, Games — while keeping essential communication tools freely accessible.
              </p>
            </div>
            <div className="showcase-img-wrap">
              <img
                src="/assets/choose-block.png"
                alt="Mozy App Selection Interface"
                className="showcase-screenshot"
              />
            </div>
          </div>

          {/* Card 3: Progress & Streaks */}
          <div className="showcase-card">
            <div className="showcase-content">
              <span className="showcase-tag">STREAKS & HABITS</span>
              <h3>Progress at a Glance</h3>
              <p>
                Keep your level, streaks, and habits in view. Watch your daily steps increase as your screen time becomes disciplined and intentional.
              </p>
            </div>
            <div className="showcase-img-wrap">
              <img
                src="/assets/progress-streak.png"
                alt="Mozy Streak and Level Progress Dashboard"
                className="showcase-screenshot"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
