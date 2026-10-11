import { Moz } from '../Moz';

// The widget follows the island: it shows the world, level and streak of whichever world is on screen.
// Copy and layout come from the App Store screenshot (public/assets/v2/progress-streak.png); the taglines come from
// the worlds screenshot (companion-worlds.png). Numbers are illustrative, like the chart below.
const PHASES = [
  { key: 'desert', world: 'Desert Oasis', short: 'Desert', level: 1, streak: 1, mp: 10, hello: 'Ethan, Level 1!', line: 'A new beginning.' },
  { key: 'city', world: 'Abandoned City', short: 'City', level: 5, streak: 5, mp: 30, hello: 'Ethan, Level 5!', line: 'Bringing back light.' },
  { key: 'park', world: 'Green Park', short: 'Park', level: 10, streak: 10, mp: 60, hello: 'Ethan, Level 10 Legend!', line: 'Unstoppable focus' },
] as const;

// Illustrative bar heights for the analytics card (minutes earned vs. spent per day); not real data.
const EARNED = [24, 32, 20, 36, 28, 40, 34];
const SPENT = [16, 20, 18, 22, 14, 24, 18];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const Flame = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 2.5c.6 3.4-1.6 5-3 6.8C8 11.2 7 12.8 7 15a5 5 0 0 0 10 0c0-2-1-3.6-2-4.8.1 1.5-.5 2.6-1.6 3 .4-3.4-.3-7.6-.9-10.7z" fill="#ff8a3d" /><path d="M12 13c-1.4 1.3-2.2 2.4-2.2 3.6a2.2 2.2 0 0 0 4.4 0c0-1.2-.8-2.3-2.2-3.6z" fill="#ffd36b" /></svg>;
const Bolt = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13.5h6L10 22l9-12h-6.2z" fill="#f5b82e" stroke="#e39b12" strokeWidth="1" strokeLinejoin="round" /></svg>;
export const Crown = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 24" aria-hidden="true"><path d="M3 8l6 5 7-10 7 10 6-5-2.5 13h-21z" fill="#ffc83d" stroke="#e8a317" strokeWidth="1.4" strokeLinejoin="round" /><path d="M6 19h20" stroke="#e8a317" strokeWidth="1.4" /><circle cx="16" cy="3" r="2" fill="#ffe08a" /><circle cx="3" cy="8" r="1.8" fill="#ffe08a" /><circle cx="29" cy="8" r="1.8" fill="#ffe08a" /></svg>
);

/** The home-screen widget and the analytics card, shown as they appear in the app. */
export function WorldShowcase() {
  return (
    <div className="st-world-showcase">
      <figure className="st-wd" role="img" aria-label="Mozy home-screen widget: your world, level and streak, with Moz cheering you on">
        <span className="st-wd-tag">Home-screen widget</span>
        <div className="st-wd-head">
          <p className="st-wd-world">{PHASES.map(p => <span key={p.key} data-phase-of={p.key}>{p.world}</span>)}</p>
          <p className="st-wd-streak"><Flame />{PHASES.map(p => <span key={p.key} data-phase-of={p.key}>{p.streak}d streak</span>)}</p>
        </div>
        <div className="st-wd-body">
          <div className="st-wd-avatar">
            <Moz mood="joy" still />
            <Crown className="st-wd-crown" />
          </div>
          <p className="st-wd-bubble">
            {PHASES.map(p => <span key={p.key} data-phase-of={p.key}><b>{p.hello}</b>{p.line}{p.key === 'park' ? <Crown className="st-wd-inline-crown" /> : null}</span>)}
          </p>
        </div>
        <p className="st-wd-foot">{PHASES.map(p => <span key={p.key} data-phase-of={p.key}>Level {p.level}<i>·</i><Bolt />{p.mp} MP<i>·</i>{p.short}</span>)}</p>
      </figure>

      <figure className="st-wa" role="img" aria-label="Mozy analytics: minutes earned and minutes spent each day this week">
        <span className="st-wd-tag">Analytics</span>
        <div className="st-wa-head"><b>This week</b><span className="st-wa-seg"><i>D</i><i className="is-on">W</i><i>M</i></span></div>
        <svg className="st-wa-chart" viewBox="0 0 182 74" aria-hidden="true">
          {[14, 34, 54].map(y => <path key={y} d={`M0 ${y}H182`} stroke="#eee9de" strokeWidth="1" />)}
          {EARNED.map((height, day) => <rect key={`e${day}`} className="st-world-bar" x={8 + day * 25.5} y={60 - height * 1.2} width="8" height={height * 1.2} rx="4" fill="#2f9a58" />)}
          {SPENT.map((height, day) => <rect key={`s${day}`} className="st-world-bar" x={17.5 + day * 25.5} y={60 - height * 1.2} width="8" height={height * 1.2} rx="4" fill="#f59a4a" />)}
          {DAYS.map((day, index) => <text key={index} x={17 + index * 25.5} y="72" textAnchor="middle" className="st-wa-day">{day}</text>)}
        </svg>
        <p className="st-wa-legend"><span className="is-earned">Minutes earned</span><span className="is-spent">Spent</span></p>
      </figure>
    </div>
  );
}

