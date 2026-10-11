import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The looping timeline (about 10.5 s). Call inside a scene with motion allowed; it pauses while the hero is off screen.
 */
export function playDoomscroll(screen: HTMLElement, hero: HTMLElement, buzz?: HTMLElement | null) {
  const q = gsap.utils.selector(screen);
  const one = (selector: string) => q(selector)[0] as HTMLElement | undefined;
  const track = one('.st-doom-track');
  const touch = one('.st-doom-touch');
  const chip = one('.st-doom-chip');
  const left = one('[data-doom-left]');
  const sheet = one('.st-doom-sheet');
  const mozWrap = one('.st-doom-moz');
  const lock = one('.st-doom-lock');
  if (!track || !touch || !chip || !left || !sheet || !mozWrap || !lock) return;
  const reelShift = (index: number, extra = 0) => -(100 / 6) * index - extra;
  const balance = { seconds: 45 };
  const showBalance = () => { left.textContent = `0:${String(Math.ceil(balance.seconds)).padStart(2, '0')}`; };

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });
  // First frame: the feed, playing. (The loop ends on black and fades back in here.)
  tl.call(() => { screen.classList.remove('is-frozen'); balance.seconds = 45; showBalance(); }, [], 0)
    .fromTo(one('.st-doom-fade') ?? [], { opacity: 1 }, { opacity: 0, duration: 0.45, ease: 'power1.out' }, 0)
    .set(track, { yPercent: 0 }, 0)
    .set([sheet], { yPercent: 115, y: 0 }, 0)
    .set([mozWrap], { opacity: 0, scale: 0.3, y: 70, rotation: 0, transformOrigin: '50% 100%' }, 0)
    .set(q('.st-doom-in'), { opacity: 0, y: 12 }, 0)
    .set(q('.st-doom-dim'), { opacity: 0 }, 0)
    .set(lock, { opacity: 0, scale: 0.2, y: 0 }, 0)
    .set(chip, { x: 0, color: '#fff', borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(16,20,38,0.72)' }, 0)
    .set(q('.st-doom-label.is-start'), { opacity: 1 }, 0)
    .set(q('.st-doom-label.is-go'), { opacity: 0 }, 0)
    .set(q('.st-reel-like.is-likeable .is-on'), { opacity: 0, scale: 0.4 }, 0)
    .set(q('.st-reel-like.is-likeable .is-off'), { opacity: 1 }, 0);

  // The balance drains while the thumb keeps going, faster and faster.
  tl.to(balance, { seconds: 0, duration: 3.9, ease: 'power1.in', onUpdate: showBalance }, 0.2);
  const swipe = (at: number, index: number, duration: number) => {
    tl.fromTo(touch, { opacity: 0, x: 18, y: 470, scale: 1 }, { opacity: 1, duration: 0.1, ease: 'none' }, at)
      .to(touch, { x: -6, y: 180, duration: duration * 0.8, ease: 'power2.in' }, at + 0.06)
      .to(touch, { opacity: 0, duration: 0.12, ease: 'none' }, at + duration * 0.8)
      .to(track, { yPercent: reelShift(index), duration, ease: 'power3.out' }, at + 0.14);
  };
  swipe(0.7, 1, 0.55);
  // A double tap on the beat drop: like.
  tl.fromTo(touch, { opacity: 0, x: 0, y: 300, scale: 1 }, { opacity: 1, duration: 0.08, ease: 'none' }, 1.45)
    .to(touch, { scale: 0.75, duration: 0.07, yoyo: true, repeat: 3, ease: 'power1.inOut' }, 1.5)
    .to(touch, { opacity: 0, duration: 0.12 }, 1.82)
    .fromTo(one('.st-doom-heart') ?? [], { opacity: 0, scale: 0.2, y: 0, rotation: -12 }, { opacity: 1, scale: 1.15, rotation: 0, duration: 0.28, ease: 'back.out(3)' }, 1.62)
    .to(one('.st-doom-heart') ?? [], { opacity: 0, scale: 1.3, y: -60, duration: 0.45, ease: 'power1.in' }, 2.05)
    .to(q('.st-reel-like.is-likeable .is-off'), { opacity: 0, duration: 0.1 }, 1.7)
    .to(q('.st-reel-like.is-likeable .is-on'), { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, 1.7);
  swipe(2.35, 2, 0.45);
  swipe(2.95, 3, 0.38);
  swipe(3.45, 4, 0.32);

  // 0:00. The chip turns red and buzzes.
  tl.to(chip, { color: '#ffb3b5', borderColor: 'rgba(255,90,95,0.8)', backgroundColor: 'rgba(120,20,30,0.78)', duration: 0.2 }, 4.1)
    .to(chip, { x: 5, duration: 0.05, yoyo: true, repeat: 5, ease: 'none' }, 4.15)
    .set(chip, { x: 0 }, 4.45);
  // One more swipe... the feed bounces back. The phone buzzes.
  tl.fromTo(touch, { opacity: 0, x: 18, y: 470 }, { opacity: 1, duration: 0.1, ease: 'none' }, 4.4)
    .to(touch, { x: 4, y: 300, duration: 0.3, ease: 'power2.in' }, 4.46)
    .to(touch, { opacity: 0, duration: 0.15 }, 4.75)
    .to(track, { yPercent: reelShift(4, 3.2), duration: 0.22, ease: 'power2.out' }, 4.5)
    .to(track, { yPercent: reelShift(4), duration: 0.7, ease: 'elastic.out(1, 0.35)' }, 4.72);
  if (buzz) tl.to(buzz, { x: 3, duration: 0.045, yoyo: true, repeat: 7, ease: 'none' }, 4.72).set(buzz, { x: 0 }, 5.1);

  // Freeze, dim, and the padlock snaps shut.
  tl.call(() => screen.classList.add('is-frozen'), [], 4.95)
    .to(q('.st-doom-dim'), { opacity: 1, duration: 0.35, ease: 'power1.out' }, 4.95)
    .to(lock, { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(2.6)' }, 5.05)
    .fromTo(q('.st-doom-shackle'), { y: -7 }, { y: 0, duration: 0.16, ease: 'power4.in' }, 5.45)
    .to(lock, { scale: 0.9, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 5.6)
    .fromTo(q('.st-doom-ring'), { opacity: 0.8, scale: 1 }, { opacity: 0, scale: 2.1, duration: 0.6, ease: 'power2.out' }, 5.6);

  // Moz rises on the lock sheet: "no".
  tl.to(lock, { opacity: 0, scale: 0.6, y: -50, duration: 0.3, ease: 'power2.in' }, 6.05)
    .to(sheet, { yPercent: 0, duration: 0.6, ease: 'back.out(1.3)' }, 6.1)
    .to(mozWrap, { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(2.2)' }, 6.3)
    .to(q('.st-doom-in'), { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 6.45);
  // The thumb tries to swipe it away; Moz shakes his head and the sheet holds.
  tl.fromTo(touch, { opacity: 0, x: 10, y: 470, scale: 1 }, { opacity: 1, duration: 0.1, ease: 'none' }, 7.5)
    .to(touch, { x: 0, y: 300, duration: 0.35, ease: 'power2.in' }, 7.56)
    .to(touch, { opacity: 0, duration: 0.15 }, 7.92)
    .to(sheet, { y: -14, duration: 0.2, ease: 'power2.out' }, 7.6)
    .to(sheet, { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 7.8)
    .to(mozWrap, { keyframes: [{ rotation: -9, duration: 0.11 }, { rotation: 9, duration: 0.14 }, { rotation: -6, duration: 0.12 }, { rotation: 4, duration: 0.1 }, { rotation: 0, duration: 0.1 }] }, 7.75);
  // A tap on Start walking.
  tl.fromTo(touch, { opacity: 0, x: 0, y: 562, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, 8.75)
    .to(touch, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, 8.95)
    .to(q('.st-doom-button'), { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, 8.95)
    .to(touch, { opacity: 0, duration: 0.2 }, 9.2)
    .to(q('.st-doom-label.is-start'), { opacity: 0, duration: 0.15 }, 9.1)
    .to(q('.st-doom-label.is-go'), { opacity: 1, duration: 0.2 }, 9.15)
    .to(one('.st-doom-fade') ?? [], { opacity: 1, duration: 0.45, ease: 'power1.in' }, 10.05);

  // Only play while the hero is on screen; CSS loops inside the clips pause with it.
  ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: self => {
      screen.classList.toggle('is-paused', !self.isActive);
      if (self.isActive) tl.resume();
      else tl.pause();
    },
  });
  return tl;
}
