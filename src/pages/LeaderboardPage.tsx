import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { blobOf } from '../race/blob';
import { countryTones, landColors } from '../race/landColors';
import { buildBlobSpecs, ownerKey } from '../race/avatars';
import { buildStandings, compactSteps, formatNumber, roundSteps, topPercent } from '../race/board';
import { BoardPanel, MyLand, type Scope } from '../race/components/BoardPanel';
import { BlobAvatar } from '../race/components/BlobAvatar';
import { Crown, Flag } from '../race/components/bits';
import { RaceGlobe, type FlyRequest } from '../race/components/RaceGlobe';
import { Sandbox, type SimSettings, type TagSettings } from '../race/components/Sandbox';
import { crownAtlas, crownFor } from '../race/crowns';
import { latLngToVec, vecToLatLng } from '../race/globe/grid';
import { DEFAULT_LOOK, type GlobeHit, type Look } from '../race/globe/scene';
import { buildTileSet, DEFAULT_REFINE, type RefinePolicy, type TileSet } from '../race/globe/tiles';
import { computeWorldTerritory, DEFAULT_STRENGTH, type StrengthRule } from '../race/globe/world';
import { addWalker, boostWalker, DEFAULT_GEN, generateWorld, rng, setHome, simulateWalking, type GenSettings } from '../race/mock/generate';
import { cityById, countryByCode } from '../race/mock/places';
import { PERIOD_LABEL, type Period, type World } from '../race/types';
import '../story.css';
import '../race/race.css';

const STORE_KEY = 'mozy-race-sandbox-v7';
interface Saved { gen: GenSettings; look: Look; refine: RefinePolicy; tags: TagSettings; period: Period; strength: StrengthRule }
const DEFAULTS: Saved = { gen: DEFAULT_GEN, look: DEFAULT_LOOK, refine: DEFAULT_REFINE, tags: { limit: 24 }, period: 'week', strength: DEFAULT_STRENGTH };
const EARTH_KM = 6371;

function loadSaved(): Saved {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? 'null') as Partial<Saved> | null;
    if (!raw) return DEFAULTS;
    return {
      gen: { ...DEFAULTS.gen, ...raw.gen }, look: { ...DEFAULTS.look, ...raw.look }, refine: { ...DEFAULTS.refine, ...raw.refine },
      tags: { ...DEFAULTS.tags, ...raw.tags }, period: raw.period ?? DEFAULTS.period, strength: { ...DEFAULTS.strength, ...raw.strength },
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * The land tiles: big hexes where nobody lives, smaller and smaller where homes crowd together. Built after the first
 * paint (H3 takes a moment the first time) and whenever walkers come or move; the old tiles stay up meanwhile.
 */
function useTileSet(world: World | null, version: number, refine: RefinePolicy) {
  const [tiles, setTiles] = useState<TileSet | null>(null);
  // Everyone's home, as a key that only changes when someone joins, leaves or moves.
  const homes = useMemo(() => {
    const map = new Map<string, [number, number][]>();
    if (world && version >= 0) {
      for (const walker of world.walkers) {
        let list = map.get(walker.cc);
        if (!list) map.set(walker.cc, (list = []));
        list.push(walker.home ?? walker.spot);
      }
    }
    return { map, key: world ? `${world.walkers.length}:${world.walkers.map(walker => (walker.home ? walker.home.join() : '')).join('')}:${world.walkers[0]?.id ?? ''}` : '' };
  }, [world, version]);
  const homesRef = useRef(homes);
  useEffect(() => { homesRef.current = homes; });
  useEffect(() => {
    if (!homes.key) return;
    const timer = window.setTimeout(() => setTiles(buildTileSet(homesRef.current.map, refine)), 30);
    return () => window.clearTimeout(timer);
  }, [homes.key, refine]);
  return tiles;
}

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

/** Counts up to a new number instead of jumping. */
function useTween(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), begin = from.current;
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const next = begin + (value - begin) * (1 - Math.pow(1 - t, 3));
      from.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return shown;
}

