import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '../../hooks/useScene';
import type { SceneContext } from '../../hooks/useScene';
import { AppTile } from './AppTile';
import type { AppName } from './AppTile';
import { Footprints, Lock } from './icons';
import { Moz } from './Moz';
import { PhoneFrame } from './Phone';
import '../../story-how.css';

const steps = [
  { title: 'Pick what steals your evenings.', copy: 'Instagram, TikTok, YouTube, a game, anything on your phone. You choose which apps Mozy guards.' },
  { title: 'Spend your minutes. Watch them run down.', copy: 'While you use those apps, your earned minutes tick down. Mozy shows what you earned, spent and have left.' },
  { title: 'At 00:00, they lock.', copy: 'When the balance runs out, the apps you picked lock automatically. Moz holds up a hand: payment declined, go walk.' },
];

const apps: [AppName, string, boolean][] = [['instagram', 'Instagram', true], ['tiktok', 'TikTok', true], ['youtube', 'YouTube', true], ['x', 'X', false], ['games', 'Games', false]];
const guarded: AppName[] = ['instagram', 'tiktok', 'youtube'];

// Timeline marks (seconds) for the looping phone demo: where each step starts, and when the loop ends.
const STEP_AT = [0, 3.8, 9.6];
const LOOP_END = 14.9;
const TAPS = [0.85, 1.65, 2.45];
const RING = 2 * Math.PI * 74;

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.ceil(seconds - 0.001));
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
};

