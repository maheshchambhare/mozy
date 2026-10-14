import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatNumber } from '../board';
import type { Look } from '../globe/scene';
import type { RefinePolicy } from '../globe/tiles';
import type { StrengthRule } from '../globe/world';
import type { LandMode } from '../landColors';
import { DEFAULT_GEN, type GenSettings } from '../mock/generate';
import { countries } from '../mock/places';
import type { Walker } from '../types';

export interface TagSettings { limit: number }
export interface SimSettings { running: boolean; minutes: number }

interface Props {
  open: boolean;
  onOpen: (open: boolean) => void;
  gen: GenSettings;
  onGen: (gen: GenSettings) => void;
  look: Look;
  onLook: (look: Partial<Look>) => void;
  refine: RefinePolicy;
  onRefine: (refine: RefinePolicy) => void;
  tags: TagSettings;
  onTags: (tags: TagSettings) => void;
  strength: StrengthRule;
  onStrength: (strength: StrengthRule) => void;
  growing: boolean;
  onGrow: (target: number | null) => void;
  sim: SimSettings;
  onSim: (sim: SimSettings) => void;
  onAdvance: (minutes: number) => void;
  selected: Walker | null;
  onBoost: (steps: number) => void;
  claim: boolean;
  onClaim: (on: boolean) => void;
  onResetHome: () => void;
  onMakeMe: () => void;
  onAddWalker: (cc: string, steps: number, count: number) => void;
  onReset: () => void;
  info: { tiles: number; owners: number; focus: { name: string; tiles: number; km2: number } | null };
}

/** A range input that reports while dragging but only commits after the hand stops (heavy settings rebuild the world). */
function Range({ label, value, min, max, step, format, onCommit, live }: {
  label: string; value: number; min: number; max: number; step: number; format?: (value: number) => string;
  onCommit: (value: number) => void; live?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [shown, setShown] = useState(value);
  const timer = useRef(0);
  // Follow outside changes (reset, other controls) without an effect.
  if (shown !== value) {
    setShown(value);
    setDraft(value);
  }
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <label className="rc-range">
      <span>{label}<output>{format ? format(draft) : draft}</output></span>
      <input
        type="range" min={min} max={max} step={step} value={draft}
        onChange={event => {
          const next = Number(event.target.value);
          setDraft(next);
          window.clearTimeout(timer.current);
          if (live) onCommit(next);
          else timer.current = window.setTimeout(() => onCommit(next), 280);
        }}
      />
    </label>
  );
}

function Toggle({ label, on, onChange, hint }: { label: string; on: boolean; onChange: (on: boolean) => void; hint?: string }) {
  return (
    <label className="rc-toggle">
      <input type="checkbox" checked={on} onChange={event => onChange(event.target.checked)} />
      <span aria-hidden="true" />
      <b>{label}{hint ? <small>{hint}</small> : null}</b>
    </label>
  );
}

function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="rc-sec" open={open}>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

// Walker count on a log scale: 1 … 50,000 (rounded to a friendly number).
const toCount = (t: number) => {
  const raw = Math.pow(10, t * Math.log10(50000));
  const step = raw < 20 ? 1 : raw < 200 ? 5 : raw < 2000 ? 50 : 500;
  return Math.max(1, Math.round(raw / step) * step);
};
const fromCount = (count: number) => Math.log10(Math.max(1, count)) / Math.log10(50000);

// H3 resolutions and their average hex area.
const HEX_KM2: Record<number, number> = { 2: 86_800, 3: 12_400, 4: 1_770, 5: 253, 6: 36, 7: 5.2, 8: 0.74 };
const ADD_COUNTS = [1, 10, 100, 500];
const LAND_MODES: [LandMode, string, string][] = [
  ['pastel', 'Pastel', 'light candy pastels, warm and cool'],
  ['cool', 'Cool pastels', 'mint, aqua, sky, periwinkle, lavender'],
  ['fields', 'Fields', 'soft greens; the blobs bring the colour'],
  ['sand', 'Sand', 'a warm sand patchwork'],
  ['country', 'Country colours', 'each country its own soft shade'],
  ['blob', 'Blob colours', 'land in its owner’s blob colour (the first version)'],
];

