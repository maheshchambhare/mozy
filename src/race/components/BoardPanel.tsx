import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { compactSteps, formatNumber, isResting, roundSteps, syncedAgo, topPercent, type Standings } from '../board';
import { blobOf } from '../blob';
import { crownFor } from '../crowns';
import type { Territory } from '../globe/territory';
import { compactArea } from '../board';
import { cityById, countryByCode } from '../mock/places';
import { PERIOD_LABEL, type Period, type Ranked, type World } from '../types';
import { BlobAvatar } from './BlobAvatar';
import { Flag } from './bits';

export type Scope = 'world' | 'country' | 'city' | 'crews';

interface Props {
  world: World;
  standings: Standings;
  territory: Territory | null;
  period: Period;
  onPeriod: (period: Period) => void;
  scope: Scope;
  onScope: (scope: Scope) => void;
  cc: string | null;
  cityId: string | null;
  onCity: (city: string) => void;
  meId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  sheetOpen: boolean;
  onSheet: (open: boolean) => void;
}

const ROW = 56;
const PERIODS: Period[] = ['day', 'week', 'month'];

function VirtualRows({ rows, render, focusIndex }: { rows: Ranked[]; render: (row: Ranked) => ReactNode; focusIndex: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(480);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.clientHeight));
    observer.observe(el);
    setHeight(el.clientHeight);
    return () => observer.disconnect();
  }, []);
  // Bring the selected walker's row into view.
  useEffect(() => {
    const el = box.current;
    if (!el || focusIndex < 0) return;
    const top = focusIndex * ROW;
    if (top < el.scrollTop || top + ROW > el.scrollTop + el.clientHeight) el.scrollTo({ top: Math.max(0, top - el.clientHeight / 2 + ROW / 2), behavior: 'smooth' });
  }, [focusIndex]);
  const first = Math.max(0, Math.floor(scroll / ROW) - 6);
  const last = Math.min(rows.length, Math.ceil((scroll + height) / ROW) + 6);
  const visible = [];
  for (let i = first; i < last; i++) visible.push(<div key={rows[i].walker.id} className="rc-row-slot" style={{ transform: `translateY(${i * ROW}px)` }}>{render(rows[i])}</div>);
  return (
    <div className="rc-rows" ref={box} onScroll={event => setScroll(event.currentTarget.scrollTop)} role="list">
      <div style={{ height: rows.length * ROW }} />
      {visible}
    </div>
  );
}

