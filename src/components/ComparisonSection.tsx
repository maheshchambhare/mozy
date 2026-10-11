
export default function ComparisonSection() {
  const comparisons = [
    {
      feature: "Enforcement Mechanism",
      mozy: "Physical Currency (Must walk steps to fund minutes)",
      others: "Tappable Warnings (“Ignore for 15 Min” button)",
    },
    {
      feature: "Willpower Required",
      mozy: "Zero willpower (Phone physically charges you in steps)",
      others: "100% willpower (You have to manually choose to stop)",
    },
    {
      feature: "Psychological Loop",
      mozy: "Movement-positive (Every step gives guilt-free scroll)",
      others: "Guilt & restriction (Constant nagging and failure)",
    },
    {
      feature: "Hardware Pedometer",
      mozy: "Built-in motion sensor (Near 0% battery, no GPS)",
      others: "None or heavy battery-draining location services",
    },
    {
      feature: "Data Privacy",
      mozy: "100% On-Device & Offline (Zero cloud accounts)",
      others: "Requires cloud login, data uploads & analytics",
    },
  ];

  return (
    <section className="mozy-section comparison-section" id="difference">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· WHY NORMAL BLOCKERS FAIL ·</span>
          <h2 className="mozy-h2">
            Warnings depend on willpower. <br />
            <span className="text-highlight">MOZY changes the rules.</span>
          </h2>
          <p className="mozy-subtext">
            Every other app blocker makes you feel like a toddler being punished. MOZY makes you a buyer who earns their minutes.
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Mechanism</th>
                <th>MOZY (Step Currency)</th>
                <th>Standard Screen Time Apps</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, idx) => (
                <tr key={idx}>
                  <td className="table-feature">{row.feature}</td>
                  <td className="table-mozy">
                    <span className="comparison-check">✓ {row.mozy}</span>
                  </td>
                  <td className="table-others">
                    <span className="comparison-cross">✗ {row.others}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="comparison-mobile-list">
          {comparisons.map((row, idx) => (
            <div key={idx} className="comparison-mobile-card">
              <h4 className="comparison-card-title">{row.feature}</h4>
              <div className="comparison-card-grid">
                <div className="comparison-card-col mozy-col">
                  <span className="col-label">MOZY</span>
                  <span className="col-value comparison-check">{row.mozy}</span>
                </div>
                <div className="comparison-card-col other-col">
                  <span className="col-label">STANDARD BLOCKERS</span>
                  <span className="col-value comparison-cross">{row.others}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
