import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type SceneContext = {
  root: HTMLElement;
  /** Scoped query, like gsap.utils.selector(root). */
  select: (query: string) => HTMLElement[];
  first: <T extends Element = HTMLElement>(query: string) => T | undefined;
  desktop: boolean;
  /** False when the visitor prefers reduced motion: change text and state, never move things. */
  motion: boolean;
};

/**
 * Runs one landing-page scene's ScrollTrigger setup inside gsap.matchMedia, re-running it when the
 * layout breakpoint or reduced-motion preference changes and reverting everything on unmount.
 * `setup` must be a stable (module-level) function; it may return a cleanup.
 */
export function useScene(root: RefObject<HTMLElement | null>, setup: (scene: SceneContext) => void | (() => void)) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 861px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      const { desktop, motion } = context.conditions as { desktop: boolean; motion: boolean };
      const select = gsap.utils.selector(element) as (query: string) => HTMLElement[];
      const first = <T extends Element = HTMLElement>(query: string) => element.querySelector<T>(query) ?? undefined;
      return setup({ root: element, select, first, desktop, motion });
    }, element);
    return () => media.revert();
  }, [root, setup]);
}
