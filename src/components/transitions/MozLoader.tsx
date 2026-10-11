import type { Ref } from 'react';
import { Moz } from '../story/Moz';

/** Moz walking in place on a little pond, with ripples spreading from his feet. Used between pages. */
export function MozLoader({ label, className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`st-loader ${className}`}>
      <div className="st-loader-pond" aria-hidden="true">
        <span className="st-loader-wave" />
        <span className="st-loader-wave is-b" />
        <span className="st-loader-wave is-c" />
        <div className="st-loader-moz is-walking"><Moz mood="walk" className="st-loader-mozart" /></div>
      </div>
      {label ? <p className="st-loader-label">Walking to <b>{label}</b></p> : null}
    </div>
  );
}

/** The ring layer the ripple helpers animate: each ring is a soft glow plus a thin bright crest. */
export function RippleRings({ className = '', count = 3, ref }: { className?: string; count?: number; ref?: Ref<SVGSVGElement> }) {
  return (
    <svg ref={ref} className={`st-rings ${className}`} aria-hidden="true" preserveAspectRatio="none">
      {Array.from({ length: count }, (_, index) => (
        <g className="st-ring" key={index}>
          <circle className="st-ring-glow" r="0" />
          <circle className="st-ring-crest" r="0" />
        </g>
      ))}
    </svg>
  );
}