/** A believable "you" for the preview: a walker in India around the top 15% of the world. */
function defaultMe(world: World): string | null {
  const board = buildStandings(world, 'week').world;
  const target = Math.round(board.length * 0.15);
  let best: string | null = null, bestGap = Infinity;
  for (const row of board) {
    if (row.walker.cc !== 'IN') continue;
    const gap = Math.abs(row.rank - target);
    if (gap < bestGap) { bestGap = gap; best = row.walker.id; }
  }
  return best ?? board[0]?.walker.id ?? null;
}

export default function LeaderboardPage() {
  const params = useParams<{ country?: string; city?: string }>();
  const [, navigate] = useLocation();
  const [saved] = useState(loadSaved);
  const [gen, setGen] = useState(saved.gen);
  const [look, setLook] = useState(saved.look);
  const [refine, setRefine] = useState(saved.refine);
  const [tags, setTags] = useState(saved.tags);
  const [period, setPeriod] = useState<Period>(saved.period);
  const [strength, setStrength] = useState<StrengthRule>(saved.strength);
  // The dummy world is made on the client only (prerendering shows the empty shell) and edited in place;
  // `version` moves whenever it changes.
  const world = useMemo<World | null>(() => (typeof window === 'undefined' ? null : generateWorld(gen)), [gen]);
  const [version, setVersion] = useState(0);
  const defaultMeId = useMemo(() => (world ? defaultMe(world) : null), [world]);
  const [meChoice, setMeChoice] = useState<string | null>(null);
  const meId = meChoice && world?.byId.has(meChoice) ? meChoice : defaultMeId;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [crews, setCrews] = useState(false);
  const [sandbox, setSandbox] = useState(false);
  const [sim, setSim] = useState<SimSettings>({ running: false, minutes: 15 });
  const [claim, setClaim] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fly, setFly] = useState<FlyRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [crowns, setCrowns] = useState<HTMLCanvasElement | null>(null);
  // "Grow from one walker": the world starts with one walker and more join every second, up to `growTo`.
  const [growTo, setGrowTo] = useState<number | null>(null);
  const narrow = useNarrow();
  const tiles = useTileSet(world, version, refine);
  const simRandom = useRef(rng(99));
  const flyId = useRef(0);

  // The address is the share link: /leaderboard, /leaderboard/in, /leaderboard/in/pune.
  const cc = params.country && countryByCode.has(params.country.toUpperCase()) ? params.country.toUpperCase() : null;
  const cityId = cc && params.city && cityById.has(`${cc.toLowerCase()}-${params.city}`) ? `${cc.toLowerCase()}-${params.city}` : null;
  const scope: Scope = crews ? 'crews' : cityId ? 'city' : cc ? 'country' : 'world';

  useEffect(() => { void crownAtlas().then(setCrowns); }, []);
  useEffect(() => {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify({ gen, look, refine, tags, period, strength })); } catch { /* private mode: settings just don't persist */ }
  }, [gen, look, refine, tags, period, strength]);

  const standings = useMemo(() => (world && version >= 0 ? buildStandings(world, period) : null), [world, version, period]);
  // One world, grown by strength from everyone's home (globe/world.ts).
  const territory = useMemo(() => (tiles && standings ? computeWorldTerritory(tiles, standings, strength) : null), [tiles, standings, strength]);

  const selected = selectedId && world ? world.byId.get(selectedId) ?? null : null;
  const me = meId && world ? world.byId.get(meId) ?? null : null;
  const blobs = useMemo(() => (territory && standings ? buildBlobSpecs(territory, standings, { meId, selectedId, focusCc: cc }) : []), [territory, standings, meId, selectedId, cc]);
  const ownerKeys = useMemo(() => Int32Array.from(territory?.owners.map(owner => ownerKey(owner.walker.id)) ?? []), [territory]);
  const land = useMemo(() => (territory ? landColors(territory, look.landMode) : []), [territory, look.landMode]);
  const accent = useMemo(() => territory?.owners.map(owner => blobOf(owner.walker.id).rgb) ?? [], [territory]);
  const tones = useMemo(() => (tiles ? countryTones(tiles, look.landMode) : []), [tiles, look.landMode]);

  const flyToDir = useCallback((dir: [number, number, number], radius: number, instant?: boolean, seconds?: number) => {
    setFly({ id: ++flyId.current, dir, radius, instant, seconds });
  }, []);
  // A country's size on the globe: its equal-area disc, stretched a little since countries are rarely round.
  const countryRadius = useCallback((shape: number) => {
    if (!tiles) return 2;
    const s = tiles.shapes[shape];
    return Math.min(1.1, Math.max(0.06, 1.9 * Math.sqrt(s.km2 / Math.PI) / EARTH_KM));
  }, [tiles]);
  const WORLD = 2;

  // First view: the globe shows at once (sea, sky, stars) and the camera glides in from far away toward "my" city
  // while the land is still being built; tiles then rise in a wave and the blobs pop up. A country link waits for
  // the tiles, so it can frame the country.
  const introDone = useRef(false);
  useEffect(() => {
    if (introDone.current || !me) return;
    if (cc) {
      if (!tiles) return;
      const shape = tiles.byCc.get(cc);
      introDone.current = true;
      if (shape !== undefined) flyToDir(tiles.shapes[shape].center, countryRadius(shape), false, 2.6);
      return;
    }
    introDone.current = true;
    const city = cityById.get(me.city);
    flyToDir(city ? latLngToVec(city.lat - 4, city.lng) : latLngToVec(20, 78), WORLD, false, 2.8);
  }, [tiles, me, cc, flyToDir, countryRadius]);

  // Opening a country (from the URL, a tab or the globe) flies there; going back to the world zooms out.
  const lastCc = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!tiles || !introDone.current) return;
    if (lastCc.current === undefined) { lastCc.current = cc; return; }
    if (lastCc.current === cc) return;
    lastCc.current = cc;
    if (cc) {
      const shape = tiles.byCc.get(cc);
      if (shape !== undefined) flyToDir(tiles.shapes[shape].center, countryRadius(shape));
    } else flyToDir(latLngToVec(18, 30), WORLD);
  }, [cc, tiles, flyToDir, countryRadius]);

  const openCountry = useCallback((code: string | null, city?: string | null) => {
    setCrews(false);
    if (!code) navigate('/leaderboard');
    else navigate(`/leaderboard/${code.toLowerCase()}${city ? `/${cityById.get(city)?.slug ?? ''}` : ''}`);
  }, [navigate]);

  /** Selects a walker and flies close enough to read their tag and see their land. */
  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    setClaim(false);
    if (!id || !world || !tiles || !territory) return;
    const walker = world.byId.get(id);
    if (!walker) return;
    if (walker.cc !== cc && scope !== 'world') openCountry(walker.cc);
    const index = territory.ownerById.get(id);
    if (index === undefined) return;
    const owner = territory.owners[index];
    const t = owner.anchor;
    flyToDir([tiles.centers[t * 3], tiles.centers[t * 3 + 1], tiles.centers[t * 3 + 2]], Math.max(0.012, 3.5 * Math.sqrt(owner.km2 / Math.PI) / EARTH_KM));
  }, [world, tiles, territory, cc, scope, openCountry, flyToDir]);

  const bump = () => setVersion(value => value + 1);
  const say = (text: string) => { setToast(text); window.setTimeout(() => setToast(current => (current === text ? null : current)), 2600); };

  useEffect(() => {
    if (growTo === null) return;
    const timer = window.setTimeout(() => {
      const next = gen.walkers < 8 ? gen.walkers + 1 : Math.min(growTo, Math.ceil(gen.walkers * 1.45));
      setGen(current => ({ ...current, walkers: next }));
      if (next >= growTo) setGrowTo(null);
    }, gen.walkers < 8 ? 1400 : 1100);
    return () => window.clearTimeout(timer);
  }, [growTo, gen.walkers]);

  // Live simulation: every second, an amount of walking in the dummy world.
  useEffect(() => {
    if (!sim.running || !world) return;
    const timer = window.setInterval(() => { simulateWalking(world, sim.minutes, simRandom.current); bump(); }, 1000);
    return () => window.clearInterval(timer);
  }, [sim.running, sim.minutes, world]);

  const onPick = useCallback((hit: GlobeHit | null) => {
    if (!world || !tiles || !territory) return;
    if (!hit) { setSelectedId(null); return; }
    const shape = tiles.shapes[hit.shape];
    // Sandbox "pick home tile": the selected walker's land regrows from the clicked tile.
    if (claim && selected) {
      if (shape.cc !== selected.cc) { say(`${selected.name} can only pick land in ${countryByCode.get(selected.cc)?.name}.`); return; }
      const c = tiles.centers;
      setHome(world, selected.id, vecToLatLng(c[hit.tile * 3], c[hit.tile * 3 + 1], c[hit.tile * 3 + 2]));
      bump();
      say(`${selected.name} moved home. Their land regrows from there.`);
      return;
    }
    if (hit.owner >= 0) {
      const walker = territory.owners[hit.owner].walker;
      setSelectedId(walker.id);
      if (walker.cc !== cc) openCountry(walker.cc);
      return;
    }
    setSelectedId(null);
    if (shape.cc) openCountry(shape.cc);
    else say(shape.atlas === '010' ? 'Antarctica: too cold to walk (for now).' : `Nobody walks in ${shape.name} yet.`);
  }, [world, tiles, territory, claim, selected, cc, openCountry]);

  const describe = useCallback((hit: GlobeHit) => {
    if (!tiles || !territory || !standings) return null;
    const shape = tiles.shapes[hit.shape];
    if (!shape) return null;
    if (hit.owner >= 0) {
      const owner = territory.owners[hit.owner];
      const walker = owner.walker;
      const worldRank = standings.worldRow.get(walker.id)?.rank ?? 0;
      return {
        title: `${walker.name}${walker.id === meId ? ' (you)' : ''}`,
        lines: [
          `#${owner.rankInCountry} in ${countryByCode.get(walker.cc)?.name} · #${formatNumber(worldRank)} in the world`,
          `${formatNumber(roundSteps(owner.steps))} steps · level ${walker.level} · ${formatNumber(walker.mp)} MP · strength ${(owner.weight ?? 0).toFixed(1)}`,
          `${formatNumber(Math.round(owner.km2 / 10) * 10)} km² of land`,
          claim && selected && walker.cc === selected.cc ? `Click to make this ${selected.name}'s home tile` : '',
        ],
      };
    }
    if (hit.shape === tiles.ice) return { title: 'Antarctica', lines: ['Too cold to walk (for now)'] };
    const walkers = shape.cc ? standings.countryTotals.get(shape.cc)?.walkers ?? 0 : 0;
    return { title: shape.name, lines: [walkers ? `${walkers} walkers, none walking ${PERIOD_LABEL[period].toLowerCase()}` : 'No walkers here yet', `Be the first walker from ${shape.name}`] };
  }, [tiles, territory, standings, meId, claim, selected, period]);

  // What the panels cover: the board on the right (desktop) or the sheet and the title (phones).
  const insets = useMemo(() => {
    if (narrow) return { top: 150, right: 0, bottom: typeof window === 'undefined' ? 0 : Math.round(window.innerHeight * (sheetOpen ? 0.8 : 0.4)) };
    return { top: 0, right: 420, bottom: 0 };
  }, [narrow, sheetOpen]);

  const focusShape = tiles && cc ? tiles.byCc.get(cc) ?? -1 : -1;
  const focusOwner = territory && selectedId ? territory.ownerById.get(selectedId) ?? -1 : -1;
  const meOwner = territory && meId ? territory.ownerById.get(meId) ?? -1 : -1;
  const total = useTween(standings ? roundSteps(cc ? standings.countryTotals.get(cc)?.steps ?? 0 : standings.totals.steps) : 0);
  const country = cc ? countryByCode.get(cc) : null;
  const where = scope === 'city' && cityId ? cityById.get(cityId)?.name : country?.name ?? 'the world';
  const when = period === 'day' ? 'today' : period === 'week' ? 'this week' : 'this month';
  const leader = standings ? (cc ? standings.byCountry.get(cc)?.[0] : standings.world[0]) : undefined;
  const focusHexes = tiles && focusShape >= 0 ? tiles.shapes[focusShape] : null;

  return (
    <main className="rc" id="main">
      <div className="rc-stage">
        {crowns ? (
          <RaceGlobe
            crowns={crowns} tiles={tiles} territory={territory} ownerKeys={ownerKeys} land={land} accent={accent} tones={tones} blobs={blobs} meOwner={meOwner}
            focusShape={focusShape} focusOwner={focusOwner} look={look} tagLimit={tags.limit} insets={insets} fly={fly} onPick={onPick} describe={describe}
          />
        ) : null}
        {!tiles || !crowns ? <p className="rc-growing" role="status"><span />Growing the map…</p> : null}

        <header className="rc-title">
          <p className="rc-eyebrow" data-rc-block>Mozy Race <span className="rc-preview">preview · dummy data</span></p>
          <h1 data-rc-block>Who owns {where} {when}?</h1>
          <p className="rc-lede">Every bit of land belongs to someone. Your land grows out from home, and the stronger walker wins the border: walk more and you take your neighbours’ land, across any border.</p>
          {standings ? (
            <p className="rc-ticker" data-rc-block>
              <b>{formatNumber(Math.round(total / 100) * 100)}</b> steps walked {when}{cc ? ` in ${country?.name}` : ' by Mozy walkers'}
              {leader ? <span><Crown kind={cc ? 'country' : 'gold'} /> {leader.walker.name} leads with {compactSteps(roundSteps(leader.steps))}</span> : null}
            </p>
          ) : null}
          {cc ? (
            <nav className="rc-crumbs" aria-label="Breadcrumb">
              <button type="button" onClick={() => openCountry(null)}>World</button>
              <span aria-hidden="true">›</span>
              <button type="button" onClick={() => openCountry(cc)} aria-current={scope === 'country' ? 'page' : undefined}><Flag cc={cc} />{country?.name}</button>
              {cityId ? <><span aria-hidden="true">›</span><span aria-current="page">{cityById.get(cityId)?.name}</span></> : null}
            </nav>
          ) : null}
        </header>

        {selected && standings && territory ? (
          <section className="rc-card" aria-label={`${selected.name}'s standing`}>
            <button type="button" className="rc-card-close" onClick={() => setSelectedId(null)} aria-label="Close">×</button>
            <BlobAvatar id={selected.id} size={64} crown={crownFor(standings.worldRow.get(selected.id)?.rank ?? 0, standings.countryRow.get(selected.id)?.rank ?? 0)} />
            <div>
              <h2>{selected.name}{selected.id === meId ? <em className="rc-you">you</em> : null}<small>walker {selected.tag}</small></h2>
              <p className="rc-card-where"><Flag cc={selected.cc} />{cityById.get(selected.city)?.name}, {countryByCode.get(selected.cc)?.name}</p>
              <p className="rc-card-steps"><b>{formatNumber(roundSteps(standings.worldRow.get(selected.id)?.steps ?? 0))}</b> steps {when}</p>
              <ul className="rc-card-ranks">
                <li><b>#{formatNumber(standings.worldRow.get(selected.id)?.rank ?? 0)}</b>world<small>top {topPercent(standings.worldRow.get(selected.id)?.rank ?? 1, standings.world.length)}%</small></li>
                <li><b>#{formatNumber(standings.countryRow.get(selected.id)?.rank ?? 0)}</b>{countryByCode.get(selected.cc)?.name}</li>
                <li><b>#{formatNumber(standings.cityRow.get(selected.id)?.rank ?? 0)}</b>{cityById.get(selected.city)?.name}</li>
              </ul>
              <MyLand world={world!} territory={territory} id={selected.id} />
            </div>
          </section>
        ) : null}

        <div className="rc-legend" aria-hidden={narrow}>
          <span><i className="rc-legend-tile" />{focusHexes && country ? `Hexes in ${country.short}: ${formatNumber(Math.round(focusHexes.minKm2))}–${formatNumber(Math.round(focusHexes.maxKm2))} km²` : 'Hexes shrink where people live'}</span>
          <span><Crown kind="country" />#1 in a country</span>
          <span><Crown kind="gold" />world top 3</span>
          <span>Zoom in to see names</span>
        </div>

        {toast ? <p className="rc-toast" role="status">{toast}</p> : null}

        {world && standings ? (
          <BoardPanel
            world={world} standings={standings} territory={territory} period={period} onPeriod={setPeriod}
            scope={scope}
            onScope={next => {
              if (next === 'crews') { setCrews(true); return; }
              setCrews(false);
              if (next === 'world') openCountry(null);
              else if (next === 'country') openCountry(cc ?? me?.cc ?? null);
              else if (next === 'city') {
                const code = cc ?? me?.cc ?? null;
                const city = me && me.cc === code ? me.city : code ? standings.byCountry.get(code)?.[0]?.walker.city ?? null : null;
                openCountry(code, city);
              }
            }}
            cc={cc ?? me?.cc ?? null} cityId={cityId ?? (me && (cc ?? me.cc) === me.cc ? me.city : null)} onCity={city => openCountry(cc ?? me?.cc ?? null, city)}
            meId={meId} selectedId={selectedId} onSelect={id => select(id)}
            sheetOpen={sheetOpen} onSheet={setSheetOpen}
          />
        ) : null}

        <Sandbox
          open={sandbox} onOpen={setSandbox}
          gen={gen} onGen={setGen}
          look={look} onLook={next => setLook(current => ({ ...current, ...next }))}
          refine={refine} onRefine={setRefine}
          tags={tags} onTags={setTags}
          strength={strength} onStrength={setStrength}
          growing={growTo !== null} onGrow={target => { if (target === null) { setGrowTo(null); return; } setGen(current => ({ ...current, walkers: 1 })); setGrowTo(target); }}
          sim={sim} onSim={setSim}
          onAdvance={minutes => { if (world) { simulateWalking(world, minutes, simRandom.current); bump(); } }}
          selected={selected}
          onBoost={steps => { if (world && selected) { boostWalker(world, selected.id, steps); bump(); say(`+${formatNumber(steps)} steps for ${selected.name}`); } }}
          claim={claim} onClaim={on => { setClaim(on); if (on && selected) say(`Click a tile in ${countryByCode.get(selected.cc)?.name} for ${selected.name}'s home.`); }}
          onResetHome={() => { if (world && selected) { setHome(world, selected.id, null); bump(); } }}
          onMakeMe={() => { if (selected) setMeChoice(selected.id); }}
          onAddWalker={(code, steps, count) => {
            if (!world) return;
            let last = null;
            for (let i = 0; i < count; i++) last = addWalker(world, code, Math.round(steps * (0.5 + Math.random())), (Date.now() + i * 7919) % 1e6) ?? last;
            if (last) {
              bump();
              setSelectedId(count === 1 ? last.id : null);
              openCountry(code);
              say(count === 1 ? `${last.name} joined from ${countryByCode.get(code)?.name}.` : `${count} walkers joined from ${countryByCode.get(code)?.name}.`);
            }
          }}
          onReset={() => { setGen(DEFAULTS.gen); setLook(DEFAULTS.look); setRefine(DEFAULTS.refine); setTags(DEFAULTS.tags); setPeriod(DEFAULTS.period); setStrength(DEFAULTS.strength); }}
          info={{ tiles: tiles?.count ?? 0, owners: territory?.owners.length ?? 0, focus: focusHexes ? { name: focusHexes.name, tiles: focusHexes.end - focusHexes.start, km2: focusHexes.minKm2 } : null }}
        />
      </div>
    </main>
  );
}
