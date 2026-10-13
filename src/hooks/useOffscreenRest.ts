import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Lets the chapters that are off screen rest. Their CSS loops (twinkling stars, birds, Moz idling) pause, and once the
 * page has rendered in full with its web fonts, the browser may skip the chapters' style, layout and paint as well
 * (`content-visibility: auto` in story.css; the footer only pauses). Every chapter used to run all of that on every frame, which phones
 * could not keep up with while scrolling.
 */
export function useOffscreenRest(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const parts = [...element.querySelectorAll<HTMLElement>(':scope > main > *, :scope > footer')];
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      for (const entry of entries) entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
    }, { rootMargin: '50% 0px' });
    for (const part of parts) observer?.observe(part);
    // Each chapter's height is remembered from this first full render (contain-intrinsic-size: auto), so skipping a
    // chapter later never changes the page's height. Two frames let that render and the remembering happen first.
    let disposed = false;
    let frame = 0;
    void document.fonts.ready.then(() => {
      if (disposed) return;
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => element.classList.add('is-settled')); });
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      element.classList.remove('is-settled');
      for (const part of parts) part.classList.remove('is-offscreen');
    };
  }, [root]);
}