/** The meadow from the walk ends at a grassy ledge with an earthy underside, like Moz's own floating island. */
export function WorldLedge() {
  return (
    <svg className="st-world-ledge" viewBox="0 0 1440 150" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="world-ledge-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c08a55" /><stop offset="1" stopColor="#8d5c34" /></linearGradient>
      </defs>
      <path d="M0 0H1440V30C1400 44 1372 64 1330 62C1290 60 1270 40 1226 44C1188 48 1170 78 1128 80C1090 82 1072 56 1032 52C992 48 970 70 930 74C884 78 862 50 818 46C776 42 752 60 712 62C670 64 650 44 610 42C566 40 544 66 500 70C458 74 436 52 394 48C352 44 330 60 290 62C250 64 228 46 188 44C146 42 120 60 80 58C46 56 22 40 0 38Z" fill="url(#world-ledge-earth)" />
      <path d="M0 30C40 40 70 48 110 44C150 40 176 52 214 52C256 52 280 38 320 40C362 42 384 56 426 56C470 56 492 42 534 42C578 42 600 56 642 54C684 52 706 40 748 40C792 40 814 54 856 56C900 58 922 42 964 42C1006 42 1030 58 1072 58C1114 58 1136 42 1178 42C1220 42 1244 54 1286 52C1330 50 1360 38 1400 36C1416 35 1430 34 1440 34V26H0Z" fill="#a8723f" opacity="0.55" />
      <g stroke="#7a5232" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M150 50c2 10-3 16 1 26" /><path d="M420 58c-2 9 4 14 0 24" /><path d="M700 62c3 8-2 14 2 22" /><path d="M985 52c-2 10 3 16-1 25" /><path d="M1240 46c2 9-2 15 1 23" /><path d="M560 44c1 7-2 11 0 17" /><path d="M1110 78c2 8-2 12 1 18" />
      </g>
      <g className="st-world-ledge-rocks">
        <path d="M1188 110l14-9 16 3 6 12-12 9-18-2z" fill="#9a6a3e" /><path d="M1188 110l14-9 16 3 1 4-15 1z" fill="#c9945f" />
        <path d="M842 104l10-6 11 2 4 9-9 6-13-2z" fill="#9a6a3e" /><path d="M842 104l10-6 11 2 1 3-11 1z" fill="#c9945f" />
        <path d="M1352 92l8-5 9 2 3 7-7 5-10-1z" fill="#9a6a3e" /><path d="M1352 92l8-5 9 2 1 3-9 1z" fill="#c9945f" />
        <path d="M640 96l7-4 7 1 3 6-6 4-8-1z" fill="#9a6a3e" /><path d="M640 96l7-4 7 1 1 2-8 1z" fill="#c9945f" />
      </g>
      <path d="M0 0H1440V24C1420 30 1398 26 1380 31C1360 36 1344 28 1322 32C1300 36 1284 27 1262 31C1238 35 1222 28 1200 32C1176 36 1160 27 1138 31C1114 35 1098 28 1076 32C1052 36 1036 27 1014 31C990 35 974 28 952 32C928 36 912 27 890 31C866 35 850 28 828 32C804 36 788 27 766 31C742 35 726 28 704 32C680 36 664 27 642 31C618 35 602 28 580 32C556 36 540 27 518 31C494 35 478 28 456 32C432 36 416 27 394 31C370 35 354 28 332 32C308 36 292 27 270 31C246 35 230 28 208 32C184 36 168 27 146 31C122 35 106 28 84 32C60 36 44 27 22 31C14 32 6 30 0 29Z" fill="#6caf55" />
      <path d="M0 0H1440V18C1300 22 1160 16 1000 20C840 24 680 16 520 20C360 24 200 17 0 20Z" fill="#7abd5c" />
      <path d="M90 18q-3-8-6-11q4 3 6 7q2-6 6-9q-3 5-2 13zM330 19q-3-7-7-10q5 3 7 6q1-6 5-9q-2 5-1 13zM610 18q-2-8-6-11q4 3 6 7q2-6 6-9q-3 5-2 13zM905 19q-3-7-7-10q5 3 7 6q1-6 5-9q-2 5-1 13zM1180 18q-2-8-6-11q4 3 6 7q2-6 6-9q-3 5-2 13zM1385 19q-3-7-7-10q5 3 7 6q1-6 5-9q-2 5-1 13z" fill="#5fa64a" />
      <g>
        {[[210, 11, '#ffd76a'], [470, 9, '#ff9db5'], [760, 12, '#fff8ef'], [1040, 10, '#c9a6ff'], [1290, 11, '#ffd76a']].map(([x, y, color]) => (
          <g key={x as number}><circle cx={x as number} cy={y as number} r="3.6" fill={color as string} /><circle cx={x as number} cy={y as number} r="1.4" fill="#f2a93b" /></g>
        ))}
      </g>
    </svg>
  );
}

/** Small glyphs for the three worlds, used by the level badge and its track. */
export function WorldGlyph({ world }: { world: 'desert' | 'city' | 'park' }) {
  if (world === 'desert') return <svg className="st-world-glyph" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17V4.5M10 11.5H6.2V8M10 13.5h3.8V9.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
  if (world === 'city') return <svg className="st-world-glyph" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 17V6.5L6 5l1.5 1.5L9.5 4V17ZM11 17V9.5l2-1.2l1.6 1l1.9-.8V17Z" fill="currentColor" /></svg>;
  return <svg className="st-world-glyph" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="8" r="5.6" fill="currentColor" /><path d="M10 12v5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>;
}
