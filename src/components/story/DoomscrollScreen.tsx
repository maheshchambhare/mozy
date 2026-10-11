import type { CSSProperties, ReactNode } from 'react';
import { Footprints } from './icons';
import { Moz } from './Moz';
import '../../story-doom.css';

/*
 * The hero phone's motion graphic, built from HTML, CSS and one GSAP timeline (no video):
 * someone doomscrolls short videos at 2:17 AM, the Mozy balance drains to 0:00, the next swipe bounces back,
 * the feed freezes, a padlock snaps shut and Moz rises on the lock sheet to stop them. Then it loops.
 * The CSS default is the first frame of the feed; with reduced motion the CSS shows the locked frame instead.
 */

type Reel = { scene: 'sunset' | 'party' | 'noodles' | 'cat' | 'meme' | 'city'; user: string; caption: string; likes: string; liked?: string; comments: string; audio: string; avatar: string };

// Made-up handles and clips for an illustrative feed.
const REELS: Reel[] = [
  { scene: 'sunset', user: 'sunset.clips', caption: 'golden hour hits different', likes: '12.4K', comments: '318', audio: 'original audio', avatar: 'linear-gradient(135deg, #ffb36b, #ff6f91)' },
  { scene: 'party', user: 'beat.drop', caption: 'wait for the drop…', likes: '88.1K', liked: '88.2K', comments: '1,204', audio: 'night drive (sped up)', avatar: 'linear-gradient(135deg, #7c5cff, #ff6fb5)' },
  { scene: 'noodles', user: 'two.am.snacks', caption: '3-minute midnight noodles', likes: '4,102', comments: '96', audio: 'original audio', avatar: 'linear-gradient(135deg, #ffd166, #f59e57)' },
  { scene: 'cat', user: 'cat.loops', caption: 'he does this every night', likes: '230K', comments: '5,880', audio: 'meow remix', avatar: 'linear-gradient(135deg, #7cf0d0, #2ec4b6)' },
  { scene: 'meme', user: 'pov.memes', caption: 'tag someone who is still awake', likes: '51.7K', comments: '2,341', audio: 'original audio', avatar: 'linear-gradient(135deg, #ffe066, #ff9f1c)' },
  { scene: 'city', user: 'city.timelapse', caption: 'the city never sleeps', likes: '19.9K', comments: '402', audio: 'lofi beats', avatar: 'linear-gradient(135deg, #4f9dff, #7c5cff)' },
];

const W = 278;
const H = 618;

