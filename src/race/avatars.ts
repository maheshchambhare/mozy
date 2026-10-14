import { blobOf } from './blob';
import { compactSteps, formatNumber, roundSteps, type Standings } from './board';
import { CROWNS, crownFor } from './crowns';
import type { BlobSpec } from './globe/scene';
import type { Territory } from './globe/territory';
import { countryByCode } from './mock/places';

export interface BlobOptions {
  meId: string | null;
  selectedId: string | null;
  /** With a country open, only its walkers (and you, and the selected walker) get name tags. */
  focusCc: string | null;
}

const EARTH_KM = 6371;

/** A stable number per walker, so the globe can tell when a tile changes hands. */
export function ownerKey(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h & 0x7fffffff;
}

/**
 * One blob for every landowner, standing on their land and sized to fit it (so more steps, more land, bigger blob).
 * Blobs never shrink below a few pixels, so a zoomed-out country still shows all its people; leaders stay bigger.
 * The list is in tag order: selected, you, the world's top 3, country leaders, then everyone by steps.
 */
export function buildBlobSpecs(territory: Territory, standings: Standings, options: BlobOptions): BlobSpec[] {
  const ranked = territory.owners.map((owner, index) => {
    const walker = owner.walker;
    const worldRank = standings.worldRow.get(walker.id)?.rank ?? Infinity;
    const crown = crownFor(worldRank, owner.rankInCountry);
    const me = walker.id === options.meId, selected = walker.id === options.selectedId;
    const priority = selected ? 1e15 : me ? 1e14 : worldRank <= 3 ? 1e13 - worldRank : crown ? 1e12 + owner.steps : owner.steps;
    return { owner, index, worldRank, crown, me, selected, priority };
  });
  ranked.sort((a, b) => b.priority - a.priority);
  return ranked.map(({ owner, index, worldRank, crown, me, selected }) => {
    const walker = owner.walker;
    const blob = blobOf(walker.id);
    const radius = Math.sqrt(owner.km2 / Math.PI) / EARTH_KM;
    const country = countryByCode.get(walker.cc);
    const outside = !!options.focusCc && walker.cc !== options.focusCc && !me && !selected;
    return {
      key: walker.id,
      owner: index,
      tile: owner.anchor,
      size: Math.min(0.05, Math.max(0.0006, radius * 1.15)),
      minPx: selected || me ? 18 : worldRank <= 3 ? 18 : crown ? 11 : 3.2,
      rgb: blob.rgb,
      shape: blob.shape,
      face: [blob.eyes, blob.mouth, blob.blush ? 1 : 0, blob.squash],
      crown: crown ? CROWNS.indexOf(crown) : -1,
      pinned: me || selected,
      label: outside ? null : {
        title: me ? `${walker.name} (you)` : walker.name,
        sub: `${worldRank <= 3 ? `#${worldRank} world` : `#${owner.rankInCountry} ${country?.short ?? walker.cc}`} · ${compactSteps(roundSteps(owner.steps))} steps`,
        extra: `${formatNumber(owner.tiles)} ${owner.tiles === 1 ? 'tile' : 'tiles'} · ${formatNumber(Math.round(owner.km2 / 10) * 10)} km²`,
        tone: me ? 'me' : worldRank <= 3 ? 'gold' : 'plain',
      },
    };
  });
}
