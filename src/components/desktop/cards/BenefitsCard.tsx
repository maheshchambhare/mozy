
export default function BenefitsCard() {
  const benefits = [
    {
      id: "energy",
      icon: "⚡",
      iconClass: "icon-energy",
      title: "More energy",
      subtitle: "during the day",
    },
    {
      id: "sleep",
      icon: "🌙",
      iconClass: "icon-sleep",
      title: "Better sleep",
      subtitle: "at night",
    },
    {
      id: "focus",
      icon: "🎯",
      iconClass: "icon-focus",
      title: "Improved focus",
      subtitle: "and productivity",
    },
    {
      id: "progress",
      icon: "❤️",
      iconClass: "icon-progress",
      title: "Real progress",
      subtitle: "in the real world",
    },
  ];

  return (
    <div className="bento-card bento-card-dark benefits-card">
      <div className="benefits-header">
        <h2 className="benefits-title">
          Not just restriction. <br />
          A better life.
        </h2>
      </div>

      <div className="benefits-grid-2x2">
        {benefits.map((item) => (
          <div key={item.id} className="benefit-tile">
            <div className={`benefit-icon-badge ${item.iconClass}`}>
              <span className="benefit-emoji">{item.icon}</span>
            </div>
            <div className="benefit-text">
              <span className="benefit-item-title">{item.title}</span>
              <span className="benefit-item-sub">{item.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
