
export default function WhyItWorksCard() {
  const traditionalPoints = [
    "Rely on willpower",
    "Easy to ignore",
    "Feel like punishment",
    "No motivation",
  ];

  const mozyPoints = [
    "Turns screen time into a reward",
    "Makes movement fun",
    "Feels positive, not restrictive",
    "Builds real habits",
  ];

  return (
    <div className="bento-card bento-card-dark why-it-works-card" id="difference">
      <div className="why-it-works-header">
        <h2 className="why-it-works-title">Why this actually works.</h2>
      </div>

      <div className="why-comparison-columns">
        {/* Traditional Blockers Column */}
        <div className="comparison-col col-traditional">
          <h3 className="col-heading text-muted">Traditional blockers</h3>
          <ul className="comparison-list">
            {traditionalPoints.map((pt, i) => (
              <li key={i} className="comparison-item item-traditional">
                <span className="comp-cross-icon">&times;</span>
                <span className="comp-text">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* MOZY Column */}
        <div className="comparison-col col-mozy">
          <h3 className="col-heading text-green">MOZY</h3>
          <ul className="comparison-list">
            {mozyPoints.map((pt, i) => (
              <li key={i} className="comparison-item item-mozy">
                <span className="comp-check-icon">&check;</span>
                <span className="comp-text">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
