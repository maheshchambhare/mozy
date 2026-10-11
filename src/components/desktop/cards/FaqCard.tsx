import { useState } from "react";

export default function FaqCard() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does MOZY track my steps?",
      answer:
        "MOZY uses your phone's built-in hardware pedometer sensor (CoreMotion on iOS and Android Step Sensor). It operates 100% offline with virtually zero battery drain and never uses GPS tracking.",
    },
    {
      question: "Which apps can I block?",
      answer:
        "You can control any app on your phone, including Instagram, TikTok, YouTube, Reddit, X (Twitter), Snapchat, Netflix, and any browser or custom game.",
    },
    {
      question: "Is my data safe?",
      answer:
        "Yes, 100%. MOZY operates completely on-device. There are no cloud accounts, no data selling, no analytics tracking, and no external servers storing your activity.",
    },
    {
      question: "Does it work on iOS and Android?",
      answer:
        "Yes, MOZY is natively available for both iPhone (iOS 16+) and Android devices via the App Store and Google Play.",
    },
    {
      question: "What is the step exchange rate?",
      answer:
        "MOZY converts physical movement at a fixed rate of 34 steps for every 1 minute of screen time. This rate is fixed on-device to build a consistent, predictable daily habit.",
    },
    {
      question: "Is MOZY free to use?",
      answer:
        "MOZY is free to download on iOS and Android with a full 7-day free trial. Ongoing access is available as a monthly ($4.99/mo) or annual ($29.99/yr) subscription.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="bento-card bento-card-light faq-card" id="faq">
      <div className="faq-card-header">
        <h2 className="faq-title">Frequently asked questions</h2>
        <a href="#faq" className="faq-view-all-link">
          View all
        </a>
      </div>

      <div className="faq-accordion-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className={`faq-accordion-item ${isOpen ? "faq-open" : ""}`}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
