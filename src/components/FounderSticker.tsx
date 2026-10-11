import { useEffect, useRef, type CSSProperties } from 'react';
import { founderSticker } from '../data/founder';

/** Mahesh peeking over the footer's bottom line: he rises into view, sways, blinks, and his doodle marks pop. */
export function FounderSticker() {
  const root = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const element = root.current;
    // Without JavaScript or with reduced motion he simply sits there; the rise only plays when it can animate.
    if (!element || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    element.classList.add('is-armed');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.classList.add('is-in');
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const { src, width, height, viewBox, lid, marks } = founderSticker;
  return (
    <a ref={root} className="st-founder" href="https://mcrudra.com/" aria-label="Mahesh Chambhare, founder of mcrudra.com" style={{ '--founder-ratio': height / width } as CSSProperties}>
      <span className="st-founder-bubble" aria-hidden="true">Hi, I’m Mahesh. I make Mozy.</span>
      <span className="st-founder-window" aria-hidden="true">
        <span className="st-founder-rise">
          <span className="st-founder-tilt">
            <img src={src} width={width} height={height} alt="" loading="lazy" decoding="async" />
            <svg className="st-founder-overlay" viewBox={viewBox}>
              {lid ? (
                <g className="st-founder-lid" style={{ transformOrigin: `${lid.origin.x}px ${lid.origin.y}px` }}>
                  <path d={lid.d} fill={lid.fill} />
                  <path d={lid.lash} fill="none" stroke="#141413" strokeWidth={lid.lashWidth} strokeLinecap="round" />
                </g>
              ) : null}
              {marks.map((group, index) => (
                <g key={index} className={`st-founder-mark is-${index ? 'b' : 'a'}`} strokeWidth={group.width}>
                  {group.ticks.map((d, tick) => <path key={d} d={d} style={{ '--tick': tick } as CSSProperties} />)}
                </g>
              ))}
            </svg>
          </span>
        </span>
      </span>
    </a>
  );
}
