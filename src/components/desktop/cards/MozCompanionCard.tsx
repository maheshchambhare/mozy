
export default function MozCompanionCard() {
  return (
    <div className="bento-card bento-card-light moz-companion-card" id="companion">
      <div className="moz-companion-header">
        <h2 className="moz-companion-title">
          Meet MOZ, <br />
          your walking companion.
        </h2>
        <p className="moz-companion-subtitle">
          Walk more. Unlock new worlds. Grow together.
        </p>
      </div>

      {/* Walking MOZ in nature with speech bubble */}
      <div className="moz-companion-scene">
        <div className="moz-companion-character-wrap">
          <img
            src="/mascot_emotions/14_jogging_running.webp"
            alt="MOZ character walking happily"
            className="moz-walking-mascot-img"
          />
          <div className="moz-speech-bubble-sticker">
            <span>Small steps. Big you.</span>
          </div>
        </div>
        <div className="moz-companion-worlds-preview">
          <img
            src="/assets/companion-worlds.png"
            alt="Unlock new worlds: Green meadows, Desert oasis, Sunset city"
            className="moz-worlds-img"
          />
        </div>
      </div>
    </div>
  );
}
