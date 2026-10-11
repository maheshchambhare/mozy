import { useState } from "react";

interface HeroSectionProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export default function HeroSection({
  appStoreUrl = "https://apps.apple.com/app/mozy-walk-to-earn-screen-time/id6792097497",
  playStoreUrl = "https://play.google.com/store/apps/details?id=com.moxstudio.mozy",
}: HeroSectionProps) {
  const [hoveredStore, setHoveredStore] = useState<"apple" | "google" | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-fullscreen-wrap" id="hero">
      {/* Background artwork */}
      <div className="hero-bg-media">
        <img
          src="/hero image.png"
          alt="MOZY: Your phone now charges you in steps"
          className="hero-bg-artwork"
        />
        <div className="hero-left-vignette"></div>
      </div>

      {/* Thought bubble over guy on bed ("Just one more reel..." + curved arrow) */}
      <div className="hero-thought-bubble-wrap" aria-hidden="true">
        <img
          src="/assets/thought-bubble-reel.png"
          alt="Just one more reel..."
          className="hero-thought-bubble-img"
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="hero-header-nav">
        <div className="hero-nav-inner">
          <a href="/" className="hero-nav-brand" aria-label="MOZY Home">
            <span className="hero-brand-logo-text">MOZY</span>
          </a>

          <nav className="hero-nav-menu">
            <button type="button" onClick={() => scrollTo("why-mozy")} className="hero-nav-item">
              Why MOZY
            </button>
            <button type="button" onClick={() => scrollTo("features")} className="hero-nav-item">
              Features
            </button>
            <button type="button" onClick={() => scrollTo("reviews")} className="hero-nav-item">
              Reviews
            </button>
            <button type="button" onClick={() => scrollTo("faq")} className="hero-nav-item">
              FAQ
            </button>
          </nav>

          <div className="hero-nav-action">
            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("download");
              }}
              className="hero-download-btn"
            >
              <svg
                className="hero-download-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download App</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Content Overlay (Left Aligned) */}
      <div className="hero-content-layer">
        <div className="hero-content-inner">
          {/* Eyebrow Pill */}
          <div className="hero-eyebrow-pill">
            <span>MOVE MORE. SCROLL BETTER.</span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="hero-title-h1">
            Your phone <br />
            now <span className="text-green-glow">charges</span> <br />
            you in steps.
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-text">
            Walk. Earn screen time. Spend it on <br />
            the apps you actually want to use.
          </p>

          {/* Store Download Buttons (with Hover-Triggered Excited Mascots) */}
          <div className="hero-store-interactive-wrap">
            {/* Ambient Green Aura behind buttons */}
            <div
              className={`store-buttons-glow-aura ${
                hoveredStore ? `glow-${hoveredStore}` : ""
              }`}
            ></div>

            {/* Twinkling magic sparkles around buttons */}
            <span className="store-sparkle sparkle-tl" aria-hidden="true">✦</span>
            <span className="store-sparkle sparkle-tr" aria-hidden="true">✦</span>
            <span className="store-sparkle sparkle-bl" aria-hidden="true">✦</span>
            <span className="store-sparkle sparkle-br" aria-hidden="true">✦</span>

            <div className="hero-store-buttons-row">
              {/* Apple Store Button Slot */}
              <div className="hero-store-btn-slot">
                {/* Mask ensures mascot is strictly clipped at the button bottom */}
                <div className="store-mascot-mask" aria-hidden="true">
                  <div
                    className={`store-mascot-popup ${
                      hoveredStore === "apple" ? "is-visible" : ""
                    }`}
                  >
                    <div className="store-mascot-speech-bubble">
                      <span>Get for iOS! 🍏</span>
                      <div className="speech-bubble-caret"></div>
                    </div>
                    <img
                      src="/mascot_emotions/03_excited_cheer.webp"
                      alt="MOZ cheering for iOS"
                      className="store-mascot-img"
                    />
                  </div>
                </div>

                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-store-link store-link-apple"
                  aria-label="Download on the App Store"
                  onMouseEnter={() => setHoveredStore("apple")}
                  onMouseLeave={() => setHoveredStore(null)}
                >
                  <div className="store-btn-shine-sweep"></div>
                  <img
                    src="/assets/app-store-badge.svg"
                    alt="Download on the App Store"
                    className="store-badge-img"
                  />
                </a>
              </div>

              {/* Google Play Button Slot */}
              <div className="hero-store-btn-slot">
                {/* Mask ensures mascot is strictly clipped at the button bottom */}
                <div className="store-mascot-mask" aria-hidden="true">
                  <div
                    className={`store-mascot-popup ${
                      hoveredStore === "google" ? "is-visible" : ""
                    }`}
                  >
                    <div className="store-mascot-speech-bubble">
                      <span>Get for Android! 🤖</span>
                      <div className="speech-bubble-caret"></div>
                    </div>
                    <img
                      src="/mascot_emotions/17_fist_pump_cheer.webp"
                      alt="MOZ cheering for Android"
                      className="store-mascot-img"
                    />
                  </div>
                </div>

                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-store-link store-link-google"
                  aria-label="Get it on Google Play"
                  onMouseEnter={() => setHoveredStore("google")}
                  onMouseLeave={() => setHoveredStore(null)}
                >
                  <div className="store-btn-shine-sweep"></div>
                  <img
                    src="/assets/google-play-badge.svg"
                    alt="Get it on Google Play"
                    className="store-badge-img"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* 3 Feature Micro-Items (Horizontal Row, No Box Containers) */}
          <div className="hero-feature-items-row">
            {/* Move more */}
            <div className="hero-feature-item">
              <img
                src="/assets/icon-sneaker.png"
                alt=""
                className="feature-item-icon-img sneaker-img"
              />
              <div className="feature-item-text">
                <span className="feature-title">Move more</span>
                <span className="feature-desc">Real steps.<br />Real change.</span>
              </div>
            </div>

            {/* Earn time */}
            <div className="hero-feature-item">
              <img
                src="/assets/icon-lightning.png"
                alt=""
                className="feature-item-icon-img lightning-img"
              />
              <div className="feature-item-text">
                <span className="feature-title">Earn time</span>
                <span className="feature-desc">Get screen time<br />with your steps.</span>
              </div>
            </div>

            {/* A better you */}
            <div className="hero-feature-item">
              <img
                src="/assets/icon-heart.png"
                alt=""
                className="feature-item-icon-img heart-img"
              />
              <div className="feature-item-text">
                <span className="feature-title">A better you</span>
                <span className="feature-desc">More focus.<br />Happier days.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar (Scroll prompt on left + Social proof on right) */}
      <div className="hero-bottom-controls">
        <button
          type="button"
          onClick={() => scrollTo("why-mozy")}
          className="hero-scroll-prompt"
        >
          <div className="scroll-arrow-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
          <span className="scroll-prompt-text">Scroll to see how it works</span>
        </button>

        <div className="hero-social-proof">
          <div className="social-avatars-group">
            <img src="/assets/v2/hero-phone.png" alt="User" className="social-avatar-circle av-1" />
            <img src="/assets/v2/steps-currency.png" alt="User" className="social-avatar-circle av-2" />
            <img src="/assets/v2/companion-worlds.png" alt="User" className="social-avatar-circle av-3" />
          </div>
          <span className="social-proof-copy">
            Join thousands building a healthier digital life.
          </span>
        </div>
      </div>
    </section>
  );
}
