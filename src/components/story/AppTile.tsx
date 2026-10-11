import type { CSSProperties } from 'react';
import { Lock } from './icons';

export type AppName = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'games';

// Simplified glyphs so the page explains "these apps" at a glance; never shipped as logos elsewhere.
function Glyph({ app }: { app: AppName }) {
  if (app === 'instagram') return <svg className="st-glyph" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="#fff" stroke="none" /></svg>;
  if (app === 'tiktok') return <svg className="st-glyph" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 4c.6 2.3 2.3 3.8 4.5 4" /></svg>;
  if (app === 'youtube') return <svg className="st-glyph st-glyph-wide" viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="4" fill="#f00" /><path d="M10 9.2v5.6l4.8-2.8z" fill="#fff" /></svg>;
  if (app === 'x') return <svg className="st-glyph st-glyph-small" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M6 5l12 14M18 5L6 19" /></svg>;
  return <svg className="st-glyph" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="8" width="18" height="9" rx="4.5" /><path d="M7.5 12.5h3M9 11v3" /></svg>;
}

export function AppTile({ app, size = 36, locked = false, lockClassName = '' }: { app: AppName; size?: number; locked?: boolean; lockClassName?: string }) {
  return (
    <span className={`st-tile st-tile-${app}`} style={{ '--tile': `${size}px` } as CSSProperties}>
      <Glyph app={app} />
      {locked && <span className={`st-tile-lock ${lockClassName}`}><Lock size={Math.max(9, Math.round(size * 0.22))} /></span>}
    </span>
  );
}
