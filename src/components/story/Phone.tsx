import type { ReactNode } from 'react';
import { AppTile } from './AppTile';
import type { AppName } from './AppTile';
import { Footprints, Lock } from './icons';
import { Moz } from './Moz';

const picks: [AppName, string, boolean][] = [['instagram', 'Instagram', true], ['tiktok', 'TikTok', true], ['youtube', 'YouTube', true], ['x', 'X', false], ['games', 'Games', false]];
const guarded: AppName[] = ['instagram', 'tiktok', 'youtube'];

function StatusBar() {
  return (
    <div className="st-phone-status">
      <span>2:17</span>
      <span className="st-phone-icons">
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 4a8.5 8.5 0 0 1 12 0" /><path d="M3.9 6.5a5 5 0 0 1 7.2 0" /><circle cx="7.5" cy="9.2" r="1.3" fill="currentColor" stroke="none" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="15" height="8" rx="2" /><rect x="22.5" y="4" width="2" height="4" rx="1" opacity="0.4" /></svg>
      </span>
    </div>
  );
}

/** A 300×620 phone with a metal rim, side buttons, island and status bar; scale it from the outside. */
export function PhoneFrame({ children, className = '', dark = false }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={`st-phone${dark ? ' is-dark' : ''} ${className}`}>
      <span className="st-phone-button is-silent" /><span className="st-phone-button is-up" /><span className="st-phone-button is-down" /><span className="st-phone-button is-power" />
      <div className="st-phone-screen">
        {children}
        <StatusBar />
        <span className="st-phone-island" />
        <span className="st-phone-home" />
      </div>
    </div>
  );
}

export function PickScreen({ className = '' }: { className?: string }) {
  return (
    <div className={`st-screen st-screen-pick ${className}`}>
      <p className="st-screen-kicker">Apps on your phone</p>
      <p className="st-screen-title">Choose what to block</p>
      <ul className="st-pick-list">
        {picks.map(([app, label, on]) => <li key={app}><AppTile app={app} size={34} /><span>{label}</span><span className={`st-toggle${on ? ' is-on' : ''}`} /></li>)}
      </ul>
      <p className="st-screen-foot">Selected apps lock when your minutes run out.</p>
    </div>
  );
}

/** Balance screen; the scene drives the clock, bar and stats while the visitor scrolls. */
export function DrainScreen({ className = '' }: { className?: string }) {
  return (
    <div className={`st-screen st-screen-drain ${className}`} data-drain-screen>
      <p className="st-screen-kicker">Screen time balance</p>
      <p className="st-drain-clock" data-drain-clock>12:00</p>
      <div className="st-drain-bar"><span data-drain-bar /></div>
      <dl className="st-drain-stats">
        <div><dt>Earned</dt><dd className="is-earned">12m</dd></div>
        <div><dt>Spent</dt><dd className="is-spent" data-drain-spent>0m</dd></div>
        <div><dt>Left</dt><dd data-drain-left>12m</dd></div>
      </dl>
      <p className="st-screen-label">Guarded apps</p>
      <div className="st-drain-apps">{guarded.map(app => <AppTile key={app} app={app} size={52} locked lockClassName="st-drain-lock" />)}</div>
      <p className="st-drain-note">Instagram can wait. Walk with Moz first.</p>
    </div>
  );
}

const feedColors = [['#ff8a65', '#ffd166'], ['#7c5cff', '#ff6fb5'], ['#2ec4b6', '#a3e635'], ['#ff6fb5', '#ffb86b'], ['#4f9dff', '#7cf0d0'], ['#ffd166', '#ff6b6b']];

/** Hero screen: an Instagram-style feed with Mozy's lock sheet over it, because the balance is 00:00. */
export function ShieldScreen({ className = '' }: { className?: string }) {
  return (
    <div className={`st-screen st-screen-shield ${className}`}>
      <div className="st-feed" aria-hidden="true">
        {feedColors.map(([from, to], index) => (
          <span key={index} className="st-feed-tile" style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}>
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 7.5v9l7.5-4.5z" fill="#fff" /></svg>
          </span>
        ))}
      </div>
      <div className="st-shield-sheet">
        <Moz mood="stern" rim className="st-shield-moz" />
        <p className="st-shield-title">Instagram is locked.</p>
        <p className="st-shield-copy">Your balance is <strong>00:00</strong>. Walk to earn more minutes.</p>
        <span className="st-lock-button"><Footprints size={18} />Start walking</span>
      </div>
    </div>
  );
}

export function LockScreen({ className = '' }: { className?: string }) {
  return (
    <div className={`st-screen st-screen-lock ${className}`}>
      <p className="st-screen-kicker">Screen time balance</p>
      <p className="st-lock-clock">00:00</p>
      <div className="st-lock-row">{guarded.map(app => <span key={app}><Lock size={14} /></span>)}</div>
      <Moz mood="stern" rim className="st-lock-moz" />
      <p className="st-lock-line">Payment declined.<br />Go walk.</p>
      <span className="st-lock-button"><Footprints size={18} />Start walking</span>
    </div>
  );
}
