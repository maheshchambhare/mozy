
export default function PainSection() {
  const painPoints = [
    {
      badge: "The 5-Second Reflex",
      emoji: "🔁",
      title: "Closing an app, then reopening it 3 seconds later",
      description:
        "You consciously close Instagram. You lock your screen. Four seconds later, your thumb unlocks your phone and taps Instagram again without your brain even registering it.",
    },
    {
      badge: "The 2:14 AM Abyss",
      emoji: "🌙",
      title: "“Just 5 minutes before bed” turning into 2 hours",
      description:
        "One reel leads to twelve. Suddenly your eyes are burning, the room is pitch black, it’s 2:14 AM, and you haven’t moved an inch from your bed in three hours.",
    },
    {
      badge: "The ‘Ignore Limit’ Joke",
      emoji: "🤡",
      title: "Tapping “Ignore for 15 minutes” for the 8th time",
      description:
        "Standard Screen Time apps rely entirely on willpower. And when willpower is the only lock, tapping ‘Ignore Limit’ becomes an unconscious muscle memory reflex.",
    },
    {
      badge: "The Ghost Guilt",
      emoji: "🫠",
      title: "Looking up after losing half your afternoon",
      description:
        "That heavy, sluggish feeling when you finally put the phone down and realize you spent 3 hours consuming content you won't even remember tomorrow.",
    },
  ];

  return (
    <section className="mozy-section pain-section">
      <div className="container">
        <div className="section-header-center">
          <span className="mozy-eyebrow">· THE DOOMSCROLL TRAP ·</span>
          <h2 className="mozy-h2">
            You didn&apos;t mean to lose 2 hours. <br />
            <span className="text-highlight">It just happened.</span>
          </h2>
          <p className="mozy-subtext">
            The modern phone trap isn&apos;t a lack of discipline. It&apos;s that scrolling has zero immediate cost. When scrolling is free, algorithms win every single time.
          </p>
        </div>

        <div className="pain-grid">
          {painPoints.map((pain, idx) => (
            <div className="pain-card" key={idx}>
              <div className="pain-card-header">
                <span className="pain-emoji">{pain.emoji}</span>
                <span className="pain-badge">{pain.badge}</span>
              </div>
              <h3 className="pain-title">{pain.title}</h3>
              <p className="pain-desc">{pain.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
