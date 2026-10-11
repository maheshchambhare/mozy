
export default function ReviewsSection() {
  const realOutcomes = [
    {
      quote:
        "I walked 4,200 steps before dinner just to watch a YouTube video. It sounds funny until you realize I used to watch 3 hours lying in bed for free. Now I feel energized and sleep way earlier.",
      name: "Alex K.",
      role: "Product Designer · 10k daily steps with Mozy",
    },
    {
      quote:
        "The ‘Ignore Limit’ button ruined every other blocker for three years. MOZ doesn't have an ignore button. When my balance hits 00:00, I literally have to put my shoes on and walk.",
      name: "Maya T.",
      role: "Medical Student · Broke the 2 AM Instagram loop",
    },
    {
      quote:
        "Cut 1 hour 45 minutes off my daily screen time in week one. My legs are getting exercise and my brain feels unclogged. Earning screen time makes scrolling feel intentional again.",
      name: "David S.",
      role: "Software Engineer · Using Mozy daily",
    },
  ];

  return (
    <section className="mozy-section reviews-section">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· REAL HUMANS ·</span>
          <h2 className="mozy-h2">
            What happens when scrolling isn&apos;t free anymore.
          </h2>
          <p className="mozy-subtext">
            Real outcomes from people who replaced endless willpower struggles with step currency.
          </p>
        </div>

        <div className="reviews-grid">
          {realOutcomes.map((item, idx) => (
            <div className="testimonial-card" key={idx}>
              <div className="testimonial-stars">★★★★★</div>
              <blockquote className="testimonial-quote">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="testimonial-divider" />
              <cite className="testimonial-name">{item.name}</cite>
              <div className="testimonial-detail">{item.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
