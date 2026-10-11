
export default function TransformationCard() {
  return (
    <div className="bento-card bento-card-light transformation-card">
      <div className="transformation-header">
        <h2 className="transformation-title">
          A small change. <br />
          A much better you.
        </h2>
      </div>

      {/* 3 Mascots Progression */}
      <div className="transformation-visual-wrapper">
        <div className="transformation-mascots-row">
          <div className="transform-mascot-item">
            <img src="/mascot_emotions/08_focused_phone.webp" alt="Mindless scrolling" className="transform-mascot-img" />
          </div>
          <div className="transformation-arrow">&rarr;</div>
          <div className="transform-mascot-item">
            <img src="/mascot_emotions/14_jogging_running.webp" alt="More movement" className="transform-mascot-img" />
          </div>
          <div className="transformation-arrow">&rarr;</div>
          <div className="transform-mascot-item">
            <img src="/mascot_emotions/02_winking_thumbs_up.webp" alt="Healthier happier you" className="transform-mascot-img" />
          </div>
        </div>

        {/* Captions matching reference */}
        <div className="transformation-captions-row">
          <div className="transformation-caption-col">
            <span className="caption-bold">Less mindless</span>
            <span className="caption-sub">scrolling</span>
          </div>

          <div className="transformation-arrow">&rarr;</div>

          <div className="transformation-caption-col">
            <span className="caption-bold">More</span>
            <span className="caption-sub">movement</span>
          </div>

          <div className="transformation-arrow">&rarr;</div>

          <div className="transformation-caption-col">
            <span className="caption-bold">A healthier,</span>
            <span className="caption-sub">happier you.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