/** One timeline drives the phone; the step list, the notes and Moz follow `data-step` on the section. */
function howScene({ root, first, select, motion }: SceneContext) {
  if (!motion) return;
  const screen = first('.st-hw');
  const touch = first('.st-hw-touch');
  const toggles = select('.st-hw-toggle.is-guard');
  const badges = select('.st-hw-row .st-hw-badge');
  const count = first('[data-hw-count]');
  const done = first('.st-hw-done');
  const pick = first('.st-hw-pick');
  const meter = first('.st-hw-meter');
  const lock = first('.st-hw-lock');
  const arc = first<SVGCircleElement>('.st-hw-arc');
  const clockText = first('[data-hw-clock]');
  const spent = first('[data-hw-spent]');
  const left = first('[data-hw-left]');
  const usePill = first('.st-hw-use');
  const bars = select('.st-how-bar i');
  const buttons = select('.st-how-step button');
  if (!screen || !touch || !count || !done || !pick || !meter || !lock || !arc || !clockText || !spent || !left || !usePill) return;
  root.classList.add('is-animated');
  // The open step's copy differs in length, so the list (and the page) changed height every few seconds; each change
  // re-measured every ScrollTrigger. The list now keeps the height of its tallest state.
  const list = first('.st-how-steps');
  const reserve = () => {
    if (!list) return;
    const current = root.dataset.step ?? '0';
    list.style.minHeight = '';
    root.classList.add('is-measuring');
    let tallest = 0;
    for (const index of ['0', '1', '2']) { root.dataset.step = index; tallest = Math.max(tallest, list.offsetHeight); }
    root.dataset.step = current;
    void list.offsetHeight;
    root.classList.remove('is-measuring');
    list.style.minHeight = `${tallest}px`;
  };
  reserve();
  ScrollTrigger.addEventListener('refreshInit', reserve);
  const drain = { p: 0 };
  const ringColor = gsap.utils.interpolate(['#5cb83f', '#8cc63f', '#ffb03a', '#ff7a45', '#ff5a5f']);
  let step = -1;
  let lastCount = -1;
  let lastClock = '';

  const render = () => {
    const t = tl.time();
    const nextStep = t >= STEP_AT[2] ? 2 : t >= STEP_AT[1] ? 1 : 0;
    if (nextStep !== step) {
      step = nextStep;
      root.dataset.step = String(step);
      buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === step)));
    }
    const guardedCount = TAPS.filter(at => t >= at).length;
    if (guardedCount !== lastCount) { lastCount = guardedCount; count.textContent = String(guardedCount); }
    const remaining = 720 * (1 - drain.p);
    const text = clock(remaining);
    if (text !== lastClock) {
      lastClock = text;
      clockText.textContent = text;
      const used = Math.min(12, Math.round(12 * drain.p));
      spent.textContent = `${used}m`;
      left.textContent = `${12 - used}m`;
      usePill.classList.toggle('is-locked', drain.p >= 0.999);
    }
    arc.style.strokeDashoffset = String(RING * drain.p);
    arc.style.stroke = ringColor(Math.min(1, drain.p));
  };

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' }, onUpdate: () => render() });
  // First frame: the picker, nothing guarded yet. (The loop ends on black and fades in here.)
  tl.fromTo(first('.st-hw-fade') ?? [], { opacity: 1 }, { opacity: 0, duration: 0.4, ease: 'power1.out' }, 0)
    .set(pick, { xPercent: 0, filter: 'brightness(1)' }, 0)
    .set(meter, { xPercent: 104 }, 0)
    .set(lock, { opacity: 0, scale: 1.06 }, 0)
    .set(toggles, { '--on': 0 }, 0)
    .set(badges, { opacity: 0, scale: 0.3 }, 0)
    .set(done, { opacity: 0.4, scale: 1 }, 0)
    .set(select('.st-hw-toast'), { yPercent: -160, opacity: 0 }, 0)
    .set(select('.st-hw-meter .st-hw-badge'), { opacity: 0, y: -18, scale: 0.6 }, 0)
    .set(select('.st-hw-lock-in'), { opacity: 0, y: 14 }, 0)
    .set(first('.st-hw-lock-moz') ?? [], { opacity: 0, scale: 0.35, y: 40, transformOrigin: '50% 100%' }, 0)
    .set(first('.st-hw-lock .st-lock-button') ?? [], { boxShadow: '0 0 0 0 rgba(255,154,77,0)' }, 0)
    .fromTo(drain, { p: 0 }, { p: 0, duration: 0.01 }, 0);

  // Step 1: tap, tap, tap. Each toggle springs on and its app gets a lock badge.
  // Offsets are in the phone's own 278 x 618 screen space (the CSS scale doesn't change them).
  const centre = (element: HTMLElement | undefined, fallback: [number, number]) => element ? { x: element.offsetLeft + element.offsetWidth / 2, y: element.offsetTop + element.offsetHeight / 2 } : { x: fallback[0], y: fallback[1] };
  TAPS.forEach((at, index) => {
    const { x, y } = centre(toggles[index], [226, 190 + index * 58]);
    tl.to(touch, { opacity: 1, x, y, scale: 1, duration: index === 0 ? 0.35 : 0.3, ease: 'power2.out' }, at - 0.4)
      .to(touch, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1 }, at - 0.05)
      .to(toggles[index] ?? [], { '--on': 1, duration: 0.32, ease: 'back.out(2.2)' }, at)
      .to(badges[index] ?? [], { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, at + 0.08);
  });
  tl.to(done, { opacity: 1, duration: 0.25 }, 2.6)
    .to(touch, { ...centre(done, [222, 566]), duration: 0.4, ease: 'power2.out' }, 3.0)
    .to(touch, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1 }, 3.42)
    .to(done, { scale: 0.92, duration: 0.09, yoyo: true, repeat: 1 }, 3.42)
    .to(touch, { opacity: 0, duration: 0.2 }, 3.62)
    .set(touch, { x: 0, y: 0 }, 3.85);

  // Step 2: the meter runs while Instagram is open.
  tl.to(pick, { xPercent: -30, filter: 'brightness(0.75)', duration: 0.5, ease: 'power3.inOut' }, STEP_AT[1])
    .to(meter, { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, STEP_AT[1])
    // Eleven minutes go fast while scrolling; the last one slows down under the "1 minute left" toast.
    .to(drain, { p: 11 / 12, duration: 3.0, ease: 'power1.inOut' }, 4.4)
    .to(drain, { p: 1, duration: 1.2, ease: 'none' }, 7.4)
    .to(select('.st-hw-toast'), { yPercent: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' }, 7.35)
    .to(select('.st-hw-toast'), { yPercent: -160, opacity: 0, duration: 0.3, ease: 'power2.in' }, 8.75)
    .fromTo(arc, { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.06, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 8.62);
  select('.st-hw-meter .st-hw-badge').forEach((badge, index) => {
    tl.to(badge, { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'bounce.out' }, 8.8 + index * 0.15);
  });

  // Step 3: locked. Moz pops up and the walk button glows.
  tl.to(lock, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, STEP_AT[2])
    .to(first('.st-hw-lock-moz') ?? [], { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2.2)' }, 10.0)
    .to(select('.st-hw-lock-in'), { opacity: 1, y: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' }, 10.25)
    .to(first('.st-hw-lock .st-lock-button') ?? [], { boxShadow: '0 0 0 12px rgba(255,154,77,0)', duration: 0.9, repeat: 2, ease: 'power1.out', startAt: { boxShadow: '0 0 0 0 rgba(255,154,77,0.6)' } }, 11.2)
    .to(first('.st-hw-fade') ?? [], { opacity: 1, duration: 0.45, ease: 'power1.in' }, LOOP_END - 0.45);

  // Step progress bars, like stories.
  bars.forEach((bar, index) => {
    const end = index < 2 ? STEP_AT[index + 1] : LOOP_END;
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: end - STEP_AT[index], ease: 'none' }, STEP_AT[index]);
  });
  render();

  // The step buttons jump the demo to their step.
  const onJump = (event: Event) => {
    const index = (event as CustomEvent<number>).detail;
    tl.play(STEP_AT[index] + (index ? 0.001 : 0));
  };
  root.addEventListener('how-jump', onJump);
  // Only play while the section is on screen. onToggle only fires on a change, so the starting state is set here too:
  // the section starts below the fold, and the loop used to run (and resize the list) from the moment the page opened.
  const setPlaying = (playing: boolean) => {
    screen.classList.toggle('is-paused', !playing);
    if (playing) tl.resume();
    else tl.pause();
  };
  const visibility = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: self => setPlaying(self.isActive) });
  setPlaying(visibility.isActive);
  return () => {
    root.removeEventListener('how-jump', onJump);
    ScrollTrigger.removeEventListener('refreshInit', reserve);
    if (list) list.style.minHeight = '';
    root.classList.remove('is-animated', 'is-measuring');
  };
}

const arrow = (d: string) => <svg viewBox="0 0 80 50" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/** How it works: a step list beside a phone that plays the whole loop (pick, spend, lock) like a short film. */
export function HowChapter() {
  const root = useRef<HTMLElement>(null);
  useScene(root, howScene);
  const jump = (index: number) => {
    const section = root.current;
    if (!section) return;
    section.dataset.step = String(index);
    section.querySelectorAll('.st-how-step button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    section.dispatchEvent(new CustomEvent('how-jump', { detail: index }));
  };
  return (
    <section className="st-how" id="how" aria-labelledby="how-title" ref={root} data-step="0">
      <div className="st-how-grid">
        <div className="st-how-copy">
          <p className="st-how-eyebrow"><span />How it works</p>
          <h2 id="how-title" className="st-how-title">Pick the apps. <em>Mozy holds the keys.</em></h2>
          <p className="st-how-note">you opened Instagram for one reel… now it’s 2:17 AM</p>
          <ol className="st-how-steps">
            {steps.map((step, index) => (
              <li className="st-how-step" key={step.title} data-index={index}>
                <button type="button" aria-pressed={index === 0} onClick={() => jump(index)}>
                  <span className="st-how-num">0{index + 1}</span>
                  <span className="st-how-main">
                    <span className="st-how-step-title">{step.title}</span>
                    <span className="st-how-step-body"><span>{step.copy}</span></span>
                  </span>
                </button>
                <span className="st-how-bar" aria-hidden="true"><i /></span>
              </li>
            ))}
          </ol>
          <a className="st-how-next" href="#walk">Next: walk them back <span aria-hidden="true">↓</span></a>
        </div>

        <div className="st-how-art" aria-hidden="true">
          <div className="st-how-halo" />
          <div className="st-how-device">
            <div className="st-how-float">
              <PhoneFrame className="st-how-phone">
                <div className="st-hw">
                  <div className="st-hw-scene st-hw-pick">
                    <p className="st-screen-kicker">Apps on your phone</p>
                    <p className="st-screen-title">Choose what to block</p>
                    <ul className="st-hw-list">
                      {apps.map(([app, label, guard]) => (
                        <li key={app} className={`st-hw-row${guard ? ' is-guard' : ''}`}>
                          <span className="st-hw-icon"><AppTile app={app} size={34} />{guard ? <span className="st-hw-badge"><Lock size={9} /></span> : null}</span>
                          <span className="st-hw-label">{label}</span>
                          <span className={`st-hw-toggle${guard ? ' is-guard' : ''}`} />
                        </li>
                      ))}
                    </ul>
                    <div className="st-hw-foot">
                      <span><b data-hw-count>3</b> of 5 guarded</span>
                      <span className="st-hw-done">Done</span>
                    </div>
                  </div>

                  <div className="st-hw-scene st-hw-meter">
                    <p className="st-hw-toast"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M12 9v4l2.5 2M9 3h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" /></svg>1 minute left today</p>
                    <p className="st-screen-kicker">Screen time balance</p>
                    <div className="st-hw-ring">
                      <svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="74" className="st-hw-track" /><circle cx="90" cy="90" r="74" className="st-hw-arc" strokeDasharray={RING} /></svg>
                      <p><b data-hw-clock>12:00</b><span>left today</span></p>
                    </div>
                    <p className="st-hw-use"><AppTile app="instagram" size={22} /><span className="is-live"><i />Instagram · in use</span><span className="is-done">Instagram · locked</span></p>
                    <dl className="st-hw-stats">
                      <div><dt>Earned</dt><dd className="is-earned">12m</dd></div>
                      <div><dt>Spent</dt><dd className="is-spent" data-hw-spent>0m</dd></div>
                      <div><dt>Left</dt><dd data-hw-left>12m</dd></div>
                    </dl>
                    <div className="st-hw-guarded">
                      {guarded.map(app => <span key={app} className="st-hw-icon"><AppTile app={app} size={44} /><span className="st-hw-badge"><Lock size={11} /></span></span>)}
                    </div>
                  </div>

                  <div className="st-hw-scene st-hw-lock">
                    <p className="st-screen-kicker">Screen time balance</p>
                    <p className="st-hw-zero">00:00</p>
                    <div className="st-hw-chips">{guarded.map(app => <span key={app}><Lock size={13} /></span>)}</div>
                    <div className="st-hw-lock-moz"><Moz mood="stern" rim /></div>
                    <p className="st-hw-line st-hw-lock-in">Payment declined.<br />Go walk.</p>
                    <span className="st-lock-button st-hw-lock-in"><Footprints size={18} />Start walking</span>
                  </div>

                  <span className="st-hw-touch" />
                  <span className="st-hw-fade" />
                </div>
              </PhoneFrame>
            </div>
          </div>
          <p className="st-how-tag is-pick">tap. tap. tap.{arrow('M6 30 C 24 8, 50 6, 72 20 M62 12 l10 8 -12 4')}</p>
          <p className="st-how-tag is-spend">{arrow('M74 30 C 56 8, 30 8, 8 22 M18 13 l-10 9 12 3')}the meter runs<br />while you scroll</p>
          <p className="st-how-tag is-lock">00:00 means locked.<br />go walk!{arrow('M6 12 C 26 34, 50 38, 72 26 M60 22 l12 4 -6 11')}</p>
        </div>
      </div>
    </section>
  );
}
