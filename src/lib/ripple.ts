import gsap from 'gsap';

/*
 * Water-ripple screen transitions. A layer is uncovered with a growing clip-path circle (rippleIn) or opened
 * from the middle with a growing transparent hole in a CSS mask (rippleOut). An SVG of rings rides the edge:
 * ring 0 is the bright wave front, locked to the edge; the others trail behind it like ripples on a pond.
 * The rings SVG holds <g class="st-ring"> groups of two circles (a soft wide glow and a thin bright crest).
 */

export type Point = { x: number; y: number };

/** Distance from a point to the farthest screen corner, so a circle of this radius covers the screen. */
export function coverRadius({ x, y }: Point) {
  const width = window.innerWidth, height = window.innerHeight;
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 32;
}

export function centerOf(element: Element | null | undefined): Point {
  if (!element) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function ringsOf(svg: SVGSVGElement | null) {
  if (!svg) return [];
  svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  return [...svg.querySelectorAll<SVGGElement>('.st-ring')];
}

function placeRings(rings: SVGGElement[], { x, y }: Point) {
  rings.forEach(ring => ring.querySelectorAll('circle').forEach(circle => { circle.setAttribute('cx', String(x)); circle.setAttribute('cy', String(y)); circle.setAttribute('r', '0'); }));
  gsap.set(rings, { opacity: 0 });
}

/** Rings for an edge that grows from 0 to `radius`: the front is locked to the edge, the rest trail behind. */
function addRings(timeline: gsap.core.Timeline, rings: SVGGElement[], radius: number, duration: number, offset: number, ease: string) {
  rings.forEach((ring, index) => {
    const circles = ring.querySelectorAll('circle');
    const lag = index * 0.11;
    const reach = index === 0 ? radius : radius * (0.86 - index * 0.14);
    timeline.set(ring, { opacity: index === 0 ? 1 : 0.75 - index * 0.15 }, offset + lag);
    timeline.to(circles, { attr: { r: reach }, duration: duration + lag * 0.6, ease }, offset + lag);
    timeline.to(ring, { opacity: 0, duration: duration * 0.35, ease: 'power1.in' }, offset + lag + duration * 0.7);
  });
}

/** Covers the screen with `layer`, growing from `origin` like a drop hitting water. */
export function rippleIn(layer: HTMLElement, svg: SVGSVGElement | null, origin: Point, duration = 0.72) {
  const radius = coverRadius(origin);
  const rings = ringsOf(svg);
  placeRings(rings, origin);
  const at = `${origin.x}px ${origin.y}px`;
  layer.classList.remove('is-revealing');
  const timeline = gsap.timeline();
  timeline.set(layer, { visibility: 'visible', opacity: 1, clipPath: `circle(0px at ${at})`, '--hole': '0px' });
  timeline.to(layer, { clipPath: `circle(${radius}px at ${at})`, duration, ease: 'power3.inOut' }, 0);
  addRings(timeline, rings, radius, duration, 0, 'power3.inOut');
  timeline.set(layer, { clipPath: 'none' });
  return timeline;
}

/** Shrinks `layer` back into `origin` (closing the menu the way it opened). */
export function rippleBack(layer: HTMLElement, origin: Point, duration = 0.55) {
  const radius = coverRadius(origin);
  const at = `${origin.x}px ${origin.y}px`;
  const timeline = gsap.timeline();
  timeline.fromTo(layer, { clipPath: `circle(${radius}px at ${at})` }, { clipPath: `circle(0px at ${at})`, duration, ease: 'power3.inOut' });
  timeline.set(layer, { visibility: 'hidden', clipPath: 'none' });
  return timeline;
}

/** Opens a hole in `layer` from `origin` outwards, so the page underneath appears as a spreading ripple. */
export function rippleOut(layer: HTMLElement, svg: SVGSVGElement | null, origin: Point, duration = 0.8) {
  const radius = coverRadius(origin) + 60;
  const rings = ringsOf(svg);
  placeRings(rings, origin);
  const timeline = gsap.timeline();
  // The mask edge is feathered, so the hole starts below zero (fully opaque) and only appears once this plays.
  timeline.call(() => {
    layer.style.setProperty('--hx', `${origin.x}px`);
    layer.style.setProperty('--hy', `${origin.y}px`);
    layer.style.setProperty('--hole', '-100px');
    layer.classList.add('is-revealing');
  }, [], 0);
  timeline.fromTo(layer, { '--hole': '-100px' }, { '--hole': `${radius}px`, duration, ease: 'power3.inOut', immediateRender: false }, 0);
  addRings(timeline, rings, radius, duration, 0.02, 'power3.inOut');
  timeline.add(() => { layer.classList.remove('is-revealing'); gsap.set(layer, { visibility: 'hidden', '--hole': '0px' }); });
  return timeline;
}

/** Reduced-motion stand-ins: a quick fade, no movement. */
export const fadeIn = (layer: HTMLElement) => gsap.timeline().set(layer, { visibility: 'visible', clipPath: 'none', opacity: 0 }).to(layer, { opacity: 1, duration: 0.18 });
export const fadeOut = (layer: HTMLElement) => gsap.timeline().to(layer, { opacity: 0, duration: 0.22 }).set(layer, { visibility: 'hidden', opacity: 1 });
