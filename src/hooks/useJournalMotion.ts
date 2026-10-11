import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export function useJournalMotion(root: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(root.current);
      // The "story isn't here" fallback has no heading block, so only animate what exists.
      const heading = select('.journal-heading');
      if (heading.length) gsap.fromTo(heading, { y: 20, opacity: .5 }, { y: 0, opacity: 1, duration: .6, ease: 'power2.out' });
      select('.journal-card, .reader-section').forEach((element: HTMLElement) => {
        gsap.fromTo(element, { y: 24, opacity: .5 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 96%', once: true } });
      });
    }, root.current);
    return () => media.revert();
  }, [root, key]);
}