export function BoardPanel(props: Props) {
  const { world, standings, territory, period, scope, cc, cityId, meId, selectedId } = props;
  const me = meId ? world.byId.get(meId) ?? null : null;
  const country = cc ? countryByCode.get(cc) ?? null : null;
  const city = cityId ? cityById.get(cityId) ?? null : null;

  const rows: Ranked[] = useMemo(() => {
    if (scope === 'country' && cc) return standings.byCountry.get(cc) ?? [];
    if (scope === 'city' && cityId) return standings.byCity.get(cityId) ?? [];
    if (scope === 'crews') return [];
    return standings.world;
  }, [scope, cc, cityId, standings]);

  const landOf = (id: string) => {
    const index = territory?.ownerById.get(id);
    return index === undefined ? null : territory!.owners[index];
  };
  const colorOf = (id: string) => (territory?.ownerById.has(id) ? blobOf(id).color : null);

  const focusIndex = selectedId ? rows.findIndex(row => row.walker.id === selectedId) : -1;
  const scopeName = scope === 'country' ? country?.name ?? '' : scope === 'city' ? city?.name ?? '' : 'the world';
  const meRow = me ? rows.find(row => row.walker.id === me.id) ?? null : null;
  const above = meRow && meRow.rank > 1 ? rows[meRow.rank - 2] : null;

  const renderRow = (row: Ranked) => {
    const walker = row.walker;
    const worldRank = standings.worldRow.get(walker.id)?.rank ?? 0;
    const countryRank = standings.countryRow.get(walker.id)?.rank ?? 0;
    const crown = crownFor(worldRank, countryRank);
    const land = landOf(walker.id);
    const color = colorOf(walker.id);
    const resting = isResting(walker, world.now);
    const cityName = cityById.get(walker.city)?.name ?? '';
    return (
      <button
        type="button"
        className={`rc-row${walker.id === meId ? ' is-me' : ''}${walker.id === selectedId ? ' is-selected' : ''}`}
        onClick={() => props.onSelect(walker.id)}
        role="listitem"
      >
        <span className={`rc-rank${row.rank <= 3 ? ` is-top is-${row.rank}` : ''}`}>{formatNumber(row.rank)}</span>
        <BlobAvatar id={walker.id} crown={crown} size={32} />
        <span className="rc-who">
          <b>{walker.name}{walker.id === meId ? <em className="rc-you">you</em> : null}{resting ? <em className="rc-rest">resting</em> : null}</b>
          <small title={syncedAgo(walker.syncedAt, world.now)}>{scope === 'world' ? <Flag cc={walker.cc} /> : null}{cityName}{scope === 'world' ? '' : ` · ${syncedAgo(walker.syncedAt, world.now).replace('synced ', '')}`}</small>
        </span>
        <span className="rc-land" title={land ? `${formatNumber(Math.round(land.km2))} km² (${formatNumber(land.tiles)} tiles)` : 'No land yet'}>
          {land ? <><i style={{ background: color ?? undefined }} />{compactArea(land.km2)}</> : <span className="rc-none">–</span>}
        </span>
        <span className="rc-steps">{formatNumber(roundSteps(row.steps))}</span>
      </button>
    );
  };

  // Who owns the open country's land (walkers from anywhere), as one stacked bar.
  const landBar = useMemo(() => {
    if (!territory || !cc || scope === 'world' || scope === 'crews') return null;
    const shape = territory.tileSet.byCc.get(cc);
    if (shape === undefined) return null;
    const { start, end } = territory.tileSet.shapes[shape];
    const counts = new Map<number, number>();
    for (let t = start; t < end; t++) { const o = territory.owner[t]; if (o >= 0) counts.set(o, (counts.get(o) ?? 0) + 1); }
    const total = end - start;
    if (!total) return null;
    const owners = [...counts].sort((a, b) => b[1] - a[1]).map(([o, tiles]) => ({ walker: territory.owners[o].walker, tiles }));
    const outsiders = owners.filter(item => item.walker.cc !== cc).reduce((sum, item) => sum + item.tiles, 0);
    return { total, owners: owners.slice(0, 12), rest: owners.slice(12).reduce((sum, item) => sum + item.tiles, 0), count: owners.length, outsiders };
  }, [territory, cc, scope]);

  const cityChips = useMemo(() => {
    if (!country) return [];
    return country.cities.map(item => ({ city: item, walkers: standings.byCity.get(item.id)?.length ?? 0 })).filter(item => item.walkers).sort((a, b) => b.walkers - a.walkers);
  }, [country, standings]);

  const totals = scope === 'country' && cc ? standings.countryTotals.get(cc) : null;
  const podium = rows.slice(0, 3);

  return (
    <aside className={`rc-board${props.sheetOpen ? ' is-open' : ''}`} aria-label="Rankings">
      <button type="button" className="rc-sheet-handle" onClick={() => props.onSheet(!props.sheetOpen)} aria-expanded={props.sheetOpen}>
        <span />
        <b>{props.sheetOpen ? 'Show the globe' : 'Show rankings'}</b>
      </button>
      <div className="rc-tabs" role="tablist" aria-label="Board">
        <button type="button" role="tab" aria-selected={scope === 'world'} onClick={() => props.onScope('world')}>World</button>
        <button type="button" role="tab" aria-selected={scope === 'country'} disabled={!cc} onClick={() => props.onScope('country')}>
          {cc ? <Flag cc={cc} /> : null}{country?.short ?? 'Country'}
        </button>
        <button type="button" role="tab" aria-selected={scope === 'city'} disabled={!cc} onClick={() => props.onScope('city')}>{city?.name ?? 'City'}</button>
        <button type="button" role="tab" aria-selected={scope === 'crews'} onClick={() => props.onScope('crews')}>Crews</button>
      </div>
      <div className="rc-periods" role="radiogroup" aria-label="Period">
        {PERIODS.map(item => (
          <button type="button" role="radio" key={item} aria-checked={period === item} onClick={() => props.onPeriod(item)}>{PERIOD_LABEL[item]}</button>
        ))}
      </div>

      {scope === 'crews' ? (
        <div className="rc-crews">
          <BlobAvatar id="crew-preview" size={64} />
          <h3>Friends &amp; family crews</h3>
          <p>Next up: crews of 2–50 people with their own board, and a link to invite them: <code>mozy.mcrudra.com/j/SHRM7Q</code>. Each crew gets its own page and its own little map.</p>
        </div>
      ) : (
        <>
          <p className="rc-summary">
            {scope === 'world' ? <>{compactSteps(roundSteps(standings.totals.steps))} steps · {formatNumber(standings.totals.walkers)} walkers · {standings.totals.countries} countries</>
              : scope === 'country' && totals ? <>{compactSteps(roundSteps(totals.steps))} steps · {formatNumber(totals.walkers)} walkers</>
              : <>{formatNumber(rows.length)} walkers in {scopeName}</>}
          </p>

          {scope === 'city' && cityChips.length ? (
            <div className="rc-chips" role="radiogroup" aria-label="City">
              {cityChips.map(({ city: item, walkers }) => (
                <button type="button" role="radio" key={item.id} aria-checked={item.id === cityId} onClick={() => props.onCity(item.id)}>{item.name}<small>{walkers}</small></button>
              ))}
            </div>
          ) : null}

          {me && meRow ? (
            <section className="rc-hero" aria-label="Your standing">
              <BlobAvatar id={me.id} size={50} crown={crownFor(standings.worldRow.get(me.id)?.rank ?? 0, standings.countryRow.get(me.id)?.rank ?? 0)} />
              <div>
                <p className="rc-hero-rank"><b>#{formatNumber(meRow.rank)}</b> of {formatNumber(rows.length)}<span>top {topPercent(meRow.rank, rows.length)}% {scope === 'world' ? 'of the world' : `in ${scopeName}`}</span></p>
                <p className="rc-hero-gap">{above ? <>{formatNumber(Math.max(1, above.steps - meRow.steps + 1))} steps to pass <b>{above.walker.name}</b></> : <>You lead {scopeName}. Hold on to it.</>}</p>
                {territory ? <MyLand world={world} territory={territory} id={me.id} /> : null}
              </div>
            </section>
          ) : null}

          {landBar ? (
            <section className="rc-landbar" aria-label={`Who owns ${country?.name}`}>
              <p>Who owns {country?.name}<span>{landBar.count} landowners{landBar.outsiders ? ` · ${Math.round((landBar.outsiders / landBar.total) * 100)}% held from abroad` : ''}</span></p>
              <div className="rc-landbar-track">
                {landBar.owners.map(owner => (
                  <button
                    type="button"
                    key={owner.walker.id}
                    style={{ width: `${(owner.tiles / landBar.total) * 100}%`, background: blobOf(owner.walker.id).color }}
                    title={`${owner.walker.name}: ${owner.tiles} tiles (${((owner.tiles / landBar.total) * 100).toFixed(1)}%)`}
                    onClick={() => props.onSelect(owner.walker.id)}
                    aria-label={`${owner.walker.name}, ${owner.tiles} tiles`}
                  />
                ))}
                {landBar.rest ? <span style={{ width: `${(landBar.rest / landBar.total) * 100}%` }} /> : null}
              </div>
            </section>
          ) : null}

          {podium.length >= 3 ? (
            <div className="rc-podium">
              {[podium[1], podium[0], podium[2]].map(row => (
                <button type="button" key={row.walker.id} className={`is-${row.rank}`} onClick={() => props.onSelect(row.walker.id)}>
                  <BlobAvatar id={row.walker.id} size={row.rank === 1 ? 58 : 46} crown={row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : 'bronze'} />
                  <b>{row.walker.name}</b>
                  <small>{scope === 'world' ? <Flag cc={row.walker.cc} /> : null}{compactSteps(roundSteps(row.steps))}</small>
                  <span>{row.rank}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="rc-head" aria-hidden="true"><span>#</span><span>Walker</span><span>km²</span><span>Steps</span></div>
          <VirtualRows rows={rows} render={renderRow} focusIndex={focusIndex} />
        </>
      )}
    </aside>
  );
}

/** "Your land" line: how much land, where, and how to get more. */
export function MyLand({ territory, id, world }: { world: World; territory: Territory; id: string }) {
  const walker = world.byId.get(id);
  if (!walker) return null;
  const index = territory.ownerById.get(id);
  const owner = index === undefined ? null : territory.owners[index];
  if (!owner) return <p className="rc-hero-land"><b>No land yet</b><span>Every spot nearby is taken: walk to claim one</span></p>;
  // Which countries their land lies in, biggest first.
  const where = new Map<string, number>();
  for (let t = 0; t < territory.owner.length; t++) {
    if (territory.owner[t] !== index) continue;
    const shape = territory.tileSet.shapes[territory.tileSet.shapeOf[t]];
    where.set(shape.name, (where.get(shape.name) ?? 0) + territory.tileSet.km2[t]);
  }
  const places = [...where].sort((a, b) => b[1] - a[1]).map(([place]) => place);
  return (
    <p className="rc-hero-land">
      <b>{formatNumber(Math.round(owner.km2 / 10) * 10)} km²</b> of land{places.length ? ` in ${places.slice(0, 3).join(', ')}${places.length > 3 ? ` +${places.length - 3}` : ''}` : ''}
      <span>Strength {(owner.weight ?? 0).toFixed(1)} · walk more to push your borders</span>
    </p>
  );
}