function Scene({ scene }: { scene: Reel['scene'] }) {
  const svg = (children: ReactNode, background: string) => (
    <svg className={`st-reel-art is-${scene}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ background }}>{children}</svg>
  );
  if (scene === 'sunset') return svg(<>
    <defs>
      <radialGradient id="doom-sun"><stop offset="0" stopColor="#fff7cf" /><stop offset="0.55" stopColor="#ffd56b" /><stop offset="1" stopColor="#ffd56b" stopOpacity="0" /></radialGradient>
      <linearGradient id="doom-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a4fc4" /><stop offset="1" stopColor="#1c1752" /></linearGradient>
    </defs>
    <circle className="st-doom-sun" cx="139" cy="262" r="78" fill="url(#doom-sun)" />
    <rect y="318" width={W} height="300" fill="url(#doom-sea)" />
    <path d="M118 326h42M108 344h62M122 362h34M114 382h50M126 404h26" stroke="#ffd98a" strokeWidth="5" strokeLinecap="round" opacity="0.55" className="st-doom-glint" />
    {[0, 1, 2].map(row => (
      <g key={row} className={`st-doom-waves is-${row}`} opacity={0.5 - row * 0.12}>
        <path d={`M-60 ${430 + row * 52} ${Array(10).fill('q 11 -9 22 0 q 11 9 22 0').join(' ')}`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    ))}
    <path className="st-doom-gull" d="M70 170 q9 -9 18 0 q9 -9 18 0" stroke="#4b2a5a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path className="st-doom-gull is-two" d="M184 132 q6 -6 12 0 q6 -6 12 0" stroke="#4b2a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </>, 'linear-gradient(180deg, #ffb36b 0%, #ff7a7a 34%, #c45ad1 52%, #6a4fc4 52%)');
  if (scene === 'party') return (
    <div className="st-reel-art is-party" aria-hidden="true">
      <span className="st-doom-beam" /><span className="st-doom-beam is-two" />
      <span className="st-doom-ball" />
      <span className="st-doom-crowd" />
      <span className="st-doom-eq">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span>
    </div>
  );
  if (scene === 'noodles') return svg(<>
    <ellipse cx="139" cy="470" rx="190" ry="80" fill="#c96b33" opacity="0.35" />
    <g className="st-doom-steam">{[100, 139, 178].map((x, i) => <path key={x} className={`is-${i}`} d={`M${x} 300 c-14 -26 14 -40 0 -66 c-14 -26 14 -40 0 -66`} stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.55" />)}</g>
    <ellipse cx="139" cy="352" rx="104" ry="24" fill="#f4b04f" />
    <path d="M58 352 q20 -18 40 0 t40 0 t40 0 t40 0" stroke="#ffe39b" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M35 352 h208 c0 70 -46 112 -104 112 s-104 -42 -104 -112z" fill="#fffaf2" />
    <path d="M35 352 h208 c0 12 -2 22 -5 30 h-198 c-3 -8 -5 -18 -5 -30z" fill="#e94f37" opacity="0.9" />
    <g className="st-doom-sticks">
      <path d="M150 340 l70 -150" stroke="#8a5a36" strokeWidth="7" strokeLinecap="round" />
      <path d="M164 344 l64 -146" stroke="#a06a42" strokeWidth="7" strokeLinecap="round" />
      <path d="M152 338 c4 -30 -10 -50 4 -80 M160 340 c6 -32 -6 -52 8 -84" stroke="#ffe39b" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  </>, 'linear-gradient(180deg, #ffd59a 0%, #f7a35c 100%)');
  if (scene === 'cat') return svg(<>
    <circle cx="139" cy="300" r="150" fill="#bff2e6" opacity="0.6" />
    <g className="st-doom-cat">
      <path d="M62 236 l18 -78 l52 50z M216 236 l-18 -78 l-52 50z" fill="#f2994a" />
      <path d="M78 224 l10 -46 l28 30z M200 224 l-10 -46 l-28 30z" fill="#ffc8a8" />
      <ellipse cx="139" cy="290" rx="98" ry="88" fill="#f2994a" />
      <path d="M100 216 q10 18 0 34 M139 206 q10 20 0 38 M178 216 q-10 18 0 34" stroke="#d9772b" strokeWidth="7" strokeLinecap="round" fill="none" />
      <g className="st-doom-cat-eyes"><ellipse cx="104" cy="288" rx="15" ry="18" fill="#2b1a10" /><ellipse cx="174" cy="288" rx="15" ry="18" fill="#2b1a10" /><circle cx="109" cy="281" r="5" fill="#fff" /><circle cx="179" cy="281" r="5" fill="#fff" /></g>
      <path d="M132 314 h14 l-7 8z" fill="#ff8fa3" />
      <path d="M126 330 q6 7 13 0 q7 7 13 0" stroke="#5a2e1a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M56 312 l46 4 M56 330 l46 -2 M222 312 l-46 4 M222 330 l-46 -2" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
      <ellipse cx="139" cy="420" rx="70" ry="44" fill="#f2994a" />
    </g>
    <g className="st-doom-yarn"><circle cx="214" cy="430" r="30" fill="#ff6fb5" /><path d="M190 418 q24 -14 48 6 M188 436 q26 -10 52 8 M200 404 q8 26 2 54" stroke="#ffd1e8" strokeWidth="3" fill="none" /></g>
    <ellipse className="st-doom-paw" cx="176" cy="446" rx="20" ry="15" fill="#ffd7b8" />
  </>, 'linear-gradient(180deg, #8fe3d1 0%, #2ec4b6 100%)');
  if (scene === 'meme') return (
    <div className="st-reel-art is-meme" aria-hidden="true">
      <p className="st-doom-meme"><span>POV:</span> just one more video</p>
      <svg className="st-doom-meme-face" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#ffcf3a" stroke="#e0a400" strokeWidth="2" /><path d="M20 26q4-5 8 0M36 26q4-5 8 0" stroke="#5a3a00" strokeWidth="3.4" strokeLinecap="round" fill="none" /><path d="M18 36h28q-2 14-14 14t-14-14z" fill="#5a3a00" /><path d="M22 37h20v4H22z" fill="#fff" /><path d="M50 12q5 8 0 12q-5-4 0-12z" fill="#7cc8ff" /></svg>
    </div>
  );
  return svg(<>
    <rect y="0" width={W} height={H} fill="url(#doom-city-sky)" />
    <defs><linearGradient id="doom-city-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f1d4a" /><stop offset="1" stopColor="#3b2a7a" /></linearGradient></defs>
    {[[0, 300, 46], [50, 250, 40], [94, 330, 52], [150, 220, 44], [198, 290, 38], [240, 260, 46]].map(([x, top, w]) => (
      <g key={x}><rect x={x} y={top} width={w} height={H} fill="#1a1f48" />{Array.from({ length: 10 }, (_, r) => <rect key={r} x={x + 8} y={top + 14 + r * 22} width={w - 16} height="6" rx="2" fill="#ffd58a" opacity={(x + r * 7) % 3 ? 0.65 : 0.15} />)}</g>
    ))}
    <rect y="520" width={W} height="98" fill="#0b0f2a" />
    <g className="st-doom-traffic"><path d="M-40 548 h60 M60 548 h40 M150 548 h70" stroke="#ff6b6b" strokeWidth="4" strokeLinecap="round" /><path d="M-20 572 h80 M120 572 h50 M210 572 h60" stroke="#fff3c4" strokeWidth="4" strokeLinecap="round" /></g>
  </>, '#0f1d4a');
}

const Heart = ({ filled = false }: { filled?: boolean }) => <svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 2.9 1.5-1.8 3-2.9 5-2.9 3.4 0 5.6 3.3 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={filled ? '#ff3b5c' : 'none'} stroke={filled ? '#ff3b5c' : '#fff'} strokeWidth="2" strokeLinejoin="round" /></svg>;

function ReelUi({ reel, index }: { reel: Reel; index: number }) {
  return (
    <div className="st-reel-ui">
      <div className="st-reel-rail">
        <span className={reel.liked ? 'st-reel-like is-likeable' : 'st-reel-like'}>
          <span className="st-reel-heart is-off"><Heart /></span>
          {reel.liked ? <span className="st-reel-heart is-on"><Heart filled /></span> : null}
          <b className="is-off">{reel.likes}</b>{reel.liked ? <b className="is-on">{reel.liked}</b> : null}
        </span>
        <span><svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg><b>{reel.comments}</b></span>
        <span><svg viewBox="0 0 24 24"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg></span>
        <span><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8" fill="#fff" /><circle cx="12" cy="12" r="1.8" fill="#fff" /><circle cx="19" cy="12" r="1.8" fill="#fff" /></svg></span>
      </div>
      <div className="st-reel-meta">
        <p className="st-reel-user"><span className="st-reel-avatar" style={{ background: reel.avatar }} />@{reel.user}<span className="st-reel-follow">Follow</span></p>
        <p className="st-reel-caption">{reel.caption}</p>
        <p className="st-reel-audio"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M9 18V5l11-2v13" fill="none" stroke="#fff" strokeWidth="2.4" /><circle cx="6.5" cy="18" r="2.6" fill="#fff" /><circle cx="17.5" cy="16" r="2.6" fill="#fff" /></svg>{reel.audio}</p>
      </div>
      <span className="st-reel-progress"><i style={{ animationDelay: `${-index * 1.7}s` }} /></span>
    </div>
  );
}

/** Hero screen: a short-video feed that Mozy locks when the earned minutes run out. */
export function DoomscrollScreen() {
  return (
    <div className="st-doom">
      <div className="st-doom-track">
        {REELS.map((reel, index) => (
          <div key={reel.user} className="st-reel">
            <Scene scene={reel.scene} />
            <ReelUi reel={reel} index={index} />
          </div>
        ))}
      </div>
      <div className="st-doom-top"><span>Reels</span><svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.5" fill="none" stroke="#fff" strokeWidth="2" /></svg></div>
      <p className="st-doom-chip">
        <svg viewBox="0 0 20 20" width="15" height="15"><path d="M10 17V9" stroke="#7ee08f" strokeWidth="2.4" strokeLinecap="round" /><path d="M10 10C9 5 4 4 2.5 6.5 5 9 8 10 10 10zM10 9c1-4.5 5.5-5.5 7.5-3-2.5 2.6-5.5 3.3-7.5 3z" fill="#7ee08f" /></svg>
        <span>Mozy</span><b className="is-live" data-doom-left>0:45</b><b className="is-zero">0:00</b><span>left</span>
      </p>
      <span className="st-doom-heart"><svg viewBox="0 0 24 24"><defs><linearGradient id="doom-heart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7a93" /><stop offset="1" stopColor="#ff2d55" /></linearGradient></defs><path d="M12 21s-8-4.9-9.9-9.8C.7 7.5 3 4 6.7 4c2.2 0 3.8 1.2 5.3 3.1C13.5 5.2 15.1 4 17.3 4 21 4 23.3 7.5 21.9 11.2 20 16.1 12 21 12 21z" fill="url(#doom-heart)" /><path d="M6.5 7.5c-1.5.4-2.3 1.7-2.2 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.8" /></svg></span>
      <div className="st-doom-dim" />
      <div className="st-doom-lock">
        <span className="st-doom-ring" />
        <svg viewBox="0 0 48 48" width="46" height="46"><path className="st-doom-shackle" d="M15 22v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><rect x="10" y="21" width="28" height="21" rx="6" fill="#fff" /><circle cx="24" cy="30" r="3" fill="#e5484d" /><path d="M24 31v5" stroke="#e5484d" strokeWidth="3" strokeLinecap="round" /></svg>
      </div>
      <div className="st-shield-sheet st-doom-sheet">
        <div className="st-doom-moz"><Moz mood="stern" rim className="st-shield-moz" /></div>
        <p className="st-shield-title st-doom-in">Instagram is locked.</p>
        <p className="st-shield-copy st-doom-in">Your balance is <strong>00:00</strong>. Walk to earn more minutes.</p>
        <span className="st-lock-button st-doom-in st-doom-button"><span className="st-doom-label is-start"><Footprints size={18} />Start walking</span><span className="st-doom-label is-go"><Footprints size={18} className="st-doom-steps" />Let’s go</span></span>
      </div>
      <span className="st-doom-touch" />
      <span className="st-doom-fade" />
    </div>
  );
}
