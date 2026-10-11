
export default function TheProblemCard() {
  return (
    <div className="bento-card bento-card-light problem-card" id="why-mozy">
      <div className="problem-content-col">
        <span className="bento-tag">THE PROBLEM</span>
        <h2 className="problem-title">
          It always starts <br />
          with <span className="text-coral-accent">5 minutes...</span>
        </h2>
        <p className="problem-description">
          But somehow it&apos;s 2 hours later. <br />
          We don&apos;t just lose time. <br />
          We lose focus, sleep, energy and the things that actually matter.
        </p>
      </div>

      <div className="problem-visual-col">
        <div className="problem-scene-wrap">
          <img
            src="/mascot_emotions/10_sleeping_zzz.webp"
            alt="Late night phone doomscrolling in bed"
            className="problem-bed-img"
          />

          {/* Annotations & stickers */}
          <div className="problem-thought-sticker">
            <span>&ldquo;Just one more...&rdquo;</span>
          </div>

          <div className="problem-clock-badge">
            <span className="clock-time">2:17 AM</span>
          </div>

          <div className="problem-hours-badge">
            <span>3 hours gone</span>
          </div>

          <div className="problem-repeat-badge">
            <span>Again tomorrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