export function Sandbox(props: Props) {
  const { gen, look, refine, sim, selected } = props;
  const [newCc, setNewCc] = useState('KE');
  const [newSteps, setNewSteps] = useState(20000);
  const [newCount, setNewCount] = useState(1);
  if (!props.open) {
    return (
      <button type="button" className="rc-sandbox-fab" onClick={() => props.onOpen(true)} aria-label="Open sandbox settings">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" /></svg>
        Sandbox
      </button>
    );
  }
  return (
    <aside className="rc-sandbox" aria-label="Sandbox settings">
      <header>
        <div>
          <b>Sandbox</b>
          <small>dev settings · dummy data only</small>
        </div>
        <button type="button" onClick={() => props.onOpen(false)} aria-label="Close sandbox">×</button>
      </header>
      <div className="rc-sandbox-body">
        <Section title="Dummy walkers">
          <Range label="Walkers" value={fromCount(gen.walkers)} min={0} max={1} step={0.005} format={t => formatNumber(toCount(t))} onCommit={t => props.onGen({ ...gen, walkers: toCount(t) })} />
          <Range label="Spread across countries" value={gen.spread} min={0} max={1} step={0.05} format={v => (v < 0.1 ? 'like our audience' : v > 0.9 ? 'even' : `${Math.round(v * 100)}%`)} onCommit={v => props.onGen({ ...gen, spread: v })} />
          <Range label="Ultra walkers" value={gen.whales} min={0} max={0.08} step={0.005} format={v => `${(v * 100).toFixed(1)}%`} onCommit={v => props.onGen({ ...gen, whales: v })} />
          <Range label="Usual active day" value={gen.median} min={2000} max={14000} step={200} format={v => `${formatNumber(v)} steps`} onCommit={v => props.onGen({ ...gen, median: v })} />
          <Range label="Rest days" value={gen.restDays} min={0} max={0.5} step={0.02} format={v => `${Math.round(v * 100)}%`} onCommit={v => props.onGen({ ...gen, restDays: v })} />
          <div className="rc-btns">
            <button type="button" className={props.growing ? 'is-on' : ''} onClick={() => props.onGrow(props.growing ? null : Math.max(gen.walkers, 6000))}>{props.growing ? 'Stop growing' : 'Grow from one walker'}</button>
            <button type="button" onClick={() => props.onGen({ ...gen, walkers: 1 })}>Just one walker</button>
          </div>
          <div className="rc-btns">
            <button type="button" onClick={() => props.onGen({ ...gen, seed: Math.floor(Math.random() * 1e6) })}>New world (seed {gen.seed})</button>
            <button type="button" onClick={() => props.onGen({ ...DEFAULT_GEN })}>Default</button>
          </div>
        </Section>

        <Section title="Live">
          <Toggle label="Simulate walking" hint="people in daylight walk; land changes hands" on={sim.running} onChange={running => props.onSim({ ...sim, running })} />
          <Range label="Each second is" value={sim.minutes} min={1} max={120} step={1} live format={v => `${v} min of walking`} onCommit={minutes => props.onSim({ ...sim, minutes })} />
          <div className="rc-btns">
            <button type="button" onClick={() => props.onAdvance(60)}>+1 hour</button>
            <button type="button" onClick={() => props.onAdvance(360)}>+6 hours</button>
          </div>
          <div className="rc-add">
            <select value={newCc} onChange={event => setNewCc(event.target.value)} aria-label="Country for new walkers">
              {countries.map(country => <option key={country.cc} value={country.cc}>{country.name}</option>)}
            </select>
            <input type="number" min={100} max={100000} step={100} value={newSteps} onChange={event => setNewSteps(Number(event.target.value))} aria-label="Steps for each new walker" />
            <select value={newCount} onChange={event => setNewCount(Number(event.target.value))} aria-label="How many walkers to add">
              {ADD_COUNTS.map(count => <option key={count} value={count}>×{count}</option>)}
            </select>
            <button type="button" onClick={() => props.onAddWalker(newCc, newSteps, newCount)}>Add</button>
          </div>
          <p className="rc-note">Add 100 or 500 walkers to a quiet country and watch its hexes get smaller so everyone still gets land.</p>
        </Section>

        <Section title={selected ? `Selected: ${selected.name}` : 'Selected walker'}>
          {selected ? (
            <>
              <div className="rc-btns">
                <button type="button" onClick={() => props.onBoost(1000)}>+1k steps</button>
                <button type="button" onClick={() => props.onBoost(10000)}>+10k</button>
                <button type="button" onClick={() => props.onBoost(50000)}>+50k</button>
              </div>
              <Toggle label="Pick home tile" hint="click a tile in their country; their land regrows from it" on={props.claim} onChange={props.onClaim} />
              <div className="rc-btns">
                <button type="button" onClick={props.onResetHome} disabled={!selected.home}>Back to their city</button>
                <button type="button" onClick={props.onMakeMe}>Make this me</button>
              </div>
            </>
          ) : <p className="rc-note">Click a blob, a tile or a row to select a walker.</p>}
        </Section>

        <Section title="Strength">
          <p className="rc-note">Strength = newcomer + steps + level + MP. Everyone's land grows from home and every border is won by strength. One walker owns the world; two equal walkers get half each.</p>
          <Range label="Newcomer strength" value={props.strength.newcomer} min={0.2} max={5} step={0.1} format={v => v.toFixed(1)} onCommit={newcomer => props.onStrength({ ...props.strength, newcomer })} />
          <Range label="Per 10,000 steps" value={props.strength.perSteps} min={0} max={4} step={0.1} format={v => `+${v.toFixed(1)}`} onCommit={perSteps => props.onStrength({ ...props.strength, perSteps })} />
          <Range label="Per level" value={props.strength.perLevel} min={0} max={1} step={0.05} format={v => `+${v.toFixed(2)}`} onCommit={perLevel => props.onStrength({ ...props.strength, perLevel })} />
          <Range label="Per 1,000 MP" value={props.strength.perMp} min={0} max={2} step={0.05} format={v => `+${v.toFixed(2)}`} onCommit={perMp => props.onStrength({ ...props.strength, perMp })} />
          <Range label="Curve (land vs strength)" value={props.strength.curve} min={0.2} max={1.2} step={0.05} format={v => v.toFixed(2)} onCommit={curve => props.onStrength({ ...props.strength, curve })} />
          <Range label="Sea crossing cost" value={props.strength.sea} min={1} max={5} step={0.1} format={v => `${v.toFixed(1)}× land`} onCommit={sea => props.onStrength({ ...props.strength, sea })} />
          <Toggle label="Shares vs borders: automatic" hint="shares by strength while few walk, local borders as the world fills" on={props.strength.fair < 0} onChange={auto => props.onStrength({ ...props.strength, fair: auto ? -1 : 1 })} />
          {props.strength.fair >= 0 ? <Range label="Shares ↔ borders" value={props.strength.fair} min={0} max={1} step={0.05} format={v => (v >= 0.99 ? 'shares by strength' : v <= 0.01 ? 'borders by distance' : `${Math.round(v * 100)}% shares`)} onCommit={fair => props.onStrength({ ...props.strength, fair })} /> : null}
        </Section>

        <Section title="Hex size">
          <Range label="Big hexes (empty land)" value={refine.baseRes} min={2} max={4} step={1} format={r => `${formatNumber(HEX_KM2[r])} km²`} onCommit={baseRes => props.onRefine({ ...refine, baseRes })} />
          <Range label="Smallest hexes" value={refine.maxRes} min={4} max={8} step={1} format={r => `${formatNumber(HEX_KM2[r])} km²`} onCommit={maxRes => props.onRefine({ ...refine, maxRes })} />
          <Range label="Split a hex with this many homes" value={refine.splitAt} min={2} max={8} step={1} format={v => String(v)} onCommit={splitAt => props.onRefine({ ...refine, splitAt })} />
          <p className="rc-note">Hexes split into seven wherever homes crowd together, so busy cities get small hexes and empty land keeps big ones. {props.info.focus ? `${props.info.focus.name}: ${formatNumber(props.info.focus.tiles)} hexes.` : ''}</p>
        </Section>

        <Section title="Land colour">
          <div className="rc-choice" role="radiogroup" aria-label="Land colour">
            {LAND_MODES.map(([mode, title, hint]) => (
              <button type="button" role="radio" key={mode} aria-checked={look.landMode === mode} onClick={() => props.onLook({ landMode: mode })}>
                <b>{title}</b><small>{hint}</small>
              </button>
            ))}
          </div>
          <p className="rc-note">Your land, the walker you select and the one under the mouse always show in their own blob colour.</p>
        </Section>

        <Section title="Blobs and name tags">
          <Range label="Blob size" value={look.blobScale} min={0.4} max={2.5} step={0.05} live format={v => `${v.toFixed(2)}×`} onCommit={blobScale => props.onLook({ blobScale })} />
          <Range label="Name tag from" value={look.tagPx} min={8} max={60} step={1} live format={v => `${v} px tall`} onCommit={tagPx => props.onLook({ tagPx })} />
          <Range label="Most name tags" value={props.tags.limit} min={0} max={120} step={1} live onCommit={limit => props.onTags({ limit })} />
          <Toggle label="Jelly wobble" on={look.wobble} onChange={wobble => props.onLook({ wobble })} />
        </Section>

        <Section title="Globe look" open={false}>
          <Range label="Gap between territories" value={look.tileGap} min={0} max={0.5} step={0.01} format={v => `${Math.round(v * 100)}% of a hex`} onCommit={tileGap => props.onLook({ tileGap })} />
          <Range label="Tile height" value={look.tileHeight} min={0.001} max={0.03} step={0.001} live format={v => v.toFixed(3)} onCommit={tileHeight => props.onLook({ tileHeight })} />
          <Range label="Spin when idle" value={look.autoRotate} min={0} max={2} step={0.05} live format={v => (v ? `${v.toFixed(2)}` : 'off')} onCommit={autoRotate => props.onLook({ autoRotate })} />
          <Range label="Glow" value={look.atmosphere} min={0} max={2} step={0.05} live format={v => v.toFixed(2)} onCommit={atmosphere => props.onLook({ atmosphere })} />
          <Toggle label="Ocean grid" on={look.oceanGrid} onChange={oceanGrid => props.onLook({ oceanGrid })} />
        </Section>

        <p className="rc-note">{formatNumber(props.info.tiles)} land tiles · {formatNumber(props.info.owners)} landowners, each with a blob</p>
        <div className="rc-btns"><button type="button" className="is-quiet" onClick={props.onReset}>Reset all sandbox settings</button></div>
      </div>
    </aside>
  );
}
