import { useCtaAttributes, useStoreHref } from '../../hooks/usePlatform';
import { Footprints } from './icons';

/** Sticky bar that counts the scroll as steps (34 = 1 min) and doubles as the "Get Mozy" button. */
export function StepHud() {
  const cta = useStoreHref('LANDING-STICKY', '#get');
  const ctaAttributes = useCtaAttributes('LANDING-STICKY');
  return (
    <div className="st-hud" data-hud>
      <Footprints size={22} color="#FF9A4D" />
      <p><strong data-hud-steps>0</strong><span className="st-hud-label">steps scrolled</span><span className="st-hud-arrow" aria-hidden="true">→</span><strong className="st-hud-min" data-hud-min>0 min</strong></p>
      <a className="st-hud-cta" href={cta} {...ctaAttributes}>Get Mozy</a>
    </div>
  );
}
