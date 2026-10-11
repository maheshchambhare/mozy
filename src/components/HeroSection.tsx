import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface HeroSectionProps {
  playStoreUrl?: string;
  appStoreUrl?: string;
}

export default function HeroSection({
  playStoreUrl = "https://play.google.com/store/apps/details?id=com.moxstudio.mozy",
  appStoreUrl = "https://apps.apple.com/app/mozy-walk-to-earn-screen-time/id6792097497",
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // GSAP load animations
    const ctx = gsap.context(() => {
      gsap.set(
        [
          ".mozy-badge-pill",
          ".mozy-hero-title",
          ".mozy-hero-subtitle",
          ".mozy-rule-banner",
          ".mozy-hero-actions",
          ".mozy-hero-trust-note",
          ".mozy-process-flow",
          ".mozy-floating-card",
          ".hero-moz-mascot-card",
        ],
        { opacity: 0, y: 25 }
      );

      gsap.set(".mozy-screen", {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 0.9,
        opacity: 0,
      });

      const tl = gsap.timeline({ delay: 0.1 });

      tl.to(
        [
          ".mozy-badge-pill",
          ".mozy-hero-title",
          ".mozy-hero-subtitle",
          ".mozy-rule-banner",
          ".mozy-hero-actions",
          ".mozy-hero-trust-note",
        ],
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      tl.to(
        ".mozy-process-flow",
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.2"
      );

      tl.to(
        ".mozy-screen",
        {
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "back.out(1.2)",
        },
        "-=0.5"
      );

      const isMobile = window.innerWidth < 768;
      const xOffset = isMobile ? 65 : 120;
      const yOffset = isMobile ? 12 : 18;
      const rot = isMobile ? 4 : 7;

      tl.to(
        ".screen-left",
        { x: -xOffset, y: yOffset, rotationZ: -rot, scale: 0.92, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
      tl.to(
        ".screen-right",
        { x: xOffset, y: yOffset + 10, rotationZ: rot, scale: 0.92, duration: 0.6, ease: "power2.out" },
        "-=0.6"
      );
      tl.to(".screen-center", { scale: 1.04, duration: 0.6, ease: "power2.out" }, "-=0.6");

      tl.to(
        [".mozy-floating-card", ".hero-moz-mascot-card"],
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }, el);

    // Mousemove parallax effect (Desktop only)
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const xOffset = 120;

      gsap.to(".mozy-screen-stack", {
        rotationY: x * 14,
        rotationX: -y * 14,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(".screen-center", {
        x: x * 15,
        y: y * 15,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(".screen-left", {
        x: -xOffset + x * 6,
        y: 18 + y * 28,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(".screen-right", {
        x: xOffset + x * 28,
        y: 28 + y * 6,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(".badge-steps", { x: x * 35, y: y * 35, duration: 0.9, ease: "power2.out", overwrite: "auto" });
      gsap.to(".badge-locked", { x: x * 45, y: y * 45, duration: 1.0, ease: "power2.out", overwrite: "auto" });
      gsap.to(".badge-time", { x: x * 30, y: y * 30, duration: 0.9, ease: "power2.out", overwrite: "auto" });
      gsap.to(".hero-moz-mascot-card", { x: x * 25, y: y * 25, duration: 0.85, ease: "power2.out", overwrite: "auto" });
    };

    const handleMouseLeave = () => {
      if (window.innerWidth < 768) return;
      const xOffset = 120;
      gsap.to(".mozy-screen-stack", { rotationY: 0, rotationX: 0, duration: 1.2, ease: "power3.out" });
      gsap.to(".screen-center", { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
      gsap.to(".screen-left", { x: -xOffset, y: 18, duration: 1.2, ease: "power3.out" });
      gsap.to(".screen-right", { x: xOffset, y: 28, duration: 1.2, ease: "power3.out" });
      gsap.to([".badge-steps", ".badge-locked", ".badge-time", ".hero-moz-mascot-card"], {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      ctx.revert();
    };
  }, []);

  return (
    <section className="mozy-hero-section" ref={containerRef}>
      <div className="container mozy-hero-grid">
        <div className="mozy-hero-content">
          <div className="mozy-badge-pill">
            <span className="mozy-badge-pulse"></span>
            ⚡ THE STEP-POWERED SCREEN TIME CURRENCY
          </div>

          <h1 className="mozy-hero-title">
            Your phone now <br />
            <span className="text-gradient">charges you in steps.</span>
          </h1>

          <p className="mozy-hero-subtitle">
            Walk. Earn screen time. Spend it on the apps you actually want to use. Stop relying on willpower — turn your daily movement into your scroll budget.
          </p>

          <div className="mozy-rule-banner">
            <span className="rule-dot"></span>
            <span className="rule-text">NO STEPS &rarr; NO SCROLL.</span>
            <span className="rule-sub">1,000 steps = 10 min screen time</span>
          </div>

          <div className="mozy-hero-actions">
            <a
              href={appStoreUrl}
              className="mozy-btn-store mozy-btn-ios"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.1.09 2.23-.58 2.95-1.39" />
              </svg>
              <span>Download on App Store</span>
            </a>

            <a
              href={playStoreUrl}
              className="mozy-btn-store mozy-btn-android"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.485c0 .97.777 1.564 1.635 1.084L19.75 13.1c.857-.48.857-1.72 0-2.2L4.635 2.43C3.777 1.95 3 2.545 3 3.515v16.97z" />
              </svg>
              <span>Get it on Google Play</span>
            </a>
          </div>

          <div className="mozy-hero-trust-note">
            <span>✓ 100% On-Device</span>
            <span className="dot-sep">·</span>
            <span>Zero Tracking</span>
            <span className="dot-sep">·</span>
            <span>No Account Needed</span>
          </div>

          <div className="mozy-process-flow">
            <div className="mozy-process-step">
              <div className="mozy-process-icon">👟</div>
              <div className="mozy-process-meta">
                <h4>1. Walk</h4>
                <p>Hardware pedometer tracks steps</p>
              </div>
            </div>

            <div className="mozy-process-arrow">
              <svg className="arrow-horizontal" viewBox="0 0 24 24" fill="none" stroke="#FF5A00" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
              <svg className="arrow-vertical" viewBox="0 0 24 24" fill="none" stroke="#FF5A00" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" />
              </svg>
            </div>

            <div className="mozy-process-step">
              <div className="mozy-process-icon">⏱️</div>
              <div className="mozy-process-meta">
                <h4>2. Earn Minutes</h4>
                <p>Steps fund your scroll wallet</p>
              </div>
            </div>

            <div className="mozy-process-arrow">
              <svg className="arrow-horizontal" viewBox="0 0 24 24" fill="none" stroke="#FF5A00" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
              <svg className="arrow-vertical" viewBox="0 0 24 24" fill="none" stroke="#FF5A00" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" />
              </svg>
            </div>

            <div className="mozy-process-step">
              <div className="mozy-process-icon">📱</div>
              <div className="mozy-process-meta">
                <h4>3. Spend Guilt-Free</h4>
                <p>Apps lock when balance hits 00:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Fanned Screen Deck */}
        <div className="mozy-hero-visual">
          <div className="mozy-glow-orb"></div>

          <div className="mozy-screen-stack">
            <div className="mozy-screen screen-left">
              <img src="/assets/steps-currency.png" alt="Mozy Steps to Screen Time" />
              <div className="screen-shine"></div>
            </div>

            <div className="mozy-screen screen-right">
              <img src="/assets/choose-block.png" alt="Mozy Choose What to Block" />
              <div className="screen-shine"></div>
            </div>

            <div className="mozy-screen screen-center">
              <img src="/assets/hero-phone.png" alt="Mozy Walk First Scroll Later App" />
              <div className="screen-shine"></div>
            </div>

            <div className="mozy-floating-card badge-steps">
              <div className="floating-card-icon">👟</div>
              <div className="floating-card-info">
                <span className="floating-card-value">+1,000 STEPS</span>
                <span className="floating-card-label">+10 min earned</span>
              </div>
            </div>

            <div className="mozy-floating-card badge-locked">
              <div className="floating-card-icon">💳</div>
              <div className="floating-card-info">
                <span className="floating-card-value">BALANCE: 00:00</span>
                <span className="floating-card-label">Payment declined. Go walk.</span>
              </div>
            </div>

            <div className="mozy-floating-card badge-time">
              <div className="floating-card-icon">🔒</div>
              <div className="floating-card-info">
                <span className="floating-card-value">Instagram Locked</span>
                <span className="floating-card-label">Cost: 1,000 steps</span>
              </div>
            </div>

            <div className="hero-moz-mascot-card">
              <img src="/assets/icon.png" alt="MOZ Mascot" className="hero-moz-img" />
              <div className="hero-moz-bubble">
                <span className="hero-moz-speaker">MOZ</span>
                <p>&ldquo;Bro thinks reopening Instagram changed his balance.&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
