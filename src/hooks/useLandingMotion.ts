import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STEPS_PER_MINUTE = 34;
const format = (value: number) => Math.round(value).toLocaleString('en-US');

/**
 * Page-level motion for the scroll story: the sticky step counter, gentle reveals and depth drift.
 * Each chapter runs its own scene through useScene. The step counter only changes text, so it also
 * runs with reduced motion; reveals and drift are skipped then.
 */
export function useLandingMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const element = root.current;
    const media = gsap.matchMedia();
    let disposed = false;
    media.add({ desktop: '(min-width: 861px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      const { desktop, motion } = context.conditions as { desktop: boolean; motion: boolean };
      const select = gsap.utils.selector(element);
      const first = (query: string) => select(query)[0] as HTMLElement | undefined;

      // The whole page counts as a 10,200-step walk; the bar appears once the hero buttons scroll away.
      const hud = first('[data-hud]');
      const hudSteps = first('[data-hud-steps]');
      const hudMinutes = first('[data-hud-min]');
      const heroBadges = first('.st-hero-badges');
      let hudThreshold = 0;
      const renderHud = (self: ScrollTrigger) => {
        const steps = 10200 * self.progress;
        if (hudSteps) hudSteps.textContent = format(steps);
        if (hudMinutes) hudMinutes.textContent = `${Math.floor(steps / STEPS_PER_MINUTE)} min`;
        hud?.classList.toggle('is-visible', self.scroll() > hudThreshold);
      };
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: renderHud,
        onRefresh: self => {
          hudThreshold = heroBadges ? heroBadges.getBoundingClientRect().bottom + window.scrollY : 0;
          renderHud(self);
        },
      });
      // Step aside while the final store buttons are on screen, so two calls to action never overlap.
      const finalActions = first('.st-final-actions');
      if (finalActions) ScrollTrigger.create({ trigger: finalActions, start: 'top bottom', end: 'bottom top', onToggle: self => hud?.classList.toggle('is-tucked', self.isActive) });
      // The walk has its own step counter; two different counts on screen read as a contradiction.
      const walk = first('#walk');
      if (walk) ScrollTrigger.create({ trigger: walk, start: 'top 60%', end: 'bottom 40%', onToggle: self => hud?.classList.toggle('is-aside', self.isActive) });

      if (!motion) return;

      // Layers drift at their own depth (positive = slower than the page, negative = faster).
      for (const node of select('[data-depth]') as HTMLElement[]) {
        const depth = Number(node.dataset.depth) * (desktop ? 1 : 0.5);
        gsap.fromTo(node, { y: depth }, { y: -depth, ease: 'none', scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      }
      for (const node of select('.st-reveal') as HTMLElement[]) {
        gsap.fromTo(node, { y: desktop ? 48 : 24, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: node, start: 'clamp(top 94%)', end: 'clamp(top 68%)', scrub: 0.6 } });
      }
      // Keyboard focus always brings revealed content to full contrast immediately.
      const onFocus = (event: FocusEvent) => {
        const revealed = (event.target as HTMLElement).closest<HTMLElement>('.st-reveal');
        if (revealed) gsap.to(revealed, { opacity: 1, y: 0, duration: 0.15, overwrite: 'auto' });
      };
      element.addEventListener('focusin', onFocus);
      return () => element.removeEventListener('focusin', onFocus);
    }, element);
    // Fonts and opening FAQ answers change section heights; never refresh after unmount.
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    let refreshFrame = 0;
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); });
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(element);
    element.addEventListener('toggle', refresh, true);
    return () => {
      disposed = true;
      element.removeEventListener('toggle', refresh, true);
      observer.disconnect();
      cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, [root]);
}
