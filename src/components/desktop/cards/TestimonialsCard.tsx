
export default function TestimonialsCard() {
  const reviews = [
    {
      avatar: "/mascot_emotions/33_cozy_hoodie.webp",
      quote: "“I actually sleep on time now.”",
      author: "College student",
    },
    {
      avatar: "/mascot_emotions/05_hugging_heart.webp",
      quote: "“My kids go outside again!”",
      author: "A parent",
    },
    {
      avatar: "/mascot_emotions/36_meditating_peaceful_zen.webp",
      quote: "“Helps me stay active every day.”",
      author: "A grandparent",
    },
  ];

  return (
    <div className="bento-card bento-card-light testimonials-card" id="reviews">
      <div className="testimonials-header">
        <h2 className="testimonials-title">Real people. Real change.</h2>
      </div>

      <div className="testimonials-row">
        {reviews.map((rev, i) => (
          <div key={i} className="testimonial-item">
            <div className="testimonial-avatar-wrap">
              <img
                src={rev.avatar}
                alt={rev.author}
                className="testimonial-avatar-img"
              />
            </div>
            <p className="testimonial-quote">{rev.quote}</p>
            <span className="testimonial-author">&mdash; {rev.author}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
